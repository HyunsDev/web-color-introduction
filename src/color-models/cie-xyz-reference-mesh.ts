import {
  CIE_D65_WHITE,
  CIE_XYZ_SPECTRAL_LOCUS_5NM,
} from "@/color-models/cie-xyz-gamut-data"
import { toChromaticityPlanePoint } from "@/color-models/cie-xyz-gamut-space"
import type { XyzPoint } from "@/color-models/cie-xyz-gamut-space"

export type CieXyzReferenceMesh = {
  readonly chromaticityPlaneIndices: Uint16Array
  readonly chromaticityPlanePositions: Float32Array
  readonly locusPositions: Float32Array
  readonly originPosition: Float32Array
  readonly purpleBoundaryPositions: Float32Array
  readonly visibleConeIndices: Uint16Array
  readonly visibleConePositions: Float32Array
  readonly visibleConeWireframePositions: Float32Array
  readonly whitePointPosition: Float32Array
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

export function buildCieXyzReferenceMesh(): CieXyzReferenceMesh {
  const spectralPoints = CIE_XYZ_SPECTRAL_LOCUS_5NM.map(
    toChromaticityPlanePoint
  )
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

  return {
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
  }
}
