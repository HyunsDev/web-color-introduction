import { inGamut } from "culori"
import type { Color } from "culori"

import type { CuloriSampleGamut } from "./color-gamut.ts"

export type ColorGamutCheck = {
  readonly gamut: CuloriSampleGamut
  readonly inGamut: boolean
  readonly label: string
}

const SAMPLE_GAMUT_LABELS = {
  rgb: "sRGB",
  p3: "Display P3",
  rec2020: "BT.2020",
} as const satisfies Record<CuloriSampleGamut, string>

const SAMPLE_GAMUTS = [
  "rgb",
  "p3",
  "rec2020",
] as const satisfies readonly CuloriSampleGamut[]

export function isColorInGamut(color: Color, gamut: CuloriSampleGamut) {
  return inGamut(gamut)(color)
}

export function getColorGamutChecks(color: Color): readonly ColorGamutCheck[] {
  return SAMPLE_GAMUTS.map((gamut) => ({
    gamut,
    inGamut: isColorInGamut(color, gamut),
    label: SAMPLE_GAMUT_LABELS[gamut],
  }))
}
