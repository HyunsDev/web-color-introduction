import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import {
  appendGridSurface,
  appendVertex,
  createBuilder,
  finalizeMesh,
} from "@/color-models/color-space-solid-mesh-builder"
import {
  createRgbColorInGamut,
  toXyyModelPoint,
} from "@/color-models/color-space-xyz"

const XYY_CUBE_SEGMENTS = 18
const XYY_WIREFRAME_STEP = 6

function appendXyyFace(
  fixedAxis: "b" | "g" | "r",
  fixedValue: number,
  options: ColorSampleRenderOptions,
  builder = createBuilder()
) {
  const gamut = options.sampleGamut ?? "rgb"

  appendGridSurface(
    builder,
    XYY_CUBE_SEGMENTS,
    XYY_CUBE_SEGMENTS,
    (row, column) => {
      const u = column / XYY_CUBE_SEGMENTS
      const v = row / XYY_CUBE_SEGMENTS
      const r = fixedAxis === "r" ? fixedValue : u
      const g = fixedAxis === "g" ? fixedValue : fixedAxis === "r" ? u : v
      const b = fixedAxis === "b" ? fixedValue : v
      const color = createRgbColorInGamut(gamut, r, g, b)

      return appendVertex(builder, toXyyModelPoint(color), color, options)
    },
    { columnStep: XYY_WIREFRAME_STEP, rowStep: XYY_WIREFRAME_STEP }
  )

  return builder
}

export function buildXyySolidMesh(options: ColorSampleRenderOptions) {
  const builder = createBuilder()

  appendXyyFace("r", 0, options, builder)
  appendXyyFace("r", 1, options, builder)
  appendXyyFace("g", 0, options, builder)
  appendXyyFace("g", 1, options, builder)
  appendXyyFace("b", 0, options, builder)
  appendXyyFace("b", 1, options, builder)

  return finalizeMesh(builder, "RGB gamut transformed into CIE xyY")
}
