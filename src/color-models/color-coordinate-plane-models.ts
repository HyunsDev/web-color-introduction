import {
  COLOR_COORDINATE_MODEL_BY_ID,
  readColorCoordinateAxis,
  setColorCoordinateAxis,
} from "./color-coordinate-utils.ts"
import type {
  ColorCoordinate,
  ColorCoordinateAxis,
  ColorCoordinateAxisId,
  ColorCoordinateModelId,
} from "./color-coordinate-utils.ts"

export type ColorCoordinatePlane = {
  readonly fixedAxisId: ColorCoordinateAxisId
  readonly id: string
  readonly label: string
  readonly modelId: ColorCoordinateModelId
  readonly xAxisId: ColorCoordinateAxisId
  readonly yAxisId: ColorCoordinateAxisId
}

const PLANE_IDS_BY_MODEL = {
  rgb: [
    ["r", "g", "b", "R x G"],
    ["r", "b", "g", "R x B"],
    ["g", "b", "r", "G x B"],
  ],
  hsl: [
    ["h", "s", "l", "H x S"],
    ["h", "l", "s", "H x L"],
    ["s", "l", "h", "S x L"],
  ],
  hsv: [
    ["h", "s", "v", "H x S"],
    ["h", "v", "s", "H x V"],
    ["s", "v", "h", "S x V"],
  ],
  lch: [
    ["h", "c", "l", "H x C"],
    ["h", "l", "c", "H x L"],
    ["c", "l", "h", "C x L"],
  ],
  oklch: [
    ["h", "c", "l", "H x C"],
    ["h", "l", "c", "H x L"],
    ["c", "l", "h", "C x L"],
  ],
} as const satisfies Record<
  ColorCoordinateModelId,
  readonly (readonly [
    ColorCoordinateAxisId,
    ColorCoordinateAxisId,
    ColorCoordinateAxisId,
    string,
  ])[]
>

export function getCoordinatePlanes(modelId: ColorCoordinateModelId) {
  return PLANE_IDS_BY_MODEL[modelId].map(
    ([xAxisId, yAxisId, fixedAxisId, label]) => ({
      fixedAxisId,
      id: `${modelId}-${xAxisId}-${yAxisId}`,
      label,
      modelId,
      xAxisId,
      yAxisId,
    })
  )
}

export function getCoordinateAxis(
  modelId: ColorCoordinateModelId,
  axisId: ColorCoordinateAxisId
) {
  return COLOR_COORDINATE_MODEL_BY_ID[modelId].axes.find(
    (axis) => axis.id === axisId
  )
}

export function requireCoordinateAxis(
  modelId: ColorCoordinateModelId,
  axisId: ColorCoordinateAxisId
): ColorCoordinateAxis {
  const axis = getCoordinateAxis(modelId, axisId)

  if (!axis) {
    throw new RangeError(`Missing ${axisId} axis for ${modelId}`)
  }

  return axis
}

export function getAxisRatio(axis: ColorCoordinateAxis, value: number) {
  return (value - axis.min) / (axis.max - axis.min)
}

export function getAxisValueFromRatio(
  axis: ColorCoordinateAxis,
  ratio: number
) {
  const clampedRatio = Math.min(1, Math.max(0, ratio))
  const value = axis.min + (axis.max - axis.min) * clampedRatio

  return axis.step >= 1 ? Math.round(value / axis.step) * axis.step : value
}

export function setPlaneCoordinate(
  coordinate: ColorCoordinate,
  plane: ColorCoordinatePlane,
  xRatio: number,
  yRatio: number
) {
  const xAxis = requireCoordinateAxis(plane.modelId, plane.xAxisId)
  const yAxis = requireCoordinateAxis(plane.modelId, plane.yAxisId)
  const withX = setColorCoordinateAxis(
    coordinate,
    plane.xAxisId,
    getAxisValueFromRatio(xAxis, xRatio)
  )

  return setColorCoordinateAxis(
    withX,
    plane.yAxisId,
    getAxisValueFromRatio(yAxis, 1 - yRatio)
  )
}

export function getPlaneMarkerPosition(
  coordinate: ColorCoordinate,
  plane: ColorCoordinatePlane
) {
  const xAxis = requireCoordinateAxis(plane.modelId, plane.xAxisId)
  const yAxis = requireCoordinateAxis(plane.modelId, plane.yAxisId)

  return {
    x: getAxisRatio(xAxis, readColorCoordinateAxis(coordinate, plane.xAxisId)),
    y:
      1 -
      getAxisRatio(yAxis, readColorCoordinateAxis(coordinate, plane.yAxisId)),
  }
}

export function getCoordinateAxisRatio(
  coordinate: ColorCoordinate,
  modelId: ColorCoordinateModelId,
  axisId: ColorCoordinateAxisId
) {
  const axis = requireCoordinateAxis(modelId, axisId)

  return getAxisRatio(axis, readColorCoordinateAxis(coordinate, axisId))
}

export function setCoordinateAxisFromRatio(
  coordinate: ColorCoordinate,
  modelId: ColorCoordinateModelId,
  axisId: ColorCoordinateAxisId,
  ratio: number
) {
  const axis = requireCoordinateAxis(modelId, axisId)

  return setColorCoordinateAxis(
    coordinate,
    axisId,
    getAxisValueFromRatio(axis, ratio)
  )
}
