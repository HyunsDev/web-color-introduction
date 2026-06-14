import { CIE_XYZ_GAMUTS } from "@/color-models/cie-xyz-gamut-data"
import type {
  CieXyzGamutDefinition,
  CieXyzGamutId,
} from "@/color-models/cie-xyz-gamut-data"
import {
  createRgbToXyzMatrix,
  multiplyMatrixPoint,
  toChromaticityPlanePoint,
  toScenePoint,
  toXyChartPoint,
} from "@/color-models/cie-xyz-gamut-space"
import type { Matrix3, XyzPoint } from "@/color-models/cie-xyz-gamut-space"

type MeshBuilder = {
  readonly indices: number[]
  readonly positions: number[]
  readonly wireframePositions: number[]
}

export type CieXyzGamutMesh = {
  readonly id: CieXyzGamutId
  readonly indices: Uint32Array
  readonly label: string
  readonly lineColor: string
  readonly positions: Float32Array
  readonly primaryLinePositions: Float32Array
  readonly shortLabel: string
  readonly surfaceColor: string
  readonly triangleCount: number
  readonly vertexCount: number
  readonly wireframePositions: Float32Array
  readonly xyPrimaryLinePositions: Float32Array
}

const CUBE_SEGMENTS = 12
const WIREFRAME_STEP = 4

function createBuilder(): MeshBuilder {
  return { indices: [], positions: [], wireframePositions: [] }
}

function appendPosition(positions: number[], point: XyzPoint) {
  positions.push(point.x, point.y, point.z)
}

function appendVertex(builder: MeshBuilder, point: XyzPoint) {
  appendPosition(builder.positions, point)

  return builder.positions.length / 3 - 1
}

function readPosition(builder: MeshBuilder, vertexIndex: number) {
  const offset = vertexIndex * 3
  const x = builder.positions[offset]
  const y = builder.positions[offset + 1]
  const z = builder.positions[offset + 2]

  return x === undefined || y === undefined || z === undefined
    ? null
    : { x, y, z }
}

function appendWireframeSegment(
  builder: MeshBuilder,
  startIndex: number,
  endIndex: number
) {
  const start = readPosition(builder, startIndex)
  const end = readPosition(builder, endIndex)

  if (!start || !end) {
    return
  }

  appendPosition(builder.wireframePositions, start)
  appendPosition(builder.wireframePositions, end)
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

function appendRgbFace(
  builder: MeshBuilder,
  matrix: Matrix3,
  fixedAxis: "b" | "g" | "r",
  fixedValue: number
) {
  const grid: number[][] = []

  for (let row = 0; row <= CUBE_SEGMENTS; row += 1) {
    const rowIndices: number[] = []

    for (let column = 0; column <= CUBE_SEGMENTS; column += 1) {
      const u = column / CUBE_SEGMENTS
      const v = row / CUBE_SEGMENTS
      const rgb = {
        x: fixedAxis === "r" ? fixedValue : u,
        y: fixedAxis === "g" ? fixedValue : fixedAxis === "r" ? u : v,
        z: fixedAxis === "b" ? fixedValue : v,
      }
      rowIndices.push(
        appendVertex(builder, toScenePoint(multiplyMatrixPoint(matrix, rgb)))
      )
    }

    grid.push(rowIndices)
  }

  appendRgbFaceIndices(builder, grid)
  appendRgbFaceWireframe(builder, grid)
}

function appendRgbFaceIndices(
  builder: MeshBuilder,
  grid: readonly (readonly number[])[]
) {
  for (let row = 0; row < CUBE_SEGMENTS; row += 1) {
    const currentRow = grid[row]
    const nextRow = grid[row + 1]

    if (!currentRow || !nextRow) {
      continue
    }

    for (let column = 0; column < CUBE_SEGMENTS; column += 1) {
      const topLeft = currentRow[column]
      const topRight = currentRow[column + 1]
      const bottomLeft = nextRow[column]
      const bottomRight = nextRow[column + 1]

      if (
        topLeft !== undefined &&
        topRight !== undefined &&
        bottomLeft !== undefined &&
        bottomRight !== undefined
      ) {
        appendQuad(builder, topLeft, topRight, bottomLeft, bottomRight)
      }
    }
  }
}

function appendRgbFaceWireframe(
  builder: MeshBuilder,
  grid: readonly (readonly number[])[]
) {
  for (let row = 0; row <= CUBE_SEGMENTS; row += WIREFRAME_STEP) {
    const rowIndices = grid[row]

    if (!rowIndices) {
      continue
    }

    for (let column = 0; column < CUBE_SEGMENTS; column += 1) {
      const start = rowIndices[column]
      const end = rowIndices[column + 1]

      if (start !== undefined && end !== undefined) {
        appendWireframeSegment(builder, start, end)
      }
    }
  }

  for (let column = 0; column <= CUBE_SEGMENTS; column += WIREFRAME_STEP) {
    for (let row = 0; row < CUBE_SEGMENTS; row += 1) {
      const currentRow = grid[row]
      const nextRow = grid[row + 1]
      const start = currentRow?.[column]
      const end = nextRow?.[column]

      if (start !== undefined && end !== undefined) {
        appendWireframeSegment(builder, start, end)
      }
    }
  }
}

function createClosedLinePositions(points: readonly XyzPoint[]) {
  const positions: number[] = []

  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length]

    if (!next) {
      return
    }

    appendPosition(positions, point)
    appendPosition(positions, next)
  })

  return new Float32Array(positions)
}

function buildGamutMesh(gamut: CieXyzGamutDefinition): CieXyzGamutMesh {
  const builder = createBuilder()
  const matrix = createRgbToXyzMatrix(gamut)

  appendRgbFace(builder, matrix, "r", 0)
  appendRgbFace(builder, matrix, "r", 1)
  appendRgbFace(builder, matrix, "g", 0)
  appendRgbFace(builder, matrix, "g", 1)
  appendRgbFace(builder, matrix, "b", 0)
  appendRgbFace(builder, matrix, "b", 1)

  return {
    id: gamut.id,
    indices: new Uint32Array(builder.indices),
    label: gamut.label,
    lineColor: gamut.lineColor,
    positions: new Float32Array(builder.positions),
    primaryLinePositions: createClosedLinePositions([
      toChromaticityPlanePoint(gamut.primaries.red),
      toChromaticityPlanePoint(gamut.primaries.green),
      toChromaticityPlanePoint(gamut.primaries.blue),
    ]),
    shortLabel: gamut.shortLabel,
    surfaceColor: gamut.surfaceColor,
    triangleCount: builder.indices.length / 3,
    vertexCount: builder.positions.length / 3,
    wireframePositions: new Float32Array(builder.wireframePositions),
    xyPrimaryLinePositions: createClosedLinePositions([
      toXyChartPoint(gamut.primaries.red),
      toXyChartPoint(gamut.primaries.green),
      toXyChartPoint(gamut.primaries.blue),
    ]),
  }
}

export function buildCieXyzGamutMeshes() {
  return CIE_XYZ_GAMUTS.map(buildGamutMesh)
}
