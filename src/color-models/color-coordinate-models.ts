import type {
  ColorCoordinateAxis,
  ColorCoordinateModelDefinition,
  ColorCoordinateModelId,
} from "./color-coordinate-types.ts"

const CHANNEL_8BIT = {
  defaultValue: 128,
  max: 255,
  min: 0,
  step: 1,
  unit: "number",
} as const

const UNIT_PERCENT = {
  max: 100,
  min: 0,
  step: 1,
  unit: "percent",
} as const

const HUE_AXIS = {
  defaultValue: 24,
  id: "h",
  label: "Hue",
  max: 360,
  min: 0,
  shortLabel: "H",
  step: 1,
  unit: "degree",
  wraps: true,
} as const satisfies ColorCoordinateAxis

export const COLOR_COORDINATE_MODEL_BY_ID = {
  rgb: {
    axes: [
      { ...CHANNEL_8BIT, id: "r", label: "Red", shortLabel: "R" },
      { ...CHANNEL_8BIT, id: "g", label: "Green", shortLabel: "G" },
      { ...CHANNEL_8BIT, id: "b", label: "Blue", shortLabel: "B" },
    ],
    id: "rgb",
    label: "RGB",
    notation: "rgb(255 96 64)",
  },
  hsl: {
    axes: [
      HUE_AXIS,
      {
        ...UNIT_PERCENT,
        defaultValue: 90,
        id: "s",
        label: "Saturation",
        shortLabel: "S",
      },
      {
        ...UNIT_PERCENT,
        defaultValue: 58,
        id: "l",
        label: "Lightness",
        shortLabel: "L",
      },
    ],
    id: "hsl",
    label: "HSL",
    notation: "hsl(24 90% 58%)",
  },
  hsv: {
    axes: [
      HUE_AXIS,
      {
        ...UNIT_PERCENT,
        defaultValue: 90,
        id: "s",
        label: "Saturation",
        shortLabel: "S",
      },
      {
        ...UNIT_PERCENT,
        defaultValue: 100,
        id: "v",
        label: "Value",
        shortLabel: "V",
      },
    ],
    id: "hsv",
    label: "HSV",
    notation: "hsv(24 90% 100%)",
  },
  lch: {
    axes: [
      {
        ...UNIT_PERCENT,
        defaultValue: 62,
        id: "l",
        label: "Lightness",
        shortLabel: "L",
      },
      {
        defaultValue: 74,
        id: "c",
        label: "Chroma",
        max: 150,
        min: 0,
        shortLabel: "C",
        step: 1,
        unit: "number",
      },
      HUE_AXIS,
    ],
    id: "lch",
    label: "LCH",
    notation: "lch(62% 74 32)",
  },
  oklch: {
    axes: [
      {
        ...UNIT_PERCENT,
        defaultValue: 70,
        id: "l",
        label: "Lightness",
        shortLabel: "L",
      },
      {
        defaultValue: 0.18,
        id: "c",
        label: "Chroma",
        max: 0.4,
        min: 0,
        shortLabel: "C",
        step: 0.005,
        unit: "number",
      },
      HUE_AXIS,
    ],
    id: "oklch",
    label: "OKLCH",
    notation: "oklch(70% 0.18 32)",
  },
} as const satisfies Record<
  ColorCoordinateModelId,
  ColorCoordinateModelDefinition
>

export const COLOR_COORDINATE_MODELS = [
  COLOR_COORDINATE_MODEL_BY_ID.rgb,
  COLOR_COORDINATE_MODEL_BY_ID.hsl,
  COLOR_COORDINATE_MODEL_BY_ID.hsv,
  COLOR_COORDINATE_MODEL_BY_ID.lch,
  COLOR_COORDINATE_MODEL_BY_ID.oklch,
] as const
