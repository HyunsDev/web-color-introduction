import type { Color } from "culori"

import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import { toColorSampleRenderColor } from "@/color-models/color-sample-rendering"
import {
  appendGridSurface,
  appendVertex,
  createBuilder,
  finalizeMesh,
  normalizeUnit,
  polarToPoint,
} from "@/color-models/color-space-solid-mesh-builder"

const HUE_SEGMENTS = 192
const PERCEPTUAL_LIGHTNESS_SEGMENTS = 64
const CHROMA_SEARCH_STEPS = 16
const COLOR_SMOOTHING_PASSES = 3
const SHAPE_SMOOTHING_PASSES = 8
const WIREFRAME_COLUMN_STEP = 16
const WIREFRAME_ROW_STEP = 8
const LCH_MAX_CHROMA = 200
const OKLCH_MAX_CHROMA = 0.48

type PerceptualSolidModelId = "lch" | "oklch"
type ChromaSmoothingMode = "color" | "shape"

function getPerceptualColor(
  modelId: PerceptualSolidModelId,
  lightness: number,
  chroma: number,
  hue: number
): Color {
  switch (modelId) {
    case "lch":
      return { mode: "lch", l: lightness * 100, c: chroma, h: hue }
    case "oklch":
      return { mode: "oklch", l: lightness, c: chroma, h: hue }
    default:
      return assertNeverPerceptualModel(modelId)
  }
}

function findMaxChroma(
  modelId: PerceptualSolidModelId,
  lightness: number,
  hue: number,
  upperChroma: number,
  options: ColorSampleRenderOptions
) {
  let low = 0
  let high = upperChroma

  for (let step = 0; step < CHROMA_SEARCH_STEPS; step += 1) {
    const middle = (low + high) / 2
    const color = getPerceptualColor(modelId, lightness, middle, hue)

    if (toColorSampleRenderColor(color, options)) {
      low = middle
    } else {
      high = middle
    }
  }

  return low
}

function buildMaxChromaGrid(
  modelId: PerceptualSolidModelId,
  upperChroma: number,
  options: ColorSampleRenderOptions
) {
  const grid: number[][] = []

  for (let row = 0; row <= PERCEPTUAL_LIGHTNESS_SEGMENTS; row += 1) {
    const lightness = row / PERCEPTUAL_LIGHTNESS_SEGMENTS
    const values: number[] = []

    for (let column = 0; column <= HUE_SEGMENTS; column += 1) {
      const hue = (column / HUE_SEGMENTS) * 360
      values.push(findMaxChroma(modelId, lightness, hue, upperChroma, options))
    }

    const firstValue = values[0]
    if (firstValue !== undefined) {
      values[HUE_SEGMENTS] = firstValue
    }

    grid.push(values)
  }

  return grid
}

function smoothChromaGrid(
  maxGrid: readonly (readonly number[])[],
  mode: ChromaSmoothingMode
) {
  let current = maxGrid
  const smoothingPasses =
    mode === "shape" ? SHAPE_SMOOTHING_PASSES : COLOR_SMOOTHING_PASSES

  for (let pass = 0; pass < smoothingPasses; pass += 1) {
    current = smoothChromaGridOnce(current, maxGrid, mode)
  }

  return current
}

function smoothChromaGridOnce(
  current: readonly (readonly number[])[],
  maxGrid: readonly (readonly number[])[],
  mode: ChromaSmoothingMode
) {
  const smoothed: number[][] = []

  for (let row = 0; row <= PERCEPTUAL_LIGHTNESS_SEGMENTS; row += 1) {
    const values: number[] = []

    for (let column = 0; column <= HUE_SEGMENTS; column += 1) {
      const value =
        row === 0 || row === PERCEPTUAL_LIGHTNESS_SEGMENTS
          ? readChroma(current, row, column)
          : getSmoothedChroma(current, maxGrid, mode, row, column)
      values.push(value)
    }

    const firstValue = values[0]
    if (firstValue !== undefined) {
      values[HUE_SEGMENTS] = firstValue
    }

    smoothed.push(values)
  }

  return smoothed
}

function getSmoothedChroma(
  current: readonly (readonly number[])[],
  maxGrid: readonly (readonly number[])[],
  mode: ChromaSmoothingMode,
  row: number,
  column: number
) {
  const center = readChroma(current, row, column)
  const averaged =
    (center * 4 +
      readChroma(current, row - 1, column) +
      readChroma(current, row + 1, column) +
      readChroma(current, row, column - 1) +
      readChroma(current, row, column + 1)) /
    8

  if (mode === "color") {
    return Math.min(readChroma(maxGrid, row, column), averaged)
  }

  return Math.max(0, averaged)
}

function readChroma(
  grid: readonly (readonly number[])[],
  row: number,
  column: number
) {
  const clampedRow = Math.min(
    PERCEPTUAL_LIGHTNESS_SEGMENTS,
    Math.max(0, row)
  )
  const values = grid[clampedRow]
  const wrappedColumn =
    ((column % HUE_SEGMENTS) + HUE_SEGMENTS) % HUE_SEGMENTS

  return values?.[wrappedColumn] ?? 0
}

export function buildPerceptualSolidMesh(
  modelId: PerceptualSolidModelId,
  options: ColorSampleRenderOptions
) {
  const builder = createBuilder()
  const upperChroma = modelId === "lch" ? LCH_MAX_CHROMA : OKLCH_MAX_CHROMA
  const maxChromaGrid = buildMaxChromaGrid(modelId, upperChroma, options)
  const colorChromaGrid = smoothChromaGrid(maxChromaGrid, "color")
  const shapeChromaGrid = smoothChromaGrid(maxChromaGrid, "shape")

  appendGridSurface(
    builder,
    PERCEPTUAL_LIGHTNESS_SEGMENTS,
    HUE_SEGMENTS,
    (row, column) => {
      const lightness = row / PERCEPTUAL_LIGHTNESS_SEGMENTS
      const hue = (column / HUE_SEGMENTS) * 360
      const shapeChroma = readChroma(shapeChromaGrid, row, column)
      const colorChroma = Math.min(
        readChroma(colorChromaGrid, row, column),
        shapeChroma
      )

      return appendVertex(
        builder,
        polarToPoint(
          hue,
          shapeChroma / upperChroma,
          normalizeUnit(lightness)
        ),
        getPerceptualColor(modelId, lightness, colorChroma, hue),
        options
      )
    },
    { columnStep: WIREFRAME_COLUMN_STEP, rowStep: WIREFRAME_ROW_STEP }
  )

  return finalizeMesh(builder, `smooth ${modelId.toUpperCase()} gamut shell`)
}

function assertNeverPerceptualModel(modelId: never): never {
  throw new RangeError(`Unknown perceptual model: ${modelId}`)
}
