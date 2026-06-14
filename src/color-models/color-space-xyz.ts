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

function normalizeXyzChannel(value: number, whiteValue: number) {
  return (value / whiteValue) * 2 - 1
}

function assertNeverGamut(gamut: never): never {
  throw new RangeError(`Unknown color gamut: ${gamut}`)
}
