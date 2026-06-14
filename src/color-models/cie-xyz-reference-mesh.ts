import { CIE_XYZ_SPECTRAL_LOCUS_5NM } from "@/color-models/cie-xyz-gamut-data"
import {
  buildCieXyChartGeometry,
  type CieXyChartGeometry,
} from "@/color-models/cie-xy-chart-geometry"
import {
  toChromaticityPlanePoint,
  toXyChartPoint,
} from "@/color-models/cie-xyz-gamut-space"
import type { XyzPoint } from "@/color-models/cie-xyz-gamut-space"

export type CieXyzReferenceMesh = {
  readonly chromaticityChart: CieXyChartGeometry
  readonly originPosition: Float32Array
  readonly visibleConeIndices: Uint16Array
  readonly visibleConePositions: Float32Array
  readonly visibleConeWireframePositions: Float32Array
  readonly xyChart: CieXyChartGeometry
}

function appendPosition(positions: number[], point: XyzPoint) {
  positions.push(point.x, point.y, point.z)
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

export function buildCieXyzReferenceMesh(): CieXyzReferenceMesh {
  const spectralPoints = CIE_XYZ_SPECTRAL_LOCUS_5NM.map(
    toChromaticityPlanePoint
  )

  return {
    chromaticityChart: buildCieXyChartGeometry(toChromaticityPlanePoint),
    originPosition: new Float32Array([-1, -1, -1]),
    visibleConeIndices: createVisibleConeIndices(spectralPoints.length),
    visibleConePositions: createVisibleConePositions(spectralPoints),
    visibleConeWireframePositions:
      createVisibleConeWireframePositions(spectralPoints),
    xyChart: buildCieXyChartGeometry(toXyChartPoint),
  }
}
