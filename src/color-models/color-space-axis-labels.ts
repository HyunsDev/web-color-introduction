import type { ColorSpaceModelId } from "@/color-models/color-space-models"
import type { Vector3Point } from "@/color-models/color-space-samples"

export type ColorSpaceAxisLabelKind = "axis" | "tick"

export type ColorSpaceAxisLabel = {
  readonly color: string
  readonly kind: ColorSpaceAxisLabelKind
  readonly position: Vector3Point
  readonly text: string
}

const AXIS_OFFSET = 1.24
const TICK_OFFSET = 1.08
const HUE_OFFSET = 1.12

const RED_AXIS = "#ef4444"
const GREEN_AXIS = "#22c55e"
const BLUE_AXIS = "#3b82f6"
const HUE_AXIS = "#f59e0b"
const RADIUS_AXIS = "#06b6d4"
const HEIGHT_AXIS = "#94a3b8"
const WHITE_AXIS = "#64748b"
const BLACK_AXIS = "#0f172a"
const LAB_A_AXIS = "#db2777"
const LAB_B_AXIS = "#eab308"
const CHROMA_AXIS = "#10b981"
const OKLAB_A_AXIS = "#0f766e"
const OKLAB_B_AXIS = "#8b5cf6"
const OK_CHROMA_AXIS = "#e11d48"

const RGB_AXIS_LABELS = [
  axis("R", RED_AXIS, AXIS_OFFSET, 0.12, 0),
  axis("G", GREEN_AXIS, 0, AXIS_OFFSET, 0),
  axis("B", BLUE_AXIS, 0, 0.12, AXIS_OFFSET),
  tick("R 0", RED_AXIS, -TICK_OFFSET, -0.1, 0),
  tick("R 1", RED_AXIS, TICK_OFFSET, -0.1, 0),
  tick("G 0", GREEN_AXIS, 0.1, -TICK_OFFSET, 0),
  tick("G 1", GREEN_AXIS, 0.1, TICK_OFFSET, 0),
  tick("B 0", BLUE_AXIS, 0, -0.1, -TICK_OFFSET),
  tick("B 1", BLUE_AXIS, 0, -0.1, TICK_OFFSET),
] as const satisfies readonly ColorSpaceAxisLabel[]

const HSL_AXIS_LABELS = [
  axis("Hue", HUE_AXIS, AXIS_OFFSET, 0.18, 0),
  axis("Sat", RADIUS_AXIS, 0.72, 0, 0.72),
  axis("Light", HEIGHT_AXIS, 0.12, AXIS_OFFSET, 0),
  tick("H 0deg", HUE_AXIS, HUE_OFFSET, -0.16, 0),
  tick("H 90deg", HUE_AXIS, 0, -0.16, HUE_OFFSET),
  tick("H 180deg", HUE_AXIS, -HUE_OFFSET, -0.16, 0),
  tick("H 270deg", HUE_AXIS, 0, -0.16, -HUE_OFFSET),
  tick("S 0", RADIUS_AXIS, 0, 0, 0),
  tick("S 1", RADIUS_AXIS, TICK_OFFSET, 0.12, 0),
  tick("L 0", HEIGHT_AXIS, 0, -TICK_OFFSET, 0),
  tick("L 1", HEIGHT_AXIS, 0, TICK_OFFSET, 0),
] as const satisfies readonly ColorSpaceAxisLabel[]

const HSV_AXIS_LABELS = [
  axis("Hue", HUE_AXIS, AXIS_OFFSET, 1.12, 0),
  axis("Sat", "#a855f7", 0.72, 1, 0.72),
  axis("Value", HEIGHT_AXIS, 0.12, AXIS_OFFSET, 0),
  tick("H 0deg", HUE_AXIS, HUE_OFFSET, 0.86, 0),
  tick("H 90deg", HUE_AXIS, 0, 0.86, HUE_OFFSET),
  tick("H 180deg", HUE_AXIS, -HUE_OFFSET, 0.86, 0),
  tick("H 270deg", HUE_AXIS, 0, 0.86, -HUE_OFFSET),
  tick("S 0", "#a855f7", 0, 0, 0),
  tick("S 1", "#a855f7", TICK_OFFSET, 1, 0),
  tick("V 0", HEIGHT_AXIS, 0, -TICK_OFFSET, 0),
  tick("V 1", HEIGHT_AXIS, 0, TICK_OFFSET, 0),
] as const satisfies readonly ColorSpaceAxisLabel[]

