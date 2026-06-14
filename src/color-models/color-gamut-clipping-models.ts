import { clampGamut, converter, formatHex, inGamut, toGamut } from "culori"
import type { Color, Oklch, P3, Rec2020 } from "culori"

export const GAMUT_CLIPPING_TARGET_IDS = [
  "srgb",
  "display-p3",
  "rec2020",
] as const

export type GamutClippingTargetId = (typeof GAMUT_CLIPPING_TARGET_IDS)[number]

export type GamutClippingTarget = {
  readonly id: GamutClippingTargetId
  readonly label: string
  readonly mode: "p3" | "rec2020" | "rgb"
}

export type GamutClippingInput = {
  readonly chroma: number
  readonly hue: number
  readonly lightness: number
  readonly targetId: GamutClippingTargetId
}

export type GamutClippingResult = {
  readonly clippedColor: Color
  readonly clippedCss: string
  readonly clippedHex: string
  readonly inTarget: boolean
  readonly mappedColor: Color
  readonly mappedCss: string
  readonly mappedHex: string
  readonly sourceColor: Oklch
  readonly sourceCss: string
  readonly sourceHex: string
  readonly target: GamutClippingTarget
}

export const GAMUT_CLIPPING_TARGET_BY_ID = {
  srgb: {
    id: "srgb",
    label: "sRGB",
    mode: "rgb",
  },
  "display-p3": {
    id: "display-p3",
    label: "Display P3",
    mode: "p3",
  },
  rec2020: {
    id: "rec2020",
    label: "Rec.2020",
    mode: "rec2020",
  },
} as const satisfies Record<GamutClippingTargetId, GamutClippingTarget>

export const GAMUT_CLIPPING_TARGETS = [
  GAMUT_CLIPPING_TARGET_BY_ID.srgb,
  GAMUT_CLIPPING_TARGET_BY_ID["display-p3"],
  GAMUT_CLIPPING_TARGET_BY_ID.rec2020,
] as const

const toRgb = converter("rgb")
const toP3 = converter("p3")
const toRec2020 = converter("rec2020")

export function createOklchGamutSource(
  lightness: number,
  chroma: number,
  hue: number
): Oklch {
  return {
    mode: "oklch",
    l: lightness / 100,
    c: chroma,
    h: hue,
  }
}

export function analyzeGamutClipping(
  input: GamutClippingInput
): GamutClippingResult {
  const target = GAMUT_CLIPPING_TARGET_BY_ID[input.targetId]
  const sourceColor = createOklchGamutSource(
    input.lightness,
    input.chroma,
    input.hue
  )
  const clippedColor = clipToTarget(sourceColor, target)
  const mappedColor = mapToTarget(sourceColor, target)

  return {
    clippedColor,
    clippedCss: formatTargetColor(clippedColor, target),
    clippedHex: formatHex(clippedColor),
    inTarget: inGamut(target.mode)(sourceColor),
    mappedColor,
    mappedCss: formatTargetColor(mappedColor, target),
    mappedHex: formatHex(mappedColor),
    sourceColor,
    sourceCss: formatOklch(sourceColor),
    sourceHex: formatHex(sourceColor),
    target,
  }
}

function clipToTarget(color: Color, target: GamutClippingTarget): Color {
  switch (target.id) {
    case "srgb":
      return clampGamut("rgb")(color) ?? toRgb(color)
    case "display-p3":
      return clampGamut("p3")(color) ?? toP3(color)
    case "rec2020":
      return clampGamut("rec2020")(color) ?? toRec2020(color)
    default:
      return assertNeverTargetId(target.id)
  }
}

function mapToTarget(color: Color, target: GamutClippingTarget): Color {
  switch (target.id) {
    case "srgb":
      return toGamut("rgb", "oklch")(color)
    case "display-p3":
      return toGamut("p3", "oklch")(color)
    case "rec2020":
      return toGamut("rec2020", "oklch")(color)
    default:
      return assertNeverTargetId(target.id)
  }
}

function formatTargetColor(color: Color, target: GamutClippingTarget) {
  switch (target.id) {
    case "srgb":
      return formatHex(color)
    case "display-p3":
      return formatDisplayP3(toP3(color))
    case "rec2020":
      return formatRec2020(toRec2020(color))
    default:
      return assertNeverTargetId(target.id)
  }
}

function formatOklch(color: Oklch) {
  return `oklch(${formatNumber(color.l * 100)}% ${formatNumber(color.c)} ${formatNumber(color.h ?? 0)})`
}

function formatDisplayP3(color: P3) {
  return `color(display-p3 ${formatNumber(color.r)} ${formatNumber(color.g)} ${formatNumber(color.b)})`
}

function formatRec2020(color: Rec2020) {
  return `color(rec2020 ${formatNumber(color.r)} ${formatNumber(color.g)} ${formatNumber(color.b)})`
}

function formatNumber(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
}

function assertNeverTargetId(targetId: never): never {
  throw new RangeError(`Unknown gamut clipping target: ${targetId}`)
}
