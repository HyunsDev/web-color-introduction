import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import {
  createRgbColorInGamut,
  toXyyModelPoint,
} from "@/color-models/color-space-xyz"
import type { ColorSpaceSample } from "@/color-models/color-space-samples"
import { toColorSampleRenderColor } from "@/color-models/color-sample-rendering"

const XYY_RGB_STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1] as const

export function buildXyySamples(options: ColorSampleRenderOptions) {
  const samples: ColorSpaceSample[] = []
  const gamut = options.sampleGamut ?? "rgb"

  for (const r of XYY_RGB_STEPS) {
    for (const g of XYY_RGB_STEPS) {
      for (const b of XYY_RGB_STEPS) {
        const color = createRgbColorInGamut(gamut, r, g, b)
        const renderColor = toColorSampleRenderColor(color, options)

        if (renderColor) {
          samples.push({
            color: renderColor,
            position: toXyyModelPoint(color),
          })
        }
      }
    }
  }

  return samples
}