const HWB_AXIS_LABELS = [
  axis("Hue", HUE_AXIS, AXIS_OFFSET, 0.18, 0),
  axis("White", WHITE_AXIS, 0.12, AXIS_OFFSET, 0),
  axis("Black", BLACK_AXIS, 0.12, -AXIS_OFFSET, 0),
  tick("H 0deg", HUE_AXIS, HUE_OFFSET, -0.16, 0),
  tick("H 90deg", HUE_AXIS, 0, -0.16, HUE_OFFSET),
  tick("H 180deg", HUE_AXIS, -HUE_OFFSET, -0.16, 0),
  tick("H 270deg", HUE_AXIS, 0, -0.16, -HUE_OFFSET),
  tick("W 0", WHITE_AXIS, TICK_OFFSET, 0.1, 0),
  tick("W 1", WHITE_AXIS, 0, TICK_OFFSET, 0),
  tick("B 0", BLACK_AXIS, -TICK_OFFSET, -0.1, 0),
  tick("B 1", BLACK_AXIS, 0, -TICK_OFFSET, 0),
] as const satisfies readonly ColorSpaceAxisLabel[]

const XYZ_AXIS_LABELS = [
  axis("X", RED_AXIS, AXIS_OFFSET, 0.12, 0),
  axis("Y", GREEN_AXIS, 0.12, AXIS_OFFSET, 0),
  axis("Z", BLUE_AXIS, 0, 0.12, AXIS_OFFSET),
  tick("X 0", RED_AXIS, -TICK_OFFSET, -0.1, 0),
  tick("X D65", RED_AXIS, TICK_OFFSET, -0.1, 0),
  tick("Y 0", GREEN_AXIS, 0.1, -TICK_OFFSET, 0),
  tick("Y 1", GREEN_AXIS, 0.1, TICK_OFFSET, 0),
  tick("Z 0", BLUE_AXIS, 0, -0.1, -TICK_OFFSET),
  tick("Z D65", BLUE_AXIS, 0, -0.1, TICK_OFFSET),
] as const satisfies readonly ColorSpaceAxisLabel[]

const XYY_AXIS_LABELS = [
  axis("x", "#0ea5e9", AXIS_OFFSET, 0.12, 0),
  axis("Y", GREEN_AXIS, 0.12, AXIS_OFFSET, 0),
  axis("y", "#6366f1", 0, 0.12, AXIS_OFFSET),
  tick("x 0", "#0ea5e9", -TICK_OFFSET, -0.1, 0),
  tick("x .8", "#0ea5e9", TICK_OFFSET, -0.1, 0),
  tick("Y 0", GREEN_AXIS, 0.1, -TICK_OFFSET, 0),
  tick("Y 1", GREEN_AXIS, 0.1, TICK_OFFSET, 0),
  tick("y 0", "#6366f1", 0, -0.1, -TICK_OFFSET),
  tick("y .9", "#6366f1", 0, -0.1, TICK_OFFSET),
] as const satisfies readonly ColorSpaceAxisLabel[]

const LAB_AXIS_LABELS = [
  axis("a", LAB_A_AXIS, AXIS_OFFSET, 0.12, 0),
  axis("Light", HEIGHT_AXIS, 0.12, AXIS_OFFSET, 0),
  axis("b", LAB_B_AXIS, 0, 0.12, AXIS_OFFSET),
  tick("a -144", LAB_A_AXIS, -TICK_OFFSET, -0.1, 0),
  tick("a 144", LAB_A_AXIS, TICK_OFFSET, -0.1, 0),
  tick("L 0", HEIGHT_AXIS, 0.1, -TICK_OFFSET, 0),
  tick("L 100", HEIGHT_AXIS, 0.1, TICK_OFFSET, 0),
  tick("b -144", LAB_B_AXIS, 0, -0.1, -TICK_OFFSET),
  tick("b 144", LAB_B_AXIS, 0, -0.1, TICK_OFFSET),
] as const satisfies readonly ColorSpaceAxisLabel[]

