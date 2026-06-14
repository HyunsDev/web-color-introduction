import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
} from "three"

import type { SolidColorSpaceMesh } from "@/color-models/color-space-solid-mesh"

const WIREFRAME_PALETTE = {
  dark: {
    color: "#f8fafc",
    opacity: 0.2,
  },
  light: {
    color: "#0f172a",
    opacity: 0.16,
  },
} as const

export function createSolidColorSpaceObject({
  mesh,
  showWireframe,
  surfaceOpacity = 1,
  theme,
}: {
  readonly mesh: SolidColorSpaceMesh
  readonly showWireframe: boolean
  readonly surfaceOpacity?: number
  readonly theme: "dark" | "light"
}) {
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(mesh.positions, 3))
  geometry.setAttribute("color", new BufferAttribute(mesh.colors, 3))
  geometry.setIndex(new BufferAttribute(mesh.indices, 1))
  geometry.computeVertexNormals()

  const material = new MeshBasicMaterial({
    depthWrite: surfaceOpacity >= 1,
    opacity: surfaceOpacity,
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    transparent: surfaceOpacity < 1,
    vertexColors: true,
  })
  const group = new Group()
  const surface = new Mesh(geometry, material)
  group.add(surface)

  if (showWireframe) {
    const wireframePalette = WIREFRAME_PALETTE[theme]
    const wireframeGeometry = new BufferGeometry()
    wireframeGeometry.setAttribute(
      "position",
      new BufferAttribute(mesh.wireframePositions, 3)
    )
    const wireframe = new LineSegments(
      wireframeGeometry,
      new LineBasicMaterial({
        color: wireframePalette.color,
        depthWrite: false,
        transparent: true,
        opacity: wireframePalette.opacity,
      })
    )
    wireframe.renderOrder = 1
    group.add(wireframe)
  }

  return group
}
