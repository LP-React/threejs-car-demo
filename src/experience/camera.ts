import { shots } from './sequence'

export type CameraPose = { angle: number; radius: number; y: number; targetX: number; targetY: number; targetZ: number; light: number; wide: number }
export type CameraJump = { from: CameraPose; to: CameraPose; mix: number }
export type SceneState = { progress: number; pose: CameraPose; jump: CameraJump | null }

export function blendPose(from: CameraPose, to: CameraPose, blend: number): CameraPose {
  const lerp = (a: number, b: number) => a + (b - a) * blend
  return {
    angle: lerp(from.angle, to.angle), radius: lerp(from.radius, to.radius), y: lerp(from.y, to.y),
    targetX: lerp(from.targetX, to.targetX), targetY: lerp(from.targetY, to.targetY), targetZ: lerp(from.targetZ, to.targetZ),
    light: lerp(from.light, to.light), wide: lerp(from.wide, to.wide),
  }
}

export function poseAt(progress: number, reducedMotion = false): CameraPose {
  const next = shots.findIndex((shot) => shot.at >= progress)
  const index = Math.max(1, next === -1 ? shots.length - 1 : next)
  const from = shots[index - 1]
  const to = shots[index]
  const raw = Math.max(0, Math.min(1, (progress - from.at) / (to.at - from.at)))
  const blend = reducedMotion ? (raw < 0.5 ? 0 : 1) : raw * raw * (3 - 2 * raw)
  const pose = (shot: typeof shots[number]): CameraPose => ({
    angle: shot.angle, radius: shot.radius, y: shot.y,
    targetX: shot.target[0], targetY: shot.target[1], targetZ: shot.target[2], light: shot.light, wide: shot.wide,
  })
  return blendPose(pose(from), pose(to), blend)
}

export function directTarget(from: CameraPose, destination: CameraPose): CameraPose {
  const difference = destination.angle - from.angle
  return { ...destination, angle: from.angle + Math.atan2(Math.sin(difference), Math.cos(difference)) }
}
