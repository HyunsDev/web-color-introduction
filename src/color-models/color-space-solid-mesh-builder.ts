import type { Color } from "culori"

import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import { toColorSampleRenderColor } from "@/color-models/color-sample-rendering"
import type { Vector3Point } from "@/color-models/color-space-samples"

export type SolidColorSpaceMesh = {
  readonly colors: Float32Array
  readonly indices: Uint32Array
  readonly positions: Float32Array
  readonly shapeLabel: string
  readonly triangleCount: number
  readonly vertexCount: number
  readonly wireframePositions: Float32Array
}

export type MeshBuilder = {
  readonly colors: number[]
  readonly indices: number[]
  readonly positions: number[]
  readonly wireframePositions: number[]
}

type GridVertexFactory = (row: number, column: number) => number
type GridWireframeOptions = {
  readonly columnStep: number
  readonly rowStep: number
}

const FALLBACK_COLOR = { r: 0, g: 0, b: 0 } as const

export function normalizeUnit(value: number) {
  return value * 2 - 1
}

export function polarToPoint(
  hue: number,
  radius: number,
  y: number
): Vector3Point {
  const radians = (hue / 180) * Math.PI

  return {
    x: Math.cos(radians) * radius,
    y,
    z: Math.sin(radians) * radius,
  }
}

export function createBuilder(): MeshBuilder {
  return { colors: [], indices: [], positions: [], wireframePositions: [] }
}

export function appendVertex(
  builder: MeshBuilder,
  position: Vector3Point,
  color: Color,
  options: ColorSampleRenderOptions
) {
  const renderColor = toColorSampleRenderColor(color, options) ?? FALLBACK_COLOR

  builder.positions.push(position.x, position.y, position.z)
  builder.colors.push(renderColor.r, renderColor.g, renderColor.b)

  return builder.positions.length / 3 - 1
}

function appendQuad(
  builder: MeshBuilder,
  topLeft: number,
  topRight: number,
  bottomLeft: number,
  bottomRight: number
) {
  builder.indices.push(topLeft, bottomLeft, topRight)
  builder.indices.push(topRight, bottomLeft, bottomRight)
}

export function appendGridSurface(
  builder: MeshBuilder,
  rows: number,
  columns: number,
  createVertex: GridVertexFactory,
  wireframeOptions?: GridWireframeOptions
) {
  const grid: number[][] = []

  for (let row = 0; row <= rows; row += 1) {
    const rowIndices: number[] = []

    for (let column = 0; column <= columns; column += 1) {
      rowIndices.push(createVertex(row, column))
    }

    grid.push(rowIndices)
  }

  for (let row = 0; row < rows; row += 1) {
    const currentRow = grid[row]
    const nextRow = grid[row + 1]

    if (!currentRow || !nextRow) {
      continue
    }

    appendGridRow(builder, currentRow, nextRow, columns)
  }

  if (wireframeOptions) {
    appendGridWireframe(builder, grid, rows, columns, wireframeOptions)
  }
}

function appendGridRow(
  builder: MeshBuilder,
  currentRow: readonly number[],
  nextRow: readonly number[],
  columns: number
) {
  for (let column = 0; column < columns; column += 1) {
    const topLeft = currentRow[column]
    const topRight = currentRow[column + 1]
    const bottomLeft = nextRow[column]
    const bottomRight = nextRow[column + 1]

    if (
      topLeft === undefined ||
      topRight === undefined ||
      bottomLeft === undefined ||
      bottomRight === undefined
    ) {
      continue
    }

    appendQuad(builder, topLeft, topRight, bottomLeft, bottomRight)
  }
}

function appendGridWireframe(
  builder: MeshBuilder,
  grid: readonly (readonly number[])[],
  rows: number,
  columns: number,
  options: GridWireframeOptions
) {
  getStops(rows, options.rowStep).forEach((row) => {
    const rowIndices = grid[row]

    if (!rowIndices) {
      return
    }

    for (let column = 0; column < columns; column += 1) {
      appendWireframeSegment(builder, rowIndices[column], rowIndices[column + 1])
    }
  })

  getStops(columns, options.columnStep).forEach((column) => {
    for (let row = 0; row < rows; row += 1) {
      const currentRow = grid[row]
      const nextRow = grid[row + 1]

      if (!currentRow || !nextRow) {
        continue
      }

      appendWireframeSegment(builder, currentRow[column], nextRow[column])
    }
  })
}

function getStops(length: number, step: number) {
  const stops: number[] = []
  const safeStep = Math.max(1, step)

  for (let value = 0; value <= length; value += safeStep) {
    stops.push(value)
  }

  const last = stops[stops.length - 1]
  if (last !== length) {
    stops.push(length)
  }

  return stops
}

function appendWireframeSegment(
  builder: MeshBuilder,
  startIndex: number | undefined,
  endIndex: number | undefined
) {
  if (startIndex === undefined || endIndex === undefined) {
    return
  }

  const start = getVertexPosition(builder, startIndex)
  const end = getVertexPosition(builder, endIndex)

  if (!start || !end) {
    return
  }

  builder.wireframePositions.push(start.x, start.y, start.z)
  builder.wireframePositions.push(end.x, end.y, end.z)
}

function getVertexPosition(
  builder: MeshBuilder,
  vertexIndex: number
): Vector3Point | null {
  const offset = vertexIndex * 3
  const x = builder.positions[offset]
  const y = builder.positions[offset + 1]
  const z = builder.positions[offset + 2]

  if (x === undefined || y === undefined || z === undefined) {
    return null
  }

  return { x, y, z }
}

export function finalizeMesh(
  builder: MeshBuilder,
  shapeLabel: string
): SolidColorSpaceMesh {
  return {
    colors: new Float32Array(builder.colors),
    indices: new Uint32Array(builder.indices),
    positions: new Float32Array(builder.positions),
    shapeLabel,
    triangleCount: builder.indices.length / 3,
    vertexCount: builder.positions.length / 3,
    wireframePositions: new Float32Array(builder.wireframePositions),
  }
}
