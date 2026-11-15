"""Project-owned sprite sets used by the private Bible reader."""

from base64 import b64decode
from contextlib import contextmanager
from hashlib import sha256
import json
import os
from pathlib import Path
import re
from struct import unpack_from
from tempfile import NamedTemporaryFile
from zlib import crc32

SPRITE_API = "api/sprite-generator"
SET_ID = re.compile(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}")
SET_REVISION = re.compile(r"[0-9a-f]{64}")
SET_LIMIT = 32 * 1024 * 1024
ASSET_LIMIT = 8 * 1024 * 1024
PNG_URL = "data:image/png;base64,"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
PNG_DEPTHS = {0: (1, 2, 4, 8, 16), 2: (8, 16), 3: (1, 2, 4, 8), 4: (8, 16), 6: (8, 16)}


class SpriteConflict(Exception):
    def __init__(self, revision):
        self.revision = revision


@contextmanager
def workspace_lock(path):
    """Hold a write lock across the revision check and replace, including other reader processes."""
    with path.open("ab") as lock:
        if os.name == "nt":
            from msvcrt import LK_LOCK, locking

            lock.seek(0)
            locking(lock.fileno(), LK_LOCK, 1)
        else:
            from fcntl import LOCK_EX, flock

            flock(lock.fileno(), LOCK_EX)
        yield


def png_dimensions(data):
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError("Invalid PNG signature.")
    index = len(PNG_SIGNATURE)
    dimensions = None
    has_pixels = False
    while index + 12 <= len(data):
        length, kind = unpack_from(">I4s", data, index)
        end = index + 8 + length
        if end + 4 > len(data) or crc32(data[index + 4:end]) != unpack_from(">I", data, end)[0]:
            break
        if index == len(PNG_SIGNATURE):
            if kind != b"IHDR" or length != 13:
                break
            width, height, depth, color, compression, filtering, interlace = unpack_from(">IIBBBBB", data, index + 8)
            if (not (0 < width <= 8192 and 0 < height <= 8192 and width * height <= 32 * 1024 * 1024)
                    or depth not in PNG_DEPTHS.get(color, ()) or compression or filtering or interlace > 1):
                break
            dimensions = width, height
        elif kind == b"IDAT" and length:
            has_pixels = True
        elif kind == b"IEND" and not length and has_pixels and end + 4 == len(data):
            return dimensions
        index = end + 4
    raise ValueError("Invalid PNG data or dimensions.")


def valid_name(name):
    return isinstance(name, str) and len(name) <= 120 and bool(name.strip()) and not any(ord(char) < 32 for char in name)


def check_manifest_shape(manifest, set_id):
    if (not isinstance(manifest, dict) or type(manifest.get("version")) is not int or manifest["version"] != 1
            or manifest.get("id") != set_id or not valid_name(manifest.get("name"))
            or not isinstance(manifest.get("assets"), list)):
        raise ValueError("Invalid sprite manifest.")


def validate_manifest(manifest, set_id):
    check_manifest_shape(manifest, set_id)
    ids = set()
    for asset in manifest["assets"]:
        if not isinstance(asset, dict):
            raise ValueError("Invalid sprite asset.")
        asset_id, image = asset.get("id"), asset.get("dataUrl")
        width, height = asset.get("width"), asset.get("height")
        if (not isinstance(asset_id, str) or not SET_ID.fullmatch(asset_id) or asset_id in ids
                or not valid_name(asset.get("name")) or not isinstance(image, str) or not image.startswith(PNG_URL)
                or len(image) > len(PNG_URL) + 4 * ((ASSET_LIMIT + 2) // 3)
                or type(width) is not int or type(height) is not int):
            raise ValueError("Invalid sprite asset.")
        decoded = b64decode(image[len(PNG_URL):], validate=True)
        if len(decoded) > ASSET_LIMIT or png_dimensions(decoded) != (width, height):
            raise ValueError("The PNG dimensions don’t match the sprite asset.")
        ids.add(asset_id)


class SpriteWorkspace:
    def __init__(self, project, directory):
        self.project = project
        self.directory = Path(directory).resolve()

    def library(self):
        sets = []
        for path in self.directory.iterdir():
            if path.suffix != ".json" or not SET_ID.fullmatch(path.stem):
                continue
            snapshot = self.read(path.stem)
            sets.append({"id": path.stem, "name": snapshot["manifest"]["name"],
                         "revision": snapshot["revision"]})
        return {"project": self.project, "sets": sorted(sets, key=lambda item: (item["name"].casefold(), item["id"]))}

    def read(self, set_id):
        path = self.directory / f"{set_id}.json"
        if path.is_symlink():
            raise ValueError("Invalid sprite set.")
        with path.open("rb") as source:
            data = source.read(SET_LIMIT + 1)
        if len(data) > SET_LIMIT:
            raise ValueError("The sprite set is too large.")
        manifest = json.loads(data)
        check_manifest_shape(manifest, set_id)
        return {"revision": sha256(data).hexdigest(), "manifest": manifest}

    def proposal_path(self, set_id, proposal_id):
        return self.directory / f"{set_id}.{proposal_id}.proposal"

    def save(self, set_id, manifest, revision):
        validate_manifest(manifest, set_id)
        data = json.dumps(manifest, ensure_ascii=False, separators=(",", ":"), allow_nan=False).encode("utf-8") + b"\n"
        if len(data) > SET_LIMIT:
            raise ValueError("The sprite set is too large.")
        with workspace_lock(self.directory / ".sprite-generator.lock"):
            try:
                current = self.read(set_id)["revision"]
            except FileNotFoundError:
                current = None
            if current != revision:
                raise SpriteConflict(current)
            with NamedTemporaryFile(dir=self.directory, delete=False) as output:
                temporary = Path(output.name)
                try:
                    output.write(data)
                    output.close()
                    temporary.replace(self.directory / f"{set_id}.json")
                finally:
                    temporary.unlink(missing_ok=True)
            for asset in manifest["assets"]:
                try:
                    self.proposal_path(set_id, asset["id"]).unlink(missing_ok=True)
                except OSError:
                    # The manifest is already saved. The inbox also omits adopted parts.
                    continue
        return {"revision": sha256(data).hexdigest(), "manifest": manifest}
