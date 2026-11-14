from functools import partial
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
import json
from pathlib import Path
import tempfile
import threading
import unittest

from serve import ReaderHandler


class TaskListTest(unittest.TestCase):
    def test_save_is_private_to_configured_project_and_checks_revision(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            path = root / "task-list.md"
            path.write_text("# Task List\n")
            handler = partial(ReaderHandler, directory=directory, task_lists={"/game/": path})
            with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
                worker = threading.Thread(target=server.serve_forever, daemon=True)
                worker.start()
                self.addCleanup(worker.join)
                self.addCleanup(server.shutdown)
                host = "127.0.0.1:" + str(server.server_port)
                connection = HTTPConnection(host)
                self.addCleanup(connection.close)

                def request(method, route, body=None, origin=None):
                    headers = {"Origin": origin or "http://" + host,
                               "Content-Type": "application/json", "X-Bible-Task-List": "1"}
                    connection.request(method, route, json.dumps(body) if body else None, headers)
                    response = connection.getresponse()
                    return response.status, json.loads(response.read())

                route = "/game/api/task-list"
                status, current = request("GET", route)
                self.assertEqual(status, 200)
                update = {"revision": current["revision"], "markdown": "# Task List\n\nNew task\n"}
                self.assertEqual(request("POST", "/other/api/task-list", update)[0], 404)
                self.assertEqual(request("POST", route, update, "https://example.org")[0], 403)
                self.assertEqual(request("POST", route, update)[0], 200)
                self.assertEqual(path.read_text(), update["markdown"])
                path.write_text("# Task List\n\nAgent edit\n")
                self.assertEqual(request("POST", route, update)[0], 409)
                self.assertIn("Agent edit", path.read_text())
