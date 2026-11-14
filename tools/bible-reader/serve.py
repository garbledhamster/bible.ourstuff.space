"""Serve private Project Bible readers and update only their shared checkouts."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import subprocess
import threading
from urllib.parse import unquote, urlsplit
from urllib.request import urlopen

RELEASE_URL = "https://bible.ourstuff.space/version.json"
UPSTREAM = "https://github.com/garbledhamster/bible.ourstuff.space.git"
ASSETS = Path(__file__).resolve().parent
API = "api/bible-update"
REVISION = re.compile(r"[0-9a-f]{40}")


class UpdateError(Exception):
    pass


def published_revision():
    with urlopen(RELEASE_URL, timeout=8) as response:
        release = json.loads(response.read(4096))
    revision = release["revision"]
    if release["format"] != 1 or not isinstance(revision, str) or not REVISION.fullmatch(revision):
        raise ValueError("Invalid release manifest")
    return revision


class SharedBible:
    def __init__(self, path, upstream=UPSTREAM, published=published_revision):
        self.path = Path(path).resolve()
        self.upstream = upstream
        self.published = published
        self.lock = threading.Lock()

    def git(self, *args):
        return subprocess.run(
            ["git", "-C", str(self.path), *args], check=True, text=True,
            capture_output=True, timeout=45, env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
        ).stdout.strip()

    def installed_revision(self):
        if Path(self.git("rev-parse", "--show-toplevel")).resolve() != self.path:
            raise UpdateError("The shared Bible checkout is missing.")
        return self.git("rev-parse", "HEAD")

    def latest_revision(self):
        try:
            return self.published()
        except (OSError, KeyError, TypeError, ValueError) as error:
            raise UpdateError("Couldn’t reach the published Bible. Try again in a moment.") from error

    def check(self):
        installed = self.installed_revision()
        try:
            latest = self.latest_revision()
        except UpdateError as error:
            return {"installed": installed, "latest": None, "status": "offline", "message": str(error)}
        return self.compare(installed, latest)

    @staticmethod
    def compare(installed, latest):
        return {
            "installed": installed,
            "latest": latest,
            "status": "current" if installed == latest else "available",
        }

    def require_clean(self):
        if self.git("status", "--porcelain", "--untracked-files=all"):
            raise UpdateError("This shared copy has local edits. Save or review them before updating.")

    def install(self, expected, target):
        with self.lock:
            installed = self.installed_revision()
            latest = self.latest_revision()
            if target != latest or (installed != expected and installed != latest):
                raise UpdateError("The versions changed. Check for updates again.")
            if installed == latest:
                return self.compare(installed, latest)
            try:
                self.require_clean()
                self.git("fetch", "--no-tags", self.upstream, "refs/heads/main")
                self.git("merge-base", "--is-ancestor", latest, "FETCH_HEAD")
                self.git("merge-base", "--is-ancestor", installed, latest)
                self.require_clean()
                if self.installed_revision() != installed:
                    raise UpdateError("The installed version changed. Check for updates again.")
                self.git("checkout", "--detach", "--no-overwrite-ignore", latest)
            except (OSError, subprocess.SubprocessError) as error:
                raise UpdateError("The update couldn’t be installed. The current copy is still available.") from error
            return self.compare(latest, latest)


class ReaderHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, readers=None, mounts=None, **kwargs):
        self.readers = readers or {}
        self.mounts = mounts or {}
        super().__init__(*args, **kwargs)

    def list_directory(self, path):
        self.send_error(404)
        return None

    def translate_path(self, path):
        decoded = unquote(urlsplit(path).path)
        if any(segment.startswith(".") for segment in decoded.split("/") if segment):
            return str(Path(self.directory) / ".unavailable-reader-path" / "missing")
        if decoded in ("/_bible/updates.js", "/_bible/updates.css"):
            return str(ASSETS / decoded.rsplit("/", 1)[1])
        for route, target in self.mounts.items():
            if decoded == route:
                return str(target)
            if route.endswith("/") and decoded.startswith(route):
                return str(target.joinpath(*filter(None, decoded[len(route):].split("/"))))
        return super().translate_path(path)

    def respond(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def update_route(self):
        path = urlsplit(self.path).path
        return self.readers.get(path[:-len(API)]) if path.endswith("/" + API) else None

    def local_host(self):
        address, port = self.server.server_address
        hosts = {f"{address}:{port}"}
        if address == "127.0.0.1":
            hosts.add(f"localhost:{port}")
        return self.headers.get("Host") in hosts

    def do_GET(self):
        bible = self.update_route()
        if bible is None:
            return super().do_GET()
        if not self.local_host():
            return self.respond(403, {"message": "Open the reader at its local address."})
        try:
            return self.respond(200, bible.check())
        except (UpdateError, OSError, subprocess.SubprocessError):
            return self.respond(503, {"message": "The shared Bible checkout is unavailable."})

    def do_POST(self):
        bible = self.update_route()
        if bible is None:
            return self.respond(404, {"message": "Unknown reader."})
        if (not self.local_host()
                or self.headers.get("Origin") != f'http://{self.headers.get("Host")}'
                or self.headers.get("X-Bible-Update") != "1"
                or self.headers.get_content_type() != "application/json"):
            return self.respond(403, {"message": "Start the update from this reader."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 256:
                raise ValueError("Invalid request length")
            self.connection.settimeout(5)
            request = json.loads(self.rfile.read(length))
            installed, latest = request["installed"], request["latest"]
            if not all(isinstance(sha, str) and REVISION.fullmatch(sha) for sha in (installed, latest)):
                raise ValueError("Invalid revisions")
        except (OSError, ValueError, TypeError, KeyError):
            return self.respond(400, {"message": "Check for updates and try again."})
        try:
            return self.respond(200, bible.install(installed, latest))
        except UpdateError as error:
            return self.respond(409, {"message": str(error)})
        except (OSError, subprocess.SubprocessError):
            return self.respond(503, {"message": "The shared Bible checkout is unavailable."})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--port", type=int, required=True)
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--reader", nargs=2, action="append", metavar=("URL_PATH", "SHARED_CHECKOUT"), required=True)
    parser.add_argument("--mount", nargs=2, action="append", default=[], metavar=("URL_PATH", "LOCAL_PATH"))
    args = parser.parse_args()
    checkouts = {}
    readers = {}
    for route, checkout in args.reader:
        path = Path(checkout).resolve()
        if path not in checkouts:
            checkouts[path] = SharedBible(path)
        readers[route] = checkouts[path]
    mounts = {route: Path(directory).resolve() for route, directory in args.mount}
    handler = partial(ReaderHandler, directory=str(args.directory.resolve()), readers=readers, mounts=mounts)
    with ThreadingHTTPServer((args.bind, args.port), handler) as server:
        server.serve_forever()


if __name__ == "__main__":
    main()
