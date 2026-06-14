export const CIE_XYZ_GAMUT_IDS = ["srgb", "display-p3", "bt2020"] as const

export type CieXyzGamutId = (typeof CIE_XYZ_GAMUT_IDS)[number]

export type CieXyzChromaticity = {
  readonly x: number
  readonly y: number
}

export type CieXyzSpectralCoordinate = CieXyzChromaticity & {
  readonly wavelength: number
}

export type CieXyzPrimaries = {
  readonly blue: CieXyzChromaticity
  readonly green: CieXyzChromaticity
  readonly red: CieXyzChromaticity
  readonly white: CieXyzChromaticity
}

export type CieXyzGamutDefinition = {
  readonly id: CieXyzGamutId
  readonly label: string
  readonly lineColor: string
  readonly primaries: CieXyzPrimaries
  readonly shortLabel: string
  readonly surfaceColor: string
}

export const CIE_D65_WHITE = { x: 0.3127, y: 0.329 } as const

export const CIE_XYZ_GAMUTS = [
  {
    id: "srgb",
    label: "sRGB",
    shortLabel: "sRGB",
    lineColor: "#2563eb",
    surfaceColor: "#3b82f6",
    primaries: {
      red: { x: 0.64, y: 0.33 },
      green: { x: 0.3, y: 0.6 },
      blue: { x: 0.15, y: 0.06 },
      white: CIE_D65_WHITE,
    },
  },
  {
    id: "display-p3",
    label: "Display P3",
    shortLabel: "P3",
    lineColor: "#16a34a",
    surfaceColor: "#22c55e",
    primaries: {
      red: { x: 0.68, y: 0.32 },
      green: { x: 0.265, y: 0.69 },
      blue: { x: 0.15, y: 0.06 },
      white: CIE_D65_WHITE,
    },
  },
  {
    id: "bt2020",
    label: "BT.2020",
    shortLabel: "BT.2020",
    lineColor: "#dc2626",
    surfaceColor: "#ef4444",
    primaries: {
      red: { x: 0.708, y: 0.292 },
      green: { x: 0.17, y: 0.797 },
      blue: { x: 0.131, y: 0.046 },
      white: CIE_D65_WHITE,
    },
  },
] as const satisfies readonly CieXyzGamutDefinition[]

