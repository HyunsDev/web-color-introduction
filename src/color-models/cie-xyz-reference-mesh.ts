import {
  CIE_D65_WHITE,
  CIE_XYZ_SPECTRAL_LOCUS_5NM,
} from "@/color-models/cie-xyz-gamut-data"
import { buildCieXyChartCells } from "@/color-models/cie-xy-chart-data"
import {
  toChromaticityPlanePoint,
  toXyChartPoint,
} from "@/color-models/cie-xyz-gamut-space"
import type { XyzPoint } from "@/color-models/cie-xyz-gamut-space"

export type CieXyzTextLabel = {
  readonly label: string
  readonly position: XyzPoint
}

export type CieXyzReferenceMesh = {
  readonly chromaticityColorIndices: Uint32Array
  readonly chromaticityColorPositions: Float32Array
  readonly chromaticityColorRgb: Float32Array
  readonly chromaticityPlaneIndices: Uint16Array
  readonly chromaticityPlanePositions: Float32Array
  readonly locusPositions: Float32Array
  readonly originPosition: Float32Array
  readonly purpleBoundaryPositions: Float32Array
  readonly visibleConeIndices: Uint16Array
  readonly visibleConePositions: Float32Array
  readonly visibleConeWireframePositions: Float32Array
  readonly whitePointPosition: Float32Array
  readonly xyGridLinePositions: Float32Array
  readonly xyLabels: readonly CieXyzTextLabel[]
  readonly xyLocusPositions: Float32Array
  readonly xyPurpleBoundaryPositions: Float32Array
  readonly xyWhitePointPosition: Float32Array
}

function appendPosition(positions: number[], point: XyzPoint) {
  positions.push(point.x, point.y, point.z)
}

function createClosedLinePositions(points: readonly XyzPoint[]) {
  const positions: number[] = []

  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length]

    if (next) {
      appendPosition(positions, point)
      appendPosition(positions, next)
    }
  })

  return new Float32Array(positions)
}

function createVisibleConeIndices(pointCount: number) {
  const indices: number[] = []

  for (let index = 1; index <= pointCount; index += 1) {
    const nextIndex = index === pointCount ? 1 : index + 1
    indices.push(0, index, nextIndex)
  }

  return new Uint16Array(indices)
}

function createVisibleConePositions(points: readonly XyzPoint[]) {
  const origin = { x: -1, y: -1, z: -1 }
  const positions: number[] = []

  appendPosition(positions, origin)
  points.forEach((point) => appendPosition(positions, point))

  return new Float32Array(positions)
}

function createVisibleConeWireframePositions(points: readonly XyzPoint[]) {
  const origin = { x: -1, y: -1, z: -1 }
  const positions: number[] = []
  const radialStep = 8

  points.forEach((point, index) => {
    if (index % radialStep === 0) {
      appendPosition(positions, origin)
      appendPosition(positions, point)
    }
  })

  return new Float32Array(positions)
}

function appendColoredQuad({
  colors,
  indices,
  positions,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  rgb,
}: {
  readonly bottomLeft: XyzPoint
  readonly bottomRight: XyzPoint
  readonly colors: number[]
  readonly indices: number[]
  readonly positions: number[]
  readonly rgb: { readonly b: number; readonly g: number; readonly r: number }
  readonly topLeft: XyzPoint
  readonly topRight: XyzPoint
}) {
  const startIndex = positions.length / 3
  const points = [topLeft, bottomLeft, topRight, bottomRight]

  points.forEach((point) => {
    appendPosition(positions, point)
    colors.push(rgb.r, rgb.g, rgb.b)
  })
  indices.push(
    startIndex,
    startIndex + 1,
    startIndex + 2,
    startIndex + 2,
    startIndex + 1,
    startIndex + 3
  )
}

function createChromaticityColorMesh() {
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []

  buildCieXyChartCells().forEach((cell) => {
    const half = cell.size / 2

    appendColoredQuad({
      colors,
      indices,
      rgb: cell.rgb,
      positions,
      topLeft: toXyChartPoint({ x: cell.x - half, y: cell.y + half }),
      topRight: toXyChartPoint({
        x: cell.x + half,
        y: cell.y + half,
      }),
      bottomLeft: toXyChartPoint({
        x: cell.x - half,
        y: cell.y - half,
      }),
      bottomRight: toXyChartPoint({
        x: cell.x + half,
        y: cell.y - half,
      }),
    })
  })

  return {
    colors: new Float32Array(colors),
    indices: new Uint32Array(indices),
    positions: new Float32Array(positions),
  }
}

