import { createFileRoute } from "@tanstack/react-router"

import { CieXyzProjectionPage } from "@/color-models/CieXyzProjectionPage"

export const Route = createFileRoute("/cie-1931-projection")({
  component: CieXyzProjectionPage,
})
