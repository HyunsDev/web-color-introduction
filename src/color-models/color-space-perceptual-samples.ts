import type { Color } from "culori"

import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import { toColorSampleRenderColor } from "@/color-models/color-sample-rendering"
import { hueCubeToPoint } from "@/color-models/color-space-hue-cube"
import type {
  ColorSpaceSample,
  Vector3Point,
} from "@/color-models/color-space-samples"

const HUE_STEPS = [
  0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320,
  340,
] as const
const LAB_LIGHTNESS_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
const OKLAB_LIGHTNESS_STEPS = [
  0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
]
const LCH_CHROMA_STEPS = [0, 18, 36, 54, 72, 90, 108, 126, 144]
const OKLCH_CHROMA_STEPS = [0, 0.045, 0.09, 0.135, 0.18, 0.225, 0.27, 0.315]
const LAB_AB_STEPS = [-144, -108, -72, -36, 0, 36, 72, 108, 144]
const OKLAB_AB_STEPS = [
  -0.315, -0.225, -0.135, -0.045, 0, 0.045, 0.135, 0.225, 0.315,
]
const ZERO_HUE = [0] as const
const LAB_MAX_CHROMA = 144
const OKLAB_MAX_CHROMA = 0.315

type CartesianPerceptualModelId = "lab" | "oklab"
type PolarPerceptualModelId = "lch" | "oklch"

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

function createCartesianPerceptualColor(
  modelId: CartesianPerceptualModelId,
  lightness: number,
  a: number,
  b: number
): Color {
  switch (modelId) {
    case "lab":
      return { mode: "lab", l: lightness, a, b }
    case "oklab":
      return { mode: "oklab", l: lightness, a, b }
    default:
      return assertNeverCartesianModel(modelId)
  }
}

function createPolarPerceptualColor(
  modelId: PolarPerceptualModelId,
  lightness: number,
  chroma: number,
  hue: number
): Color {
  switch (modelId) {
    case "lch":
      return { mode: "lch", l: lightness, c: chroma, h: hue }
    case "oklch":
      return { mode: "oklch", l: lightness, c: chroma, h: hue }
    default:
      return assertNeverPolarModel(modelId)
  }
}

function buildCartesianPerceptualSamples({
  componentRange,
  componentSteps,
  lightnessDivisor,
  lightnessSteps,
  modelId,
  options,
}: {
  readonly componentRange: number
  readonly componentSteps: readonly number[]
  readonly lightnessDivisor: number
  readonly lightnessSteps: readonly number[]
  readonly modelId: CartesianPerceptualModelId
  readonly options: ColorSampleRenderOptions
}) {
  const samples: ColorSpaceSample[] = []

  for (const lightness of lightnessSteps) {
    const y = normalizeUnit(lightness / lightnessDivisor)

    for (const a of componentSteps) {
      for (const b of componentSteps) {
        appendSample(
          samples,
          { x: a / componentRange, y, z: b / componentRange },
          createCartesianPerceptualColor(modelId, lightness, a, b),
          options
        )
      }
    }
  }

  return samples
}

function buildPolarPerceptualSamples({
  chromaSteps,
  lightnessDivisor,
  lightnessSteps,
  maxChroma,
  modelId,
  options,
}: {
  readonly chromaSteps: readonly number[]
  readonly lightnessDivisor: number
  readonly lightnessSteps: readonly number[]
  readonly maxChroma: number
  readonly modelId: PolarPerceptualModelId
  readonly options: ColorSampleRenderOptions
}) {
  const samples: ColorSpaceSample[] = []

  for (const lightness of lightnessSteps) {
    const y = normalizeUnit(lightness / lightnessDivisor)

    for (const chroma of chromaSteps) {
      const radius = chroma / maxChroma

      for (const hue of getHueStepsForRadius(radius)) {
        appendSample(
          samples,
          polarToPoint(hue, radius, y),
          createPolarPerceptualColor(modelId, lightness, chroma, hue),
          options
        )
      }
    }
  }

  return samples
}

function buildPolarPerceptualCubeSamples({
  chromaSteps,
  lightnessDivisor,
  lightnessSteps,
  maxChroma,
  modelId,
  options,
}: {
  readonly chromaSteps: readonly number[]
  readonly lightnessDivisor: number
  readonly lightnessSteps: readonly number[]
  readonly maxChroma: number
  readonly modelId: PolarPerceptualModelId
  readonly options: ColorSampleRenderOptions
}) {
  const samples: ColorSpaceSample[] = []

  for (const lightness of lightnessSteps) {
    const lightnessUnit = lightness / lightnessDivisor

    for (const chroma of chromaSteps) {
      const chromaUnit = chroma / maxChroma

      for (const hue of HUE_STEPS) {
        appendSample(
          samples,
          hueCubeToPoint(hue, lightnessUnit, chromaUnit),
          createPolarPerceptualColor(modelId, lightness, chroma, hue),
          options
        )
      }
    }
  }

  return samples
}

export function buildLabSamples(options: ColorSampleRenderOptions) {
  return buildCartesianPerceptualSamples({
    componentRange: LAB_MAX_CHROMA,
    componentSteps: LAB_AB_STEPS,
    lightnessDivisor: 100,
    lightnessSteps: LAB_LIGHTNESS_STEPS,
    modelId: "lab",
    options,
  })
}

export function buildLchSamples(options: ColorSampleRenderOptions) {
  return buildPolarPerceptualSamples({
    chromaSteps: LCH_CHROMA_STEPS,
    lightnessDivisor: 100,
    lightnessSteps: LAB_LIGHTNESS_STEPS,
    maxChroma: LAB_MAX_CHROMA,
    modelId: "lch",
    options,
  })
}

export function buildLchCubeSamples(options: ColorSampleRenderOptions) {
  return buildPolarPerceptualCubeSamples({
    chromaSteps: LCH_CHROMA_STEPS,
    lightnessDivisor: 100,
    lightnessSteps: LAB_LIGHTNESS_STEPS,
    maxChroma: LAB_MAX_CHROMA,
    modelId: "lch",
    options,
  })
}

export function buildOklabSamples(options: ColorSampleRenderOptions) {
  return buildCartesianPerceptualSamples({
    componentRange: OKLAB_MAX_CHROMA,
    componentSteps: OKLAB_AB_STEPS,
    lightnessDivisor: 1,
    lightnessSteps: OKLAB_LIGHTNESS_STEPS,
    modelId: "oklab",
    options,
  })
}

export function buildOklchSamples(options: ColorSampleRenderOptions) {
  return buildPolarPerceptualSamples({
    chromaSteps: OKLCH_CHROMA_STEPS,
    lightnessDivisor: 1,
    lightnessSteps: OKLAB_LIGHTNESS_STEPS,
    maxChroma: OKLAB_MAX_CHROMA,
    modelId: "oklch",
    options,
  })
}

export function buildOklchCubeSamples(options: ColorSampleRenderOptions) {
  return buildPolarPerceptualCubeSamples({
    chromaSteps: OKLCH_CHROMA_STEPS,
    lightnessDivisor: 1,
    lightnessSteps: OKLAB_LIGHTNESS_STEPS,
    maxChroma: OKLAB_MAX_CHROMA,
    modelId: "oklch",
    options,
  })
}

function assertNeverCartesianModel(modelId: never): never {
  throw new RangeError(`Unknown cartesian perceptual model: ${modelId}`)
}

function assertNeverPolarModel(modelId: never): never {
  throw new RangeError(`Unknown polar perceptual model: ${modelId}`)
}
