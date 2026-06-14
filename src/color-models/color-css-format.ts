import { converter, formatHex, formatHsl, formatRgb } from "culori"
import type { Color } from "culori"

export type CssColorNotation =
  | "displayP3"
  | "hex"
  | "hsl"
  | "lab"
  | "lch"
  | "oklab"
  | "oklch"
  | "rgb"

export type CssColorFormats = {
  readonly displayP3: string
  readonly hex: string
  readonly hsl: string
  readonly lab: string
  readonly lch: string
  readonly oklab: string
  readonly oklch: string
  readonly rgb: string
}

const toLab = converter("lab")
const toLch = converter("lch")
const toOklab = converter("oklab")
const toOklch = converter("oklch")
const toDisplayP3 = converter("p3")

export function formatCssColor(color: Color, notation: CssColorNotation) {
  switch (notation) {
    case "hex":
      return formatHex(color)
    case "rgb":
      return formatRgb(color)
    case "hsl":
      return formatHsl(color)
    case "lab":
      return formatLab(color)
    case "lch":
      return formatLch(color)
    case "oklab":
      return formatOklab(color)
    case "oklch":
      return formatOklch(color)
    case "displayP3":
      return formatDisplayP3(color)
    default:
      return assertNeverNotation(notation)
  }
}

export function formatCssColorSet(color: Color): CssColorFormats {
  return {
    displayP3: formatCssColor(color, "displayP3"),
    hex: formatCssColor(color, "hex"),
    rgb: formatCssColor(color, "rgb"),
    hsl: formatCssColor(color, "hsl"),
    lab: formatCssColor(color, "lab"),
    lch: formatCssColor(color, "lch"),
    oklab: formatCssColor(color, "oklab"),
    oklch: formatCssColor(color, "oklch"),
  }
}

function formatLab(color: Color) {
  const lab = toLab(color)

  return `lab(${formatNumber(lab.l)}% ${formatNumber(lab.a)} ${formatNumber(lab.b)})`
}

function formatLch(color: Color) {
  const lch = toLch(color)

  return `lch(${formatNumber(lch.l)}% ${formatNumber(lch.c)} ${formatHue(lch.h)})`
}

function formatOklab(color: Color) {
  const oklab = toOklab(color)

  return `oklab(${formatNumber(oklab.l * 100)}% ${formatNumber(oklab.a)} ${formatNumber(oklab.b)})`
}

function formatOklch(color: Color) {
  const oklch = toOklch(color)

  return `oklch(${formatNumber(oklch.l * 100)}% ${formatNumber(oklch.c)} ${formatHue(oklch.h)})`
}

function formatDisplayP3(color: Color) {
  const p3 = toDisplayP3(color)

  return `color(display-p3 ${formatNumber(p3.r)} ${formatNumber(p3.g)} ${formatNumber(p3.b)})`
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
