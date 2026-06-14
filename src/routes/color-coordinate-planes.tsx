import { createFileRoute } from "@tanstack/react-router"

import { ColorCoordinatePlanesPage } from "@/color-models/ColorCoordinatePlanesPage"

export const Route = createFileRoute("/color-coordinate-planes")({
  component: ColorCoordinatePlanesPage,
})
