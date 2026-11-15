"""Serve private Project Bible readers and update only their shared checkouts."""

import argparse
from functools import partial
from hashlib import sha256
from html import escape, unescape
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
import json
import os
from pathlib import Path
import re
import subprocess
from tempfile import NamedTemporaryFile
import threading
from urllib.parse import unquote, urljoin, urlsplit, urlunsplit
from urllib.request import urlopen

from sprite_store import SET_ID, SET_LIMIT, SET_REVISION, SPRITE_API, SpriteConflict, SpriteWorkspace

RELEASE_URL = "https://bible.ourstuff.space/version.json"
UPSTREAM = "https://github.com/garbledhamster/bible.ourstuff.space.git"
ASSETS = Path(__file__).resolve().parent
API = "api/bible-update"
TASK_API = "api/task-list"
TASK_LIMIT = 128 * 1024
TASK_LOCK = threading.Lock()
WORK_MODE_API = "api/work-mode"
WORK_MODES = ("Explore", "Grilling", "Plan", "Build", "Testing", "Maintenance")
WORK_MODE_LOCK = threading.Lock()
WORK_MODE_LINE = re.compile(rb"^(\*\*(?:Current phase|Work mode):\*\*[ \t]*)([^\r\n]*)", re.M)
BIBLE_TITLE = re.compile(rb"^# [^\r\n]+(?:\r?\n|$)")
REVISION = re.compile(r"[0-9a-f]{40}")
ASSET_REVISION_PATH = re.compile(r"/_bible/assets/[0-9a-f]{40}(/.*)")
ASSET_TAG = re.compile(r"<(?:script|link)\b[^>]*>", re.I)
ASSET_URL = re.compile(r"""(\s(?:src|href)\s*=\s*)(["'])(.*?)\2""", re.I)


def reader_html(source, path, revision):
    """Give each installed release a distinct URL for its module and stylesheet graph."""
    prefix = f"/_bible/assets/{revision}"

    def update_url(match):
        url = urlsplit(urljoin(path, unescape(match[3])))
        if url.scheme or url.netloc or not url.path.lower().endswith((".js", ".mjs", ".css")):
            return match[0]
        stamped = urlunsplit(("", "", prefix + url.path, url.query, url.fragment))
        return match[1] + match[2] + escape(stamped, quote=True) + match[2]

    return ASSET_TAG.sub(lambda tag: ASSET_URL.sub(update_url, tag[0], count=1), source)


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
        previous = self.previous_revision(installed)
        try:
            latest = self.latest_revision()
        except UpdateError as error:
            return {"installed": installed, "latest": None, "previous": previous,
                    "status": "offline", "message": str(error)}
        return self.compare(installed, latest, previous)

    @staticmethod
    def compare(installed, latest, previous=None):
        return {
            "installed": installed,
            "latest": latest,
            "previous": previous,
            "status": "current" if installed == latest else "available",
        }

    @staticmethod
    def backup_ref(revision):
        return f"refs/project-bible/backups/{revision}"

    def previous_revision(self, installed):
        ref = self.backup_ref(installed)
        return self.git("for-each-ref", "--format=%(objectname)", ref) or None

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
                return self.compare(installed, latest, self.previous_revision(installed))
            try:
                self.require_clean()
                self.git("fetch", "--no-tags", self.upstream, "refs/heads/main")
                self.git("merge-base", "--is-ancestor", latest, "FETCH_HEAD")
                self.git("merge-base", "--is-ancestor", installed, latest)
                self.require_clean()
                if self.installed_revision() != installed:
                    raise UpdateError("The installed version changed. Check for updates again.")
                self.git("update-ref", self.backup_ref(latest), installed)
                self.git("checkout", "--detach", "--no-overwrite-ignore", latest)
            except (OSError, subprocess.SubprocessError) as error:
                raise UpdateError("The update couldn’t be installed. Check the installed version.") from error
            return self.compare(latest, latest, installed)

    def restore(self, expected, target):
        with self.lock:
            installed = self.installed_revision()
            if installed != expected or self.previous_revision(installed) != target:
                raise UpdateError("The versions changed. Check for updates again.")
            self.require_clean()
            try:
                self.git("checkout", "--detach", "--no-overwrite-ignore", target)
            except (OSError, subprocess.SubprocessError) as error:
                raise UpdateError("The backup couldn’t be restored. Check the installed version.") from error
            return {"installed": target, "latest": None, "previous": self.previous_revision(target),
                    "status": "restored"}


