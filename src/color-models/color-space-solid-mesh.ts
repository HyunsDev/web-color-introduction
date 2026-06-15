import type {
  ColorGamutModeId,
  ColorOutputGamutId,
} from "@/color-models/color-gamut"
import type { ColorSpaceModelId } from "@/color-models/color-space-models"
import { buildBasicSolidMesh } from "@/color-models/color-space-solid-basic-mesh"
import { createColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import { buildCieReferenceSolidMesh } from "@/color-models/color-space-solid-cie-reference-mesh"
import { buildPerceptualSolidMesh } from "@/color-models/color-space-solid-perceptual-mesh"
import type { SolidColorSpaceMesh } from "@/color-models/color-space-solid-mesh-builder"
import { buildXyzSolidMesh } from "@/color-models/color-space-solid-xyz-mesh"
import { buildXyySolidMesh } from "@/color-models/color-space-solid-xyy-mesh"

export type { SolidColorSpaceMesh }

function createFallbackRenderOptions(outputGamutId: ColorOutputGamutId) {
  return createColorSampleRenderOptions("srgb", outputGamutId)
}

export function buildSolidColorSpaceMesh(
  modelId: ColorSpaceModelId,
  gamutModeId: ColorGamutModeId,
  outputGamutId: ColorOutputGamutId
) {
  const options = createColorSampleRenderOptions(gamutModeId, outputGamutId)

  switch (modelId) {
    case "xyz":
      return gamutModeId === "cie-1931"
        ? buildCieReferenceSolidMesh("xyz", options)
        : buildXyzSolidMesh(options)
    case "xyy":
      return gamutModeId === "cie-1931"
        ? buildCieReferenceSolidMesh("xyy", options)
        : buildXyySolidMesh(options)
    case "rgb":
    case "hsl":
    case "hsl-cube":
    case "hsv":
    case "hsv-cube":
    case "hwb":
    case "hwb-cube":
      return buildBasicSolidMesh(
        modelId,
        gamutModeId === "cie-1931"
          ? createFallbackRenderOptions(outputGamutId)
          : options
      )
    case "lab":
    case "lch":
    case "lch-cube":
    case "oklab":
    case "oklch":
    case "oklch-cube":
      return buildPerceptualSolidMesh(
        modelId,
        gamutModeId === "cie-1931"
          ? createFallbackRenderOptions(outputGamutId)
          : options
      )
    default:
      return assertNeverModel(modelId)
  }
}

function assertNeverModel(modelId: never): never {
  throw new RangeError(`Unknown color model: ${modelId}`)
}
