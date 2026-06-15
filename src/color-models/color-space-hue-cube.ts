import type { Vector3Point } from "@/color-models/color-space-samples"

export function normalizeUnit(value: number) {
  return value * 2 - 1
}

export function hueCubeToPoint(
  hue: number,
  yUnit: number,
  zUnit: number
): Vector3Point {
  return {
    x: normalizeUnit(hue / 360),
    y: normalizeUnit(yUnit),
    z: normalizeUnit(zUnit),
  }
}
