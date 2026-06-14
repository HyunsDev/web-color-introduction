import { CIE_D65_WHITE } from "@/color-models/cie-xyz-gamut-data"
import type {
  CieXyzChromaticity,
  CieXyzGamutDefinition,
} from "@/color-models/cie-xyz-gamut-data"

export type XyzPoint = {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type Matrix3 = {
  readonly m00: number
  readonly m01: number
  readonly m02: number
  readonly m10: number
  readonly m11: number
  readonly m12: number
  readonly m20: number
  readonly m21: number
  readonly m22: number
}

const SCENE_SCALE = 3
const CHROMATICITY_CENTER = 1 / 3
const WHITE_XYZ = chromaticityToXyz(CIE_D65_WHITE)
const WHITE_SUM = WHITE_XYZ.x + WHITE_XYZ.y + WHITE_XYZ.z

function chromaticityToXyz({ x, y }: CieXyzChromaticity): XyzPoint {
  return {
    x: x / y,
    y: 1,
    z: (1 - x - y) / y,
  }
}

function chromaticityToNormalizedXyz(
  chromaticity: CieXyzChromaticity
): XyzPoint {
  return {
    x: chromaticity.x,
    y: chromaticity.y,
    z: 1 - chromaticity.x - chromaticity.y,
  }
}

function invertMatrix(matrix: Matrix3): Matrix3 {
  const c00 = matrix.m11 * matrix.m22 - matrix.m12 * matrix.m21
  const c01 = matrix.m02 * matrix.m21 - matrix.m01 * matrix.m22
  const c02 = matrix.m01 * matrix.m12 - matrix.m02 * matrix.m11
  const c10 = matrix.m12 * matrix.m20 - matrix.m10 * matrix.m22
  const c11 = matrix.m00 * matrix.m22 - matrix.m02 * matrix.m20
  const c12 = matrix.m02 * matrix.m10 - matrix.m00 * matrix.m12
  const c20 = matrix.m10 * matrix.m21 - matrix.m11 * matrix.m20
  const c21 = matrix.m01 * matrix.m20 - matrix.m00 * matrix.m21
  const c22 = matrix.m00 * matrix.m11 - matrix.m01 * matrix.m10
  const determinant = matrix.m00 * c00 + matrix.m01 * c10 + matrix.m02 * c20
  const scale = 1 / determinant

  return {
    m00: c00 * scale,
    m01: c01 * scale,
    m02: c02 * scale,
    m10: c10 * scale,
    m11: c11 * scale,
    m12: c12 * scale,
    m20: c20 * scale,
    m21: c21 * scale,
    m22: c22 * scale,
  }
}

export function multiplyMatrixPoint(
  matrix: Matrix3,
  point: XyzPoint
): XyzPoint {
  return {
    x: matrix.m00 * point.x + matrix.m01 * point.y + matrix.m02 * point.z,
    y: matrix.m10 * point.x + matrix.m11 * point.y + matrix.m12 * point.z,
    z: matrix.m20 * point.x + matrix.m21 * point.y + matrix.m22 * point.z,
  }
}

export function createRgbToXyzMatrix(gamut: CieXyzGamutDefinition): Matrix3 {
  const red = chromaticityToXyz(gamut.primaries.red)
  const green = chromaticityToXyz(gamut.primaries.green)
  const blue = chromaticityToXyz(gamut.primaries.blue)
  const white = chromaticityToXyz(gamut.primaries.white)
  const primaryMatrix = {
    m00: red.x,
    m01: green.x,
    m02: blue.x,
    m10: red.y,
    m11: green.y,
    m12: blue.y,
    m20: red.z,
    m21: green.z,
    m22: blue.z,
  }
  const scale = multiplyMatrixPoint(invertMatrix(primaryMatrix), white)

  return {
    m00: primaryMatrix.m00 * scale.x,
    m01: primaryMatrix.m01 * scale.y,
    m02: primaryMatrix.m02 * scale.z,
    m10: primaryMatrix.m10 * scale.x,
    m11: primaryMatrix.m11 * scale.y,
    m12: primaryMatrix.m12 * scale.z,
    m20: primaryMatrix.m20 * scale.x,
    m21: primaryMatrix.m21 * scale.y,
    m22: primaryMatrix.m22 * scale.z,
  }
}

export function toScenePoint(point: XyzPoint): XyzPoint {
  return {
    x: (point.x / WHITE_SUM - CHROMATICITY_CENTER) * SCENE_SCALE,
    y: (point.y / WHITE_SUM - CHROMATICITY_CENTER) * SCENE_SCALE,
    z: (point.z / WHITE_SUM - CHROMATICITY_CENTER) * SCENE_SCALE,
  }
}

export function toChromaticityPlanePoint(
  chromaticity: CieXyzChromaticity
): XyzPoint {
  const point = chromaticityToNormalizedXyz(chromaticity)

  return {
    x: (point.x - CHROMATICITY_CENTER) * SCENE_SCALE,
    y: (point.y - CHROMATICITY_CENTER) * SCENE_SCALE,
    z: (point.z - CHROMATICITY_CENTER) * SCENE_SCALE,
  }
}

export function toXyChartPoint({ x, y }: CieXyzChromaticity): XyzPoint {
  return {
    x: (x - 0.45) * 4,
    y: (y - 0.4) * 4,
    z: 0,
  }
}
