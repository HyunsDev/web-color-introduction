import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from "three"

import type { CieXyzGamutMesh } from "@/color-models/cie-xyz-gamut-mesh"
import type { CieXyzGamutId } from "@/color-models/cie-xyz-gamut-data"
import type { CieXyzReferenceMesh } from "@/color-models/cie-xyz-reference-mesh"
import { CIE_XYZ_SCENE_PALETTE } from "@/color-models/three-cie-xyz-palette"
import type { CieXyzSceneTheme } from "@/color-models/three-cie-xyz-palette"
import { createCieXyzReferenceObject } from "@/color-models/three-cie-xyz-reference-scene"

export type CieXyzGamutVisibility = Record<CieXyzGamutId, boolean>

function createLine(
  points: readonly Vector3[],
  color: string,
  opacity: number
) {
  const geometry = new BufferGeometry().setFromPoints([...points])
  const material = new LineBasicMaterial({ color, opacity, transparent: true })

  return new Line(geometry, material)
}

function createLineSegments(
  positions: Float32Array,
  color: string,
  opacity: number
) {
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(positions, 3))

  return new LineSegments(
    geometry,
    new LineBasicMaterial({
      color,
      depthWrite: false,
      opacity,
      transparent: true,
    })
  )
}

function createXyzFrame(theme: CieXyzSceneTheme) {
  const palette = CIE_XYZ_SCENE_PALETTE[theme]
  const group = new Group()
  const axisLength = 1.24

  group.add(
    createLine(
      [new Vector3(-axisLength, -1, -1), new Vector3(axisLength, -1, -1)],
      "#ef4444",
      palette.axisOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(-1, -axisLength, -1), new Vector3(-1, axisLength, -1)],
      "#22c55e",
      palette.axisOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(-1, -1, -axisLength), new Vector3(-1, -1, axisLength)],
      "#3b82f6",
      palette.axisOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(-1, -1, -1), new Vector3(2, -1, -1)],
      palette.frameColor,
      palette.guideOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(-1, -1, -1), new Vector3(-1, 2, -1)],
      palette.frameColor,
      palette.guideOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(-1, -1, -1), new Vector3(-1, -1, 2)],
      palette.frameColor,
      palette.guideOpacity
    )
  )

  return group
}

function createGamutObject({
  mesh,
  showWireframe,
}: {
  readonly mesh: CieXyzGamutMesh
  readonly showWireframe: boolean
}) {
  const group = new Group()
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(mesh.positions, 3))
  geometry.setIndex(new BufferAttribute(mesh.indices, 1))
  geometry.computeVertexNormals()

  const surface = new Mesh(
    geometry,
    new MeshBasicMaterial({
      color: mesh.surfaceColor,
      depthWrite: false,
      opacity: 0.18,
      side: DoubleSide,
      transparent: true,
    })
  )
  group.add(surface)

  if (showWireframe) {
    group.add(createLineSegments(mesh.wireframePositions, mesh.lineColor, 0.42))
  }

  group.add(createLineSegments(mesh.primaryLinePositions, mesh.lineColor, 0.95))

  return group
}

function createXyGamutObject(mesh: CieXyzGamutMesh) {
  const group = new Group()

  group.add(
    createLineSegments(mesh.xyPrimaryLinePositions, mesh.lineColor, 0.95)
  )

  return group
}

export function createCieXyzGamutSceneObject({
  gamutMeshes,
  reference,
  showChromaticity,
  showVisibleCone,
  showWireframe,
  showXyChart,
  theme,
  visibleGamuts,
}: {
  readonly gamutMeshes: readonly CieXyzGamutMesh[]
  readonly reference: CieXyzReferenceMesh
  readonly showChromaticity: boolean
  readonly showVisibleCone: boolean
  readonly showWireframe: boolean
  readonly showXyChart: boolean
  readonly theme: CieXyzSceneTheme
  readonly visibleGamuts: CieXyzGamutVisibility
}) {
  const group = createXyzFrame(theme)

  if (showChromaticity || showVisibleCone) {
    group.add(
      createCieXyzReferenceObject({
        reference,
        showChromaticity,
        showVisibleCone,
        showXyChart,
        theme,
      })
    )
  }

  gamutMeshes.forEach((mesh) => {
    if (visibleGamuts[mesh.id]) {
      group.add(
        showXyChart
          ? createXyGamutObject(mesh)
          : createGamutObject({ mesh, showWireframe })
      )
    }
  })

  return group
}