function createXyGridLinePositions() {
  const positions: number[] = []

  for (let x = 0; x <= 0.9; x = Number((x + 0.1).toFixed(1))) {
    appendPosition(positions, toXyChartPoint({ x, y: 0 }))
    appendPosition(positions, toXyChartPoint({ x, y: 0.8 }))
  }

  for (let y = 0; y <= 0.8; y = Number((y + 0.1).toFixed(1))) {
    appendPosition(positions, toXyChartPoint({ x: 0, y }))
    appendPosition(positions, toXyChartPoint({ x: 0.9, y }))
  }

  return new Float32Array(positions)
}

function createXyLabels(): readonly CieXyzTextLabel[] {
  const labels: CieXyzTextLabel[] = []

  for (let x = 0; x <= 0.9; x = Number((x + 0.1).toFixed(1))) {
    labels.push({
      label: x.toFixed(1),
      position: toXyChartPoint({ x, y: -0.035 }),
    })
  }

  for (let y = 0; y <= 0.8; y = Number((y + 0.1).toFixed(1))) {
    labels.push({
      label: y.toFixed(1),
      position: toXyChartPoint({ x: -0.035, y }),
    })
  }

  labels.push(
    {
      label: "x",
      position: toXyChartPoint({ x: 0.45, y: -0.095 }),
    },
    {
      label: "y",
      position: toXyChartPoint({ x: -0.095, y: 0.4 }),
    },
    {
      label: "D65",
      position: toXyChartPoint({
        x: CIE_D65_WHITE.x + 0.045,
        y: CIE_D65_WHITE.y + 0.03,
      }),
    }
  )

  return labels
}

export function buildCieXyzReferenceMesh(): CieXyzReferenceMesh {
  const colorMesh = createChromaticityColorMesh()
  const spectralPoints = CIE_XYZ_SPECTRAL_LOCUS_5NM.map(
    toChromaticityPlanePoint
  )
  const xySpectralPoints = CIE_XYZ_SPECTRAL_LOCUS_5NM.map(toXyChartPoint)
  const firstSpectralPoint = spectralPoints[0]
  const lastSpectralPoint = spectralPoints[spectralPoints.length - 1]
  const purpleBoundaryPositions =
    firstSpectralPoint && lastSpectralPoint
      ? new Float32Array([
          lastSpectralPoint.x,
          lastSpectralPoint.y,
          lastSpectralPoint.z,
          firstSpectralPoint.x,
          firstSpectralPoint.y,
          firstSpectralPoint.z,
        ])
      : new Float32Array()
  const whitePoint = toChromaticityPlanePoint(CIE_D65_WHITE)
  const xyWhitePoint = toXyChartPoint(CIE_D65_WHITE)
  const xyFirstSpectralPoint = xySpectralPoints[0]
  const xyLastSpectralPoint = xySpectralPoints[xySpectralPoints.length - 1]
  const xyPurpleBoundaryPositions =
    xyFirstSpectralPoint && xyLastSpectralPoint
      ? new Float32Array([
          xyLastSpectralPoint.x,
          xyLastSpectralPoint.y,
          xyLastSpectralPoint.z,
          xyFirstSpectralPoint.x,
          xyFirstSpectralPoint.y,
          xyFirstSpectralPoint.z,
        ])
      : new Float32Array()

  return {
    chromaticityColorIndices: colorMesh.indices,
    chromaticityColorPositions: colorMesh.positions,
    chromaticityColorRgb: colorMesh.colors,
    chromaticityPlaneIndices: new Uint16Array([0, 1, 2]),
    chromaticityPlanePositions: new Float32Array([
      2, -1, -1, -1, 2, -1, -1, -1, 2,
    ]),
    locusPositions: createClosedLinePositions(spectralPoints),
    originPosition: new Float32Array([-1, -1, -1]),
    purpleBoundaryPositions,
    visibleConeIndices: createVisibleConeIndices(spectralPoints.length),
    visibleConePositions: createVisibleConePositions(spectralPoints),
    visibleConeWireframePositions:
      createVisibleConeWireframePositions(spectralPoints),
    whitePointPosition: new Float32Array([
      whitePoint.x,
      whitePoint.y,
      whitePoint.z,
    ]),
    xyGridLinePositions: createXyGridLinePositions(),
    xyLabels: createXyLabels(),
    xyLocusPositions: createClosedLinePositions(xySpectralPoints),
    xyPurpleBoundaryPositions,
    xyWhitePointPosition: new Float32Array([
      xyWhitePoint.x,
      xyWhitePoint.y,
      xyWhitePoint.z,
    ]),
  }
}
