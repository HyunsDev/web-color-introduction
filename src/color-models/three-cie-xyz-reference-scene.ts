import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from "three"

import type { CieXyzReferenceMesh } from "@/color-models/cie-xyz-reference-mesh"
import { CIE_XYZ_SCENE_PALETTE } from "@/color-models/three-cie-xyz-palette"
import type { CieXyzSceneTheme } from "@/color-models/three-cie-xyz-palette"

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

function createVisibleConeObject({
  reference,
  theme,
}: {
  readonly reference: CieXyzReferenceMesh
  readonly theme: CieXyzSceneTheme
}) {
  const palette = CIE_XYZ_SCENE_PALETTE[theme]
  const group = new Group()
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    "position",
    new BufferAttribute(reference.visibleConePositions, 3)
  )
  geometry.setIndex(new BufferAttribute(reference.visibleConeIndices, 1))
  geometry.computeVertexNormals()
  group.add(
    new Mesh(
      geometry,
      new MeshBasicMaterial({
        color: palette.visibleCone,
        depthWrite: false,
        opacity: 0.14,
        side: DoubleSide,
        transparent: true,
      })
    )
  )
  group.add(
    createLineSegments(
      reference.visibleConeWireframePositions,
      palette.visibleConeWire,
      0.34
    )
  )

  return group
}

export function createCieXyzReferenceObject({
  reference,
  showChromaticity,
  showVisibleCone,
  theme,
}: {
  readonly reference: CieXyzReferenceMesh
  readonly showChromaticity: boolean
  readonly showVisibleCone: boolean
  readonly theme: CieXyzSceneTheme
}) {
  const palette = CIE_XYZ_SCENE_PALETTE[theme]
  const group = new Group()
  const pointGeometry = new SphereGeometry(0.035, 18, 12)
  const originPoint = new Mesh(
    pointGeometry,
    new MeshBasicMaterial({ color: palette.frameColor })
  )
  const whitePoint = new Mesh(
    pointGeometry.clone(),
    new MeshBasicMaterial({ color: palette.whitePoint })
  )

  originPoint.position.set(
    reference.originPosition[0] ?? -1,
    reference.originPosition[1] ?? -1,
    reference.originPosition[2] ?? -1
  )
  whitePoint.position.set(
    reference.whitePointPosition[0] ?? 0,
    reference.whitePointPosition[1] ?? 0,
    reference.whitePointPosition[2] ?? 0
  )

  if (showVisibleCone) {
    group.add(createVisibleConeObject({ reference, theme }))
  }

  if (showChromaticity) {
    const planeGeometry = new BufferGeometry()
    planeGeometry.setAttribute(
      "position",
      new BufferAttribute(reference.chromaticityPlanePositions, 3)
    )
    planeGeometry.setIndex(
      new BufferAttribute(reference.chromaticityPlaneIndices, 1)
    )
    const plane = new Mesh(
      planeGeometry,
      new MeshBasicMaterial({
        color: palette.planeColor,
        depthWrite: false,
        opacity: palette.planeOpacity,
        side: DoubleSide,
        transparent: true,
      })
    )
    group.add(plane)
    group.add(
      createLineSegments(reference.locusPositions, palette.spectralLocus, 0.9)
    )
    group.add(
      createLineSegments(
        reference.purpleBoundaryPositions,
        palette.purpleBoundary,
        0.88
      )
    )
  }

  group.add(originPoint)
  group.add(whitePoint)

  return group
}
