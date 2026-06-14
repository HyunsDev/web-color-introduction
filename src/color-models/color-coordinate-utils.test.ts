import assert from "node:assert/strict"
import test from "node:test"

import { formatCssColorSet } from "./color-css-format.ts"
import { samplePixel } from "./color-canvas-sampling.ts"
import { getColorGamutChecks } from "./color-gamut-analysis.ts"
import {
  getCoordinatePlanes,
  getPlaneMarkerPosition,
  setPlaneCoordinate,
} from "./color-coordinate-plane-models.ts"
import {
  createDefaultColorCoordinate,
  readColorCoordinateAxis,
  setColorCoordinateAxis,
  toCuloriColor,
} from "./color-coordinate-utils.ts"

test("toCuloriColor converts RGB 8-bit channels to unit RGB", () => {
  const color = toCuloriColor({ modelId: "rgb", r: 255, g: 128, b: 0 })

  assert.equal(color.mode, "rgb")
  if (color.mode !== "rgb") {
    return
  }

  assert.equal(color.r, 1)
  assert.equal(color.g, 128 / 255)
  assert.equal(color.b, 0)
})

test("createDefaultColorCoordinate returns model-shaped defaults", () => {
  assert.deepEqual(createDefaultColorCoordinate("oklch"), {
    modelId: "oklch",
    l: 70,
    c: 0.18,
    h: 32,
  })
})

test("formatCssColorSet exposes core CSS notations", () => {
  const formats = formatCssColorSet({ mode: "rgb", r: 1, g: 0, b: 0 })

  assert.equal(formats.hex, "#ff0000")
  assert.match(formats.rgb, /rgb/)
  assert.match(formats.hsl, /hsl/)
  assert.match(formats.lch, /lch/)
  assert.match(formats.oklch, /oklch/)
})

test("getColorGamutChecks reports sRGB red inside each device gamut", () => {
  const checks = getColorGamutChecks({ mode: "rgb", r: 1, g: 0, b: 0 })

  assert.deepEqual(
    checks.map((check) => [check.gamut, check.inGamut]),
    [
      ["rgb", true],
      ["p3", true],
      ["rec2020", true],
    ]
  )
})

test("samplePixel returns null outside bounds and channel data inside bounds", () => {
  const data = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255])

  assert.deepEqual(samplePixel({ data, width: 2, height: 1 }, 1, 0), {
    r: 0,
    g: 255,
    b: 0,
    a: 255,
  })
  assert.equal(samplePixel({ data, width: 2, height: 1 }, 2, 0), null)
})

test("setColorCoordinateAxis updates only valid channels for the model", () => {
  const coordinate = createDefaultColorCoordinate("hsl")

  assert.deepEqual(setColorCoordinateAxis(coordinate, "s", 42), {
    modelId: "hsl",
    h: 24,
    s: 42,
    l: 58,
  })
  assert.equal(readColorCoordinateAxis(coordinate, "r"), 0)
})

test("setPlaneCoordinate maps pointer ratios onto selected axes", () => {
  const coordinate = createDefaultColorCoordinate("rgb")
  const plane = getCoordinatePlanes("rgb")[0]

  assert.ok(plane)
  assert.deepEqual(setPlaneCoordinate(coordinate, plane, 0, 1), {
    modelId: "rgb",
    r: 0,
    g: 0,
    b: 64,
  })
})

test("getPlaneMarkerPosition normalizes selected coordinate axes", () => {
  const coordinate = { modelId: "rgb", r: 255, g: 0, b: 64 } as const
  const plane = getCoordinatePlanes("rgb")[0]

  assert.ok(plane)
  assert.deepEqual(getPlaneMarkerPosition(coordinate, plane), { x: 1, y: 1 })
})