const LCH_AXIS_LABELS = [
  axis("Hue", HUE_AXIS, AXIS_OFFSET, 0.18, 0),
  axis("Chroma", CHROMA_AXIS, AXIS_OFFSET, -0.12, 0),
  axis("Light", HEIGHT_AXIS, 0.12, AXIS_OFFSET, 0),
  tick("H 0deg", HUE_AXIS, HUE_OFFSET, -0.22, 0),
  tick("H 90deg", HUE_AXIS, 0, -0.16, HUE_OFFSET),
  tick("H 180deg", HUE_AXIS, -HUE_OFFSET, -0.16, 0),
  tick("H 270deg", HUE_AXIS, 0, -0.16, -HUE_OFFSET),
  tick("C 0", CHROMA_AXIS, 0, 0, 0),
  tick("C 144", CHROMA_AXIS, TICK_OFFSET, 0, 0),
  tick("L 0", HEIGHT_AXIS, 0, -TICK_OFFSET, 0),
  tick("L 100", HEIGHT_AXIS, 0, TICK_OFFSET, 0),
] as const satisfies readonly ColorSpaceAxisLabel[]

const OKLAB_AXIS_LABELS = [
  axis("a", OKLAB_A_AXIS, AXIS_OFFSET, 0.12, 0),
  axis("OKL", HEIGHT_AXIS, 0.12, AXIS_OFFSET, 0),
  axis("b", OKLAB_B_AXIS, 0, 0.12, AXIS_OFFSET),
  tick("a -.315", OKLAB_A_AXIS, -TICK_OFFSET, -0.1, 0),
  tick("a .315", OKLAB_A_AXIS, TICK_OFFSET, -0.1, 0),
  tick("OKL 0", HEIGHT_AXIS, 0.1, -TICK_OFFSET, 0),
  tick("OKL 1", HEIGHT_AXIS, 0.1, TICK_OFFSET, 0),
  tick("b -.315", OKLAB_B_AXIS, 0, -0.1, -TICK_OFFSET),
  tick("b .315", OKLAB_B_AXIS, 0, -0.1, TICK_OFFSET),
] as const satisfies readonly ColorSpaceAxisLabel[]

const OKLCH_AXIS_LABELS = [
  axis("Hue", HUE_AXIS, AXIS_OFFSET, 0.18, 0),
  axis("Chroma", OK_CHROMA_AXIS, AXIS_OFFSET, -0.12, 0),
  axis("OKL", HEIGHT_AXIS, 0.12, AXIS_OFFSET, 0),
  tick("H 0deg", HUE_AXIS, HUE_OFFSET, -0.22, 0),
  tick("H 90deg", HUE_AXIS, 0, -0.16, HUE_OFFSET),
  tick("H 180deg", HUE_AXIS, -HUE_OFFSET, -0.16, 0),
  tick("H 270deg", HUE_AXIS, 0, -0.16, -HUE_OFFSET),
  tick("C 0", OK_CHROMA_AXIS, 0, 0, 0),
  tick("C .315", OK_CHROMA_AXIS, TICK_OFFSET, 0, 0),
  tick("OKL 0", HEIGHT_AXIS, 0, -TICK_OFFSET, 0),
  tick("OKL 1", HEIGHT_AXIS, 0, TICK_OFFSET, 0),
] as const satisfies readonly ColorSpaceAxisLabel[]

