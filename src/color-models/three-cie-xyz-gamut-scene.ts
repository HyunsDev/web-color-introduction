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
  SphereGeometry,
  Vector3,
} from "three"

import type {
  CieXyzGamutMesh,
  CieXyzReferenceMesh,
} from "@/color-models/cie-xyz-gamut-mesh"
import type { CieXyzGamutId } from "@/color-models/cie-xyz-gamut-data"

export type CieXyzGamutVisibility = Record<CieXyzGamutId, boolean>

export type CieXyzSceneTheme = "dark" | "light"

const FRAME_PALETTE = {
  light: {
    axisOpacity: 0.58,
    frameColor: "#1f2937",
    guideOpacity: 0.24,
    planeColor: "#64748b",
    planeOpacity: 0.08,
    purpleBoundary: "#a855f7",
    spectralLocus: "#111827",
    whitePoint: "#f8fafc",
  },
  dark: {
    axisOpacity: 0.78,
    frameColor: "#d1d5db",
    guideOpacity: 0.38,
    planeColor: "#cbd5e1",
    planeOpacity: 0.12,
    purpleBoundary: "#d8b4fe",
    spectralLocus: "#f8fafc",
    whitePoint: "#ffffff",
  },
} as const satisfies Record<
  CieXyzSceneTheme,
  {
    readonly axisOpacity: number
    readonly frameColor: string
    readonly guideOpacity: number
    readonly planeColor: string
    readonly planeOpacity: number
    readonly purpleBoundary: string
    readonly spectralLocus: string
    readonly whitePoint: string
  }
>

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
  const palette = FRAME_PALETTE[theme]
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

function createReferenceObject({
  reference,
  theme,
}: {
  readonly reference: CieXyzReferenceMesh
  readonly theme: CieXyzSceneTheme
}) {
  const palette = FRAME_PALETTE[theme]
  const group = new Group()
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
  const whitePoint = new Mesh(
    new SphereGeometry(0.035, 18, 12),
    new MeshBasicMaterial({ color: palette.whitePoint })
  )

  whitePoint.position.set(
    reference.whitePointPosition[0] ?? 0,
    reference.whitePointPosition[1] ?? 0,
    reference.whitePointPosition[2] ?? 0
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
  group.add(whitePoint)

  return group
}

export function createCieXyzGamutSceneObject({
  gamutMeshes,
  reference,
  showChromaticity,
  showWireframe,
  theme,
  visibleGamuts,
}: {
  readonly gamutMeshes: readonly CieXyzGamutMesh[]
  readonly reference: CieXyzReferenceMesh
  readonly showChromaticity: boolean
  readonly showWireframe: boolean
  readonly theme: CieXyzSceneTheme
  readonly visibleGamuts: CieXyzGamutVisibility
}) {
  const group = createXyzFrame(theme)

  if (showChromaticity) {
    group.add(createReferenceObject({ reference, theme }))
  }

  gamutMeshes.forEach((mesh) => {
    if (visibleGamuts[mesh.id]) {
      group.add(createGamutObject({ mesh, showWireframe }))
    }
  })

  return group
}
