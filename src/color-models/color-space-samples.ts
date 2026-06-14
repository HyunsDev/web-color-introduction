import { converter, displayable } from "culori"
import type { Color, Rgb } from "culori"

import type { ColorSpaceModelId } from "@/color-models/color-space-models"

export type Vector3Point = {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type ColorSpaceSample = {
  readonly position: Vector3Point
  readonly color: Rgb
}

const UNIT_STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1] as const
const HUE_STEPS = [
  0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320,
  340,
] as const
const LIGHTNESS_STEPS = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
const VALUE_STEPS = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1] as const
const LCH_LIGHTNESS_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
const LCH_CHROMA_STEPS = [0, 18, 36, 54, 72, 90, 108, 126, 144]
const OKLCH_LIGHTNESS_STEPS = [
  0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
]
const OKLCH_CHROMA_STEPS = [0, 0.045, 0.09, 0.135, 0.18, 0.225, 0.27, 0.315]
const ZERO_HUE = [0] as const
const LCH_MAX_CHROMA = 144
const OKLCH_MAX_CHROMA = 0.315

const toRgb = converter("rgb")

function normalizeUnit(value: number) {
  return value * 2 - 1
}

function clampRgbChannel(value: number) {
  return Math.min(1, Math.max(0, value))
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

function toDisplayableRgb(color: Color): Rgb | null {
  if (!displayable(color)) {
    return null
  }

  const rgb = toRgb(color)

  if (
    !Number.isFinite(rgb.r) ||
    !Number.isFinite(rgb.g) ||
    !Number.isFinite(rgb.b)
  ) {
    return null
  }

  return {
    mode: "rgb",
    r: clampRgbChannel(rgb.r),
    g: clampRgbChannel(rgb.g),
    b: clampRgbChannel(rgb.b),
  }
}

function appendSample(
  samples: ColorSpaceSample[],
  position: Vector3Point,
  color: Color
) {
  const rgb = toDisplayableRgb(color)

  if (!rgb) {
    return
  }

  samples.push({ position, color: rgb })
}

function buildRgbSamples() {
  const samples: ColorSpaceSample[] = []

  for (const r of UNIT_STEPS) {
    for (const g of UNIT_STEPS) {
      for (const b of UNIT_STEPS) {
        samples.push({
          position: {
            x: normalizeUnit(r),
            y: normalizeUnit(g),
            z: normalizeUnit(b),
          },
          color: { mode: "rgb", r, g, b },
        })
      }
    }
  }

  return samples
}

function buildHslSamples() {
  const samples: ColorSpaceSample[] = []

  for (const lightness of LIGHTNESS_STEPS) {
    const y = normalizeUnit(lightness)
    const lightnessRadius = 1 - Math.abs(2 * lightness - 1)

    for (const saturation of UNIT_STEPS) {
      const radius = saturation * lightnessRadius

      for (const hue of getHueStepsForRadius(radius)) {
        appendSample(samples, polarToPoint(hue, radius, y), {
          mode: "hsl",
          h: hue,
          s: saturation,
          l: lightness,
        })
      }
    }
  }

  return samples
}

function buildHsvSamples() {
  const samples: ColorSpaceSample[] = []

  for (const value of VALUE_STEPS) {
    const y = normalizeUnit(value)

    for (const saturation of UNIT_STEPS) {
      const radius = saturation * value

      for (const hue of getHueStepsForRadius(radius)) {
        appendSample(samples, polarToPoint(hue, radius, y), {
          mode: "hsv",
          h: hue,
          s: saturation,
          v: value,
        })
      }
    }
  }

  return samples
}

function buildLchSamples() {
  const samples: ColorSpaceSample[] = []

  for (const lightness of LCH_LIGHTNESS_STEPS) {
    const y = normalizeUnit(lightness / 100)

    for (const chroma of LCH_CHROMA_STEPS) {
      const radius = chroma / LCH_MAX_CHROMA

      for (const hue of getHueStepsForRadius(radius)) {
        appendSample(samples, polarToPoint(hue, radius, y), {
          mode: "lch",
          l: lightness,
          c: chroma,
          h: hue,
        })
      }
    }
  }

  return samples
}

function buildOklchSamples() {
  const samples: ColorSpaceSample[] = []

  for (const lightness of OKLCH_LIGHTNESS_STEPS) {
    const y = normalizeUnit(lightness)

    for (const chroma of OKLCH_CHROMA_STEPS) {
      const radius = chroma / OKLCH_MAX_CHROMA

      for (const hue of getHueStepsForRadius(radius)) {
        appendSample(samples, polarToPoint(hue, radius, y), {
          mode: "oklch",
          l: lightness,
          c: chroma,
          h: hue,
        })
      }
    }
  }

  return samples
}

function assertNeverModel(modelId: never): never {
  throw new RangeError(`Unknown color model: ${modelId}`)
}

export function buildColorSpaceSamples(modelId: ColorSpaceModelId) {
  switch (modelId) {
    case "rgb":
      return buildRgbSamples()
    case "hsl":
      return buildHslSamples()
    case "hsv":
      return buildHsvSamples()
    case "lch":
      return buildLchSamples()
    case "oklch":
      return buildOklchSamples()
    default:
      return assertNeverModel(modelId)
  }
}
