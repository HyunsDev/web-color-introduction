import {
  CIE_XYZ_SPECTRAL_LOCUS_5NM,
  type CieXyzChromaticity,
} from "@/color-models/cie-xyz-gamut-data"
import {
  chromaticityToDisplayHex,
  chromaticityToDisplayRgb,
  type CieXyDisplayRgb,
} from "@/color-models/cie-xy-chart-color"

export type CieXyChartCell = CieXyzChromaticity & {
  readonly color: string
  readonly rgb: CieXyDisplayRgb
  readonly size: number
}

const GRID_SIZE = 52

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

export function buildCieXyChartCells(): readonly CieXyChartCell[] {
  const cells: CieXyChartCell[] = []
  const cellSize = 1 / GRID_SIZE

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let column = 0; column < GRID_SIZE; column += 1) {
      const x = (column + 0.5) / GRID_SIZE
      const y = (row + 0.5) / GRID_SIZE
      const point = { x, y }

      if (isPointInPolygon(point, CIE_XYZ_SPECTRAL_LOCUS_5NM)) {
        cells.push({
          ...point,
          color: chromaticityToDisplayHex(point),
          rgb: chromaticityToDisplayRgb(point),
          size: cellSize,
        })
      }
    }
  }

  return cells
}

export function buildCieXyLocusPath(
  project: (point: CieXyzChromaticity) => string
) {
  const [first, ...rest] = CIE_XYZ_SPECTRAL_LOCUS_5NM

  if (!first) {
    return ""
  }

  return `M ${project(first)} ${rest
    .map((point) => `L ${project(point)}`)
    .join(" ")} Z`
}
