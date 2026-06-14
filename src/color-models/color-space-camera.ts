const MAX_NARROW_CAMERA_SCALE = 2.1

export function getResponsiveCameraScale(width: number, height: number) {
  if (width >= height) {
    return 1
  }

  return Math.min(MAX_NARROW_CAMERA_SCALE, (height / width) * 0.9)
}
