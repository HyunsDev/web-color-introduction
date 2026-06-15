import type { Color } from "culori"

import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import { hueCubeToPoint } from "@/color-models/color-space-hue-cube"
import {
  appendGridSurface,
  appendVertex,
  createBuilder,
  finalizeMesh,
  normalizeUnit,
  polarToPoint,
} from "@/color-models/color-space-solid-mesh-builder"
import type {
  SolidSliceModelId,
  SolidSliceState,
} from "@/color-models/color-space-solid-slice-models"
import type { Vector3Point } from "@/color-models/color-space-samples"

const SLICE_SEGMENTS = 42
const HUE_SEGMENTS = 72
const WIREFRAME_STEP = 7

export function buildSolidSliceMesh(
  modelId: SolidSliceModelId,
  slice: SolidSliceState,
  options: ColorSampleRenderOptions
) {
  switch (modelId) {
    case "rgb":
      return buildRgbSlice(slice, options)
    case "hsl":
      return buildHslSlice(slice, options)
    case "hsl-cube":
      return buildHslCubeSlice(slice, options)
    case "hsv":
      return buildHsvSlice(slice, options)
    case "hsv-cube":
      return buildHsvCubeSlice(slice, options)
    case "lch":
      return buildPerceptualSlice(slice, options, "lch", 150)
    case "lch-cube":
      return buildPerceptualSlice(slice, options, "lch", 150, "cube")
    case "oklch":
      return buildPerceptualSlice(slice, options, "oklch", 0.4)
    case "oklch-cube":
      return buildPerceptualSlice(slice, options, "oklch", 0.4, "cube")
    default:
      return assertNeverModel(modelId)
  }
}

function buildPerceptualSlice(
  slice: SolidSliceState,
  options: ColorSampleRenderOptions,
  mode: "lch" | "oklch",
  maxChroma: number,
  shape: "cube" | "polar" = "polar"
) {
  const builder = createBuilder()

  appendGridSurface(
    builder,
    SLICE_SEGMENTS,
    HUE_SEGMENTS,
    (row, column) => {
      const u = column / HUE_SEGMENTS
      const v = row / SLICE_SEGMENTS
      const h = slice.axisId === "h" ? slice.value : u * 360
      const c =
        slice.axisId === "c"
          ? slice.value
          : (slice.axisId === "h" ? u : v) * maxChroma
      const l = slice.axisId === "l" ? slice.value : v
      const color: Color =
        mode === "lch" ? { mode, l: l * 100, c, h } : { mode, l, c, h }

      return appendVertex(
        builder,
        shape === "cube"
          ? hueCubeToPoint(h, l, c / maxChroma)
          : polarToPoint(h, c / maxChroma, normalizeUnit(l)),
        color,
        options
      )
    },
    { columnStep: 12, rowStep: WIREFRAME_STEP }
  )

  return finalizeMesh(
    builder,
    shape === "cube"
      ? `${mode.toUpperCase()} cube coordinate slice`
      : `${mode.toUpperCase()} coordinate slice`
  )
}

function buildRgbSlice(
  slice: SolidSliceState,
  options: ColorSampleRenderOptions
) {
  return buildCartesianSlice(
    slice,
    options,
    (r, g, b) => ({ mode: "rgb", r, g, b }),
    (r, g, b) => ({
      x: normalizeUnit(r),
      y: normalizeUnit(g),
      z: normalizeUnit(b),
    }),
    "RGB channel slice"
  )
}

function buildHslSlice(
  slice: SolidSliceState,
  options: ColorSampleRenderOptions
) {
  return buildPolarSlice(
    slice,
    options,
    (h, s, l) => ({ mode: "hsl", h, s, l }),
    (h, s, l) =>
      polarToPoint(h, s * (1 - Math.abs(2 * l - 1)), normalizeUnit(l)),
    "HSL coordinate slice"
  )
}

function buildHslCubeSlice(
  slice: SolidSliceState,
  options: ColorSampleRenderOptions
) {
  return buildPolarSlice(
    slice,
    options,
    (h, s, l) => ({ mode: "hsl", h, s, l }),
    (h, s, l) => hueCubeToPoint(h, l, s),
    "HSL cube coordinate slice"
  )
}

function buildHsvSlice(
  slice: SolidSliceState,
  options: ColorSampleRenderOptions
) {
  return buildPolarSlice(
    slice,
    options,
    (h, s, v) => ({ mode: "hsv", h, s, v }),
    (h, s, v) => polarToPoint(h, s * v, normalizeUnit(v)),
    "HSV coordinate slice"
  )
}

function buildHsvCubeSlice(
  slice: SolidSliceState,
  options: ColorSampleRenderOptions
) {
  return buildPolarSlice(
    slice,
    options,
    (h, s, v) => ({ mode: "hsv", h, s, v }),
    (h, s, v) => hueCubeToPoint(h, v, s),
    "HSV cube coordinate slice"
  )
}

function buildCartesianSlice(
  slice: SolidSliceState,
  options: ColorSampleRenderOptions,
  createColor: (r: number, g: number, b: number) => Color,
  createPoint: (r: number, g: number, b: number) => Vector3Point,
  label: string
) {
  const builder = createBuilder()

  appendGridSurface(
    builder,
    SLICE_SEGMENTS,
    SLICE_SEGMENTS,
    (row, column) => {
      const u = column / SLICE_SEGMENTS
      const v = row / SLICE_SEGMENTS
      const r = slice.axisId === "r" ? slice.value : u
      const g =
        slice.axisId === "g" ? slice.value : slice.axisId === "r" ? u : v
      const b = slice.axisId === "b" ? slice.value : v

      return appendVertex(
        builder,
        createPoint(r, g, b),
        createColor(r, g, b),
        options
      )
    },
    { columnStep: WIREFRAME_STEP, rowStep: WIREFRAME_STEP }
  )

  return finalizeMesh(builder, label)
}

function buildPolarSlice(
  slice: SolidSliceState,
  options: ColorSampleRenderOptions,
  createColor: (h: number, s: number, l: number) => Color,
  createPoint: (h: number, s: number, l: number) => Vector3Point,
  label: string
) {
  const builder = createBuilder()

  appendGridSurface(
    builder,
    SLICE_SEGMENTS,
    HUE_SEGMENTS,
    (row, column) => {
      const u = column / HUE_SEGMENTS
      const v = row / SLICE_SEGMENTS
      const h = slice.axisId === "h" ? slice.value : u * 360
      const s =
        slice.axisId === "s" ? slice.value : slice.axisId === "h" ? u : v
      const l = slice.axisId === "l" || slice.axisId === "v" ? slice.value : v

      return appendVertex(
        builder,
        createPoint(h, s, l),
        createColor(h, s, l),
        options
      )
    },
    { columnStep: 12, rowStep: WIREFRAME_STEP }
  )

  return finalizeMesh(builder, label)
}

function assertNeverModel(modelId: never): never {
  throw new RangeError(`Unknown slice model: ${modelId}`)
}
