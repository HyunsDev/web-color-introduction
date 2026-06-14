import { converter } from "culori"
import type { Color } from "culori"

import { CIE_D65_WHITE } from "@/color-models/cie-xyz-gamut-data"
import type { CuloriSampleGamut } from "@/color-models/color-gamut"
import type { Vector3Point } from "@/color-models/color-space-samples"

const toXyz65 = converter("xyz65")

const XYZ_D65_WHITE = {
  x: CIE_D65_WHITE.x / CIE_D65_WHITE.y,
  y: 1,
  z: (1 - CIE_D65_WHITE.x - CIE_D65_WHITE.y) / CIE_D65_WHITE.y,
} as const
const XYY_EPSILON = 0.000001
const XY_AXIS_MAX = { x: 0.8, y: 0.9 } as const

export function createRgbColorInGamut(
  gamut: CuloriSampleGamut,
  r: number,
  g: number,
  b: number
): Color {
  switch (gamut) {
    case "rgb":
      return { mode: "rgb", r, g, b }
    case "p3":
      return { mode: "p3", r, g, b }
    case "rec2020":
      return { mode: "rec2020", r, g, b }
    default:
      return assertNeverGamut(gamut)
  }
}

export function toXyzModelPoint(color: Color): Vector3Point {
  const xyz = toXyz65(color)

  return {
    x: normalizeXyzChannel(xyz.x, XYZ_D65_WHITE.x),
    y: normalizeXyzChannel(xyz.y, XYZ_D65_WHITE.y),
    z: normalizeXyzChannel(xyz.z, XYZ_D65_WHITE.z),
  }
}

export function toXyyModelPoint(color: Color): Vector3Point {
  const xyz = toXyz65(color)
  const sum = xyz.x + xyz.y + xyz.z
  const chromaticity =
    sum <= XYY_EPSILON
      ? CIE_D65_WHITE
      : {
          x: xyz.x / sum,
          y: xyz.y / sum,
        }

  return {
    x: normalizeXyChannel(chromaticity.x, XY_AXIS_MAX.x),
    y: normalizeXyzChannel(xyz.y, XYZ_D65_WHITE.y),
    z: normalizeXyChannel(chromaticity.y, XY_AXIS_MAX.y),
  }
}

function normalizeXyzChannel(value: number, whiteValue: number) {
  return (value / whiteValue) * 2 - 1
}

function normalizeXyChannel(value: number, maxValue: number) {
  return (value / maxValue) * 2 - 1
}

function assertNeverGamut(gamut: never): never {
  throw new RangeError(`Unknown color gamut: ${gamut}`)
}
