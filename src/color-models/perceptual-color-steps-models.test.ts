import assert from "node:assert/strict"
import test from "node:test"

import {
  createBrandChromaRows,
  createLightnessStepRows,
  formatDeltaE,
} from "./perceptual-color-steps-models.ts"

test("createLightnessStepRows returns RGB HSL and OKLCH rows", () => {
  const rows = createLightnessStepRows(6)

  assert.deepEqual(
    rows.map((row) => row.id),
    ["rgb-gray", "hsl-lightness", "oklch-lightness"]
  )
  assert.equal(rows[0]?.steps.length, 6)
})

test("createBrandChromaRows returns equal-count brand color ramps", () => {
  const rows = createBrandChromaRows(5)

  assert.deepEqual(
    rows.map((row) => row.id),
    ["rgb-mix", "hsl-saturation", "oklch-chroma"]
  )
  assert.equal(rows[2]?.steps.at(-1)?.label, "100")
})

test("formatDeltaE renders compact adjacent differences", () => {
  assert.equal(formatDeltaE(0), "0")
  assert.equal(formatDeltaE(2.345), "2.3")
})
