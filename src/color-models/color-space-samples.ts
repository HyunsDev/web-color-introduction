import type { Color } from "culori"

import type {
  ColorGamutModeId,
  ColorOutputGamutId,
} from "@/color-models/color-gamut"
import {
  createColorSampleRenderOptions,
  toColorSampleRenderColor,
} from "@/color-models/color-sample-rendering"
import type {
  ColorSampleRenderOptions,
  LinearDisplayColor,
} from "@/color-models/color-sample-rendering"
import type { ColorSpaceModelId } from "@/color-models/color-space-models"
import { hueCubeToPoint } from "@/color-models/color-space-hue-cube"
import {
  buildLabSamples,
  buildLchCubeSamples,
  buildLchSamples,
  buildOklabSamples,
  buildOklchCubeSamples,
  buildOklchSamples,
} from "@/color-models/color-space-perceptual-samples"
import { buildXyySamples } from "@/color-models/color-space-xyy-samples"
import { buildXyzSamples } from "@/color-models/color-space-xyz-samples"

export type Vector3Point = {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type ColorSpaceSample = {
  readonly position: Vector3Point
  readonly color: LinearDisplayColor
}

const UNIT_STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1] as const
const HUE_STEPS = [
  0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320,
  340,
] as const
const LIGHTNESS_STEPS = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
const VALUE_STEPS = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1] as const
const ZERO_HUE = [0] as const

function normalizeUnit(value: number) {
  return value * 2 - 1
}

function degreesToRadians(degrees: number) {
  return (degrees / 180) * Math.PI
}

function getHueStepsForRadius(radius: number) {
  return radius === 0 ? ZERO_HUE : HUE_STEPS
}

function polarToPoint(hue: number, radius: number, y: number): Vector3Point {
  const radians = degreesToRadians(hue)

  return {
    x: Math.cos(radians) * radius,
    y,
    z: Math.sin(radians) * radius,
  }
}

function appendSample(
  samples: ColorSpaceSample[],
  position: Vector3Point,
  color: Color,
  options: ColorSampleRenderOptions
) {
  const linearRgb = toColorSampleRenderColor(color, options)

  if (!linearRgb) {
    return
  }

  samples.push({ position, color: linearRgb })
}

function buildRgbSamples(options: ColorSampleRenderOptions) {
  const samples: ColorSpaceSample[] = []

  for (const r of UNIT_STEPS) {
    for (const g of UNIT_STEPS) {
      for (const b of UNIT_STEPS) {
        appendSample(
          samples,
          {
            x: normalizeUnit(r),
            y: normalizeUnit(g),
            z: normalizeUnit(b),
          },
          { mode: "rgb", r, g, b },
          options
        )
      }
    }
  }

  return samples
}

function buildHslSamples(options: ColorSampleRenderOptions) {
  const samples: ColorSpaceSample[] = []

  for (const lightness of LIGHTNESS_STEPS) {
    const y = normalizeUnit(lightness)
    const lightnessRadius = 1 - Math.abs(2 * lightness - 1)

    for (const saturation of UNIT_STEPS) {
      const radius = saturation * lightnessRadius

      for (const hue of getHueStepsForRadius(radius)) {
        appendSample(
          samples,
          polarToPoint(hue, radius, y),
          {
            mode: "hsl",
            h: hue,
            s: saturation,
            l: lightness,
          },
          options
        )
      }
    }
  }

  return samples
}

function buildHslCubeSamples(options: ColorSampleRenderOptions) {
  const samples: ColorSpaceSample[] = []

  for (const lightness of LIGHTNESS_STEPS) {
    for (const saturation of UNIT_STEPS) {
      for (const hue of HUE_STEPS) {
        appendSample(
          samples,
          hueCubeToPoint(hue, lightness, saturation),
          {
            mode: "hsl",
            h: hue,
            s: saturation,
            l: lightness,
          },
          options
        )
      }
    }
  }

  return samples
}

function buildHsvSamples(options: ColorSampleRenderOptions) {
  const samples: ColorSpaceSample[] = []

  for (const value of VALUE_STEPS) {
    const y = normalizeUnit(value)

    for (const saturation of UNIT_STEPS) {
      const radius = saturation * value

      for (const hue of getHueStepsForRadius(radius)) {
        appendSample(
          samples,
          polarToPoint(hue, radius, y),
          {
            mode: "hsv",
            h: hue,
            s: saturation,
            v: value,
          },
          options
        )
      }
    }
  }

  return samples
}

function buildHsvCubeSamples(options: ColorSampleRenderOptions) {
  const samples: ColorSpaceSample[] = []

  for (const value of VALUE_STEPS) {
    for (const saturation of UNIT_STEPS) {
      for (const hue of HUE_STEPS) {
        appendSample(
          samples,
          hueCubeToPoint(hue, value, saturation),
          {
            mode: "hsv",
            h: hue,
            s: saturation,
            v: value,
          },
          options
        )
      }
    }
  }

  return samples
}

function buildHwbSamples(options: ColorSampleRenderOptions) {
  const samples: ColorSpaceSample[] = []

  for (const whiteness of UNIT_STEPS) {
    for (const blackness of UNIT_STEPS) {
      if (whiteness + blackness > 1) {
        continue
      }

      const radius = 1 - whiteness - blackness
      const y = whiteness - blackness

      for (const hue of getHueStepsForRadius(radius)) {
        appendSample(
          samples,
          polarToPoint(hue, radius, y),
          { mode: "hwb", h: hue, w: whiteness, b: blackness },
          options
        )
      }
    }
  }

  return samples
}

function buildHwbCubeSamples(options: ColorSampleRenderOptions) {
  const samples: ColorSpaceSample[] = []

  for (const whiteness of UNIT_STEPS) {
    for (const blackness of UNIT_STEPS) {
      if (whiteness + blackness > 1) {
        continue
      }

      for (const hue of HUE_STEPS) {
        appendSample(
          samples,
          hueCubeToPoint(hue, whiteness, blackness),
          { mode: "hwb", h: hue, w: whiteness, b: blackness },
          options
        )
      }
    }
  }

  return samples
}

function assertNeverModel(modelId: never): never {
  throw new RangeError(`Unknown color model: ${modelId}`)
}

export function buildColorSpaceSamples(
  modelId: ColorSpaceModelId,
  gamutModeId: ColorGamutModeId,
  outputGamutId: ColorOutputGamutId
) {
  const options = createColorSampleRenderOptions(gamutModeId, outputGamutId)

  switch (modelId) {
    case "rgb":
      return buildRgbSamples(options)
    case "hsl":
      return buildHslSamples(options)
    case "hsl-cube":
      return buildHslCubeSamples(options)
    case "hsv":
      return buildHsvSamples(options)
    case "hsv-cube":
      return buildHsvCubeSamples(options)
    case "hwb":
      return buildHwbSamples(options)
    case "hwb-cube":
      return buildHwbCubeSamples(options)
    case "xyz":
      return buildXyzSamples(options)
    case "xyy":
      return buildXyySamples(options)
    case "lab":
      return buildLabSamples(options)
    case "lch":
      return buildLchSamples(options)
    case "lch-cube":
      return buildLchCubeSamples(options)
    case "oklab":
      return buildOklabSamples(options)
    case "oklch":
      return buildOklchSamples(options)
    case "oklch-cube":
      return buildOklchCubeSamples(options)
    default:
      return assertNeverModel(modelId)
  }
}
