export type ColorSpaceModelId =
  | "rgb"
  | "hsl"
  | "hsv"
  | "xyz"
  | "lab"
  | "lch"
  | "oklab"
  | "oklch"

export type ColorSpaceAxis = {
  readonly label: string
  readonly value: string
  readonly color: string
}

export type ColorSpaceModelDefinition = {
  readonly id: ColorSpaceModelId
  readonly name: string
  readonly title: string
  readonly geometry: string
  readonly coordinate: string
  readonly notation: string
  readonly summary: string
  readonly pointSize: number
  readonly accent: string
  readonly axes: readonly ColorSpaceAxis[]
  readonly notes: readonly string[]
}

export const COLOR_SPACE_MODEL_BY_ID = {
  rgb: {
    id: "rgb",
    name: "RGB",
    title: "RGB Cube",
    geometry: "Cartesian cube",
    coordinate: "R, G, B",
    notation: "rgb(255 96 64)",
    summary:
      "세 채널이 각각 직교축을 만들며, 웹 화면의 최종 픽셀에 가장 가까운 좌표계입니다.",
    pointSize: 0.055,
    accent: "#f97316",
    axes: [
      { label: "X", value: "Red", color: "#ef4444" },
      { label: "Y", value: "Green", color: "#22c55e" },
      { label: "Z", value: "Blue", color: "#3b82f6" },
    ],
    notes: [
      "검정은 원점, 흰색은 대각선 반대 꼭짓점에 놓입니다.",
      "보간은 빠르지만 밝기와 채도 감각이 균일하지 않습니다.",
    ],
  },
  hsl: {
    id: "hsl",
    name: "HSL",
    title: "HSL Double Cone",
    geometry: "Hue ring + saturation radius + lightness height",
    coordinate: "H, S, L",
    notation: "hsl(24 90% 58%)",
    summary:
      "색상환을 중심으로 채도는 반지름, 명도는 높이로 배치해 UI 색 조절에 익숙한 형태를 만듭니다.",
    pointSize: 0.04,
    accent: "#06b6d4",
    axes: [
      { label: "Angle", value: "Hue", color: "#f59e0b" },
      { label: "Radius", value: "Saturation", color: "#06b6d4" },
      { label: "Height", value: "Lightness", color: "#64748b" },
    ],
    notes: [
      "검정과 흰색으로 갈수록 채도 반지름이 시각적으로 접힙니다.",
      "디자인 툴에서 직관적이지만 지각 균일성은 약합니다.",
    ],
  },
  hsv: {
    id: "hsv",
    name: "HSV",
    title: "HSV Cone",
    geometry: "Hue ring + saturation radius + value height",
    coordinate: "H, S, V",
    notation: "hsv(24 90% 100%)",
    summary:
      "밝기 값을 위쪽 축으로 세워 컬러 피커의 색상 선택 평면과 잘 맞는 원뿔 구조를 만듭니다.",
    pointSize: 0.042,
    accent: "#a855f7",
    axes: [
      { label: "Angle", value: "Hue", color: "#f59e0b" },
      { label: "Radius", value: "Saturation", color: "#a855f7" },
      { label: "Height", value: "Value", color: "#64748b" },
    ],
    notes: [
      "아래 꼭짓점은 검정이고, 위쪽 원판에서 가장 선명한 색이 펼쳐집니다.",
      "색 선택에는 편하지만 같은 거리 변화가 같은 시각 변화는 아닙니다.",
    ],
  },
  xyz: {
    id: "xyz",
    name: "XYZ",
    title: "CIE XYZ Tristimulus Volume",
    geometry: "D65 tristimulus coordinates",
    coordinate: "X, Y, Z",
    notation: "color(xyz-d65 0.42 0.21 0.02)",
    summary:
      "기기 색역을 CIE D65 기준의 X, Y, Z 자극값으로 옮겨, RGB 큐브가 장치 독립 좌표에서 어떻게 기울어지는지 봅니다.",
    pointSize: 0.04,
    accent: "#2563eb",
    axes: [
      { label: "X", value: "Red-weighted tristimulus", color: "#ef4444" },
      { label: "Y", value: "Luminance", color: "#22c55e" },
      { label: "Z", value: "Blue-weighted tristimulus", color: "#3b82f6" },
    ],
    notes: [
      "Y 축은 상대 휘도에 대응해 색의 밝기 기여를 가장 직접적으로 보여줍니다.",
      "같은 RGB 색역도 XYZ로 옮기면 원색 좌표와 백색점 때문에 비스듬한 입체가 됩니다.",
    ],
  },
  lab: {
    id: "lab",
    name: "Lab",
    title: "CIE Lab Cartesian Volume",
    geometry: "Lightness height + a/b opponent axes",
    coordinate: "L, a, b",
    notation: "lab(62% 42 58)",
    summary:
      "밝기 L과 빨강-초록 a, 노랑-파랑 b 축으로 색을 놓아 지각 차이를 RGB보다 직접적으로 봅니다.",
    pointSize: 0.04,
    accent: "#db2777",
    axes: [
      { label: "X", value: "a red-green", color: "#db2777" },
      { label: "Y", value: "Lightness", color: "#64748b" },
      { label: "Z", value: "b yellow-blue", color: "#eab308" },
    ],
    notes: [
      "a/b 평면의 격자를 실제 표시 가능한 색만 남기면 불규칙한 지각 색역이 보입니다.",
      "CSS 색 표기와 색차 계산의 역사적 기준을 이해하기 좋은 좌표계입니다.",
    ],
  },
  lch: {
    id: "lch",
    name: "LCH",
    title: "CIE LCH Cylinder",
    geometry: "Lightness height + chroma radius + hue angle",
    coordinate: "L, C, H",
    notation: "lch(62% 74 32)",
    summary:
      "Lab을 극좌표로 바꾼 모델로, 밝기와 채도를 RGB보다 사람의 지각에 가깝게 분리합니다.",
    pointSize: 0.038,
    accent: "#10b981",
    axes: [
      { label: "Angle", value: "Hue", color: "#f59e0b" },
      { label: "Radius", value: "Chroma", color: "#10b981" },
      { label: "Height", value: "Lightness", color: "#64748b" },
    ],
    notes: [
      "sRGB에서 표현할 수 없는 바깥쪽 좌표는 모델에서 제외했습니다.",
      "명도 중심 설계와 팔레트 단계화에 강한 좌표계입니다.",
    ],
  },
  oklab: {
    id: "oklab",
    name: "OKLab",
    title: "OKLab Cartesian Volume",
    geometry: "OK lightness height + a/b opponent axes",
    coordinate: "OKL, a, b",
    notation: "oklab(70% 0.12 0.14)",
    summary:
      "OKL 밝기와 a/b 상대색 축으로 최신 CSS 색 설계에서 더 균일한 거리감을 보여줍니다.",
    pointSize: 0.042,
    accent: "#0f766e",
    axes: [
      { label: "X", value: "a green-red", color: "#0f766e" },
      { label: "Y", value: "OK lightness", color: "#64748b" },
      { label: "Z", value: "b blue-yellow", color: "#8b5cf6" },
    ],
    notes: [
      "OKL이 같을 때 a/b 좌표 변화가 색상과 채도 변화를 더 안정적으로 드러냅니다.",
      "OKLCH는 이 a/b 평면을 chroma와 hue로 다시 읽은 극좌표 표현입니다.",
    ],
  },
  oklch: {
    id: "oklch",
    name: "OKLCH",
    title: "OKLCH Perceptual Shell",
    geometry: "OK lightness height + chroma radius + hue angle",
    coordinate: "OKL, C, H",
    notation: "oklch(70% 0.18 32)",
    summary:
      "OKLab 기반 극좌표계로, 최신 CSS 색 설계에서 밝기와 채도 변화를 더 안정적으로 다룹니다.",
    pointSize: 0.04,
    accent: "#e11d48",
    axes: [
      { label: "Angle", value: "Hue", color: "#f59e0b" },
      { label: "Radius", value: "Chroma", color: "#e11d48" },
      { label: "Height", value: "Lightness", color: "#64748b" },
    ],
    notes: [
      "CSS `oklch()` 토큰은 다크 모드와 상태 색의 단계감을 잡기 좋습니다.",
      "색역 밖 좌표를 제거하면 실제 웹 표시 가능 영역의 껍질이 드러납니다.",
    ],
  },
} satisfies Record<ColorSpaceModelId, ColorSpaceModelDefinition>

export const COLOR_SPACE_MODELS = [
  COLOR_SPACE_MODEL_BY_ID.rgb,
  COLOR_SPACE_MODEL_BY_ID.hsl,
  COLOR_SPACE_MODEL_BY_ID.hsv,
  COLOR_SPACE_MODEL_BY_ID.xyz,
  COLOR_SPACE_MODEL_BY_ID.lab,
  COLOR_SPACE_MODEL_BY_ID.lch,
  COLOR_SPACE_MODEL_BY_ID.oklab,
  COLOR_SPACE_MODEL_BY_ID.oklch,
] as const