export const CIE_XYZ_SPECTRAL_LOCUS_5NM = [
  { wavelength: 360, x: 0.17556, y: 0.00529 },
  { wavelength: 365, x: 0.17516, y: 0.00526 },
  { wavelength: 370, x: 0.17482, y: 0.00522 },
  { wavelength: 375, x: 0.17451, y: 0.00518 },
  { wavelength: 380, x: 0.17411, y: 0.00496 },
  { wavelength: 385, x: 0.17401, y: 0.00498 },
  { wavelength: 390, x: 0.1738, y: 0.00492 },
  { wavelength: 395, x: 0.17356, y: 0.00492 },
  { wavelength: 400, x: 0.17334, y: 0.0048 },
  { wavelength: 405, x: 0.17302, y: 0.00478 },
  { wavelength: 410, x: 0.17258, y: 0.0048 },
  { wavelength: 415, x: 0.17209, y: 0.00483 },
  { wavelength: 420, x: 0.17141, y: 0.0051 },
  { wavelength: 425, x: 0.1703, y: 0.00579 },
  { wavelength: 430, x: 0.16888, y: 0.0069 },
  { wavelength: 435, x: 0.1669, y: 0.00855 },
  { wavelength: 440, x: 0.16441, y: 0.01086 },
  { wavelength: 445, x: 0.16111, y: 0.01379 },
  { wavelength: 450, x: 0.15664, y: 0.01771 },
  { wavelength: 455, x: 0.15099, y: 0.02274 },
  { wavelength: 460, x: 0.14396, y: 0.0297 },
  { wavelength: 465, x: 0.1355, y: 0.03988 },
  { wavelength: 470, x: 0.12412, y: 0.0578 },
  { wavelength: 475, x: 0.1096, y: 0.08684 },
  { wavelength: 480, x: 0.09129, y: 0.1327 },
  { wavelength: 485, x: 0.06871, y: 0.20072 },
  { wavelength: 490, x: 0.04539, y: 0.29498 },
  { wavelength: 495, x: 0.02346, y: 0.4127 },
  { wavelength: 500, x: 0.00817, y: 0.53842 },
  { wavelength: 505, x: 0.00386, y: 0.65482 },
  { wavelength: 510, x: 0.01387, y: 0.75019 },
  { wavelength: 515, x: 0.03885, y: 0.81202 },
  { wavelength: 520, x: 0.0743, y: 0.8338 },
  { wavelength: 525, x: 0.11416, y: 0.82621 },
  { wavelength: 530, x: 0.15472, y: 0.80586 },
  { wavelength: 535, x: 0.19288, y: 0.78163 },
  { wavelength: 540, x: 0.22962, y: 0.75433 },
  { wavelength: 545, x: 0.26578, y: 0.72432 },
  { wavelength: 550, x: 0.3016, y: 0.69231 },
  { wavelength: 555, x: 0.33736, y: 0.65885 },
  { wavelength: 560, x: 0.3731, y: 0.62445 },
  { wavelength: 565, x: 0.40873, y: 0.58961 },
  { wavelength: 570, x: 0.44406, y: 0.55472 },
  { wavelength: 575, x: 0.47878, y: 0.5202 },
  { wavelength: 580, x: 0.51249, y: 0.48659 },
  { wavelength: 585, x: 0.54479, y: 0.45443 },
  { wavelength: 590, x: 0.57515, y: 0.42423 },
  { wavelength: 595, x: 0.60293, y: 0.3965 },
  { wavelength: 600, x: 0.62704, y: 0.37249 },
  { wavelength: 605, x: 0.64823, y: 0.3514 },
  { wavelength: 610, x: 0.66576, y: 0.33401 },
  { wavelength: 615, x: 0.68008, y: 0.31975 },
  { wavelength: 620, x: 0.69151, y: 0.30834 },
  { wavelength: 625, x: 0.70061, y: 0.2993 },
  { wavelength: 630, x: 0.70792, y: 0.29203 },
  { wavelength: 635, x: 0.71403, y: 0.28593 },
  { wavelength: 640, x: 0.71903, y: 0.28094 },
  { wavelength: 645, x: 0.72303, y: 0.27695 },
  { wavelength: 650, x: 0.72599, y: 0.27401 },
  { wavelength: 655, x: 0.72827, y: 0.27173 },
  { wavelength: 660, x: 0.72997, y: 0.27003 },
  { wavelength: 665, x: 0.73109, y: 0.26891 },
  { wavelength: 670, x: 0.73199, y: 0.26801 },
  { wavelength: 675, x: 0.73272, y: 0.26728 },
  { wavelength: 680, x: 0.73342, y: 0.26658 },
  { wavelength: 685, x: 0.73405, y: 0.26595 },
  { wavelength: 690, x: 0.73439, y: 0.26561 },
  { wavelength: 695, x: 0.73459, y: 0.26541 },
  { wavelength: 700, x: 0.73469, y: 0.26531 },
  { wavelength: 705, x: 0.73469, y: 0.26531 },
  { wavelength: 710, x: 0.73469, y: 0.26531 },
  { wavelength: 715, x: 0.73469, y: 0.26531 },
  { wavelength: 720, x: 0.73469, y: 0.26531 },
  { wavelength: 725, x: 0.73469, y: 0.26531 },
  { wavelength: 730, x: 0.73469, y: 0.26531 },
  { wavelength: 735, x: 0.73469, y: 0.26531 },
  { wavelength: 740, x: 0.73469, y: 0.26531 },
  { wavelength: 745, x: 0.73469, y: 0.26531 },
  { wavelength: 750, x: 0.73469, y: 0.26531 },
  { wavelength: 755, x: 0.73469, y: 0.26531 },
  { wavelength: 760, x: 0.73469, y: 0.26531 },
  { wavelength: 765, x: 0.73469, y: 0.26531 },
  { wavelength: 770, x: 0.73469, y: 0.26531 },
  { wavelength: 775, x: 0.73469, y: 0.26531 },
  { wavelength: 780, x: 0.73469, y: 0.26531 },
  { wavelength: 785, x: 0.73469, y: 0.26531 },
  { wavelength: 790, x: 0.73469, y: 0.26531 },
  { wavelength: 795, x: 0.73469, y: 0.26531 },
  { wavelength: 800, x: 0.73469, y: 0.26531 },
  { wavelength: 805, x: 0.73469, y: 0.26531 },
  { wavelength: 810, x: 0.73469, y: 0.26531 },
  { wavelength: 815, x: 0.73469, y: 0.26531 },
  { wavelength: 820, x: 0.73469, y: 0.26531 },
  { wavelength: 825, x: 0.73469, y: 0.26531 },
  { wavelength: 830, x: 0.73469, y: 0.26531 },
] as const satisfies readonly CieXyzSpectralCoordinate[]
