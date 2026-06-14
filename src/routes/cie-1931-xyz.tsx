import { createFileRoute } from "@tanstack/react-router"

import { CieXyzSpectralPage } from "@/color-models/CieXyzSpectralPage"

export const Route = createFileRoute("/cie-1931-xyz")({
  component: CieXyzSpectralPage,
})
