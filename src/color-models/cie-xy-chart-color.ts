import type { CieXyzChromaticity } from "@/color-models/cie-xyz-gamut-data"

export type CieXyDisplayRgb = {
  readonly b: number
  readonly g: number
  readonly r: number
}

const SRGB_EPSILON = 0.0031308

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function encodeSrgb(channel: number) {
  const clamped = clamp01(channel)

  return clamped <= SRGB_EPSILON
    ? clamped * 12.92
    : 1.055 * clamped ** (1 / 2.4) - 0.055
}

function toHexByte(channel: number) {
  return Math.round(encodeSrgb(channel) * 255)
    .toString(16)
    .padStart(2, "0")
}

function normalizeDisplayRgb(rgb: CieXyDisplayRgb): CieXyDisplayRgb | null {
  const clipped = {
    b: Math.max(0, rgb.b),
    g: Math.max(0, rgb.g),
    r: Math.max(0, rgb.r),
  }
  const maxChannel = Math.max(clipped.r, clipped.g, clipped.b)

  if (maxChannel <= 0) {
    return null
  }

  return maxChannel > 1
    ? {
        b: clipped.b / maxChannel,
        g: clipped.g / maxChannel,
        r: clipped.r / maxChannel,
      }
    : clipped
}

function mixWithWhite(rgb: CieXyDisplayRgb, amount: number): CieXyDisplayRgb {
  return {
    b: rgb.b * amount + (1 - amount),
    g: rgb.g * amount + (1 - amount),
    r: rgb.r * amount + (1 - amount),
  }
}

export function chromaticityToDisplayRgb({
  x,
  y,
}: CieXyzChromaticity): CieXyDisplayRgb {
  if (y <= 0) {
    return { b: 1, g: 1, r: 1 }
  }

  const z = 1 - x - y
  const bigX = x / y
  const bigY = 1
  const bigZ = z / y
  const rgb = normalizeDisplayRgb({
    r: 3.2406 * bigX - 1.5372 * bigY - 0.4986 * bigZ,
    g: -0.9689 * bigX + 1.8758 * bigY + 0.0415 * bigZ,
    b: 0.0557 * bigX - 0.204 * bigY + 1.057 * bigZ,
  })

  if (!rgb) {
    return { b: 1, g: 1, r: 1 }
  }

  const distanceFromWhite = Math.hypot(x - 0.3127, y - 0.329)
  const saturation = clamp01(distanceFromWhite / 0.42)
  return mixWithWhite(rgb, 0.28 + saturation * 0.72)
}

export function chromaticityToDisplayHex(chromaticity: CieXyzChromaticity) {
  const displayRgb = chromaticityToDisplayRgb(chromaticity)
  return `#${toHexByte(displayRgb.r)}${toHexByte(displayRgb.g)}${toHexByte(
    displayRgb.b
  )}`
}
