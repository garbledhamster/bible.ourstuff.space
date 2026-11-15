from concurrent.futures import ThreadPoolExecutor
from base64 import b64encode
from functools import partial
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
import json
from pathlib import Path
from struct import pack
import tempfile
import threading
import unittest
import zlib

from serve import ReaderHandler
from sprite_store import SpriteWorkspace


SET = "22222222-2222-4222-8222-222222222222"
ASSET = "33333333-3333-4333-8333-333333333333"


def transparent_png():
    def chunk(kind, data):
        return pack(">I", len(data)) + kind + data + pack(">I", zlib.crc32(kind + data))

    return (bytes.fromhex("89504e470d0a1a0a") + chunk(b"IHDR", pack(">IIBBBBB", 2, 1, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(bytes.fromhex("00ff0000ff00000000"))) + chunk(b"IEND", b""))


def sample_manifest():
    return {
        "version": 1, "id": SET, "name": "Goalie",
        "assets": [{"id": ASSET, "name": "mask.png", "width": 2, "height": 1,
                    "dataUrl": "data:image/png;base64," + b64encode(transparent_png()).decode()}],
    }


class SpriteGeneratorTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name)
        self.docs = root / "docs"
        self.docs.mkdir()
        (self.docs / "read.html").write_text("Reader")
        self.home = root / "home"
        self.away = root / "away"
        self.home.mkdir()
        self.away.mkdir()
        workspaces = {
            "/home/": SpriteWorkspace("Home Team", self.home),
            "/away/": SpriteWorkspace("Away Team", self.away),
        }
        handler = partial(ReaderHandler, directory=str(self.docs), sprite_workspaces=workspaces)
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        self.addCleanup(server.server_close)
        self.addCleanup(worker.join)
        self.addCleanup(server.shutdown)
        self.host = f"127.0.0.1:{server.server_port}"
        self.endpoint = "/home/api/sprite-generator"

    def request(self, method, path, body=None, **headers):
        connection = HTTPConnection(self.host, timeout=3)
        try:
            options = {
                "Origin": "http://" + self.host,
                "Content-Type": "application/json",
                "X-Bible-Sprite-Generator": "1",
                **headers,
            }
            connection.request(method, path, None if body is None else json.dumps(body), options)
            response = connection.getresponse()
            content = response.read()
            if response.headers.get_content_type() == "application/json":
                content = json.loads(content)
            return response.status, content
        finally:
            connection.close()

    def test_lists_sets_for_enabled_private_reader(self):
        self.assertEqual(self.request("GET", self.endpoint), (200, {"project": "Home Team", "sets": []}))

    def test_saves_png_and_reopens_the_named_set(self):
        manifest = sample_manifest()
        route = f"{self.endpoint}/{SET}"
        status, saved = self.request("POST", route, {"revision": None, "manifest": manifest})
        self.assertEqual(status, 200)
        self.assertEqual(saved["manifest"], manifest)
        self.assertRegex(saved["revision"], r"^[0-9a-f]{64}$")
        self.assertEqual(self.request("GET", route), (200, saved))
        self.assertEqual(self.request("GET", self.endpoint), (200, {
            "project": "Home Team",
            "sets": [{"id": SET, "name": "Goalie", "revision": saved["revision"]}],
        }))

    def test_concurrent_saves_only_apply_one_edit_to_a_revision(self):
        manifest = sample_manifest()
        route = f"{self.endpoint}/{SET}"
        status, saved = self.request("POST", route, {"revision": None, "manifest": manifest})
        self.assertEqual(status, 200)

        def save(name):
            return self.request("POST", route, {"revision": saved["revision"], "manifest": {**manifest, "name": name}})

        with ThreadPoolExecutor(max_workers=2) as requests:
            outcomes = list(requests.map(save, ("Starter", "Backup")))
        self.assertEqual(sorted(status for status, _ in outcomes), [200, 409])
        winner = next(body for status, body in outcomes if status == 200)
        self.assertEqual(self.request("GET", route), (200, winner))

    def test_rejects_invalid_png_and_keeps_the_saved_set(self):
        manifest = sample_manifest()
        route = f"{self.endpoint}/{SET}"
        status, saved = self.request("POST", route, {"revision": None, "manifest": manifest})
        self.assertEqual(status, 200)
        manifest["assets"][0]["dataUrl"] = "data:image/png;base64,SGVsbG8="
        status, _ = self.request("POST", route, {"revision": saved["revision"], "manifest": manifest})
        self.assertEqual(status, 400)
        self.assertEqual(self.request("GET", route), (200, saved))

    def test_projects_keep_separate_libraries_on_the_same_host(self):
        home_set = f"{self.endpoint}/{SET}"
        away_library = "/away/api/sprite-generator"
        away_set = f"{away_library}/{SET}"
        home = sample_manifest()
        self.assertEqual(self.request("POST", home_set, {"revision": None, "manifest": home})[0], 200)
        self.assertEqual(self.request("GET", away_library), (200, {"project": "Away Team", "sets": []}))
        self.assertEqual(self.request("GET", away_set)[0], 404)
        away = {**home, "name": "Visitor"}
        self.assertEqual(self.request("POST", away_set, {"revision": None, "manifest": away})[0], 200)
        self.assertEqual(self.request("GET", home_set)[1]["manifest"]["name"], "Goalie")
        self.assertEqual(self.request("GET", away_set)[1]["manifest"]["name"], "Visitor")

    def test_unconfigured_reader_keeps_public_content_and_its_private_routes_absent(self):
        self.assertEqual(self.request("GET", "/read.html"), (200, b"Reader"))
        self.assertEqual(self.request("GET", "/public/api/sprite-generator")[0], 404)
        self.assertEqual(self.request("POST", f"/public/api/sprite-generator/{SET}",
                                      {"revision": None, "manifest": sample_manifest()})[0], 404)

    def test_rejects_untrusted_hosts_and_origins(self):
        route = f"{self.endpoint}/{SET}"
        update = {"revision": None, "manifest": sample_manifest()}
        self.assertEqual(self.request("GET", self.endpoint, Host="other.example")[0], 403)
        self.assertEqual(self.request("POST", route, update, Origin="https://other.example")[0], 403)
        self.assertEqual(self.request("POST", route, update, **{"X-Bible-Sprite-Generator": "0"})[0], 403)
        self.assertEqual(self.request("GET", route)[0], 404)

    def test_static_routes_cannot_follow_a_link_into_a_sprite_workspace(self):
        route = f"{self.endpoint}/{SET}"
        self.assertEqual(self.request("POST", route, {"revision": None, "manifest": sample_manifest()})[0], 200)
        (self.docs / "sprite-library.json").symlink_to(self.home / f"{SET}.json")
        self.assertEqual(self.request("GET", "/sprite-library.json")[0], 404)

    def test_static_directory_index_keeps_sprite_workspace_private(self):
        project_page = self.docs / "project"
        project_page.mkdir()
        route = f"{self.endpoint}/{SET}"
        self.assertEqual(self.request("POST", route, {"revision": None, "manifest": sample_manifest()})[0], 200)
        (project_page / "index.html").symlink_to(self.home / f"{SET}.json")
        self.assertEqual(self.request("GET", "/project/")[0], 404)

    def test_unavailable_workspace_identifies_the_project_for_reader_setup(self):
        self.home.rmdir()
        status, payload = self.request("GET", self.endpoint)
        self.assertEqual(status, 503)
        self.assertEqual(payload["project"], "Home Team")
