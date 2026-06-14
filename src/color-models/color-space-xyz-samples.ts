import {
  toColorSampleRenderColor,
  type ColorSampleRenderOptions,
} from "@/color-models/color-sample-rendering"
import type { ColorSpaceSample } from "@/color-models/color-space-samples"
import {
  createRgbColorInGamut,
  toXyzModelPoint,
} from "@/color-models/color-space-xyz"

const XYZ_RGB_STEPS = [
  0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1,
] as const

export function buildXyzSamples(options: ColorSampleRenderOptions) {
  const samples: ColorSpaceSample[] = []
  const gamut = options.sampleGamut ?? "rgb"

  for (const r of XYZ_RGB_STEPS) {
    for (const g of XYZ_RGB_STEPS) {
      for (const b of XYZ_RGB_STEPS) {
        const color = createRgbColorInGamut(gamut, r, g, b)
        const renderColor = toColorSampleRenderColor(color, options)

        if (renderColor) {
          samples.push({
            color: renderColor,
            position: toXyzModelPoint(color),
          })
        }
      }
    }
  }

  return samples
}
