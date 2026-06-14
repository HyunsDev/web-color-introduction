import { ColorManagement, LinearSRGBColorSpace, SRGBColorSpace } from "three"
import {
  DisplayP3ColorSpace,
  DisplayP3ColorSpaceImpl,
  LinearDisplayP3ColorSpace,
  LinearDisplayP3ColorSpaceImpl,
} from "three/examples/jsm/math/ColorSpaces.js"

import type { ColorOutputGamutId } from "@/color-models/color-gamut"

let hasRegisteredWideGamutColorSpaces = false

export function registerWideGamutColorSpaces() {
  if (hasRegisteredWideGamutColorSpaces) {
    return
  }

  ColorManagement.define({
    [DisplayP3ColorSpace]: DisplayP3ColorSpaceImpl,
    [LinearDisplayP3ColorSpace]: LinearDisplayP3ColorSpaceImpl,
  })
  hasRegisteredWideGamutColorSpaces = true
}

export function getThreeOutputColorSpace(outputGamutId: ColorOutputGamutId) {
  switch (outputGamutId) {
    case "srgb":
      return SRGBColorSpace
    case "display-p3":
      return DisplayP3ColorSpace
    default:
      return assertNeverOutputGamut(outputGamutId)
  }
}

export function getThreeWorkingColorSpace(outputGamutId: ColorOutputGamutId) {
  switch (outputGamutId) {
    case "srgb":
      return LinearSRGBColorSpace
    case "display-p3":
      return LinearDisplayP3ColorSpace
    default:
      return assertNeverOutputGamut(outputGamutId)
  }
}

function assertNeverOutputGamut(outputGamutId: never): never {
  throw new RangeError(`Unknown output gamut: ${outputGamutId}`)
}
