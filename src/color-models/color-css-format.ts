import { converter, formatHex, formatHsl, formatRgb } from "culori"
import type { Color } from "culori"

export type CssColorNotation = "hex" | "hsl" | "lch" | "oklch" | "rgb"

export type CssColorFormats = {
  readonly hex: string
  readonly hsl: string
  readonly lch: string
  readonly oklch: string
  readonly rgb: string
}

const toLch = converter("lch")
const toOklch = converter("oklch")

export function formatCssColor(color: Color, notation: CssColorNotation) {
  switch (notation) {
    case "hex":
      return formatHex(color)
    case "rgb":
      return formatRgb(color)
    case "hsl":
      return formatHsl(color)
    case "lch":
      return formatLch(color)
    case "oklch":
      return formatOklch(color)
    default:
      return assertNeverNotation(notation)
  }
}

export function formatCssColorSet(color: Color): CssColorFormats {
  return {
    hex: formatCssColor(color, "hex"),
    rgb: formatCssColor(color, "rgb"),
    hsl: formatCssColor(color, "hsl"),
    lch: formatCssColor(color, "lch"),
    oklch: formatCssColor(color, "oklch"),
  }
}

function formatLch(color: Color) {
  const lch = toLch(color)

  return `lch(${formatNumber(lch.l)}% ${formatNumber(lch.c)} ${formatHue(lch.h)})`
}

function formatOklch(color: Color) {
  const oklch = toOklch(color)

  return `oklch(${formatNumber(oklch.l * 100)}% ${formatNumber(oklch.c)} ${formatHue(oklch.h)})`
}

function formatHue(hue: number | undefined) {
  return hue === undefined || !Number.isFinite(hue)
    ? "none"
    : formatNumber(normalizeHue(hue))
}

function normalizeHue(hue: number) {
  return ((hue % 360) + 360) % 360
}

function formatNumber(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
}

function assertNeverNotation(notation: never): never {
  throw new RangeError(`Unknown CSS color notation: ${notation}`)
}
