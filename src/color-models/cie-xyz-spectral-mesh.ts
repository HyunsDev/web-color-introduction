import { buildCieXyChartGeometry } from "@/color-models/cie-xy-chart-geometry"
import { chromaticityToDisplayRgb } from "@/color-models/cie-xy-chart-color"
import { CIE_XYZ_CMF_5NM } from "@/color-models/cie-xyz-cmf-data"
import type { CieXyzColorMatchingFunction } from "@/color-models/cie-xyz-cmf-data"
import type { CieXyzChromaticity } from "@/color-models/cie-xyz-gamut-data"
import type { XyzPoint } from "@/color-models/cie-xyz-gamut-space"
import type { CieXyChartGeometry } from "@/color-models/cie-xy-chart-geometry"

export const XYZ_SCENE_SCALE = 1.25

export const XYZ_AXIS_MAX = {
  x: 1.1 * XYZ_SCENE_SCALE,
  y: 1.05 * XYZ_SCENE_SCALE,
  z: 1.85 * XYZ_SCENE_SCALE,
} as const

export type CieXyzSpectralLabel = {
  readonly label: string
  readonly position: XyzPoint
}

export type CieXyzSpectralMesh = {
  readonly chromaticityPlane: CieXyChartGeometry
  readonly coneIndices: Uint16Array
  readonly conePositions: Float32Array
  readonly coneWireframePositions: Float32Array
  readonly normalizationLinePositions: Float32Array
  readonly spectralCurvePositions: Float32Array
  readonly spectralLabels: readonly CieXyzSpectralLabel[]
  readonly spectralPointColors: Float32Array
  readonly spectralPointPositions: Float32Array
}

function appendPosition(positions: number[], point: XyzPoint) {
  positions.push(point.x, point.y, point.z)
}

function toRawXyzPoint({
  xBar,
  yBar,
  zBar,
}: CieXyzColorMatchingFunction): XyzPoint {
  return {
    x: xBar * XYZ_SCENE_SCALE,
    y: yBar * XYZ_SCENE_SCALE,
    z: zBar * XYZ_SCENE_SCALE,
  }
}

function toChromaticity({
  xBar,
  yBar,
  zBar,
}: CieXyzColorMatchingFunction): CieXyzChromaticity {
  const sum = xBar + yBar + zBar

  if (sum <= 0) {
    return { x: 0, y: 0 }
  }

  return {
    x: xBar / sum,
    y: yBar / sum,
  }
}

export function toXyzChromaticityPlanePoint({
  x,
  y,
}: CieXyzChromaticity): XyzPoint {
  return {
    x: x * XYZ_SCENE_SCALE,
    y: y * XYZ_SCENE_SCALE,
    z: (1 - x - y) * XYZ_SCENE_SCALE,
  }
}

function createSpectralCurvePositions() {
  const positions: number[] = []

  CIE_XYZ_CMF_5NM.forEach((sample, index) => {
    const next = CIE_XYZ_CMF_5NM[index + 1]

    if (!next) {
      return
    }

    appendPosition(positions, toRawXyzPoint(sample))
    appendPosition(positions, toRawXyzPoint(next))
  })

  return new Float32Array(positions)
}

function createSpectralPoints() {
  const positions: number[] = []
  const colors: number[] = []

  CIE_XYZ_CMF_5NM.forEach((sample) => {
    const chromaticity = toChromaticity(sample)
    const rgb = chromaticityToDisplayRgb(chromaticity)

    appendPosition(positions, toRawXyzPoint(sample))
    colors.push(rgb.r, rgb.g, rgb.b)
  })

  return {
    colors: new Float32Array(colors),
    positions: new Float32Array(positions),
  }
}

function createNormalizationLinePositions() {
  const positions: number[] = []
  const lineStep = 4

  CIE_XYZ_CMF_5NM.forEach((sample, index) => {
    if (index % lineStep !== 0) {
      return
    }

    appendPosition(positions, toRawXyzPoint(sample))
    appendPosition(
      positions,
      toXyzChromaticityPlanePoint(toChromaticity(sample))
    )
  })

  return new Float32Array(positions)
}

function createConePositions(chart: CieXyChartGeometry) {
  const positions: number[] = [0, 0, 0]

  for (let index = 0; index < chart.locusPositions.length; index += 6) {
    const x = chart.locusPositions[index]
    const y = chart.locusPositions[index + 1]
    const z = chart.locusPositions[index + 2]

    if (x !== undefined && y !== undefined && z !== undefined) {
      positions.push(x, y, z)
    }
  }

  return new Float32Array(positions)
}

function createConeIndices(pointCount: number) {
  const indices: number[] = []

  for (let index = 1; index <= pointCount; index += 1) {
    indices.push(0, index, index === pointCount ? 1 : index + 1)
  }

  return new Uint16Array(indices)
}

function createConeWireframePositions(conePositions: Float32Array) {
  const positions: number[] = []
  const radialStep = 8

  for (let index = 1; index < conePositions.length / 3; index += 1) {
    if (index % radialStep !== 0) {
      continue
    }

    positions.push(0, 0, 0)
    positions.push(
      conePositions[index * 3] ?? 0,
      conePositions[index * 3 + 1] ?? 0,
      conePositions[index * 3 + 2] ?? 0
    )
  }

  return new Float32Array(positions)
}

function createSpectralLabels(): readonly CieXyzSpectralLabel[] {
  const labelWavelengths = [440, 555, 610] as const

  return CIE_XYZ_CMF_5NM.filter((sample) => {
    return labelWavelengths.some(
      (wavelength) => wavelength === sample.wavelength
    )
  }).map((sample) => {
    const point = toRawXyzPoint(sample)

    return {
      label: `${sample.wavelength}nm`,
      position: {
        x: point.x + 0.06,
        y: point.y + 0.06,
        z: point.z + 0.06,
      },
    }
  })
}

export function buildCieXyzSpectralMesh(): CieXyzSpectralMesh {
  const chromaticityPlane = buildCieXyChartGeometry(toXyzChromaticityPlanePoint)
  const conePositions = createConePositions(chromaticityPlane)
  const spectralPoints = createSpectralPoints()

  return {
    chromaticityPlane,
    coneIndices: createConeIndices(conePositions.length / 3 - 1),
    conePositions,
    coneWireframePositions: createConeWireframePositions(conePositions),
    normalizationLinePositions: createNormalizationLinePositions(),
    spectralCurvePositions: createSpectralCurvePositions(),
    spectralLabels: createSpectralLabels(),
    spectralPointColors: spectralPoints.colors,
    spectralPointPositions: spectralPoints.positions,
  }
}
