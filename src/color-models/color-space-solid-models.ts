import {
  COLOR_SPACE_MODEL_BY_ID,
  COLOR_SPACE_MODELS,
} from "@/color-models/color-space-models"

export const COLOR_SPACE_SOLID_MODELS = [
  ...COLOR_SPACE_MODELS,
  COLOR_SPACE_MODEL_BY_ID.xyy,
] as const
