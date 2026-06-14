import {
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Vector3,
} from "three"

import type { ColorSpaceModelId } from "@/color-models/color-space-models"

const FRAME_COLOR = "#1f2937"
const AXIS_LENGTH = 1.26
const FRAME_LEVELS = [-1, -0.5, 0, 0.5, 1] as const
const RING_SEGMENTS = 96

function createLine(points: Vector3[], color: string, opacity = 0.48) {
  const geometry = new BufferGeometry().setFromPoints(points)
  const material = new LineBasicMaterial({
    color,
    transparent: true,
    opacity,
  })

  return new Line(geometry, material)
}

function createAxisLines() {
  const group = new Group()

  group.add(
    createLine(
      [new Vector3(-AXIS_LENGTH, 0, 0), new Vector3(AXIS_LENGTH, 0, 0)],
      "#ef4444",
      0.64
    )
  )
  group.add(
    createLine(
      [new Vector3(0, -AXIS_LENGTH, 0), new Vector3(0, AXIS_LENGTH, 0)],
      "#22c55e",
      0.64
    )
  )
  group.add(
    createLine(
      [new Vector3(0, 0, -AXIS_LENGTH), new Vector3(0, 0, AXIS_LENGTH)],
      "#3b82f6",
      0.64
    )
  )

  return group
}

function createCubeFrame() {
  const geometry = new BoxGeometry(2, 2, 2)
  const edges = new EdgesGeometry(geometry)
  const material = new LineBasicMaterial({
    color: FRAME_COLOR,
    transparent: true,
    opacity: 0.28,
  })
  const frame = new LineSegments(edges, material)

  geometry.dispose()

  return frame
}

function createRing(y: number, radius: number) {
  const points: Vector3[] = []

  for (let index = 0; index <= RING_SEGMENTS; index += 1) {
    const angle = (index / RING_SEGMENTS) * Math.PI * 2
    points.push(
      new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
    )
  }

  return createLine(points, FRAME_COLOR, 0.22)
}

function createHslFrame() {
  const group = new Group()

  for (const y of FRAME_LEVELS) {
    group.add(createRing(y, 1 - Math.abs(y)))
  }

  group.add(
    createLine(
      [new Vector3(0, -1, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0)],
      FRAME_COLOR,
      0.3
    )
  )
  group.add(
    createLine(
      [new Vector3(0, -1, 0), new Vector3(-1, 0, 0), new Vector3(0, 1, 0)],
      FRAME_COLOR,
      0.3
    )
  )

  return group
}

function createHsvFrame() {
  const group = new Group()

  for (const y of FRAME_LEVELS) {
    group.add(createRing(y, (y + 1) / 2))
  }

  group.add(
    createLine([new Vector3(0, -1, 0), new Vector3(1, 1, 0)], FRAME_COLOR, 0.3)
  )
  group.add(
    createLine([new Vector3(0, -1, 0), new Vector3(-1, 1, 0)], FRAME_COLOR, 0.3)
  )

  return group
}

function createCylinderFrame() {
  const group = new Group()

  for (const y of FRAME_LEVELS) {
    group.add(createRing(y, 1))
  }

  group.add(
    createLine([new Vector3(1, -1, 0), new Vector3(1, 1, 0)], FRAME_COLOR, 0.3)
  )
  group.add(
    createLine(
      [new Vector3(-1, -1, 0), new Vector3(-1, 1, 0)],
      FRAME_COLOR,
      0.3
    )
  )
  group.add(
    createLine([new Vector3(0, -1, 1), new Vector3(0, 1, 1)], FRAME_COLOR, 0.3)
  )
  group.add(
    createLine(
      [new Vector3(0, -1, -1), new Vector3(0, 1, -1)],
      FRAME_COLOR,
      0.3
    )
  )

  return group
}

function assertNeverModel(modelId: never): never {
  throw new RangeError(`Unknown color model: ${modelId}`)
}

export function createModelFrame(modelId: ColorSpaceModelId) {
  const group = createAxisLines()

  switch (modelId) {
    case "rgb":
      group.add(createCubeFrame())
      return group
    case "hsl":
      group.add(createHslFrame())
      return group
    case "hsv":
      group.add(createHsvFrame())
      return group
    case "lch":
    case "oklch":
      group.add(createCylinderFrame())
      return group
    default:
      return assertNeverModel(modelId)
  }
}
