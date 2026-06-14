export type CieXyzSceneTheme = "dark" | "light"

export const CIE_XYZ_SCENE_PALETTE = {
  light: {
    axisOpacity: 0.58,
    frameColor: "#1f2937",
    guideOpacity: 0.24,
    planeColor: "#64748b",
    planeOpacity: 0.08,
    purpleBoundary: "#a855f7",
    spectralLocus: "#111827",
    visibleCone: "#0891b2",
    visibleConeWire: "#0e7490",
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
    visibleCone: "#67e8f9",
    visibleConeWire: "#a5f3fc",
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
    readonly visibleCone: string
    readonly visibleConeWire: string
    readonly whitePoint: string
  }
>