def replace_file(path, data):
    with NamedTemporaryFile(dir=path.parent, delete=False) as output:
        temporary = Path(output.name)
        try:
            output.write(data)
            output.flush()
            temporary.chmod(path.stat().st_mode & 0o777)
            temporary.replace(path)
        finally:
            temporary.unlink(missing_ok=True)


def work_mode_snapshot(data):
    title = BIBLE_TITLE.match(data)
    if title is None:
        raise ValueError("The Project Bible needs a title.")
    chapter = re.search(rb"^##[ \t]", data, re.M)
    opening_end = chapter.start() if chapter else len(data)
    fields = list(WORK_MODE_LINE.finditer(data, title.end(), opening_end))
    if len(fields) > 1:
        raise ValueError("The Project Bible has more than one Work mode.")
    field = fields[0] if fields else None
    value = field[2].decode("utf-8").strip() if field else None
    snapshot = {"mode": value if value in WORK_MODES else None,
                "revision": sha256(data).hexdigest()}
    return snapshot, field, title.end()


class ReaderHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, readers=None, mounts=None, task_lists=None, changelogs=None,
                 project_bibles=None, sprite_workspaces=None, **kwargs):
        self.readers = readers or {}
        self.mounts = mounts or {}
        self.task_lists = task_lists or {}
        self.changelogs = changelogs or {}
        self.project_bibles = project_bibles or {}
        self.sprite_workspaces = sprite_workspaces or {}
        super().__init__(*args, **kwargs)

    def list_directory(self, path):
        self.send_error(404)
        return None

    def translate_path(self, path):
        location = self.translate_reader_path(path)
        if self.sprite_workspaces:
            try:
                resolved = Path(location).resolve()
                served_paths = [resolved]
                if resolved.is_dir():
                    # The HTTP handler can open an index after translating the directory.
                    served_paths.extend((resolved / name).resolve() for name in ("index.html", "index.htm"))
                if not any(served.is_relative_to(workspace.directory)
                           for served in served_paths for workspace in self.sprite_workspaces.values()):
                    return location
            except (OSError, RuntimeError):
                pass
            return str(Path(self.directory) / ".unavailable-reader-path" / "missing")
        return location

    def translate_reader_path(self, path):
        path = urlsplit(path).path
        asset = ASSET_REVISION_PATH.fullmatch(path)
        if asset:
            path = asset[1]
        decoded = unquote(path)
        if any(segment.startswith(".") for segment in decoded.split("/") if segment):
            return str(Path(self.directory) / ".unavailable-reader-path" / "missing")
        if decoded in ("/_bible/updates.js", "/_bible/updates.css", "/_bible/task-list.js"):
            return str(ASSETS / decoded.rsplit("/", 1)[1])
        for route, bible in self.readers.items():
            if decoded == route + "bible-changelog.md":
                return str(bible.path / "docs/resources/changelog.md")
            if decoded == route + "project-changelog.md":
                log = self.changelogs.get(route)
                if log is not None and self.local_host():
                    return str(log)
                return str(Path(self.directory) / ".unavailable-reader-path" / "missing")
        for route, task_path in self.task_lists.items():
            if decoded == route + "task-list.md":
                return str(task_path)
        for route, target in self.mounts.items():
            if decoded == route:
                return str(target)
            if route.endswith("/") and decoded.startswith(route):
                return str(target.joinpath(*filter(None, decoded[len(route):].split("/"))))
        return super().translate_path(path)

    def send_head(self):
        path = urlsplit(self.path).path
        route = unquote(path)
        if route.endswith("/index.html"):
            route = route[:-len("index.html")]
        bible = self.readers.get(route)
        if bible is None:
            return super().send_head()
        index = Path(self.translate_path(path))
        if index.is_dir():
            index = index / "index.html"
        try:
            revision = bible.installed_revision()
            content = reader_html(index.read_text(encoding="utf-8"), path, revision).encode("utf-8")
        except (UpdateError, OSError, UnicodeError, subprocess.SubprocessError):
            return super().send_head()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        return BytesIO(content)

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

    def task_list(self):
        path = urlsplit(self.path).path
        return self.task_lists.get(path[:-len(TASK_API)]) if path.endswith("/" + TASK_API) else None

    @staticmethod
    def task_snapshot(path):
        data = path.read_bytes()
        if len(data) > TASK_LIMIT:
            raise ValueError("Task List is too large.")
        return {"markdown": data.decode("utf-8"), "revision": sha256(data).hexdigest()}

    def save_task_list(self, path):
        if (not self.local_host()
                or self.headers.get("Origin") != f'http://{self.headers.get("Host")}'
                or self.headers.get("X-Bible-Task-List") != "1"
                or self.headers.get_content_type() != "application/json"):
            return self.respond(403, {"message": "Open the Task List in its private reader."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 2 * TASK_LIMIT:
                raise ValueError("Invalid request length")
            self.connection.settimeout(5)
            request = json.loads(self.rfile.read(length))
            revision = request["revision"]
            markdown = request["markdown"]
            if (not isinstance(revision, str) or not re.fullmatch(r"[0-9a-f]{64}", revision)
                    or not isinstance(markdown, str) or not markdown.startswith("# Task List\n")
                    or "\x00" in markdown or len(markdown.encode("utf-8")) > TASK_LIMIT):
                raise ValueError("Invalid Task List")
        except (OSError, ValueError, TypeError, KeyError):
            return self.respond(400, {"message": "This Task List could not be saved. Check the edit and try again."})
        try:
            with TASK_LOCK:
                if self.task_snapshot(path)["revision"] != revision:
                    return self.respond(409, {"message": "The Task List changed. Reload it before applying your edit."})
                replace_file(path, markdown.encode("utf-8"))
                return self.respond(200, self.task_snapshot(path))
        except (OSError, ValueError):
            return self.respond(503, {"message": "The project Task List is unavailable."})

    def project_bible(self):
        path = urlsplit(self.path).path
        return self.project_bibles.get(path[:-len(WORK_MODE_API)]) if path.endswith("/" + WORK_MODE_API) else None

    def read_work_mode(self, path):
        if not self.local_host():
            return self.respond(403, {"message": "Open the reader at its private address."})
        try:
            snapshot, _, _ = work_mode_snapshot(path.read_bytes())
            return self.respond(200, snapshot)
        except (OSError, ValueError):
            return self.respond(503, {"message": "Couldn’t read the Work mode from this Project Bible."})

    def save_work_mode(self, path):
        if (not self.local_host()
                or self.headers.get("Origin") != f'http://{self.headers.get("Host")}'
                or self.headers.get("X-Bible-Work-Mode") != "1"
                or self.headers.get_content_type() != "application/json"):
            return self.respond(403, {"message": "Change the Work mode from its private reader."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 256:
                raise ValueError("Invalid request length")
            self.connection.settimeout(5)
            request = json.loads(self.rfile.read(length))
            mode, revision = request["mode"], request["revision"]
            if mode not in WORK_MODES or not isinstance(revision, str) or not re.fullmatch(r"[0-9a-f]{64}", revision):
                raise ValueError("Invalid mode or revision")
        except (OSError, ValueError, TypeError, KeyError):
            return self.respond(400, {"message": "Choose a Work mode and try again."})
        try:
            with WORK_MODE_LOCK:
                data = path.read_bytes()
                snapshot, field, title_end = work_mode_snapshot(data)
                if snapshot["revision"] != revision:
                    return self.respond(409, {"message": "The Project Bible changed. Review the current mode and try again."})
                if snapshot["mode"] == mode:
                    return self.respond(200, snapshot)
                if field:
                    data = data[:field.start(2)] + mode.encode() + data[field.end(2):]
                else:
                    newline = b"\r\n" if data[:title_end].endswith(b"\r\n") else b"\n"
                    separator = b"" if data[:title_end].endswith(b"\n") else newline
                    rest = data[title_end:]
                    gap = b"" if rest.startswith(newline) else newline
                    data = (data[:title_end] + separator + newline + b"**Current phase:** "
                            + mode.encode() + newline + gap + rest)
                replace_file(path, data)
                return self.respond(200, work_mode_snapshot(data)[0])
        except (OSError, ValueError):
            return self.respond(503, {"message": "Couldn’t save the Work mode to this Project Bible."})

    def sprite_workspace(self):
        path = urlsplit(self.path).path
        route, separator, suffix = path.rpartition("/" + SPRITE_API)
        if separator and (not suffix or suffix.startswith("/")):
            return self.sprite_workspaces.get(route + "/"), suffix[1:] if suffix else None
        return None, None

    def read_sprites(self, workspace, set_id):
        if not self.local_host():
            return self.respond(403, {"message": "Open Sprite Generator in its private reader."})
        if set_id is not None and not SET_ID.fullmatch(set_id):
            return self.respond(404, {"message": "Sprite set not found."})
        try:
            return self.respond(200, workspace.library() if set_id is None else workspace.read(set_id))
        except FileNotFoundError:
            if set_id and workspace.directory.is_dir():
                return self.respond(404, {"message": "Sprite set not found."})
        except (KeyError, OSError, RecursionError, ValueError):
            pass
        return self.respond(503, {"project": workspace.project,
                                  "message": "Can’t open the sprite workspace. Check its reader setup."})

    def save_sprites(self, workspace, set_id):
        if set_id is None or not SET_ID.fullmatch(set_id):
            return self.respond(404, {"message": "Sprite set not found."})
        if (not self.local_host()
                or self.headers.get("Origin") != f'http://{self.headers.get("Host")}'
                or self.headers.get("X-Bible-Sprite-Generator") != "1"
                or self.headers.get_content_type() != "application/json"):
            return self.respond(403, {"message": "Save the set from its private reader."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= SET_LIMIT:
                raise ValueError("Invalid request length.")
            self.connection.settimeout(5)
            request = json.loads(self.rfile.read(length))
            revision, manifest = request["revision"], request["manifest"]
            if revision is not None and (not isinstance(revision, str) or not SET_REVISION.fullmatch(revision)):
                raise ValueError("Invalid revision.")
        except (KeyError, OSError, RecursionError, TypeError, ValueError):
            return self.respond(400, {"message": "Can’t save this sprite set. Check the set and try again."})
        try:
            return self.respond(200, workspace.save(set_id, manifest, revision))
        except SpriteConflict as error:
            return self.respond(409, {"revision": error.revision,
                                      "message": "Someone saved a newer revision. Your draft is still here."})
        except (TypeError, ValueError, RecursionError) as error:
            return self.respond(400, {"message": str(error)})
        except OSError:
            return self.respond(503, {"project": workspace.project,
                                      "message": "Can’t save to the sprite workspace. Check its reader setup."})

    def do_GET(self):
        workspace, set_id = self.sprite_workspace()
        if workspace is not None:
            return self.read_sprites(workspace, set_id)
        project = self.project_bible()
        if project is not None:
            return self.read_work_mode(project)
        task_list = self.task_list()
        if task_list is not None:
            if not self.local_host():
                return self.respond(403, {"message": "Open the reader at its local address."})
            try:
                return self.respond(200, self.task_snapshot(task_list))
            except (OSError, ValueError):
                return self.respond(503, {"message": "The project Task List is unavailable."})
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
        workspace, set_id = self.sprite_workspace()
        if workspace is not None:
            return self.save_sprites(workspace, set_id)
        project = self.project_bible()
        if project is not None:
            return self.save_work_mode(project)
        task_list = self.task_list()
        if task_list is not None:
            return self.save_task_list(task_list)
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
            installed = request["installed"]
            action = request.get("action", "install")
            if action not in ("install", "restore"):
                raise ValueError("Invalid action")
            target = request["previous" if action == "restore" else "latest"]
            if not all(isinstance(sha, str) and REVISION.fullmatch(sha) for sha in (installed, target)):
                raise ValueError("Invalid revisions")
        except (OSError, ValueError, TypeError, KeyError):
            return self.respond(400, {"message": "Check for updates and try again."})
        try:
            change = bible.restore if action == "restore" else bible.install
            return self.respond(200, change(installed, target))
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
    parser.add_argument("--task-list", nargs=2, action="append", default=[], metavar=("URL_PATH", "MARKDOWN_FILE"))
    parser.add_argument("--changelog", nargs=2, action="append", default=[], metavar=("URL_PATH", "MARKDOWN_FILE"))
    parser.add_argument("--project-bible", nargs=2, action="append", default=[], metavar=("URL_PATH", "MARKDOWN_FILE"))
    parser.add_argument("--sprite-generator", nargs=3, action="append", default=[],
                        metavar=("URL_PATH", "PROJECT_NAME", "WORKSPACE_DIRECTORY"))
    args = parser.parse_args()
    checkouts = {}
    readers = {}
    for route, checkout in args.reader:
        path = Path(checkout).resolve()
        if path not in checkouts:
            checkouts[path] = SharedBible(path)
        readers[route] = checkouts[path]
    mounts = {route: Path(directory).resolve() for route, directory in args.mount}
    task_lists = {route: Path(path).resolve() for route, path in args.task_list}
    if not task_lists.keys() <= readers.keys():
        parser.error("--task-list must use an existing --reader URL path")
    changelogs = {route: Path(path).resolve() for route, path in args.changelog}
    if not changelogs.keys() <= readers.keys():
        parser.error("--changelog must use an existing --reader URL path")
    project_bibles = {route: Path(path).resolve() for route, path in args.project_bible}
    if not project_bibles.keys() <= readers.keys():
        parser.error("--project-bible must use an existing --reader URL path")
    sprite_workspaces = {}
    served_paths = (args.directory.resolve(), *mounts.values(), *checkouts)
    for route, project, directory in args.sprite_generator:
        if route not in readers or route in sprite_workspaces:
            parser.error("--sprite-generator must use a distinct existing --reader URL path")
        workspace = SpriteWorkspace(project.strip(), directory)
        if not workspace.project:
            parser.error("--sprite-generator needs a project name")
        other_paths = (*served_paths, *(item.directory for item in sprite_workspaces.values()))
        if any(workspace.directory.is_relative_to(path) or path.is_relative_to(workspace.directory)
               for path in other_paths):
            parser.error("--sprite-generator needs a separate project-owned directory outside all served paths")
        sprite_workspaces[route] = workspace
    handler = partial(ReaderHandler, directory=str(args.directory.resolve()), readers=readers,
                      mounts=mounts, task_lists=task_lists, changelogs=changelogs,
                      project_bibles=project_bibles, sprite_workspaces=sprite_workspaces)
    with ThreadingHTTPServer((args.bind, args.port), handler) as server:
        server.serve_forever()


if __name__ == "__main__":
    main()
