import assert from "node:assert/strict"
import test from "node:test"

import {
  buildUnwrappedColorSpaceMesh,
  UNWRAPPED_MESH_HUE_SEGMENTS,
  UNWRAPPED_MESH_RADIUS_SEGMENTS,
} from "./color-space-unwrapped-mesh.ts"

test("buildUnwrappedColorSpaceMesh wraps 0 and 360 degrees onto the same seam", () => {
  const mesh = buildUnwrappedColorSpaceMesh("oklch", 0.7)
  const rowStride = UNWRAPPED_MESH_HUE_SEGMENTS + 1
  const outerRow = UNWRAPPED_MESH_RADIUS_SEGMENTS * rowStride
  const firstOuterOffset = outerRow * 3
  const lastOuterOffset = (outerRow + UNWRAPPED_MESH_HUE_SEGMENTS) * 3

  assert.equal(
    mesh.positions[firstOuterOffset],
    mesh.positions[lastOuterOffset]
  )
  assert.equal(
    mesh.positions[firstOuterOffset + 1],
    mesh.positions[lastOuterOffset + 1]
  )
  assert.ok(
    Math.abs(
      mesh.positions[firstOuterOffset + 2] - mesh.positions[lastOuterOffset + 2]
    ) < 0.000001
  )
})

test("buildUnwrappedColorSpaceMesh reports the generated surface shape", () => {
  const mesh = buildUnwrappedColorSpaceMesh("hsl", 0.58)
  const expectedVertices =
    (UNWRAPPED_MESH_RADIUS_SEGMENTS + 1) * (UNWRAPPED_MESH_HUE_SEGMENTS + 1)
  const expectedTriangles =
    UNWRAPPED_MESH_RADIUS_SEGMENTS * UNWRAPPED_MESH_HUE_SEGMENTS * 2

  assert.equal(mesh.vertexCount, expectedVertices)
  assert.equal(mesh.triangleCount, expectedTriangles)
  assert.match(mesh.shapeLabel, /HSL Lightness 58%/)
  assert.equal(mesh.axisPositions.length, 6)
  assert.equal(mesh.seamPositions.length, 6)
})
