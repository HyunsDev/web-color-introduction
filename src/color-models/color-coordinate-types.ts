export const COLOR_COORDINATE_MODEL_IDS = [
  "rgb",
  "hsl",
  "hsv",
  "lch",
  "oklch",
] as const

export type ColorCoordinateModelId = (typeof COLOR_COORDINATE_MODEL_IDS)[number]

export type ColorCoordinateUnit = "degree" | "number" | "percent"
export type ColorCoordinateAxisId =
  | "b"
  | "c"
  | "g"
  | "h"
  | "l"
  | "r"
  | "s"
  | "v"

export type ColorCoordinateAxis = {
  readonly defaultValue: number
  readonly id: ColorCoordinateAxisId
  readonly label: string
  readonly max: number
  readonly min: number
  readonly shortLabel: string
  readonly step: number
  readonly unit: ColorCoordinateUnit
  readonly wraps?: true
}

export type RgbCoordinate = {
  readonly b: number
  readonly g: number
  readonly modelId: "rgb"
  readonly r: number
}

export type HslCoordinate = {
  readonly h: number
  readonly l: number
  readonly modelId: "hsl"
  readonly s: number
}

export type HsvCoordinate = {
  readonly h: number
  readonly modelId: "hsv"
  readonly s: number
  readonly v: number
}

export type LchCoordinate = {
  readonly c: number
  readonly h: number
  readonly l: number
  readonly modelId: "lch"
}

export type OklchCoordinate = {
  readonly c: number
  readonly h: number
  readonly l: number
  readonly modelId: "oklch"
}

export type ColorCoordinate =
  | HslCoordinate
  | HsvCoordinate
  | LchCoordinate
  | OklchCoordinate
  | RgbCoordinate

export type ColorCoordinateModelDefinition = {
  readonly axes: readonly ColorCoordinateAxis[]
  readonly id: ColorCoordinateModelId
  readonly label: string
  readonly notation: string
}
