import type { Color } from "culori"

import type { CuloriSampleGamut } from "@/color-models/color-gamut"
import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import type { ColorSpaceModelId } from "@/color-models/color-space-models"
import {
  appendGridSurface,
  appendVertex,
  createBuilder,
  finalizeMesh,
  normalizeUnit,
  polarToPoint,
} from "@/color-models/color-space-solid-mesh-builder"

const CUBE_SEGMENTS = 18
const HUE_SEGMENTS = 72
const HSL_LIGHTNESS_SEGMENTS = 48
const HSV_VALUE_SEGMENTS = 42
const HSV_CAP_SEGMENTS = 18
const CUBE_WIREFRAME_STEP = 6
const POLAR_WIREFRAME_COLUMN_STEP = 12
const POLAR_WIREFRAME_ROW_STEP = 8

type BasicSolidModelId = Extract<ColorSpaceModelId, "hsl" | "hsv" | "rgb">

function toGamutRgbColor(
  gamut: CuloriSampleGamut,
  r: number,
  g: number,
  b: number
): Color {
  switch (gamut) {
    case "rgb":
      return { mode: "rgb", r, g, b }
    case "p3":
      return { mode: "p3", r, g, b }
    case "rec2020":
      return { mode: "rec2020", r, g, b }
    default:
      return assertNeverGamut(gamut)
  }
}

function appendRgbFace(
  fixedAxis: "b" | "g" | "r",
  fixedValue: number,
  gamut: CuloriSampleGamut,
  options: ColorSampleRenderOptions,
  builder = createBuilder()
) {
  appendGridSurface(
    builder,
    CUBE_SEGMENTS,
    CUBE_SEGMENTS,
    (row, column) => {
      const u = column / CUBE_SEGMENTS
      const v = row / CUBE_SEGMENTS
      const r = fixedAxis === "r" ? fixedValue : u
      const g = fixedAxis === "g" ? fixedValue : fixedAxis === "r" ? u : v
      const b = fixedAxis === "b" ? fixedValue : v

      return appendVertex(
        builder,
        { x: normalizeUnit(r), y: normalizeUnit(g), z: normalizeUnit(b) },
        toGamutRgbColor(gamut, r, g, b),
        options
      )
    },
    { columnStep: CUBE_WIREFRAME_STEP, rowStep: CUBE_WIREFRAME_STEP }
  )

  return builder
}

function buildRgbMesh(options: ColorSampleRenderOptions) {
  const builder = createBuilder()
  const gamut = options.sampleGamut ?? "rgb"

  appendRgbFace("r", 0, gamut, options, builder)
  appendRgbFace("r", 1, gamut, options, builder)
  appendRgbFace("g", 0, gamut, options, builder)
  appendRgbFace("g", 1, gamut, options, builder)
  appendRgbFace("b", 0, gamut, options, builder)
  appendRgbFace("b", 1, gamut, options, builder)

  return finalizeMesh(builder, "six RGB channel faces")
}

function buildHslMesh(options: ColorSampleRenderOptions) {
  const builder = createBuilder()

  appendGridSurface(
    builder,
    HSL_LIGHTNESS_SEGMENTS,
    HUE_SEGMENTS,
    (row, column) => {
      const lightness = row / HSL_LIGHTNESS_SEGMENTS
      const hue = (column / HUE_SEGMENTS) * 360
      const radius = 1 - Math.abs(2 * lightness - 1)

      return appendVertex(
        builder,
        polarToPoint(hue, radius, normalizeUnit(lightness)),
        { mode: "hsl", h: hue, s: 1, l: lightness },
        options
      )
    },
    {
      columnStep: POLAR_WIREFRAME_COLUMN_STEP,
      rowStep: POLAR_WIREFRAME_ROW_STEP,
    }
  )

  return finalizeMesh(builder, "double-cone HSL surface")
}

function buildHsvMesh(options: ColorSampleRenderOptions) {
  const builder = createBuilder()

  appendGridSurface(
    builder,
    HSV_VALUE_SEGMENTS,
    HUE_SEGMENTS,
    (row, column) => {
      const value = row / HSV_VALUE_SEGMENTS
      const hue = (column / HUE_SEGMENTS) * 360

      return appendVertex(
        builder,
        polarToPoint(hue, value, normalizeUnit(value)),
        { mode: "hsv", h: hue, s: 1, v: value },
        options
      )
    },
    {
      columnStep: POLAR_WIREFRAME_COLUMN_STEP,
      rowStep: POLAR_WIREFRAME_ROW_STEP,
    }
  )
  appendGridSurface(
    builder,
    HSV_CAP_SEGMENTS,
    HUE_SEGMENTS,
    (row, column) => {
      const saturation = row / HSV_CAP_SEGMENTS
      const hue = (column / HUE_SEGMENTS) * 360

      return appendVertex(
        builder,
        polarToPoint(hue, saturation, 1),
        { mode: "hsv", h: hue, s: saturation, v: 1 },
        options
      )
    },
    { columnStep: POLAR_WIREFRAME_COLUMN_STEP, rowStep: 6 }
  )

  return finalizeMesh(builder, "HSV cone with value cap")
}

export function buildBasicSolidMesh(
  modelId: BasicSolidModelId,
  options: ColorSampleRenderOptions
) {
  switch (modelId) {
    case "rgb":
      return buildRgbMesh(options)
    case "hsl":
      return buildHslMesh(options)
    case "hsv":
      return buildHsvMesh(options)
    default:
      return assertNeverBasicModel(modelId)
  }
}

function assertNeverBasicModel(modelId: never): never {
  throw new RangeError(`Unknown basic solid model: ${modelId}`)
}

function assertNeverGamut(gamut: never): never {
  throw new RangeError(`Unknown color gamut: ${gamut}`)
}
