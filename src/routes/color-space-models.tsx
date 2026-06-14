import { createFileRoute } from "@tanstack/react-router"

import { ColorSpaceExplorer } from "@/color-models/ColorSpaceExplorer"

export const Route = createFileRoute("/color-space-models")({
  component: ColorSpaceExplorer,
})
