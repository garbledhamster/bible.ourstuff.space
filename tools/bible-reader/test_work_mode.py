from functools import partial
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
import json
from pathlib import Path
import tempfile
import threading
import unittest

from serve import ReaderHandler


class WorkModeTest(unittest.TestCase):
    def test_switch_is_scoped_and_preserves_other_project_text(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            zoo = root / "zoo.md"
            island = root / "island.md"
            original = b"# Project Bible: Zoo\r\n\r\n**Current phase:** Build\r\n\r\n## Vision\r\nKeep this.\r\n"
            zoo.write_bytes(original)
            island.write_bytes(b"# Project Bible: Island\n\n## Vision\nKeep this too.\n")
            handler = partial(ReaderHandler, directory=directory,
                              project_bibles={"/zoo/": zoo, "/island/": island})
            with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
                worker = threading.Thread(target=server.serve_forever, daemon=True)
                worker.start()
                self.addCleanup(worker.join)
                self.addCleanup(server.shutdown)
                host = f"127.0.0.1:{server.server_port}"
                connection = HTTPConnection(host, timeout=2)
                self.addCleanup(connection.close)

                def request(method, route, body=None, origin=None):
                    headers = {"Origin": origin or "http://" + host,
                               "Content-Type": "application/json", "X-Bible-Work-Mode": "1"}
                    connection.request(method, route + "api/work-mode",
                                       json.dumps(body) if body is not None else None, headers)
                    response = connection.getresponse()
                    return response.status, json.loads(response.read())

                status, current = request("GET", "/zoo/")
                self.assertEqual((status, current["mode"]), (200, "Build"))
                payload = {"mode": "Explore", "revision": current["revision"]}
                self.assertEqual(request("POST", "/other/", payload)[0], 404)
                self.assertEqual(request("POST", "/zoo/", {**payload, "mode": "Unknown"})[0], 400)
                self.assertEqual(request("POST", "/zoo/", payload, "https://example.org")[0], 403)
                status, saved = request("POST", "/zoo/", payload)
                self.assertEqual((status, saved["mode"]), (200, "Explore"))
                self.assertEqual(zoo.read_bytes(), original.replace(b"Build", b"Explore", 1))
                self.assertEqual(request("GET", "/zoo/")[1], saved)
                with zoo.open("ab") as output:
                    output.write(b"Agent note.\r\n")
                self.assertEqual(request("POST", "/zoo/", {**saved, "mode": "Testing"})[0], 409)
                self.assertTrue(zoo.read_bytes().endswith(b"Agent note.\r\n"))

                status, current = request("GET", "/island/")
                self.assertEqual((status, current["mode"]), (200, None))
                self.assertEqual(request("POST", "/island/", {**current, "mode": "Plan"})[0], 200)
                self.assertEqual(island.read_bytes(),
                                 b"# Project Bible: Island\n\n**Current phase:** Plan\n\n## Vision\nKeep this too.\n")
                self.assertEqual(request("GET", "/zoo/")[1]["mode"], "Explore")
