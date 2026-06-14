import type { Color } from "culori"

export const UNWRAPPED_COLOR_MODEL_IDS = ["hsl", "hsv", "lch", "oklch"] as const

export type UnwrappedColorModelId = (typeof UNWRAPPED_COLOR_MODEL_IDS)[number]

export type UnwrappedColorModel = {
  readonly axisLabel: string
  readonly fixedAxisLabel: string
  readonly fixedDefault: number
  readonly fixedMax: number
  readonly fixedMin: number
  readonly fixedStep: number
  readonly fixedUnit: "number" | "percent"
  readonly id: UnwrappedColorModelId
  readonly label: string
  readonly maxRadius: number
  readonly radiusLabel: string
  readonly radiusUnit: "number" | "percent"
}

export const UNWRAPPED_COLOR_MODEL_BY_ID = {
  hsl: {
    axisLabel: "Hue",
    fixedAxisLabel: "Lightness",
    fixedDefault: 0.58,
    fixedMax: 1,
    fixedMin: 0,
    fixedStep: 0.01,
    fixedUnit: "percent",
    id: "hsl",
    label: "HSL",
    maxRadius: 1,
    radiusLabel: "Saturation",
    radiusUnit: "percent",
  },
  hsv: {
    axisLabel: "Hue",
    fixedAxisLabel: "Value",
    fixedDefault: 1,
    fixedMax: 1,
    fixedMin: 0,
    fixedStep: 0.01,
    fixedUnit: "percent",
    id: "hsv",
    label: "HSV",
    maxRadius: 1,
    radiusLabel: "Saturation",
    radiusUnit: "percent",
  },
  lch: {
    axisLabel: "Hue",
    fixedAxisLabel: "Lightness",
    fixedDefault: 0.62,
    fixedMax: 1,
    fixedMin: 0,
    fixedStep: 0.01,
    fixedUnit: "percent",
    id: "lch",
    label: "LCH",
    maxRadius: 150,
    radiusLabel: "Chroma",
    radiusUnit: "number",
  },
  oklch: {
    axisLabel: "Hue",
    fixedAxisLabel: "Lightness",
    fixedDefault: 0.7,
    fixedMax: 1,
    fixedMin: 0,
    fixedStep: 0.01,
    fixedUnit: "percent",
    id: "oklch",
    label: "OKLCH",
    maxRadius: 0.4,
    radiusLabel: "Chroma",
    radiusUnit: "number",
  },
} as const satisfies Record<UnwrappedColorModelId, UnwrappedColorModel>

export const UNWRAPPED_COLOR_MODELS = [
  UNWRAPPED_COLOR_MODEL_BY_ID.hsl,
  UNWRAPPED_COLOR_MODEL_BY_ID.hsv,
  UNWRAPPED_COLOR_MODEL_BY_ID.lch,
  UNWRAPPED_COLOR_MODEL_BY_ID.oklch,
] as const

export function createUnwrappedColor(
  modelId: UnwrappedColorModelId,
  hue: number,
  radiusRatio: number,
  fixedValue: number
): Color {
  const model = UNWRAPPED_COLOR_MODEL_BY_ID[modelId]
  const radius = model.maxRadius * radiusRatio

  switch (modelId) {
    case "hsl":
      return { mode: "hsl", h: hue, s: radiusRatio, l: fixedValue }
    case "hsv":
      return { mode: "hsv", h: hue, s: radiusRatio, v: fixedValue }
    case "lch":
      return { mode: "lch", h: hue, c: radius, l: fixedValue * 100 }
    case "oklch":
      return { mode: "oklch", h: hue, c: radius, l: fixedValue }
    default:
      return assertNeverModel(modelId)
  }
}

export function formatUnwrappedValue(
  value: number,
  unit: "number" | "percent"
) {
  switch (unit) {
    case "percent":
      return `${Math.round(value * 100)}%`
    case "number":
      return Number.isInteger(value) ? String(value) : value.toFixed(3)
    default:
      return assertNeverUnit(unit)
  }
}

function assertNeverModel(modelId: never): never {
  throw new RangeError(`Unknown unwrapped color model: ${modelId}`)
}

function assertNeverUnit(unit: never): never {
  throw new RangeError(`Unknown unwrapped value unit: ${unit}`)
}
