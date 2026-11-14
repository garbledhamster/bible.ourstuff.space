"""Check, update, or restore a local shared Project Bible checkout."""

import argparse
import json
import subprocess

from serve import SharedBible, UpdateError


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("check", "update", "restore"))
    parser.add_argument("checkout")
    args = parser.parse_args()
    bible = SharedBible(args.checkout)
    try:
        installed = bible.installed_revision()
        if args.action == "update":
            result = bible.install(installed, bible.latest_revision())
        elif args.action == "restore":
            previous = bible.previous_revision(installed)
            if not previous:
                raise UpdateError("There is no backup for the installed version.")
            result = bible.restore(installed, previous)
        else:
            result = bible.check()
    except (UpdateError, OSError, subprocess.SubprocessError) as error:
        parser.exit(1, f"{error}\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
