from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
RESOURCES = ROOT / "dist" / "resources"
TICKETS = RESOURCES / "game-tickets"


def package(name, entries):
    with ZipFile(RESOURCES / name, "w") as archive:
        for filename, source in entries:
            archive.writestr(ZipInfo(filename), source.read_bytes(), compress_type=ZIP_DEFLATED)


planning_files = [RESOURCES / "game-spec-template.md", *sorted(TICKETS.glob("*.md"))]
package("game-planning-kit.zip", [
    (path.relative_to(RESOURCES).as_posix(), path) for path in planning_files
])
package("game-quality-control.zip", [
    ("game-quality-control/SKILL.md", RESOURCES / "game-quality-control.md"),
    ("game-quality-control/agents/openai.yaml", RESOURCES / "game-quality-control-agent.yaml"),
])
print("Packaged the planning kit and quality-control skill from the published sources.")
