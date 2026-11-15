"""Revision-bound part proposals for a private reader's sprite workspace."""

from base64 import b64decode, b64encode
import json
from tempfile import NamedTemporaryFile
from pathlib import Path
from uuid import uuid4

from sprite_store import ASSET_LIMIT, PNG_URL, SET_ID, SET_REVISION, SpriteConflict, png_dimensions, valid_name, workspace_lock

PROPOSAL_LIMIT = 4 * ((ASSET_LIMIT + 2) // 3) + 4096
METADATA_LIMIT = 4096


def named(items, item_id):
    if isinstance(items, list):
        return next((item for item in items if isinstance(item, dict) and item.get("id") == item_id), None)
    return None


def offsets(value):
    return isinstance(value, dict) and all(
        type(value.get(axis)) is int and abs(value[axis]) <= 2**53 - 1 for axis in ("x", "y")
    )


def inspect_slot(workspace, set_id, request, snapshot=None):
    base = request.get("revision")
    if base is not None and (not isinstance(base, str) or not SET_REVISION.fullmatch(base)):
        raise ValueError("Copy a valid saved revision from the editor.")
    snapshot = snapshot or workspace.read(set_id)
    if base is not None and base != snapshot["revision"]:
        raise SpriteConflict(snapshot["revision"])

    manifest = snapshot["manifest"]
    placement = manifest.get("placement")
    if not isinstance(placement, dict):
        raise ValueError("Register the selected slot and save the set first.")
    pose_id, slot_id = request.get("poseId"), request.get("slotId")
    if not all(isinstance(item, str) and 0 < len(item) <= 120 for item in (pose_id, slot_id)):
        raise ValueError("Choose a saved pose and slot.")
    pose = named(placement.get("poses"), pose_id)
    slot = named(placement.get("slots"), slot_id)
    view = named(placement.get("views"), pose.get("viewId")) if pose else None
    if not view or not slot or view["id"] != slot.get("viewId") or request.get("viewId", view["id"]) != view["id"]:
        raise ValueError("Choose a slot in the selected pose’s view.")
    layers = pose.get("layers")
    if not isinstance(layers, list):
        raise ValueError("Place this slot on the selected pose and save the set first.")
    layer = next((entry for entry in layers if isinstance(entry, dict) and entry.get("slotId") == slot_id), None)
    if not offsets(layer):
        raise ValueError("Place this slot on the selected pose and save the set first.")
    expression_id = request.get("expressionId") or ""
    if not isinstance(expression_id, str) or len(expression_id) > 120:
        raise ValueError("Choose a saved expression.")
    expression = named(placement.get("expressions"), expression_id) if expression_id else None
    if expression_id and (not expression or not isinstance(expression.get("parts"), dict)):
        raise ValueError("Choose a saved expression.")
    part_id = expression["parts"].get(slot_id, layer.get("partId")) if expression else layer.get("partId")
    part = named(placement.get("parts"), part_id)
    anchors = pose.get("anchors")
    if (not part or part.get("slotId") != slot_id or not offsets(part)
            or not isinstance(anchors, dict) or not isinstance(slot.get("anchor"), str)
            or not offsets(anchors.get(slot["anchor"])) or not offsets(anchors.get("origin"))):
        raise ValueError("Register a compatible PNG and anchor for the selected slot.")
    asset = named(manifest["assets"], part.get("assetId"))
    if not asset or any(type(asset.get(key)) is not int for key in ("width", "height")):
        raise ValueError("Import the registered PNG for the selected slot.")
    return {
        "canvas": {"width": placement.get("width"), "height": placement.get("height")},
        "referenceAsset": {"id": asset["id"], "name": asset["name"]},
        "project": workspace.project, "setId": set_id, "setName": manifest["name"], "revision": snapshot["revision"],
        "poseId": pose_id, "poseName": pose.get("name", pose_id),
        "viewId": view["id"], "viewName": view.get("name", view["id"]),
        "slotId": slot_id, "slotName": slot.get("name", slot_id),
        "expressionId": expression_id, "expressionName": expression.get("name", expression_id) if expression else "",
        "registration": {"x": part["x"], "y": part["y"], "width": asset["width"], "height": asset["height"]},
    }


def read_proposal_file(path, include_asset=False):
    if path.is_symlink():
        raise ValueError("Invalid sprite proposal.")
    with path.open("rb") as source:
        header = source.readline(METADATA_LIMIT)
        proposal = json.loads(header)
        if include_asset:
            proposal["asset"] = json.loads(source.read(PROPOSAL_LIMIT))
    return proposal


def proposal_list(workspace, set_id):
    snapshot = workspace.read(set_id)
    adopted = {asset["id"] for asset in snapshot["manifest"]["assets"]}
    proposals = []
    for path in workspace.directory.glob(f"{set_id}.*.proposal"):
        if not SET_ID.fullmatch(path.stem.removeprefix(f"{set_id}.")):
            continue
        try:
            item = read_proposal_file(path)
        except FileNotFoundError:
            continue  # Another editor discarded it while this request was listing.
        if item["id"] not in adopted:
            proposals.append(item)
    return {"revision": snapshot["revision"], "proposals": sorted(proposals, key=lambda item: item["name"].casefold())}


def stage_proposal(workspace, set_id, request):
    if not request.get("revision"):
        raise ValueError("Copy the saved revision before staging a proposal.")
    name, encoded = request.get("name"), request.get("pngBase64")
    if (not valid_name(name) or not isinstance(encoded, str)
            or len(encoded) > 4 * ((ASSET_LIMIT + 2) // 3)):
        raise ValueError("Give the proposal a name and a PNG smaller than 8 MB.")
    data = b64decode(encoded, validate=True)
    if len(data) > ASSET_LIMIT:
        raise ValueError("Use a PNG smaller than 8 MB.")
    width, height = png_dimensions(data)

    with workspace_lock(workspace.directory / ".sprite-generator.lock"):
        selection = inspect_slot(workspace, set_id, request)
        registration = selection["registration"]
        if "x" in request or "y" in request:
            if not offsets(request):
                raise ValueError("Set both registration offsets as whole pixels.")
            x, y = request["x"], request["y"]
        else:
            if (width, height) != (registration["width"], registration["height"]):
                raise ValueError("Set both registration offsets when the PNG dimensions change.")
            x, y = registration["x"], registration["y"]
        proposal_id = str(uuid4())
        item = {key: selection[key] for key in (
            "revision", "viewId", "viewName", "poseId", "poseName", "slotId", "slotName", "expressionId", "expressionName",
        )}
        item.update(id=proposal_id, name=name, x=x, y=y, width=width, height=height)
        metadata = json.dumps(item, ensure_ascii=False, allow_nan=False).encode("utf-8") + b"\n"
        if len(metadata) >= METADATA_LIMIT:
            raise ValueError("The proposal names are too long.")
        asset = {
            "id": proposal_id, "name": name, "width": width, "height": height,
            "dataUrl": PNG_URL + b64encode(data).decode("ascii"),
        }
        with NamedTemporaryFile(dir=workspace.directory, delete=False) as output:
            temporary = Path(output.name)
            try:
                output.write(metadata)
                output.write(json.dumps(asset, ensure_ascii=False, allow_nan=False).encode("utf-8"))
                output.close()
                temporary.replace(workspace.proposal_path(set_id, proposal_id))
            finally:
                temporary.unlink(missing_ok=True)
        return item
