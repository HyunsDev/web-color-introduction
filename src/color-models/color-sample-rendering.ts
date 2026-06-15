import { converter, toGamut } from "culori"
import type { Color } from "culori"

import {
  COLOR_GAMUT_MODE_BY_ID,
  COLOR_OUTPUT_GAMUT_BY_ID,
} from "./color-gamut.ts"
import type {
  ColorGamutModeId,
  ColorOutputGamutId,
  CuloriOutputGamut,
  CuloriSampleGamut,
} from "./color-gamut.ts"

export type LinearDisplayColor = {
  readonly r: number
  readonly g: number
  readonly b: number
}

export type ColorSampleRenderOptions = {
  readonly sampleGamut: CuloriSampleGamut | null
  readonly outputGamut: CuloriOutputGamut
}

const GAMUT_CHANNEL_EPSILON = 0.000001

const toRgb = converter("rgb")
const toP3 = converter("p3")
const toRec2020 = converter("rec2020")
const toLinearRgb = converter("lrgb")
const toSrgbGamut = toGamut("rgb", "oklch")
const toP3Gamut = toGamut("p3", "oklch")

export function createColorSampleRenderOptions(
  gamutModeId: ColorGamutModeId,
  outputGamutId: ColorOutputGamutId
) {
  return {
    sampleGamut: COLOR_GAMUT_MODE_BY_ID[gamutModeId].sampleGamut,
    outputGamut: COLOR_OUTPUT_GAMUT_BY_ID[outputGamutId].culoriMode,
  } satisfies ColorSampleRenderOptions
}

export function toColorSampleRenderColor(
  color: Color,
  options: ColorSampleRenderOptions
) {
  if (!isInSampleGamut(color, options.sampleGamut)) {
    return null
  }

  return toRenderableLinearRgb(color, options.outputGamut)
}

function isFiniteRgbLike(color: LinearDisplayColor) {
  return (
    Number.isFinite(color.r) &&
    Number.isFinite(color.g) &&
    Number.isFinite(color.b)
  )
}

function isGamutChannelInRange(value: number) {
  return (
    Number.isFinite(value) &&
    value >= -GAMUT_CHANNEL_EPSILON &&
    value <= 1 + GAMUT_CHANNEL_EPSILON
  )
}

function toSampleGamutCoordinates(
  color: Color,
  sampleGamut: CuloriSampleGamut
): LinearDisplayColor {
  switch (sampleGamut) {
    case "rgb":
      return toRgb(color)
    case "p3":
      return toP3(color)
    case "rec2020":
      return toRec2020(color)
    default:
      return assertNeverSampleGamut(sampleGamut)
  }
}

function isInSampleGamut(color: Color, sampleGamut: CuloriSampleGamut | null) {
  if (!sampleGamut) {
    return true
  }

  const coordinates = toSampleGamutCoordinates(color, sampleGamut)

  return (
    isGamutChannelInRange(coordinates.r) &&
    isGamutChannelInRange(coordinates.g) &&
    isGamutChannelInRange(coordinates.b)
  )
}

function mapToOutputGamut(color: Color, outputGamut: CuloriOutputGamut): Color {
  switch (outputGamut) {
    case "rgb":
      return toSrgbGamut(color)
    case "p3":
      return toP3Gamut(color)
    default:
      return assertNeverOutputGamut(outputGamut)
  }
}

function toRenderableLinearRgb(
  color: Color,
  outputGamut: CuloriOutputGamut
): LinearDisplayColor | null {
  const mappedColor = mapToOutputGamut(color, outputGamut)
  const linearRgb =
    outputGamut === "p3" ? toLinearP3(mappedColor) : toLinearRgb(mappedColor)

  if (!isFiniteRgbLike(linearRgb)) {
    return null
  }

  return linearRgb
}

function toLinearP3(color: Color): LinearDisplayColor {
  const p3 = toP3(color)

  return {
    r: linearizeSrgbTransfer(p3.r),
    g: linearizeSrgbTransfer(p3.g),
    b: linearizeSrgbTransfer(p3.b),
  }
}

function linearizeSrgbTransfer(value = 0) {
  return value < 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function assertNeverSampleGamut(sampleGamut: never): never {
  throw new RangeError(`Unknown sample gamut: ${sampleGamut}`)
}

function assertNeverOutputGamut(outputGamut: never): never {
  throw new RangeError(`Unknown output gamut: ${outputGamut}`)
}
