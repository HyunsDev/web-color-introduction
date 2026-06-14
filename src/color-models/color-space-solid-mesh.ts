import type {
  ColorGamutModeId,
  ColorOutputGamutId,
} from "@/color-models/color-gamut"
import type { ColorSpaceModelId } from "@/color-models/color-space-models"
import { buildBasicSolidMesh } from "@/color-models/color-space-solid-basic-mesh"
import { createColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import { buildPerceptualSolidMesh } from "@/color-models/color-space-solid-perceptual-mesh"
import type { SolidColorSpaceMesh } from "@/color-models/color-space-solid-mesh-builder"

export type { SolidColorSpaceMesh }

export function buildSolidColorSpaceMesh(
  modelId: ColorSpaceModelId,
  gamutModeId: ColorGamutModeId,
  outputGamutId: ColorOutputGamutId
) {
  const options = createColorSampleRenderOptions(gamutModeId, outputGamutId)

  switch (modelId) {
    case "rgb":
    case "hsl":
    case "hsv":
      return buildBasicSolidMesh(modelId, options)
    case "lab":
    case "lch":
    case "oklab":
    case "oklch":
      return buildPerceptualSolidMesh(modelId, options)
    default:
      return assertNeverModel(modelId)
  }
}

function assertNeverModel(modelId: never): never {
  throw new RangeError(`Unknown color model: ${modelId}`)
}
