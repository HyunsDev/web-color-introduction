import { createFileRoute } from "@tanstack/react-router"

import { PerceptualColorStepsPage } from "@/color-models/PerceptualColorStepsPage"

export const Route = createFileRoute("/perceptual-color-steps")({
  component: PerceptualColorStepsPage,
})
