import assert from "node:assert/strict"
import test from "node:test"

import { hueCubeToPoint } from "./color-space-hue-cube.ts"
import {
  COLOR_SPACE_MODELS,
  getBaseColorSpaceModelId,
  isHueCubeModelId,
} from "./color-space-models.ts"
import { isSolidSliceModel } from "./color-space-solid-slice-models.ts"

test("hueCubeToPoint unfolds hue, height, and depth onto cube axes", () => {
  assert.deepEqual(hueCubeToPoint(0, 0.5, 1), { x: -1, y: 0, z: 1 })
  assert.deepEqual(hueCubeToPoint(360, 1, 0), { x: 1, y: 1, z: -1 })
})

test("cube model helpers map cube ids back to their base color spaces", () => {
  assert.equal(isHueCubeModelId("oklch-cube"), true)
  assert.equal(isHueCubeModelId("oklch"), false)
  assert.equal(getBaseColorSpaceModelId("oklch-cube"), "oklch")
  assert.equal(getBaseColorSpaceModelId("hsl"), "hsl")
})

test("COLOR_SPACE_MODELS places cube models next to their base models", () => {
  assert.deepEqual(
    COLOR_SPACE_MODELS.map((model) => model.id),
    [
      "rgb",
      "hsl",
      "hsl-cube",
      "hsv",
      "hsv-cube",
      "hwb",
      "hwb-cube",
      "xyz",
      "lab",
      "lch",
      "lch-cube",
      "oklab",
      "oklch",
      "oklch-cube",
    ]
  )
})

test("solid slice support follows the cube model scope", () => {
  assert.equal(isSolidSliceModel("hsl-cube"), true)
  assert.equal(isSolidSliceModel("hsv-cube"), true)
  assert.equal(isSolidSliceModel("lch-cube"), true)
  assert.equal(isSolidSliceModel("oklch-cube"), true)
  assert.equal(isSolidSliceModel("hwb-cube"), false)
})
