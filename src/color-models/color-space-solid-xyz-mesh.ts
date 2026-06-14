import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import {
  appendGridSurface,
  appendVertex,
  createBuilder,
  finalizeMesh,
} from "@/color-models/color-space-solid-mesh-builder"
import {
  createRgbColorInGamut,
  toXyzModelPoint,
} from "@/color-models/color-space-xyz"

const XYZ_CUBE_SEGMENTS = 18
const XYZ_WIREFRAME_STEP = 6

function appendXyzFace(
  fixedAxis: "b" | "g" | "r",
  fixedValue: number,
  options: ColorSampleRenderOptions,
  builder = createBuilder()
) {
  const gamut = options.sampleGamut ?? "rgb"

  appendGridSurface(
    builder,
    XYZ_CUBE_SEGMENTS,
    XYZ_CUBE_SEGMENTS,
    (row, column) => {
      const u = column / XYZ_CUBE_SEGMENTS
      const v = row / XYZ_CUBE_SEGMENTS
      const r = fixedAxis === "r" ? fixedValue : u
      const g = fixedAxis === "g" ? fixedValue : fixedAxis === "r" ? u : v
      const b = fixedAxis === "b" ? fixedValue : v
      const color = createRgbColorInGamut(gamut, r, g, b)

      return appendVertex(builder, toXyzModelPoint(color), color, options)
    },
    { columnStep: XYZ_WIREFRAME_STEP, rowStep: XYZ_WIREFRAME_STEP }
  )

  return builder
}

export function buildXyzSolidMesh(options: ColorSampleRenderOptions) {
  const builder = createBuilder()

  appendXyzFace("r", 0, options, builder)
  appendXyzFace("r", 1, options, builder)
  appendXyzFace("g", 0, options, builder)
  appendXyzFace("g", 1, options, builder)
  appendXyzFace("b", 0, options, builder)
  appendXyzFace("b", 1, options, builder)

  return finalizeMesh(builder, "RGB gamut transformed into CIE XYZ")
}
