import {
  toColorSampleRenderColor,
  type ColorSampleRenderOptions,
} from "./color-sample-rendering.ts"
import {
  createUnwrappedColor,
  formatUnwrappedValue,
  UNWRAPPED_COLOR_MODEL_BY_ID,
} from "./color-space-unwrapped-models.ts"
import type { UnwrappedColorModelId } from "./color-space-unwrapped-models.ts"

export const UNWRAPPED_MESH_HUE_SEGMENTS = 96
export const UNWRAPPED_MESH_RADIUS_SEGMENTS = 36

export type UnwrappedColorSpaceMesh = {
  readonly axisPositions: Float32Array
  readonly colors: Float32Array
  readonly indices: Uint32Array
  readonly positions: Float32Array
  readonly seamPositions: Float32Array
  readonly shapeLabel: string
  readonly triangleCount: number
  readonly vertexCount: number
  readonly wireframePositions: Float32Array
}

type MeshBuilder = {
  readonly axisPositions: number[]
  readonly colors: number[]
  readonly indices: number[]
  readonly positions: number[]
  readonly seamPositions: number[]
  readonly wireframePositions: number[]
}

type MeshPoint = {
  readonly x: number
  readonly y: number
  readonly z: number
}

const SAMPLE_RENDER_OPTIONS = {
  outputGamut: "rgb",
  sampleGamut: null,
} satisfies ColorSampleRenderOptions
const FALLBACK_COLOR = { r: 0.5, g: 0.5, b: 0.5 } as const
const AXIS_EXTENT = 1.14
const HUE_SEGMENTS = UNWRAPPED_MESH_HUE_SEGMENTS
const RADIUS_SEGMENTS = UNWRAPPED_MESH_RADIUS_SEGMENTS

export function buildUnwrappedColorSpaceMesh(
  modelId: UnwrappedColorModelId,
  fixedValue: number
): UnwrappedColorSpaceMesh {
  const model = UNWRAPPED_COLOR_MODEL_BY_ID[modelId]
  const fixedY = normalizeUnit(fixedValue)
  const builder = createBuilder()

  for (let radiusIndex = 0; radiusIndex <= RADIUS_SEGMENTS; radiusIndex += 1) {
    const radiusRatio = radiusIndex / RADIUS_SEGMENTS

    for (let hueIndex = 0; hueIndex <= HUE_SEGMENTS; hueIndex += 1) {
      appendSampleVertex(builder, {
        fixedY,
        fixedValue,
        hueIndex,
        modelId,
        radiusRatio,
      })
    }
  }

  appendSurfaceIndices(builder)
  appendGuideWireframe(builder, fixedY)

  return {
    axisPositions: new Float32Array(builder.axisPositions),
    colors: new Float32Array(builder.colors),
    indices: new Uint32Array(builder.indices),
    positions: new Float32Array(builder.positions),
    seamPositions: new Float32Array(builder.seamPositions),
    shapeLabel: `${model.label} ${model.fixedAxisLabel} ${formatUnwrappedValue(
      fixedValue,
      model.fixedUnit
    )}`,
    triangleCount: builder.indices.length / 3,
    vertexCount: builder.positions.length / 3,
    wireframePositions: new Float32Array(builder.wireframePositions),
  }
}

function createBuilder(): MeshBuilder {
  return {
    axisPositions: [],
    colors: [],
    indices: [],
    positions: [],
    seamPositions: [],
    wireframePositions: [],
  }
}

function appendSampleVertex(
  builder: MeshBuilder,
  options: {
    readonly fixedY: number
    readonly fixedValue: number
    readonly hueIndex: number
    readonly modelId: UnwrappedColorModelId
    readonly radiusRatio: number
  }
) {
  const hue = (options.hueIndex / HUE_SEGMENTS) * 360
  const position = polarToPoint(hue, options.radiusRatio, options.fixedY)
  const color = createUnwrappedColor(
    options.modelId,
    hue,
    options.radiusRatio,
    options.fixedValue
  )
  const renderColor =
    toColorSampleRenderColor(color, SAMPLE_RENDER_OPTIONS) ?? FALLBACK_COLOR

  builder.positions.push(position.x, position.y, position.z)
  builder.colors.push(renderColor.r, renderColor.g, renderColor.b)
}

function appendSurfaceIndices(builder: MeshBuilder) {
  const rowStride = HUE_SEGMENTS + 1

  for (let radiusIndex = 0; radiusIndex < RADIUS_SEGMENTS; radiusIndex += 1) {
    const currentRow = radiusIndex * rowStride
    const nextRow = (radiusIndex + 1) * rowStride

    for (let hueIndex = 0; hueIndex < HUE_SEGMENTS; hueIndex += 1) {
      const topLeft = currentRow + hueIndex
      const topRight = currentRow + hueIndex + 1
      const bottomLeft = nextRow + hueIndex
      const bottomRight = nextRow + hueIndex + 1

      builder.indices.push(topLeft, bottomLeft, topRight)
      builder.indices.push(topRight, bottomLeft, bottomRight)
    }
  }
}

function appendGuideWireframe(builder: MeshBuilder, fixedY: number) {
  appendAxis(builder)
  appendSeam(builder, fixedY)

  for (let radiusIndex = 9; radiusIndex <= RADIUS_SEGMENTS; radiusIndex += 9) {
    appendRing(builder, radiusIndex / RADIUS_SEGMENTS, fixedY)
  }

  for (let hueIndex = 0; hueIndex < HUE_SEGMENTS; hueIndex += 12) {
    appendSpoke(builder, (hueIndex / HUE_SEGMENTS) * 360, fixedY)
  }
}

function appendAxis(builder: MeshBuilder) {
  builder.axisPositions.push(0, -AXIS_EXTENT, 0, 0, AXIS_EXTENT, 0)
}

function appendSeam(builder: MeshBuilder, fixedY: number) {
  const center = polarToPoint(0, 0, fixedY)
  const edge = polarToPoint(0, 1, fixedY)

  builder.seamPositions.push(center.x, center.y, center.z)
  builder.seamPositions.push(edge.x, edge.y, edge.z)
}

function appendRing(builder: MeshBuilder, radiusRatio: number, fixedY: number) {
  for (let hueIndex = 0; hueIndex < HUE_SEGMENTS; hueIndex += 1) {
    const startHue = (hueIndex / HUE_SEGMENTS) * 360
    const endHue = ((hueIndex + 1) / HUE_SEGMENTS) * 360

    appendWireSegment(
      builder,
      polarToPoint(startHue, radiusRatio, fixedY),
      polarToPoint(endHue, radiusRatio, fixedY)
    )
  }
}

function appendSpoke(builder: MeshBuilder, hue: number, fixedY: number) {
  appendWireSegment(
    builder,
    polarToPoint(hue, 0, fixedY),
    polarToPoint(hue, 1, fixedY)
  )
}

function appendWireSegment(
  builder: MeshBuilder,
  start: MeshPoint,
  end: MeshPoint
) {
  builder.wireframePositions.push(start.x, start.y, start.z)
  builder.wireframePositions.push(end.x, end.y, end.z)
}

function polarToPoint(hue: number, radius: number, y: number): MeshPoint {
  const radians = (hue / 180) * Math.PI

  return {
    x: Math.cos(radians) * radius,
    y,
    z: Math.sin(radians) * radius,
  }
}

function normalizeUnit(value: number) {
  return value * 2 - 1
}
