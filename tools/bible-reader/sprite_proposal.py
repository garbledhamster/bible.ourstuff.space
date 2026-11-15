"""Inspect a saved sprite slot or stage a local PNG from a Codex workspace."""

import argparse
from base64 import b64encode
import json
from pathlib import Path
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener

from sprite_store import ASSET_LIMIT, SET_ID, SPRITE_API


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def reader_url(value):
    url = urlsplit(value)
    if (url.scheme != "http" or url.hostname not in ("localhost", "127.0.0.1", "::1")
            or url.username is not None or url.password is not None or url.query or url.fragment
            or not re.search(r"/" + SPRITE_API + r"/" + SET_ID.pattern + r"\Z", url.path)):
        raise ValueError("Use the localhost set URL copied from Sprite Generator.")
    return url


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="action", required=True)
    for action in ("inspect", "stage"):
        command = commands.add_parser(action)
        command.add_argument("--set-url", required=True)
        command.add_argument("--revision", required=action == "stage")
        command.add_argument("--pose", required=True)
        command.add_argument("--slot", required=True)
        command.add_argument("--expression", default="")
        if action == "stage":
            command.add_argument("--png", type=Path, required=True)
            command.add_argument("--x", type=int)
            command.add_argument("--y", type=int)
    args = parser.parse_args()
    try:
        url = reader_url(args.set_url)
        data = {"action": args.action, "poseId": args.pose, "slotId": args.slot,
                "expressionId": args.expression, "revision": args.revision}
        if args.action == "stage":
            with args.png.open("rb") as image:
                png = image.read(ASSET_LIMIT + 1)
            if len(png) > ASSET_LIMIT:
                raise ValueError("Use a PNG smaller than 8 MB.")
            data.update(name=args.png.name, pngBase64=b64encode(png).decode("ascii"))
            if args.x is not None or args.y is not None:
                data.update(x=args.x, y=args.y)
        request = Request(args.set_url + "/proposals", data=json.dumps(data).encode(), headers={
            "Origin": f"{url.scheme}://{url.netloc}", "Content-Type": "application/json",
            "X-Bible-Sprite-Generator": "1",
        }, method="POST")
        # Keep the workspace PNG on this loopback reader even if a proxy is configured.
        with build_opener(ProxyHandler({}), NoRedirect()).open(request, timeout=10) as response:
            result = json.load(response)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except HTTPError as error:
        try:
            message = json.load(error)["message"]
        except (KeyError, ValueError):
            message = "Open the private reader and check the copied set URL."
        parser.exit(1, f"{message}\n")
    except (OSError, URLError, ValueError) as error:
        parser.exit(1, f"{error}\n")


if __name__ == "__main__":
    main()
