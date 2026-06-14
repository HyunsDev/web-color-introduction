import { createFileRoute } from "@tanstack/react-router"

import { CieXyzGamutPage } from "@/color-models/CieXyzGamutPage"

export const Route = createFileRoute("/cie-1931-xyz")({
  component: CieXyzGamutPage,
})
