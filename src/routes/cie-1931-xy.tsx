import { createFileRoute } from "@tanstack/react-router"

import { CieXyChromaticityPage } from "@/color-models/CieXyChromaticityPage"

export const Route = createFileRoute("/cie-1931-xy")({
  component: CieXyChromaticityPage,
})
