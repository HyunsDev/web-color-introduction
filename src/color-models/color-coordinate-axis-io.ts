import type {
  ColorCoordinate,
  ColorCoordinateAxisId,
} from "./color-coordinate-types.ts"

export function readColorCoordinateAxis(
  coordinate: ColorCoordinate,
  axisId: ColorCoordinateAxisId
) {
  switch (coordinate.modelId) {
    case "rgb":
      return readRgbAxis(coordinate, axisId)
    case "hsl":
      return readHslAxis(coordinate, axisId)
    case "hsv":
      return readHsvAxis(coordinate, axisId)
    case "lch":
    case "oklch":
      return readCylindricalAxis(coordinate, axisId)
    default:
      return assertNeverCoordinate(coordinate)
  }
}

export function setColorCoordinateAxis(
  coordinate: ColorCoordinate,
  axisId: ColorCoordinateAxisId,
  value: number
): ColorCoordinate {
  switch (coordinate.modelId) {
    case "rgb":
      return setRgbAxis(coordinate, axisId, value)
    case "hsl":
      return setHslAxis(coordinate, axisId, value)
    case "hsv":
      return setHsvAxis(coordinate, axisId, value)
    case "lch":
      return setLchAxis(coordinate, axisId, value)
    case "oklch":
      return setOklchAxis(coordinate, axisId, value)
    default:
      return assertNeverCoordinate(coordinate)
  }
}

function readRgbAxis(
  coordinate: Extract<ColorCoordinate, { readonly modelId: "rgb" }>,
  axisId: ColorCoordinateAxisId
) {
  switch (axisId) {
    case "r":
      return coordinate.r
    case "g":
      return coordinate.g
    case "b":
      return coordinate.b
    case "c":
    case "h":
    case "l":
    case "s":
    case "v":
      return 0
    default:
      return assertNeverAxis(axisId)
  }
}

function readHslAxis(
  coordinate: Extract<ColorCoordinate, { readonly modelId: "hsl" }>,
  axisId: ColorCoordinateAxisId
) {
  switch (axisId) {
    case "h":
      return coordinate.h
    case "s":
      return coordinate.s
    case "l":
      return coordinate.l
    case "b":
    case "c":
    case "g":
    case "r":
    case "v":
      return 0
    default:
      return assertNeverAxis(axisId)
  }
}

function readHsvAxis(
  coordinate: Extract<ColorCoordinate, { readonly modelId: "hsv" }>,
  axisId: ColorCoordinateAxisId
) {
  switch (axisId) {
    case "h":
      return coordinate.h
    case "s":
      return coordinate.s
    case "v":
      return coordinate.v
    case "b":
    case "c":
    case "g":
    case "l":
    case "r":
      return 0
    default:
      return assertNeverAxis(axisId)
  }
}

function readCylindricalAxis(
  coordinate: Extract<ColorCoordinate, { readonly modelId: "lch" | "oklch" }>,
  axisId: ColorCoordinateAxisId
) {
  switch (axisId) {
    case "l":
      return coordinate.l
    case "c":
      return coordinate.c
    case "h":
      return coordinate.h
    case "b":
    case "g":
    case "r":
    case "s":
    case "v":
      return 0
    default:
      return assertNeverAxis(axisId)
  }
}

function setRgbAxis(
  coordinate: Extract<ColorCoordinate, { readonly modelId: "rgb" }>,
  axisId: ColorCoordinateAxisId,
  value: number
): ColorCoordinate {
  switch (axisId) {
    case "r":
      return { ...coordinate, r: value }
    case "g":
      return { ...coordinate, g: value }
    case "b":
      return { ...coordinate, b: value }
    default:
      return coordinate
  }
}

function setHslAxis(
  coordinate: Extract<ColorCoordinate, { readonly modelId: "hsl" }>,
  axisId: ColorCoordinateAxisId,
  value: number
): ColorCoordinate {
  switch (axisId) {
    case "h":
      return { ...coordinate, h: value }
    case "s":
      return { ...coordinate, s: value }
    case "l":
      return { ...coordinate, l: value }
    default:
      return coordinate
  }
}

function setHsvAxis(
  coordinate: Extract<ColorCoordinate, { readonly modelId: "hsv" }>,
  axisId: ColorCoordinateAxisId,
  value: number
): ColorCoordinate {
  switch (axisId) {
    case "h":
      return { ...coordinate, h: value }
    case "s":
      return { ...coordinate, s: value }
    case "v":
      return { ...coordinate, v: value }
    default:
      return coordinate
  }
}

function setLchAxis(
  coordinate: Extract<ColorCoordinate, { readonly modelId: "lch" }>,
  axisId: ColorCoordinateAxisId,
  value: number
): ColorCoordinate {
  switch (axisId) {
    case "l":
      return { ...coordinate, l: value }
    case "c":
      return { ...coordinate, c: value }
    case "h":
      return { ...coordinate, h: value }
    default:
      return coordinate
  }
}

function setOklchAxis(
  coordinate: Extract<ColorCoordinate, { readonly modelId: "oklch" }>,
  axisId: ColorCoordinateAxisId,
  value: number
): ColorCoordinate {
  switch (axisId) {
    case "l":
      return { ...coordinate, l: value }
    case "c":
      return { ...coordinate, c: value }
    case "h":
      return { ...coordinate, h: value }
    default:
      return coordinate
  }
}

function assertNeverCoordinate(coordinate: never): never {
  throw new RangeError(`Unknown color coordinate: ${coordinate}`)
}

function assertNeverAxis(axisId: never): never {
  throw new RangeError(`Unknown color coordinate axis: ${axisId}`)
}
