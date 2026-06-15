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

import type { UnwrappedColorSpaceMesh } from "@/color-models/color-space-unwrapped-mesh"

type SceneTheme = "dark" | "light"

const FRAME_LEVELS = [-1, -0.5, 0, 0.5, 1] as const
const FRAME_SEGMENTS = 96
const OUTER_RADIUS = 1

const SCENE_PALETTE = {
  light: {
    axisColor: "#16a34a",
    axisOpacity: 0.72,
    fixedRingColor: "#0f172a",
    fixedRingOpacity: 0.5,
    frameColor: "#334155",
    frameOpacity: 0.24,
    seamColor: "#f97316",
    seamOpacity: 0.96,
    wireColor: "#0f172a",
    wireOpacity: 0.2,
  },
  dark: {
    axisColor: "#4ade80",
    axisOpacity: 0.9,
    fixedRingColor: "#e5e7eb",
    fixedRingOpacity: 0.62,
    frameColor: "#d1d5db",
    frameOpacity: 0.4,
    seamColor: "#fb923c",
    seamOpacity: 1,
    wireColor: "#f8fafc",
    wireOpacity: 0.26,
  },
} as const satisfies Record<
  SceneTheme,
  {
    readonly axisColor: string
    readonly axisOpacity: number
    readonly fixedRingColor: string
    readonly fixedRingOpacity: number
    readonly frameColor: string
    readonly frameOpacity: number
    readonly seamColor: string
    readonly seamOpacity: number
    readonly wireColor: string
    readonly wireOpacity: number
  }
>

export function createUnwrappedColorSpaceObject({
  mesh,
  theme,
}: {
  readonly mesh: UnwrappedColorSpaceMesh
  readonly theme: SceneTheme
}) {
  const palette = SCENE_PALETTE[theme]
  const group = new Group()
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(mesh.positions, 3))
  geometry.setAttribute("color", new BufferAttribute(mesh.colors, 3))
  geometry.setIndex(new BufferAttribute(mesh.indices, 1))
  geometry.computeVertexNormals()

  group.add(
    new Mesh(
      geometry,
      new MeshBasicMaterial({
        side: DoubleSide,
        vertexColors: true,
      })
    )
  )
  group.add(
    createLineSegments(
      mesh.wireframePositions,
      palette.wireColor,
      palette.wireOpacity
    )
  )
  group.add(
    createLineSegments(
      mesh.seamPositions,
      palette.seamColor,
      palette.seamOpacity
    )
  )
  group.add(
    createLineSegments(
      mesh.axisPositions,
      palette.axisColor,
      palette.axisOpacity
    )
  )

  return group
}

export function createUnwrappedReferenceFrame({
  fixedY,
  theme,
}: {
  readonly fixedY: number
  readonly theme: SceneTheme
}) {
  const palette = SCENE_PALETTE[theme]
  const group = new Group()

  for (const level of FRAME_LEVELS) {
    group.add(
      createRing(level, OUTER_RADIUS, palette.frameColor, palette.frameOpacity)
    )
  }

  group.add(
    createLine(
      [new Vector3(OUTER_RADIUS, -1, 0), new Vector3(OUTER_RADIUS, 1, 0)],
      palette.frameColor,
      palette.frameOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(-OUTER_RADIUS, -1, 0), new Vector3(-OUTER_RADIUS, 1, 0)],
      palette.frameColor,
      palette.frameOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(0, -1, OUTER_RADIUS), new Vector3(0, 1, OUTER_RADIUS)],
      palette.frameColor,
      palette.frameOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(0, -1, -OUTER_RADIUS), new Vector3(0, 1, -OUTER_RADIUS)],
      palette.frameColor,
      palette.frameOpacity
    )
  )
  group.add(
    createRing(
      fixedY,
      OUTER_RADIUS * 1.01,
      palette.fixedRingColor,
      palette.fixedRingOpacity
    )
  )

  return group
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

function createRing(y: number, radius: number, color: string, opacity: number) {
  const points: Vector3[] = []

  for (let index = 0; index <= FRAME_SEGMENTS; index += 1) {
    const angle = (index / FRAME_SEGMENTS) * Math.PI * 2
    points.push(
      new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
    )
  }

  return createLine(points, color, opacity)
}

function createLine(points: Vector3[], color: string, opacity: number) {
  const geometry = new BufferGeometry().setFromPoints(points)

  return new Line(
    geometry,
    new LineBasicMaterial({
      color,
      depthWrite: false,
      opacity,
      transparent: true,
    })
  )
}
