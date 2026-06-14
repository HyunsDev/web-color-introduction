import { createFileRoute } from "@tanstack/react-router"

import { ColorInterpolationPage } from "@/color-models/ColorInterpolationPage"

export const Route = createFileRoute("/color-interpolation")({
  component: ColorInterpolationPage,
})
