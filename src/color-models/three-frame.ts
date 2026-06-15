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

export type ColorModelFrameTheme = "light" | "dark"

const AXIS_LENGTH = 1.26
const FRAME_LEVELS = [-1, -0.5, 0, 0.5, 1] as const
const RING_SEGMENTS = 96

const FRAME_PALETTE = {
  light: {
    axisOpacity: 0.64,
    frameColor: "#1f2937",
    frameOpacity: 0.28,
    guideOpacity: 0.3,
    ringOpacity: 0.22,
    xAxisColor: "#ef4444",
    yAxisColor: "#22c55e",
    zAxisColor: "#3b82f6",
  },
  dark: {
    axisOpacity: 0.84,
    frameColor: "#d1d5db",
    frameOpacity: 0.46,
    guideOpacity: 0.5,
    ringOpacity: 0.4,
    xAxisColor: "#fb7185",
    yAxisColor: "#4ade80",
    zAxisColor: "#60a5fa",
  },
} as const satisfies Record<
  ColorModelFrameTheme,
  {
    readonly axisOpacity: number
    readonly frameColor: string
    readonly frameOpacity: number
    readonly guideOpacity: number
    readonly ringOpacity: number
    readonly xAxisColor: string
    readonly yAxisColor: string
    readonly zAxisColor: string
  }
>

function createLine(points: Vector3[], color: string, opacity = 0.48) {
  const geometry = new BufferGeometry().setFromPoints(points)
  const material = new LineBasicMaterial({
    color,
    transparent: true,
    opacity,
  })

  return new Line(geometry, material)
}

function createAxisLines(theme: ColorModelFrameTheme) {
  const palette = FRAME_PALETTE[theme]
  const group = new Group()

  group.add(
    createLine(
      [new Vector3(-AXIS_LENGTH, 0, 0), new Vector3(AXIS_LENGTH, 0, 0)],
      palette.xAxisColor,
      palette.axisOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(0, -AXIS_LENGTH, 0), new Vector3(0, AXIS_LENGTH, 0)],
      palette.yAxisColor,
      palette.axisOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(0, 0, -AXIS_LENGTH), new Vector3(0, 0, AXIS_LENGTH)],
      palette.zAxisColor,
      palette.axisOpacity
    )
  )

  return group
}

function createCubeFrame(theme: ColorModelFrameTheme) {
  const palette = FRAME_PALETTE[theme]
  const geometry = new BoxGeometry(2, 2, 2)
  const edges = new EdgesGeometry(geometry)
  const material = new LineBasicMaterial({
    color: palette.frameColor,
    transparent: true,
    opacity: palette.frameOpacity,
  })
  const frame = new LineSegments(edges, material)

  geometry.dispose()

  return frame
}

function createRing(y: number, radius: number, theme: ColorModelFrameTheme) {
  const points: Vector3[] = []
  const palette = FRAME_PALETTE[theme]

  for (let index = 0; index <= RING_SEGMENTS; index += 1) {
    const angle = (index / RING_SEGMENTS) * Math.PI * 2
    points.push(
      new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
    )
  }

  return createLine(points, palette.frameColor, palette.ringOpacity)
}

function createHslFrame(theme: ColorModelFrameTheme) {
  const palette = FRAME_PALETTE[theme]
  const group = new Group()

  for (const y of FRAME_LEVELS) {
    group.add(createRing(y, 1 - Math.abs(y), theme))
  }

  group.add(
    createLine(
      [new Vector3(0, -1, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0)],
      palette.frameColor,
      palette.guideOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(0, -1, 0), new Vector3(-1, 0, 0), new Vector3(0, 1, 0)],
      palette.frameColor,
      palette.guideOpacity
    )
  )

  return group
}

function createHsvFrame(theme: ColorModelFrameTheme) {
  const palette = FRAME_PALETTE[theme]
  const group = new Group()

  for (const y of FRAME_LEVELS) {
    group.add(createRing(y, (y + 1) / 2, theme))
  }

  group.add(
    createLine(
      [new Vector3(0, -1, 0), new Vector3(1, 1, 0)],
      palette.frameColor,
      palette.guideOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(0, -1, 0), new Vector3(-1, 1, 0)],
      palette.frameColor,
      palette.guideOpacity
    )
  )

  return group
}

function createCylinderFrame(theme: ColorModelFrameTheme) {
  const palette = FRAME_PALETTE[theme]
  const group = new Group()

  for (const y of FRAME_LEVELS) {
    group.add(createRing(y, 1, theme))
  }

  group.add(
    createLine(
      [new Vector3(1, -1, 0), new Vector3(1, 1, 0)],
      palette.frameColor,
      palette.guideOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(-1, -1, 0), new Vector3(-1, 1, 0)],
      palette.frameColor,
      palette.guideOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(0, -1, 1), new Vector3(0, 1, 1)],
      palette.frameColor,
      palette.guideOpacity
    )
  )
  group.add(
    createLine(
      [new Vector3(0, -1, -1), new Vector3(0, 1, -1)],
      palette.frameColor,
      palette.guideOpacity
    )
  )

  return group
}

function assertNeverModel(modelId: never): never {
  throw new RangeError(`Unknown color model: ${modelId}`)
}

export function createModelFrame(
  modelId: ColorSpaceModelId,
  theme: ColorModelFrameTheme = "light"
) {
  const group = createAxisLines(theme)

  switch (modelId) {
    case "rgb":
    case "hsl-cube":
    case "hsv-cube":
    case "hwb-cube":
    case "lch-cube":
    case "oklch-cube":
      group.add(createCubeFrame(theme))
      return group
    case "hsl":
    case "hwb":
      group.add(createHslFrame(theme))
      return group
    case "hsv":
      group.add(createHsvFrame(theme))
      return group
    case "xyz":
    case "xyy":
      group.add(createCubeFrame(theme))
      return group
    case "lab":
    case "oklab":
      group.add(createCubeFrame(theme))
      return group
    case "lch":
    case "oklch":
      group.add(createCylinderFrame(theme))
      return group
    default:
      return assertNeverModel(modelId)
  }
}
