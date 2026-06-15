import type { Color } from "culori"

import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import { toColorSampleRenderColor } from "@/color-models/color-sample-rendering"
import { hueCubeToPoint } from "@/color-models/color-space-hue-cube"
import {
  appendGridSurface,
  appendVertex,
  createBuilder,
  finalizeMesh,
  normalizeUnit,
} from "@/color-models/color-space-solid-mesh-builder"

const HUE_SEGMENTS = 192
const PERCEPTUAL_LIGHTNESS_SEGMENTS = 64
const CHROMA_SEARCH_STEPS = 16
const COLOR_SMOOTHING_PASSES = 3
const SHAPE_SMOOTHING_PASSES = 8
const WIREFRAME_COLUMN_STEP = 16
const WIREFRAME_ROW_STEP = 8
const LAB_MAX_CHROMA = 200
const OKLAB_MAX_CHROMA = 0.48

type PerceptualSolidModelId =
  | "lab"
  | "lch"
  | "lch-cube"
  | "oklab"
  | "oklch"
  | "oklch-cube"
type ChromaSmoothingMode = "color" | "shape"

const PERCEPTUAL_SOLID_MODEL_SETTINGS = {
  lab: {
    shapeLabel: "smooth Lab a/b gamut shell",
    upperChroma: LAB_MAX_CHROMA,
  },
  lch: {
    shapeLabel: "smooth LCH gamut shell",
    upperChroma: LAB_MAX_CHROMA,
  },
  "lch-cube": {
    shapeLabel: "smooth LCH unfolded gamut shell",
    upperChroma: LAB_MAX_CHROMA,
  },
  oklab: {
    shapeLabel: "smooth OKLab a/b gamut shell",
    upperChroma: OKLAB_MAX_CHROMA,
  },
  oklch: {
    shapeLabel: "smooth OKLCH gamut shell",
    upperChroma: OKLAB_MAX_CHROMA,
  },
  "oklch-cube": {
    shapeLabel: "smooth OKLCH unfolded gamut shell",
    upperChroma: OKLAB_MAX_CHROMA,
  },
} as const satisfies Record<
  PerceptualSolidModelId,
  {
    readonly shapeLabel: string
    readonly upperChroma: number
  }
>

function chromaHueToComponents(chroma: number, hue: number) {
  const radians = (hue / 180) * Math.PI

  return {
    a: Math.cos(radians) * chroma,
    b: Math.sin(radians) * chroma,
  }
}

function getPerceptualColor(
  modelId: PerceptualSolidModelId,
  lightness: number,
  chroma: number,
  hue: number
): Color {
  const { a, b } = chromaHueToComponents(chroma, hue)

  switch (modelId) {
    case "lab":
      return { mode: "lab", l: lightness * 100, a, b }
    case "lch":
    case "lch-cube":
      return { mode: "lch", l: lightness * 100, c: chroma, h: hue }
    case "oklab":
      return { mode: "oklab", l: lightness, a, b }
    case "oklch":
    case "oklch-cube":
      return { mode: "oklch", l: lightness, c: chroma, h: hue }
    default:
      return assertNeverPerceptualModel(modelId)
  }
}

function getPerceptualPoint(
  modelId: PerceptualSolidModelId,
  lightness: number,
  chroma: number,
  hue: number,
  upperChroma: number
) {
  switch (modelId) {
    case "lab":
    case "oklab": {
      const { a, b } = chromaHueToComponents(chroma, hue)

      return {
        x: a / upperChroma,
        y: normalizeUnit(lightness),
        z: b / upperChroma,
      }
    }
    case "lch":
    case "oklch": {
      const { a, b } = chromaHueToComponents(chroma / upperChroma, hue)

      return { x: a, y: normalizeUnit(lightness), z: b }
    }
    case "lch-cube":
    case "oklch-cube":
      return hueCubeToPoint(hue, lightness, chroma / upperChroma)
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
  const clampedRow = Math.min(PERCEPTUAL_LIGHTNESS_SEGMENTS, Math.max(0, row))
  const values = grid[clampedRow]
  const wrappedColumn = ((column % HUE_SEGMENTS) + HUE_SEGMENTS) % HUE_SEGMENTS

  return values?.[wrappedColumn] ?? 0
}

export function buildPerceptualSolidMesh(
  modelId: PerceptualSolidModelId,
  options: ColorSampleRenderOptions
) {
  const builder = createBuilder()
  const modelSettings = PERCEPTUAL_SOLID_MODEL_SETTINGS[modelId]
  const upperChroma = modelSettings.upperChroma
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
        getPerceptualPoint(modelId, lightness, shapeChroma, hue, upperChroma),
        getPerceptualColor(modelId, lightness, colorChroma, hue),
        options
      )
    },
    { columnStep: WIREFRAME_COLUMN_STEP, rowStep: WIREFRAME_ROW_STEP }
  )

  return finalizeMesh(builder, modelSettings.shapeLabel)
}

function assertNeverPerceptualModel(modelId: never): never {
  throw new RangeError(`Unknown perceptual model: ${modelId}`)
}
