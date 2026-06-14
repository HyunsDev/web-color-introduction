import { BoxIcon, PaletteIcon } from "lucide-react"

import {
  PlaygroundIndexPage,
  PlaygroundRouteColumn,
  PlaygroundRouteFeature,
  PlaygroundRouteGroup,
} from "@/playground/PlaygroundRoute"

export function PlaygroundHomePage() {
  return (
    <PlaygroundIndexPage
      title="Web Color Introduction"
      description="색 공간, 좌표계, 대비, 보간을 직접 보면서 이해하는 playground입니다."
    >
      <PlaygroundRouteColumn>
        <PlaygroundRouteGroup name="Color Models" icon={PaletteIcon}>
          <PlaygroundRouteFeature
            icon={BoxIcon}
            label="3D Color Coordinates"
            path="/color-space-models"
          />
        </PlaygroundRouteGroup>
      </PlaygroundRouteColumn>
    </PlaygroundIndexPage>
  )
}
