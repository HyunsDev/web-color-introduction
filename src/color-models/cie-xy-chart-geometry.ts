import {
  CIE_D65_WHITE,
  CIE_XYZ_SPECTRAL_LOCUS_5NM,
  type CieXyzChromaticity,
} from "@/color-models/cie-xyz-gamut-data"
import { chromaticityToDisplayRgb } from "@/color-models/cie-xy-chart-color"
import type { XyzPoint } from "@/color-models/cie-xyz-gamut-space"

export const XY_AXIS_MAX = { x: 0.8, y: 0.9 } as const
export const XY_TICK_STEP = 0.1

export type CieXyzTextLabel = {
  readonly label: string
  readonly position: XyzPoint
}

export type CieXyChartGeometry = {
  readonly colorIndices: Uint32Array
  readonly colorPositions: Float32Array
  readonly colorRgb: Float32Array
  readonly gridLinePositions: Float32Array
  readonly labels: readonly CieXyzTextLabel[]
  readonly locusPositions: Float32Array
  readonly purpleBoundaryPositions: Float32Array
  readonly whitePointPosition: Float32Array
}

type Projection = (chromaticity: CieXyzChromaticity) => XyzPoint

const SURFACE_GRID_SIZE = 180

function appendPosition(positions: number[], point: XyzPoint) {
  positions.push(point.x, point.y, point.z)
}

function appendColor(colors: number[], point: CieXyzChromaticity) {
  const rgb = chromaticityToDisplayRgb(point)

  colors.push(rgb.r, rgb.g, rgb.b)
}

function isPointInPolygon(
  point: CieXyzChromaticity,
  polygon: readonly CieXyzChromaticity[]
) {
  let isInside = false

  polygon.forEach((current, index) => {
    const previous = polygon[(index + polygon.length - 1) % polygon.length]

    if (!previous) {
      return
    }

    const crossesY = current.y > point.y !== previous.y > point.y
    const crossingX =
      ((previous.x - current.x) * (point.y - current.y)) /
        (previous.y - current.y) +
      current.x

    if (crossesY && point.x < crossingX) {
      isInside = !isInside
    }
  })

  return isInside
}

function createTickValues(max: number) {
  const values: number[] = []

  for (let value = 0; value <= max + 0.0001; value += XY_TICK_STEP) {
    values.push(Number(value.toFixed(1)))
  }

  return values
}

function createClosedLinePositions(
  points: readonly CieXyzChromaticity[],
  project: Projection
) {
  const positions: number[] = []

  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length]

    if (next) {
      appendPosition(positions, project(point))
      appendPosition(positions, project(next))
    }
  })

  return new Float32Array(positions)
}

function createPurpleBoundaryPositions(project: Projection) {
  const first = CIE_XYZ_SPECTRAL_LOCUS_5NM[0]
  const last = CIE_XYZ_SPECTRAL_LOCUS_5NM.at(-1)

  if (!first || !last) {
    return new Float32Array()
  }

  const start = project(last)
  const end = project(first)

  return new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z])
}

function createSurface(project: Projection) {
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  const grid: number[][] = []

  for (let row = 0; row <= SURFACE_GRID_SIZE; row += 1) {
    const y = row / SURFACE_GRID_SIZE
    const rowIndices: number[] = []

    for (let column = 0; column <= SURFACE_GRID_SIZE; column += 1) {
      const point = { x: column / SURFACE_GRID_SIZE, y }

      rowIndices.push(positions.length / 3)
      appendPosition(positions, project(point))
      appendColor(colors, point)
    }

    grid.push(rowIndices)
  }

  appendSurfaceIndices(indices, grid)

  return {
    colors: new Float32Array(colors),
    indices: new Uint32Array(indices),
    positions: new Float32Array(positions),
  }
}

function appendSurfaceIndices(indices: number[], grid: readonly number[][]) {
  for (let row = 0; row < SURFACE_GRID_SIZE; row += 1) {
    for (let column = 0; column < SURFACE_GRID_SIZE; column += 1) {
      const center = {
        x: (column + 0.5) / SURFACE_GRID_SIZE,
        y: (row + 0.5) / SURFACE_GRID_SIZE,
      }

      if (isPointInPolygon(center, CIE_XYZ_SPECTRAL_LOCUS_5NM)) {
        appendCellIndices(indices, grid, row, column)
      }
    }
  }
}

function appendCellIndices(
  indices: number[],
  grid: readonly (readonly number[])[],
  row: number,
  column: number
) {
  const currentRow = grid[row]
  const nextRow = grid[row + 1]
  const topLeft = currentRow?.[column]
  const topRight = currentRow?.[column + 1]
  const bottomLeft = nextRow?.[column]
  const bottomRight = nextRow?.[column + 1]

  if (
    topLeft === undefined ||
    topRight === undefined ||
    bottomLeft === undefined ||
    bottomRight === undefined
  ) {
    return
  }

  indices.push(topLeft, bottomLeft, topRight)
  indices.push(topRight, bottomLeft, bottomRight)
}

function createGridLinePositions(project: Projection) {
  const positions: number[] = []

  createTickValues(XY_AXIS_MAX.x).forEach((x) => {
    appendPosition(positions, project({ x, y: 0 }))
    appendPosition(positions, project({ x, y: XY_AXIS_MAX.y }))
  })
  createTickValues(XY_AXIS_MAX.y).forEach((y) => {
    appendPosition(positions, project({ x: 0, y }))
    appendPosition(positions, project({ x: XY_AXIS_MAX.x, y }))
  })

  return new Float32Array(positions)
}

function createLabels(project: Projection): readonly CieXyzTextLabel[] {
  const labels: CieXyzTextLabel[] = []

  createTickValues(XY_AXIS_MAX.x).forEach((x) => {
    labels.push({ label: x.toFixed(1), position: project({ x, y: -0.035 }) })
  })
  createTickValues(XY_AXIS_MAX.y).forEach((y) => {
    labels.push({ label: y.toFixed(1), position: project({ x: -0.035, y }) })
  })
  labels.push(
    { label: "x", position: project({ x: XY_AXIS_MAX.x / 2, y: -0.095 }) },
    { label: "y", position: project({ x: -0.095, y: XY_AXIS_MAX.y / 2 }) },
    {
      label: "D65",
      position: project({
        x: CIE_D65_WHITE.x + 0.045,
        y: CIE_D65_WHITE.y + 0.03,
      }),
    }
  )

  return labels
}

export function buildCieXyChartGeometry(
  project: Projection
): CieXyChartGeometry {
  const surface = createSurface(project)
  const whitePoint = project(CIE_D65_WHITE)

  return {
    colorIndices: surface.indices,
    colorPositions: surface.positions,
    colorRgb: surface.colors,
    gridLinePositions: createGridLinePositions(project),
    labels: createLabels(project),
    locusPositions: createClosedLinePositions(
      CIE_XYZ_SPECTRAL_LOCUS_5NM,
      project
    ),
    purpleBoundaryPositions: createPurpleBoundaryPositions(project),
    whitePointPosition: new Float32Array([
      whitePoint.x,
      whitePoint.y,
      whitePoint.z,
    ]),
  }
}
