import { parse } from "culori"
import type { Color } from "culori"

import { formatCssColor, formatCssColorSet } from "./color-css-format.ts"
import type { CssColorNotation } from "./color-css-format.ts"

export type CssColorParseResult =
  | {
      readonly color: Color
      readonly status: "parsed"
    }
  | {
      readonly status: "invalid"
    }

export type CssNotationRow = {
  readonly id: CssColorNotation
  readonly label: string
  readonly value: string
}

export const CSS_COLOR_PRESETS = [
  "#ff5a3d",
  "#325bff",
  "oklch(70% 0.18 32)",
  "lch(62% 74 320)",
  "color(display-p3 1 0.45 0.12)",
] as const

export const CSS_NOTATION_ORDER = [
  "hex",
  "rgb",
  "hsl",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "displayP3",
] as const satisfies readonly CssColorNotation[]

const CSS_NOTATION_LABELS = {
  displayP3: "Display P3",
  hex: "Hex",
  hsl: "HSL",
  lab: "Lab",
  lch: "LCH",
  oklab: "OKLab",
  oklch: "OKLCH",
  rgb: "RGB",
} satisfies Record<CssColorNotation, string>

export function parseCssColorInput(value: string): CssColorParseResult {
  const color = parse(value.trim())

  return color ? { status: "parsed", color } : { status: "invalid" }
}

export function createCssNotationRows(color: Color): readonly CssNotationRow[] {
  const formats = formatCssColorSet(color)

  return CSS_NOTATION_ORDER.map((id) => ({
    id,
    label: CSS_NOTATION_LABELS[id],
    value: formats[id] ?? formatCssColor(color, id),
  }))
}
