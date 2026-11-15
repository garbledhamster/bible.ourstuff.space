import { renderSpritePose, resolveSpritePose } from './sprite-placement-model.js';

function cropForPose(pose, { poseId, expressionId }) {
  return {
    x: 0, y: 0, width: pose.canvas?.width ?? pose.width, height: pose.canvas?.height ?? pose.height,
    originX: pose.origin.x, originY: pose.origin.y, durationMs: pose.duration,
    source: { kind: 'pose', poseId, expressionId: expressionId || null },
  };
}

export function planPoseFrame(frame, manifest) {
  return cropForPose(resolveSpritePose(manifest, frame), frame);
}

export async function renderPoseFrame(frame, manifest) {
  const pose = await renderSpritePose(manifest, frame);
  return { ...cropForPose(pose, frame), image: pose.canvas };
}
