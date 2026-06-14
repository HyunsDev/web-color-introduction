import { createFileRoute } from "@tanstack/react-router"

import { PlaygroundHomePage } from "@/playground/PlaygroundHomePage"

export const Route = createFileRoute("/")({
  component: PlaygroundHomePage,
})
