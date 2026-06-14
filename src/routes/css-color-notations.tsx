import { createFileRoute } from "@tanstack/react-router"

import { CssColorNotationPage } from "@/color-models/CssColorNotationPage"

export const Route = createFileRoute("/css-color-notations")({
  component: CssColorNotationPage,
})
