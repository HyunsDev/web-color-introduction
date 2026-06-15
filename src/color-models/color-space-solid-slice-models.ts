import type { ColorSpaceModelId } from "@/color-models/color-space-models"

export type SolidSliceModelId = Extract<
  ColorSpaceModelId,
  | "hsl"
  | "hsl-cube"
  | "hsv"
  | "hsv-cube"
  | "lch"
  | "lch-cube"
  | "oklch"
  | "oklch-cube"
  | "rgb"
>
export type SolidSliceAxisId = "b" | "c" | "g" | "h" | "l" | "r" | "s" | "v"

export type SolidSliceAxis = {
  readonly defaultValue: number
  readonly id: SolidSliceAxisId
  readonly label: string
  readonly max: number
  readonly min: number
  readonly step: number
  readonly unit: "degree" | "number" | "percent"
}

export type SolidSliceState = {
  readonly axisId: SolidSliceAxisId
  readonly value: number
}

const SLICE_AXES_BY_MODEL = {
  rgb: [
    {
      id: "r",
      label: "Red",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      unit: "number",
    },
    {
      id: "g",
      label: "Green",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      unit: "number",
    },
    {
      id: "b",
      label: "Blue",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      unit: "number",
    },
  ],
  hsl: [
    {
      id: "h",
      label: "Hue",
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 24,
      unit: "degree",
    },
    {
      id: "s",
      label: "Saturation",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 1,
      unit: "percent",
    },
    {
      id: "l",
      label: "Lightness",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      unit: "percent",
    },
  ],
  "hsl-cube": [
    {
      id: "h",
      label: "Hue",
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 24,
      unit: "degree",
    },
    {
      id: "s",
      label: "Saturation",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 1,
      unit: "percent",
    },
    {
      id: "l",
      label: "Lightness",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      unit: "percent",
    },
  ],
  hsv: [
    {
      id: "h",
      label: "Hue",
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 24,
      unit: "degree",
    },
    {
      id: "s",
      label: "Saturation",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 1,
      unit: "percent",
    },
    {
      id: "v",
      label: "Value",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.75,
      unit: "percent",
    },
  ],
  "hsv-cube": [
    {
      id: "h",
      label: "Hue",
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 24,
      unit: "degree",
    },
    {
      id: "s",
      label: "Saturation",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 1,
      unit: "percent",
    },
    {
      id: "v",
      label: "Value",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.75,
      unit: "percent",
    },
  ],
  lch: [
    {
      id: "h",
      label: "Hue",
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 32,
      unit: "degree",
    },
    {
      id: "c",
      label: "Chroma",
      min: 0,
      max: 150,
      step: 1,
      defaultValue: 74,
      unit: "number",
    },
    {
      id: "l",
      label: "Lightness",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.62,
      unit: "percent",
    },
  ],
  "lch-cube": [
    {
      id: "h",
      label: "Hue",
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 32,
      unit: "degree",
    },
    {
      id: "c",
      label: "Chroma",
      min: 0,
      max: 150,
      step: 1,
      defaultValue: 74,
      unit: "number",
    },
    {
      id: "l",
      label: "Lightness",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.62,
      unit: "percent",
    },
  ],
  oklch: [
    {
      id: "h",
      label: "Hue",
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 32,
      unit: "degree",
    },
    {
      id: "c",
      label: "Chroma",
      min: 0,
      max: 0.4,
      step: 0.005,
      defaultValue: 0.18,
      unit: "number",
    },
    {
      id: "l",
      label: "Lightness",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.7,
      unit: "percent",
    },
  ],
  "oklch-cube": [
    {
      id: "h",
      label: "Hue",
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 32,
      unit: "degree",
    },
    {
      id: "c",
      label: "Chroma",
      min: 0,
      max: 0.4,
      step: 0.005,
      defaultValue: 0.18,
      unit: "number",
    },
    {
      id: "l",
      label: "Lightness",
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.7,
      unit: "percent",
    },
  ],
} as const satisfies Record<SolidSliceModelId, readonly SolidSliceAxis[]>

export function isSolidSliceModel(
  modelId: ColorSpaceModelId
): modelId is SolidSliceModelId {
  return (
    modelId === "rgb" ||
    modelId === "hsl" ||
    modelId === "hsl-cube" ||
    modelId === "hsv" ||
    modelId === "hsv-cube" ||
    modelId === "lch" ||
    modelId === "lch-cube" ||
    modelId === "oklch" ||
    modelId === "oklch-cube"
  )
}

export function getSolidSliceAxes(modelId: SolidSliceModelId) {
  return SLICE_AXES_BY_MODEL[modelId]
}

export function createDefaultSolidSliceState(
  modelId: SolidSliceModelId
): SolidSliceState {
  const axes = getSolidSliceAxes(modelId)
  const axis = axes[axes.length - 1]

  if (!axis) {
    throw new RangeError(`Missing slice axis for ${modelId}`)
  }

  return { axisId: axis.id, value: axis.defaultValue }
}

export function getSolidSliceAxis(
  modelId: SolidSliceModelId,
  axisId: SolidSliceAxisId
) {
  return getSolidSliceAxes(modelId).find((axis) => axis.id === axisId)
}
