import { createFileRoute } from "@tanstack/react-router"

import { ColorSpaceUnwrappedPage } from "@/color-models/ColorSpaceUnwrappedPage"

export const Route = createFileRoute("/color-space-unwrapped")({
  component: ColorSpaceUnwrappedPage,
})
