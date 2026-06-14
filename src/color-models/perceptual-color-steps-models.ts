import { differenceCiede2000, formatHex } from "culori"
import type { Color } from "culori"

export type PerceptualStep = {
  readonly deltaFromPrevious: number | null
  readonly hex: string
  readonly label: string
}

export type PerceptualStepRow = {
  readonly description: string
  readonly id: string
  readonly label: string
  readonly steps: readonly PerceptualStep[]
}

const deltaE = differenceCiede2000()

export function createLightnessStepRows(
  stepCount: number
): readonly PerceptualStepRow[] {
  return [
    createRow(
      "rgb-gray",
      "RGB gray",
      "R=G=B 값을 같은 간격으로 올립니다.",
      stepCount,
      (position) => {
        const channel = lerp(32, 224, position) / 255

        return { mode: "rgb", r: channel, g: channel, b: channel }
      }
    ),
    createRow(
      "hsl-lightness",
      "HSL lightness",
      "HSL L 값을 같은 간격으로 올립니다.",
      stepCount,
      (position) => ({
        mode: "hsl",
        h: 260,
        s: 0.72,
        l: lerp(0.2, 0.8, position),
      })
    ),
    createRow(
      "oklch-lightness",
      "OKLCH lightness",
      "OKLCH L 값을 같은 간격으로 올립니다.",
      stepCount,
      (position) => ({
        mode: "oklch",
        l: lerp(0.28, 0.82, position),
        c: 0.1,
        h: 260,
      })
    ),
  ]
}

export function createBrandChromaRows(
  stepCount: number
): readonly PerceptualStepRow[] {
  return [
    createRow(
      "rgb-mix",
      "RGB mix",
      "회색과 브랜드 색을 RGB에서 같은 비율로 섞습니다.",
      stepCount,
      (position) => ({
        mode: "rgb",
        r: lerp(0.45, 1, position),
        g: lerp(0.45, 0.36, position),
        b: lerp(0.45, 0.24, position),
      })
    ),
    createRow(
      "hsl-saturation",
      "HSL saturation",
      "HSL S 값을 같은 간격으로 올립니다.",
      stepCount,
      (position) => ({
        mode: "hsl",
        h: 16,
        s: lerp(0.18, 1, position),
        l: 0.58,
      })
    ),
    createRow(
      "oklch-chroma",
      "OKLCH chroma",
      "OKLCH C 값을 같은 간격으로 올립니다.",
      stepCount,
      (position) => ({
        mode: "oklch",
        l: 0.68,
        c: lerp(0.03, 0.2, position),
        h: 32,
      })
    ),
  ]
}

export function formatDeltaE(delta: number) {
  return Number.isInteger(delta) ? String(delta) : delta.toFixed(1)
}

function createRow(
  id: string,
  label: string,
  description: string,
  stepCount: number,
  createColor: (position: number) => Color
): PerceptualStepRow {
  const colors = createStepPositions(stepCount).map(createColor)

  return {
    description,
    id,
    label,
    steps: colors.map((color, index) => ({
      deltaFromPrevious:
        index === 0 ? null : deltaE(colors[index - 1] ?? color, color),
      hex: formatHex(color),
      label: formatStepLabel(index, colors.length),
    })),
  }
}

function createStepPositions(stepCount: number) {
  const count = Math.max(2, Math.round(stepCount))

  return Array.from({ length: count }, (_, index) => index / (count - 1))
}

function formatStepLabel(index: number, count: number) {
  return Math.round((index / (count - 1)) * 100).toString()
}

function lerp(start: number, end: number, position: number) {
  return start + (end - start) * position
}
