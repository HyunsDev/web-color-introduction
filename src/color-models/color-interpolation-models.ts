import {
  converter,
  fixupHueDecreasing,
  fixupHueIncreasing,
  fixupHueLonger,
  fixupHueShorter,
  formatHex,
  interpolate,
  parse,
} from "culori"
import type { Color } from "culori"

import { isColorInGamut } from "./color-gamut-analysis.ts"

export const INTERPOLATION_SPACE_IDS = [
  "rgb",
  "hsl",
  "lab",
  "lch",
  "oklch",
] as const

export const HUE_STRATEGY_IDS = [
  "shorter",
  "longer",
  "increasing",
  "decreasing",
] as const

export type InterpolationSpaceId = (typeof INTERPOLATION_SPACE_IDS)[number]
export type HueStrategyId = (typeof HUE_STRATEGY_IDS)[number]

export type HueStrategyDefinition = {
  readonly description: string
  readonly id: HueStrategyId
  readonly label: string
}

export type InterpolationStep = {
  readonly color: Color
  readonly hex: string
  readonly inSrgb: boolean
  readonly position: number
}

export type InterpolationRow = {
  readonly id: InterpolationSpaceId
  readonly label: string
  readonly steps: readonly InterpolationStep[]
}

export type InterpolationInput = {
  readonly endColor: Color | string
  readonly hueStrategyId: HueStrategyId
  readonly startColor: Color | string
  readonly stepCount: number
}

const INTERPOLATION_SPACE_LABELS = {
  rgb: "RGB",
  hsl: "HSL",
  lab: "Lab",
  lch: "LCH",
  oklch: "OKLCH",
} satisfies Record<InterpolationSpaceId, string>

const HUE_FIXUPS = {
  shorter: fixupHueShorter,
  longer: fixupHueLonger,
  increasing: fixupHueIncreasing,
  decreasing: fixupHueDecreasing,
} satisfies Record<HueStrategyId, (hues: number[]) => number[]>

const toHsl = converter("hsl")
const toLch = converter("lch")
const toOklch = converter("oklch")

export const HUE_STRATEGIES = [
  {
    description: "가장 짧은 hue 호를 선택합니다.",
    id: "shorter",
    label: "Shorter",
  },
  {
    description: "더 긴 hue 호를 선택합니다.",
    id: "longer",
    label: "Longer",
  },
  {
    description: "hue 각도가 증가하는 방향으로 이동합니다.",
    id: "increasing",
    label: "Increasing",
  },
  {
    description: "hue 각도가 감소하는 방향으로 이동합니다.",
    id: "decreasing",
    label: "Decreasing",
  },
] as const satisfies readonly HueStrategyDefinition[]

export function parseInterpolationColor(value: string): Color | null {
  return parse(value) ?? null
}

export function createInterpolationRows(
  input: InterpolationInput
): readonly InterpolationRow[] {
  const startColor =
    typeof input.startColor === "string"
      ? parseInterpolationColor(input.startColor)
      : input.startColor
  const endColor =
    typeof input.endColor === "string"
      ? parseInterpolationColor(input.endColor)
      : input.endColor

  if (!startColor || !endColor) {
    return []
  }

  return INTERPOLATION_SPACE_IDS.map((spaceId) => {
    const interpolator = createSpaceInterpolator(
      startColor,
      endColor,
      spaceId,
      input.hueStrategyId
    )

    return {
      id: spaceId,
      label: INTERPOLATION_SPACE_LABELS[spaceId],
      steps: createStepPositions(input.stepCount).map((position) => {
        const color = interpolator(position)

        return {
          color,
          hex: formatHex(color),
          inSrgb: isSrgbColor(color),
          position,
        }
      }),
    }
  })
}

export function formatInterpolationStepPosition(position: number) {
  return `${Math.round(position * 100)}%`
}

function createSpaceInterpolator(
  startColor: Color,
  endColor: Color,
  spaceId: InterpolationSpaceId,
  hueStrategyId: HueStrategyId
) {
  switch (spaceId) {
    case "rgb":
    case "lab":
      return interpolate([startColor, endColor], spaceId)
    case "hsl":
      return createHslInterpolator(startColor, endColor, hueStrategyId)
    case "lch":
      return createLchInterpolator(startColor, endColor, hueStrategyId)
    case "oklch":
      return createOklchInterpolator(startColor, endColor, hueStrategyId)
    default:
      return assertNeverSpace(spaceId)
  }
}

function createHslInterpolator(
  startColor: Color,
  endColor: Color,
  hueStrategyId: HueStrategyId
) {
  const start = toHsl(startColor)
  const end = toHsl(endColor)
  const hues = fixHuePair(start.h, end.h, hueStrategyId)

  return (position: number): Color => ({
    mode: "hsl",
    h: lerp(hues[0], hues[1], position),
    s: lerp(start.s, end.s, position),
    l: lerp(start.l, end.l, position),
  })
}

function createLchInterpolator(
  startColor: Color,
  endColor: Color,
  hueStrategyId: HueStrategyId
) {
  const start = toLch(startColor)
  const end = toLch(endColor)
  const hues = fixHuePair(start.h, end.h, hueStrategyId)

  return (position: number): Color => ({
    mode: "lch",
    h: lerp(hues[0], hues[1], position),
    c: lerp(start.c, end.c, position),
    l: lerp(start.l, end.l, position),
  })
}

function createOklchInterpolator(
  startColor: Color,
  endColor: Color,
  hueStrategyId: HueStrategyId
) {
  const start = toOklch(startColor)
  const end = toOklch(endColor)
  const hues = fixHuePair(start.h, end.h, hueStrategyId)

  return (position: number): Color => ({
    mode: "oklch",
    h: lerp(hues[0], hues[1], position),
    c: lerp(start.c, end.c, position),
    l: lerp(start.l, end.l, position),
  })
}

function fixHuePair(
  startHue: number | undefined,
  endHue: number | undefined,
  hueStrategyId: HueStrategyId
) {
  const fixedHues = HUE_FIXUPS[hueStrategyId]([
    normalizeHue(startHue),
    normalizeHue(endHue),
  ])
  const fixedStartHue = fixedHues[0] ?? 0
  const fixedEndHue = fixedHues[1] ?? fixedStartHue

  return [fixedStartHue, fixedEndHue] as const
}

function normalizeHue(hue: number | undefined) {
  return hue === undefined || !Number.isFinite(hue) ? 0 : hue
}

function lerp(start: number, end: number, position: number) {
  return start + (end - start) * position
}

function createStepPositions(stepCount: number) {
  const count = Math.max(2, Math.round(stepCount))

  return Array.from({ length: count }, (_, index) => index / (count - 1))
}

function isSrgbColor(color: Color) {
  return isColorInGamut(color, "rgb")
}

function assertNeverSpace(spaceId: never): never {
  throw new RangeError(`Unknown interpolation space: ${spaceId}`)
}