function createHueCubeAxisLabels({
  depthAxisColor,
  depthLabel,
  depthMaxLabel,
  heightAxisColor = HEIGHT_AXIS,
  heightLabel,
  heightMaxLabel,
}: {
  readonly depthAxisColor: string
  readonly depthLabel: string
  readonly depthMaxLabel: string
  readonly heightAxisColor?: string
  readonly heightLabel: string
  readonly heightMaxLabel: string
}) {
  return [
    axis("Hue", HUE_AXIS, AXIS_OFFSET, 0.12, 0),
    axis(heightLabel, heightAxisColor, 0.12, AXIS_OFFSET, 0),
    axis(depthLabel, depthAxisColor, 0, 0.12, AXIS_OFFSET),
    tick("H 0deg", HUE_AXIS, -TICK_OFFSET, -0.1, 0),
    tick("H 360deg", HUE_AXIS, TICK_OFFSET, -0.1, 0),
    tick(`${heightLabel} 0`, heightAxisColor, 0.1, -TICK_OFFSET, 0),
    tick(heightMaxLabel, heightAxisColor, 0.1, TICK_OFFSET, 0),
    tick(`${depthLabel} 0`, depthAxisColor, 0, -0.1, -TICK_OFFSET),
    tick(depthMaxLabel, depthAxisColor, 0, -0.1, TICK_OFFSET),
  ] satisfies readonly ColorSpaceAxisLabel[]
}

const HSL_CUBE_AXIS_LABELS = createHueCubeAxisLabels({
  depthAxisColor: RADIUS_AXIS,
  depthLabel: "Sat",
  depthMaxLabel: "Sat 1",
  heightLabel: "Light",
  heightMaxLabel: "Light 1",
})

const HSV_CUBE_AXIS_LABELS = createHueCubeAxisLabels({
  depthAxisColor: "#a855f7",
  depthLabel: "Sat",
  depthMaxLabel: "Sat 1",
  heightLabel: "Value",
  heightMaxLabel: "Value 1",
})

const HWB_CUBE_AXIS_LABELS = createHueCubeAxisLabels({
  depthAxisColor: BLACK_AXIS,
  depthLabel: "Black",
  depthMaxLabel: "Black 1",
  heightAxisColor: WHITE_AXIS,
  heightLabel: "White",
  heightMaxLabel: "White 1",
})

const LCH_CUBE_AXIS_LABELS = createHueCubeAxisLabels({
  depthAxisColor: CHROMA_AXIS,
  depthLabel: "Chroma",
  depthMaxLabel: "C 144",
  heightLabel: "Light",
  heightMaxLabel: "L 100",
})

const OKLCH_CUBE_AXIS_LABELS = createHueCubeAxisLabels({
  depthAxisColor: OK_CHROMA_AXIS,
  depthLabel: "Chroma",
  depthMaxLabel: "C .315",
  heightLabel: "OKL",
  heightMaxLabel: "OKL 1",
})

export function getColorSpaceAxisLabels(modelId: ColorSpaceModelId) {
  switch (modelId) {
    case "rgb":
      return RGB_AXIS_LABELS
    case "hsl":
      return HSL_AXIS_LABELS
    case "hsl-cube":
      return HSL_CUBE_AXIS_LABELS
    case "hsv":
      return HSV_AXIS_LABELS
    case "hsv-cube":
      return HSV_CUBE_AXIS_LABELS
    case "hwb":
      return HWB_AXIS_LABELS
    case "hwb-cube":
      return HWB_CUBE_AXIS_LABELS
    case "xyz":
      return XYZ_AXIS_LABELS
    case "xyy":
      return XYY_AXIS_LABELS
    case "lab":
      return LAB_AXIS_LABELS
    case "lch":
      return LCH_AXIS_LABELS
    case "lch-cube":
      return LCH_CUBE_AXIS_LABELS
    case "oklab":
      return OKLAB_AXIS_LABELS
    case "oklch":
      return OKLCH_AXIS_LABELS
    case "oklch-cube":
      return OKLCH_CUBE_AXIS_LABELS
    default:
      return assertNeverModel(modelId)
  }
}

function axis(
  text: string,
  color: string,
  x: number,
  y: number,
  z: number
): ColorSpaceAxisLabel {
  return label("axis", text, color, x, y, z)
}

function tick(
  text: string,
  color: string,
  x: number,
  y: number,
  z: number
): ColorSpaceAxisLabel {
  return label("tick", text, color, x, y, z)
}

function label(
  kind: ColorSpaceAxisLabelKind,
  text: string,
  color: string,
  x: number,
  y: number,
  z: number
): ColorSpaceAxisLabel {
  return {
    color,
    kind,
    position: { x, y, z },
    text,
  }
}

function assertNeverModel(modelId: never): never {
  throw new RangeError(`Unknown color model: ${modelId}`)
}
