import { useMemo, useState } from "react"
import type { ElementType } from "react"
import {
  Axis3dIcon,
  BlendIcon,
  BoxIcon,
  CircleDotIcon,
  ConeIcon,
  CylinderIcon,
  OrbitIcon,
  Scale3dIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ColorGamutControls } from "@/color-models/ColorGamutControls"
import { buildSolidColorSpaceMesh } from "@/color-models/color-space-solid-mesh"
import {
  detectColorGamutCapabilities,
  resolveColorGamutRendering,
} from "@/color-models/color-gamut"
import type {
  ColorGamutCapabilities,
  ColorGamutModeId,
} from "@/color-models/color-gamut"
import {
  COLOR_SPACE_MODEL_BY_ID,
  COLOR_SPACE_MODELS,
} from "@/color-models/color-space-models"
import type {
  ColorSpaceAxis,
  ColorSpaceModelId,
} from "@/color-models/color-space-models"
import { SolidColorSpaceModelCanvas } from "@/color-models/SolidColorSpaceModelCanvas"
import { cn } from "@/lib/utils"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

const MODEL_ICONS = {
  rgb: BoxIcon,
  hsl: CircleDotIcon,
  hsv: ConeIcon,
  hwb: BlendIcon,
  xyz: Axis3dIcon,
  lab: Axis3dIcon,
  lch: CylinderIcon,
  oklab: Scale3dIcon,
  oklch: OrbitIcon,
} satisfies Record<ColorSpaceModelId, ElementType>

function AxisLegendItem({ axis }: { readonly axis: ColorSpaceAxis }) {
  return (
    <li className="grid grid-cols-[auto_1fr] items-center gap-x-2 rounded-md border border-border bg-background/75 px-2.5 py-2">
      <span
        className="row-span-2 size-2 rounded-full"
        style={{ backgroundColor: axis.color }}
      />
      <span className="font-mono text-[0.62rem] leading-none text-muted-foreground">
        {axis.label}
      </span>
      <span className="mt-1 text-xs leading-none font-medium">
        {axis.value}
      </span>
    </li>
  )
}

function CoordinateLegendDock({
  axes,
}: {
  readonly axes: readonly ColorSpaceAxis[]
}) {
  return (
    <div className="rounded-md border border-border bg-background/90 p-2.5 shadow-sm backdrop-blur">
      <ul className="grid min-w-32 gap-1.5">
        {axes.map((axis) => (
          <AxisLegendItem key={`${axis.label}-${axis.value}`} axis={axis} />
        ))}
      </ul>
    </div>
  )
}

export function ColorSpaceSolidModelsPage() {
  const [selectedModelId, setSelectedModelId] =
    useState<ColorSpaceModelId>("oklch")
  const [selectedGamutId, setSelectedGamutId] =
    useState<ColorGamutModeId>("srgb")
  const [showWireframe, setShowWireframe] = useState(true)
  const [gamutCapabilities] = useState<ColorGamutCapabilities>(() =>
    detectColorGamutCapabilities()
  )
  const selectedModel = COLOR_SPACE_MODEL_BY_ID[selectedModelId]
  const gamutRendering = useMemo(
    () => resolveColorGamutRendering(selectedGamutId, gamutCapabilities),
    [gamutCapabilities, selectedGamutId]
  )
  const mesh = useMemo(
    () =>
      buildSolidColorSpaceMesh(
        selectedModel.id,
        gamutRendering.mode.id,
        gamutRendering.actualOutput.id
      ),
    [gamutRendering.actualOutput.id, gamutRendering.mode.id, selectedModel.id]
  )
  const ActiveIcon = MODEL_ICONS[selectedModel.id]
  const modelTabs = useMemo(
    () =>
      COLOR_SPACE_MODELS.map((model) => {
        const ModelIcon = MODEL_ICONS[model.id]
        const isSelected = model.id === selectedModel.id

        return (
          <Button
            key={model.id}
            type="button"
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-9 justify-start gap-2 px-3 text-xs",
              isSelected && "shadow-sm"
            )}
            onClick={() => setSelectedModelId(model.id)}
          >
            <ModelIcon />
            {model.name}
          </Button>
        )
      }),
    [selectedModel.id]
  )

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <code className="text-sm font-bold">
            색 공간을 실제 3D 표면으로 보기
          </code>
          <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">
            점군 대신 닫힌 표면 mesh로 RGB, HSL, HSV, HWB, XYZ, Lab, LCH, OKLab,
            OKLCH의 형태 차이를 비교합니다.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <ActiveIcon className="size-3" />
              {selectedModel.name}
            </Badge>
            <Badge variant="secondary">{mesh.shapeLabel}</Badge>
          </div>
          <label className="mt-3 flex items-center justify-between gap-3 rounded-md border border-border bg-background/75 px-2.5 py-2 text-xs">
            <span className="font-medium">Wireframe</span>
            <Switch
              size="sm"
              checked={showWireframe}
              onCheckedChange={setShowWireframe}
              aria-label="Toggle wireframe overlay"
            />
          </label>
        </div>
      }
      topEnd={
        <ColorGamutControls
          capabilities={gamutCapabilities}
          selectedGamutId={selectedGamutId}
          onSelect={setSelectedGamutId}
          className="max-w-[min(100%,42rem)] p-3 sm:p-4"
        />
      }
      bottomStart={<CoordinateLegendDock axes={selectedModel.axes} />}
      bottomCenter={
        <div className="grid w-full max-w-[min(100%,54rem)] grid-cols-2 gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur sm:grid-cols-4 xl:grid-cols-9">
          {modelTabs}
        </div>
      }
      bottomEnd={<PlaygroundTools />}
    >
      <SolidColorSpaceModelCanvas
        gamutRendering={gamutRendering}
        mesh={mesh}
        model={selectedModel}
        showWireframe={showWireframe}
        className="size-full min-h-0 rounded-none border-0 bg-background/70 shadow-none md:min-h-0"
      />
    </PlaygroundStage>
  )
}
