from concurrent.futures import ThreadPoolExecutor
from base64 import b64encode
from functools import partial
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
import json
from pathlib import Path
from struct import pack
import subprocess
import sys
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


def placed_manifest():
    manifest = sample_manifest()
    manifest["placement"] = {
        "width": 8, "height": 8,
        "views": [{"id": "front", "name": "Front"}],
        "slots": [{"id": "mouth", "name": "Mouth", "viewId": "front", "anchor": "face"}],
        "parts": [{"id": "idle-mouth", "slotId": "mouth", "assetId": ASSET, "x": -1, "y": 0}],
        "poses": [{"id": "idle", "name": "Idle", "viewId": "front", "duration": 120,
                   "anchors": {"origin": {"x": 4, "y": 8}, "face": {"x": 4, "y": 4}},
                   "layers": [{"slotId": "mouth", "partId": "idle-mouth", "x": 0, "y": 0}]}],
        "expressions": [{"id": "rest", "name": "Rest", "parts": {}}],
    }
    return manifest


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

    def test_workspace_cli_stages_a_png_for_the_open_revision(self):
        route = f"{self.endpoint}/{SET}"
        _, saved = self.request("POST", route, {"revision": None, "manifest": placed_manifest()})
        png = self.home.parent / "grin.png"
        png.write_bytes(transparent_png())
        command = [sys.executable, "-B", str(Path(__file__).with_name("sprite_proposal.py"))]
        arguments = ["--set-url", f"http://{self.host}{route}", "--revision", saved["revision"],
                     "--pose", "idle", "--slot", "mouth", "--expression", "rest"]
        inspection = subprocess.run([*command, "inspect", *arguments], capture_output=True, text=True)
        self.assertEqual(inspection.returncode, 0, inspection.stderr)
        self.assertEqual(json.loads(inspection.stdout)["registration"], {"x": -1, "y": 0, "width": 2, "height": 1})

        staged = subprocess.run([*command, "stage", *arguments, "--png", str(png)], capture_output=True, text=True)
        self.assertEqual(staged.returncode, 0, staged.stderr)
        proposal_id = json.loads(staged.stdout)["id"]
        inbox = route + "/proposals"
        status, listed = self.request("GET", inbox)
        self.assertEqual(status, 200)
        self.assertEqual(listed["revision"], saved["revision"])
        self.assertEqual([item["id"] for item in listed["proposals"]], [proposal_id])
        self.assertEqual(self.request("GET", f"{inbox}/{proposal_id}")[1]["asset"]["dataUrl"],
                         "data:image/png;base64," + b64encode(png.read_bytes()).decode())
        self.assertEqual(self.request("GET", route), (200, saved))
        self.assertEqual(self.request("GET", f"/away/api/sprite-generator/{SET}/proposals")[0], 404)
        self.assertEqual(self.request("POST", f"{inbox}/{proposal_id}", {"action": "discard"})[0], 200)
        self.assertEqual(self.request("GET", inbox)[1]["proposals"], [])

    def test_saved_proposal_is_no_longer_pending(self):
        route = f"{self.endpoint}/{SET}"
        manifest = placed_manifest()
        _, saved = self.request("POST", route, {"revision": None, "manifest": manifest})
        inbox = route + "/proposals"
        _, png = self.request("POST", inbox, {
            "revision": saved["revision"], "poseId": "idle", "slotId": "mouth", "name": "smile.png",
            "pngBase64": b64encode(transparent_png()).decode(),
        })
        item_url = f"{inbox}/{png['id']}"
        _, item = self.request("GET", item_url)
        manifest["assets"].append(item["asset"])
        manifest["placement"]["parts"].append({
            "id": item["id"], "assetId": item["asset"]["id"], "name": "Smile",
            "slotId": "mouth", "x": item["x"], "y": item["y"],
        })
        manifest["placement"]["poses"][0]["layers"][0]["partId"] = item["id"]
        status, accepted = self.request("POST", route, {"revision": saved["revision"], "manifest": manifest})
        self.assertEqual(status, 200)
        self.assertEqual(self.request("GET", route), (200, accepted))
        self.assertEqual(self.request("GET", inbox)[1]["proposals"], [])
        self.assertEqual(self.request("GET", item_url)[0], 404)

    def test_proposal_staging_requires_a_current_revision_and_compatible_registration(self):
        route = f"{self.endpoint}/{SET}"
        manifest = placed_manifest()
        _, old = self.request("POST", route, {"revision": None, "manifest": manifest})
        _, saved = self.request("POST", route, {"revision": old["revision"], "manifest": {**manifest, "name": "New name"}})
        inbox = route + "/proposals"
        proposal = {
            "revision": saved["revision"], "poseId": "idle", "slotId": "mouth",
            "viewId": "front", "expressionId": "rest", "name": "grin.png",
            "pngBase64": b64encode(transparent_png()).decode(),
        }
        for edits, expected in (
            ({"revision": old["revision"]}, 409), ({"slotId": "helmet"}, 400),
            ({"viewId": "side"}, 400), ({"x": -1}, 400), ({"pngBase64": "R2FtZQ=="}, 400),
        ):
            with self.subTest(edits=edits):
                self.assertEqual(self.request("POST", inbox, {**proposal, **edits})[0], expected)
        self.assertEqual(self.request("POST", inbox, proposal, Origin="https://other.example")[0], 403)
        self.assertEqual(self.request("GET", inbox)[1]["proposals"], [])
        self.assertEqual(self.request("GET", route), (200, saved))

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
