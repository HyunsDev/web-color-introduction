import type { Color } from "culori"

import type { CuloriSampleGamut } from "@/color-models/color-gamut"
import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import { hueCubeToPoint } from "@/color-models/color-space-hue-cube"
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
const HWB_RATIO_SEGMENTS = 42
const CUBE_WIREFRAME_STEP = 6
const POLAR_WIREFRAME_COLUMN_STEP = 12
const POLAR_WIREFRAME_ROW_STEP = 8

type BasicSolidModelId = Extract<
  ColorSpaceModelId,
  "hsl" | "hsl-cube" | "hsv" | "hsv-cube" | "hwb" | "hwb-cube" | "rgb"
>
type HslCubeAxis = "h" | "l" | "s"
type HsvCubeAxis = "h" | "s" | "v"
type HwbConeChannel = "blackness" | "whiteness"
type HwbCubeFace = "blackness-zero" | "hue" | "sum-one" | "whiteness-zero"

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

function appendHslCubeFace(
  fixedAxis: HslCubeAxis,
  fixedValue: number,
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
      const hue = (fixedAxis === "h" ? fixedValue : u) * 360
      const saturation =
        fixedAxis === "s" ? fixedValue : fixedAxis === "h" ? u : v
      const lightness = fixedAxis === "l" ? fixedValue : v

      return appendVertex(
        builder,
        hueCubeToPoint(hue, lightness, saturation),
        { mode: "hsl", h: hue, s: saturation, l: lightness },
        options
      )
    },
    { columnStep: CUBE_WIREFRAME_STEP, rowStep: CUBE_WIREFRAME_STEP }
  )

  return builder
}

function buildHslCubeMesh(options: ColorSampleRenderOptions) {
  const builder = createBuilder()

  appendHslCubeFace("h", 0, options, builder)
  appendHslCubeFace("h", 1, options, builder)
  appendHslCubeFace("s", 0, options, builder)
  appendHslCubeFace("s", 1, options, builder)
  appendHslCubeFace("l", 0, options, builder)
  appendHslCubeFace("l", 1, options, builder)

  return finalizeMesh(builder, "HSL unfolded coordinate cube")
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

function appendHsvCubeFace(
  fixedAxis: HsvCubeAxis,
  fixedValue: number,
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
      const hue = (fixedAxis === "h" ? fixedValue : u) * 360
      const saturation =
        fixedAxis === "s" ? fixedValue : fixedAxis === "h" ? u : v
      const value = fixedAxis === "v" ? fixedValue : v

      return appendVertex(
        builder,
        hueCubeToPoint(hue, value, saturation),
        { mode: "hsv", h: hue, s: saturation, v: value },
        options
      )
    },
    { columnStep: CUBE_WIREFRAME_STEP, rowStep: CUBE_WIREFRAME_STEP }
  )

  return builder
}

function buildHsvCubeMesh(options: ColorSampleRenderOptions) {
  const builder = createBuilder()

  appendHsvCubeFace("h", 0, options, builder)
  appendHsvCubeFace("h", 1, options, builder)
  appendHsvCubeFace("s", 0, options, builder)
  appendHsvCubeFace("s", 1, options, builder)
  appendHsvCubeFace("v", 0, options, builder)
  appendHsvCubeFace("v", 1, options, builder)

  return finalizeMesh(builder, "HSV unfolded coordinate cube")
}

function appendHwbCone(
  builder: ReturnType<typeof createBuilder>,
  channel: HwbConeChannel,
  options: ColorSampleRenderOptions
) {
  appendGridSurface(
    builder,
    HWB_RATIO_SEGMENTS,
    HUE_SEGMENTS,
    (row, column) => {
      const amount = row / HWB_RATIO_SEGMENTS
      const hue = (column / HUE_SEGMENTS) * 360
      const radius = 1 - amount
      const y = channel === "whiteness" ? amount : -amount

      if (channel === "whiteness") {
        return appendVertex(
          builder,
          polarToPoint(hue, radius, y),
          { mode: "hwb", h: hue, w: amount, b: 0 },
          options
        )
      }

      return appendVertex(
        builder,
        polarToPoint(hue, radius, y),
        { mode: "hwb", h: hue, w: 0, b: amount },
        options
      )
    },
    {
      columnStep: POLAR_WIREFRAME_COLUMN_STEP,
      rowStep: POLAR_WIREFRAME_ROW_STEP,
    }
  )
}

function buildHwbMesh(options: ColorSampleRenderOptions) {
  const builder = createBuilder()

  appendHwbCone(builder, "whiteness", options)
  appendHwbCone(builder, "blackness", options)

  return finalizeMesh(builder, "HWB white/black bicone surface")
}

function appendHwbCubeFace(
  face: HwbCubeFace,
  fixedHueUnit: number,
  options: ColorSampleRenderOptions,
  builder = createBuilder()
) {
  appendGridSurface(
    builder,
    HWB_RATIO_SEGMENTS,
    face === "hue" ? HWB_RATIO_SEGMENTS : HUE_SEGMENTS,
    (row, column) => {
      const u =
        face === "hue" ? column / HWB_RATIO_SEGMENTS : column / HUE_SEGMENTS
      const v = row / HWB_RATIO_SEGMENTS
      const hue = (face === "hue" ? fixedHueUnit : u) * 360
      const whiteness =
        face === "blackness-zero"
          ? v
          : face === "whiteness-zero"
            ? 0
            : face === "sum-one"
              ? v
              : v
      const blackness =
        face === "blackness-zero"
          ? 0
          : face === "whiteness-zero"
            ? v
            : face === "sum-one"
              ? 1 - v
              : (1 - whiteness) * u

      return appendVertex(
        builder,
        hueCubeToPoint(hue, whiteness, blackness),
        { mode: "hwb", h: hue, w: whiteness, b: blackness },
        options
      )
    },
    {
      columnStep:
        face === "hue" ? CUBE_WIREFRAME_STEP : POLAR_WIREFRAME_COLUMN_STEP,
      rowStep: POLAR_WIREFRAME_ROW_STEP,
    }
  )

  return builder
}

function buildHwbCubeMesh(options: ColorSampleRenderOptions) {
  const builder = createBuilder()

  appendHwbCubeFace("blackness-zero", 0, options, builder)
  appendHwbCubeFace("whiteness-zero", 0, options, builder)
  appendHwbCubeFace("sum-one", 0, options, builder)
  appendHwbCubeFace("hue", 0, options, builder)
  appendHwbCubeFace("hue", 1, options, builder)

  return finalizeMesh(builder, "HWB valid coordinate prism")
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
    case "hsl-cube":
      return buildHslCubeMesh(options)
    case "hsv":
      return buildHsvMesh(options)
    case "hsv-cube":
      return buildHsvCubeMesh(options)
    case "hwb":
      return buildHwbMesh(options)
    case "hwb-cube":
      return buildHwbCubeMesh(options)
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
