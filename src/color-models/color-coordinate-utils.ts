import type { Color } from "culori"

export {
  readColorCoordinateAxis,
  setColorCoordinateAxis,
} from "./color-coordinate-axis-io.ts"
export {
  COLOR_COORDINATE_MODEL_BY_ID,
  COLOR_COORDINATE_MODELS,
} from "./color-coordinate-models.ts"
export { COLOR_COORDINATE_MODEL_IDS } from "./color-coordinate-types.ts"
export type {
  ColorCoordinate,
  ColorCoordinateAxis,
  ColorCoordinateAxisId,
  ColorCoordinateModelDefinition,
  ColorCoordinateModelId,
  ColorCoordinateUnit,
  HslCoordinate,
  HsvCoordinate,
  LchCoordinate,
  OklchCoordinate,
  RgbCoordinate,
} from "./color-coordinate-types.ts"
import type {
  ColorCoordinate,
  ColorCoordinateModelId,
} from "./color-coordinate-types.ts"

export function createDefaultColorCoordinate(
  modelId: ColorCoordinateModelId
): ColorCoordinate {
  switch (modelId) {
    case "rgb":
      return { modelId, r: 255, g: 96, b: 64 }
    case "hsl":
      return { modelId, h: 24, s: 90, l: 58 }
    case "hsv":
      return { modelId, h: 24, s: 90, v: 100 }
    case "lch":
      return { modelId, l: 62, c: 74, h: 32 }
    case "oklch":
      return { modelId, l: 70, c: 0.18, h: 32 }
    default:
      return assertNeverModel(modelId)
  }
}

export function toCuloriColor(coordinate: ColorCoordinate): Color {
  switch (coordinate.modelId) {
    case "rgb":
      return {
        mode: "rgb",
        r: coordinate.r / 255,
        g: coordinate.g / 255,
        b: coordinate.b / 255,
      }
    case "hsl":
      return {
        mode: "hsl",
        h: coordinate.h,
        s: coordinate.s / 100,
        l: coordinate.l / 100,
      }
    case "hsv":
      return {
        mode: "hsv",
        h: coordinate.h,
        s: coordinate.s / 100,
        v: coordinate.v / 100,
      }
    case "lch":
      return {
        mode: "lch",
        l: coordinate.l,
        c: coordinate.c,
        h: coordinate.h,
      }
    case "oklch":
      return {
        mode: "oklch",
        l: coordinate.l / 100,
        c: coordinate.c,
        h: coordinate.h,
      }
    default:
      return assertNeverCoordinate(coordinate)
  }
}

function assertNeverModel(modelId: never): never {
  throw new RangeError(`Unknown color coordinate model: ${modelId}`)
}

function assertNeverCoordinate(coordinate: never): never {
  throw new RangeError(`Unknown color coordinate: ${coordinate}`)
}
