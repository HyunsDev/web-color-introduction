import { createFileRoute } from "@tanstack/react-router"

import { ColorGamutClippingPage } from "@/color-models/ColorGamutClippingPage"

export const Route = createFileRoute("/color-gamut-clipping")({
  component: ColorGamutClippingPage,
})
