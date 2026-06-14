export const COLOR_GAMUT_MODE_IDS = [
  "srgb",
  "display-p3",
  "bt2020",
] as const

export const COLOR_OUTPUT_GAMUT_IDS = ["srgb", "display-p3"] as const

export type ColorGamutModeId = (typeof COLOR_GAMUT_MODE_IDS)[number]
export type ColorOutputGamutId = (typeof COLOR_OUTPUT_GAMUT_IDS)[number]
export type CuloriSampleGamut = "rgb" | "p3" | "rec2020"
export type CuloriOutputGamut = "rgb" | "p3"
export type ColorGamutRenderStatus = "actual" | "simulated"

export type ColorGamutModeDefinition = {
  readonly id: ColorGamutModeId
  readonly label: string
  readonly shortLabel: string
  readonly description: string
  readonly sampleGamut: CuloriSampleGamut | null
}

export type ColorOutputGamutDefinition = {
  readonly id: ColorOutputGamutId
  readonly label: string
  readonly culoriMode: CuloriOutputGamut
}

export type ColorGamutCapabilities = {
  readonly displayP3: boolean
  readonly rec2020: boolean
  readonly webGlDisplayP3: boolean
}

export type ColorGamutRendering = {
  readonly mode: ColorGamutModeDefinition
  readonly status: ColorGamutRenderStatus
  readonly actualOutput: ColorOutputGamutDefinition
}

export const DEFAULT_GAMUT_CAPABILITIES = {
  displayP3: false,
  rec2020: false,
  webGlDisplayP3: false,
} satisfies ColorGamutCapabilities

export const COLOR_OUTPUT_GAMUT_BY_ID = {
  srgb: {
    id: "srgb",
    label: "sRGB",
    culoriMode: "rgb",
  },
  "display-p3": {
    id: "display-p3",
    label: "Display P3",
    culoriMode: "p3",
  },
} satisfies Record<ColorOutputGamutId, ColorOutputGamutDefinition>

export const COLOR_GAMUT_MODE_BY_ID = {
  srgb: {
    id: "srgb",
    label: "sRGB",
    shortLabel: "sRGB",
    description: "표준 웹 색역입니다. 모든 브라우저와 디스플레이의 기본 기준입니다.",
    sampleGamut: "rgb",
  },
  "display-p3": {
    id: "display-p3",
    label: "Display P3",
    shortLabel: "P3",
    description: "sRGB보다 넓은 현대 디스플레이 색역입니다.",
    sampleGamut: "p3",
  },
  bt2020: {
    id: "bt2020",
    label: "BT.2020",
    shortLabel: "BT.2020",
    description: "영상 표준에서 쓰는 매우 넓은 색역입니다. 현재 웹 출력은 보통 시뮬레이션됩니다.",
    sampleGamut: "rec2020",
  },
} satisfies Record<ColorGamutModeId, ColorGamutModeDefinition>

export const COLOR_GAMUT_MODES = [
  COLOR_GAMUT_MODE_BY_ID.srgb,
  COLOR_GAMUT_MODE_BY_ID["display-p3"],
  COLOR_GAMUT_MODE_BY_ID.bt2020,
] as const

function canUseDisplayP3DrawingBuffer() {
  if (typeof document === "undefined") {
    return false
  }

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl")

  if (!context) {
    return false
  }

  const previousColorSpace = context.drawingBufferColorSpace
  context.drawingBufferColorSpace = "display-p3"
  const isSupported = context.drawingBufferColorSpace === "display-p3"
  context.drawingBufferColorSpace = previousColorSpace

  return isSupported
}

function matchesColorGamut(query: string) {
  return typeof window !== "undefined" && window.matchMedia(query).matches
}

export function detectColorGamutCapabilities(): ColorGamutCapabilities {
  if (typeof window === "undefined") {
    return DEFAULT_GAMUT_CAPABILITIES
  }

  return {
    displayP3: matchesColorGamut("(color-gamut: p3)"),
    rec2020: matchesColorGamut("(color-gamut: rec2020)"),
    webGlDisplayP3: canUseDisplayP3DrawingBuffer(),
  }
}

function getBestOutputGamut(capabilities: ColorGamutCapabilities) {
  return capabilities.displayP3 && capabilities.webGlDisplayP3
    ? COLOR_OUTPUT_GAMUT_BY_ID["display-p3"]
    : COLOR_OUTPUT_GAMUT_BY_ID.srgb
}

export function resolveColorGamutRendering(
  modeId: ColorGamutModeId,
  capabilities: ColorGamutCapabilities
): ColorGamutRendering {
  const mode = COLOR_GAMUT_MODE_BY_ID[modeId]
  const bestOutput = getBestOutputGamut(capabilities)

  switch (modeId) {
    case "srgb":
      return {
        mode,
        status: "actual",
        actualOutput: COLOR_OUTPUT_GAMUT_BY_ID.srgb,
      }
    case "display-p3":
      return {
        mode,
        status: bestOutput.id === "display-p3" ? "actual" : "simulated",
        actualOutput: bestOutput,
      }
    case "bt2020":
      return {
        mode,
        status: "simulated",
        actualOutput: bestOutput,
      }
    default:
      return assertNeverGamutMode(modeId)
  }
}

export function getColorGamutStatusLabel(status: ColorGamutRenderStatus) {
  switch (status) {
    case "actual":
      return "Actual"
    case "simulated":
      return "Simulated"
    default:
      return assertNeverRenderStatus(status)
  }
}

export function getColorGamutRenderLabel(rendering: ColorGamutRendering) {
  switch (rendering.status) {
    case "actual":
      return `${rendering.mode.label} · actual`
    case "simulated":
      return `${rendering.mode.label} · simulated via ${rendering.actualOutput.label}`
    default:
      return assertNeverRenderStatus(rendering.status)
  }
}

function assertNeverGamutMode(modeId: never): never {
  throw new RangeError(`Unknown color gamut mode: ${modeId}`)
}

function assertNeverRenderStatus(status: never): never {
  throw new RangeError(`Unknown color gamut render status: ${status}`)
}
