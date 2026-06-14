import assert from "node:assert/strict"
import test from "node:test"

import {
  analyzeGamutClipping,
  createOklchGamutSource,
} from "./color-gamut-clipping-models.ts"

test("createOklchGamutSource maps controls into OKLCH colors", () => {
  assert.deepEqual(createOklchGamutSource(70, 0.24, 32), {
    mode: "oklch",
    l: 0.7,
    c: 0.24,
    h: 32,
  })
})

test("analyzeGamutClipping compares target gamut clipping and mapping", () => {
  const result = analyzeGamutClipping({
    chroma: 0.35,
    hue: 32,
    lightness: 70,
    targetId: "srgb",
  })

  assert.equal(result.inTarget, false)
  assert.equal(result.target.label, "sRGB")
  assert.match(result.clippedCss, /rgb|#/)
  assert.match(result.mappedCss, /rgb|#/)
})
