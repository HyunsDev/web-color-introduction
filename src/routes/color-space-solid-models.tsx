import { createFileRoute } from "@tanstack/react-router"

import { ColorSpaceSolidModelsPage } from "@/color-models/ColorSpaceSolidModelsPage"

export const Route = createFileRoute("/color-space-solid-models")({
  component: ColorSpaceSolidModelsPage,
})
