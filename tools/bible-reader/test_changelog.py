from contextlib import closing
from functools import partial
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
from pathlib import Path
import tempfile
import threading
import unittest

from serve import ReaderHandler, SharedBible


class ChangelogTest(unittest.TestCase):
    def test_readers_use_their_own_logs_and_installed_shared_copy(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            shared = root / "checkout"
            resources = shared / "docs/resources"
            resources.mkdir(parents=True)
            system_log = resources / "changelog.md"
            system_log.write_text("First release")
            project_log = root / "private.md"
            project_log.write_text("Project change")
            handler = partial(
                ReaderHandler, directory=directory,
                readers={"/game/": SharedBible(shared), "/other/": SharedBible(shared)},
                changelogs={"/game/": project_log},
            )
            with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
                worker = threading.Thread(target=server.serve_forever, daemon=True)
                worker.start()
                try:
                    with closing(HTTPConnection("127.0.0.1", server.server_port)) as connection:
                        def read(path):
                            connection.request("GET", path)
                            response = connection.getresponse()
                            return response.status, response.read()

                        self.assertEqual(read("/game/bible-changelog.md"), (200, b"First release"))
                        self.assertEqual(read("/game/project-changelog.md"), (200, b"Project change"))
                        self.assertEqual(read("/other/project-changelog.md")[0], 404)
                        system_log.write_text("Next release")
                        self.assertEqual(read("/game/bible-changelog.md"), (200, b"Next release"))
                        self.assertEqual(read("/game/project-changelog.md"), (200, b"Project change"))
                finally:
                    server.shutdown()
                    worker.join()
