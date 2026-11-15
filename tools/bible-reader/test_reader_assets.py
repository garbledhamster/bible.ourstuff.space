from contextlib import closing
from functools import partial
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
from pathlib import Path
import tempfile
import threading
import unittest

from serve import ReaderHandler


class ReaderAssetsTest(unittest.TestCase):
    def test_reader_loads_fresh_module_graph_after_version_change(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            reader = root / "sample"
            reader.mkdir()
            (reader / "index.html").write_text(
                '<link rel="stylesheet" href="shared/review.css">'
                '<link rel="alternate" href="game-bible.md">'
                '<script type="module" src="../reader.js"></script>'
                '<script src="https://example.com/external.js"></script>'
            )
            (root / "reader.js").write_text("import './dependency.js';")
            dependency = root / "dependency.js"
            dependency.write_text("export const old = true;")
            (root / ".private").write_text("private file")
            class Checkout:
                revision = "1" * 40

                def installed_revision(self):
                    return self.revision

            checkout = Checkout()
            handler = partial(ReaderHandler, directory=directory, readers={"/sample/": checkout})
            with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
                worker = threading.Thread(target=server.serve_forever, daemon=True)
                worker.start()
                self.addCleanup(worker.join)
                self.addCleanup(server.shutdown)
                with closing(HTTPConnection("127.0.0.1", server.server_port, timeout=3)) as connection:
                    def get(path, headers=None):
                        connection.request("GET", path, headers=headers or {})
                        response = connection.getresponse()
                        return response.status, response.headers, response.read().decode()

                    status, headers, html = get("/sample/")
                    self.assertEqual(status, 200)
                    self.assertEqual(headers["Cache-Control"], "no-store")
                    first = f"/_bible/assets/{checkout.revision}/"
                    self.assertIn(f'{first}sample/shared/review.css', html)
                    self.assertIn(f'{first}reader.js', html)
                    self.assertIn('href="game-bible.md"', html)
                    self.assertIn('src="https://example.com/external.js"', html)
                    self.assertEqual(get(first + "dependency.js")[2], "export const old = true;")

                    checkout.revision = "2" * 40
                    dependency.write_text("export const newAsset = true;")
                    status, _, html = get("/sample/?bible-revision=" + checkout.revision,
                                          {"If-Modified-Since": "Wed, 31 Dec 2099 23:59:59 GMT"})
                    self.assertEqual(status, 200)
                    second = f"/_bible/assets/{checkout.revision}/"
                    self.assertIn(second + "reader.js", html)
                    self.assertNotIn(first, html)
                    self.assertEqual(get(second + "dependency.js")[2], "export const newAsset = true;")
                    self.assertEqual(get(second + ".private")[0], 404)
