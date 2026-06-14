import {
  ArrowDownToLineIcon,
  BlendIcon,
  BoxIcon,
  CircleDotIcon,
  Code2Icon,
  CrosshairIcon,
  CylinderIcon,
  EyeIcon,
  PaletteIcon,
  PanelTopIcon,
  ScissorsIcon,
} from "lucide-react"

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
          <PlaygroundRouteFeature
            icon={CylinderIcon}
            label="3D Solid Models"
            path="/color-space-solid-models"
          />
          <PlaygroundRouteFeature
            icon={CrosshairIcon}
            label="2D Coordinate Planes"
            path="/color-coordinate-planes"
          />
          <PlaygroundRouteFeature
            icon={PanelTopIcon}
            label="Unwrapped Color Spaces"
            path="/color-space-unwrapped"
          />
          <PlaygroundRouteFeature
            icon={BlendIcon}
            label="Color Interpolation"
            path="/color-interpolation"
          />
          <PlaygroundRouteFeature
            icon={Code2Icon}
            label="CSS Color Notations"
            path="/css-color-notations"
          />
          <PlaygroundRouteFeature
            icon={ScissorsIcon}
            label="Gamut Clipping"
            path="/color-gamut-clipping"
          />
          <PlaygroundRouteFeature
            icon={EyeIcon}
            label="Perceptual Steps"
            path="/perceptual-color-steps"
          />
          <PlaygroundRouteFeature
            icon={CircleDotIcon}
            label="CIE 1931 xy"
            path="/cie-1931-xy"
          />
          <PlaygroundRouteFeature
            icon={BoxIcon}
            label="CIE 1931 XYZ"
            path="/cie-1931-xyz"
          />
          <PlaygroundRouteFeature
            icon={ArrowDownToLineIcon}
            label="XYZ to xy Projection"
            path="/cie-1931-projection"
          />
        </PlaygroundRouteGroup>
      </PlaygroundRouteColumn>
    </PlaygroundIndexPage>
  )
}
