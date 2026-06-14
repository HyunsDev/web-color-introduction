import { useMemo, useState } from "react"
import type { ElementType } from "react"
import {
  BlendIcon,
  BoxIcon,
  CircleDotIcon,
  ConeIcon,
  CylinderIcon,
  OrbitIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ColorGamutControls } from "@/color-models/ColorGamutControls"
import { ColorSpaceModelCanvas } from "@/color-models/ColorSpaceModelCanvas"
import {
  detectColorGamutCapabilities,
  getColorGamutStatusLabel,
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
  ColorSpaceModelDefinition,
  ColorSpaceModelId,
} from "@/color-models/color-space-models"
import { cn } from "@/lib/utils"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

const MODEL_ICONS = {
  rgb: BoxIcon,
  hsl: CircleDotIcon,
  hsv: ConeIcon,
  lch: CylinderIcon,
  oklch: OrbitIcon,
} satisfies Record<ColorSpaceModelId, ElementType>

function AxisRow({ axis }: { readonly axis: ColorSpaceAxis }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
      <span className="flex items-center gap-2 font-mono text-[0.68rem] text-muted-foreground">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: axis.color }}
        />
        {axis.label}
      </span>
      <span className="text-xs font-medium">{axis.value}</span>
    </li>
  )
}

function ColorSpaceModelInspector({
  gamutRendering,
  model,
}: {
  readonly gamutRendering: ReturnType<typeof resolveColorGamutRendering>
  readonly model: ColorSpaceModelDefinition
}) {
  const ActiveIcon = MODEL_ICONS[model.id]

  return (
    <aside className="grid content-start gap-3">
      <div className="rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
              <ActiveIcon className="size-4" />
              {model.title}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              {model.summary}
            </p>
          </div>
          <span
            className="mt-1 size-3 shrink-0 rounded-full"
            style={{ backgroundColor: model.accent }}
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline">{model.coordinate}</Badge>
          <Badge variant="secondary">{model.geometry}</Badge>
          <Badge variant="outline">{gamutRendering.mode.shortLabel}</Badge>
          <Badge variant="secondary">
            {getColorGamutStatusLabel(gamutRendering.status)}
          </Badge>
        </div>

        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs">
          {model.notation}
        </div>
      </div>

      <div className="rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <BlendIcon className="size-4" />
          Coordinate axes
        </div>
        <ul className="grid gap-2">
          {model.axes.map((axis) => (
            <AxisRow key={`${model.id}-${axis.label}`} axis={axis} />
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
        <div className="mb-3 text-sm font-semibold">Model notes</div>
        <ul className="grid gap-2 text-xs leading-5 text-muted-foreground">
          {model.notes.map((note) => (
            <li key={note} className="rounded-md bg-muted/45 px-3 py-2">
              {note}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export function ColorSpaceExplorer() {
  const [selectedModelId, setSelectedModelId] =
    useState<ColorSpaceModelId>("rgb")
  const [selectedGamutId, setSelectedGamutId] =
    useState<ColorGamutModeId>("srgb")
  const [gamutCapabilities] = useState<ColorGamutCapabilities>(
    () => detectColorGamutCapabilities()
  )
  const selectedModel = COLOR_SPACE_MODEL_BY_ID[selectedModelId]
  const gamutRendering = useMemo(
    () => resolveColorGamutRendering(selectedGamutId, gamutCapabilities),
    [gamutCapabilities, selectedGamutId]
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
            색 좌표계를 3D 모델로 비교하기
          </code>
          <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">
            RGB, HSL, HSV, LCH, OKLCH를 같은 무대에서 점군과 좌표축으로
            비교합니다.
          </p>
          <div className="mt-3 grid gap-2 lg:hidden">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <ActiveIcon className="size-4" />
              {selectedModel.title}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{selectedModel.coordinate}</Badge>
              <Badge variant="secondary">{selectedModel.geometry}</Badge>
              <Badge variant="outline">{gamutRendering.mode.shortLabel}</Badge>
            </div>
          </div>
        </div>
      }
      topEnd={
        <ColorGamutControls
          capabilities={gamutCapabilities}
          selectedGamutId={selectedGamutId}
          onSelect={setSelectedGamutId}
          className="max-w-[min(100%,56rem)] p-3 sm:p-4"
        />
      }
      endPanel={
        <ColorSpaceModelInspector
          gamutRendering={gamutRendering}
          model={selectedModel}
        />
      }
      bottomStart={
        <div className="rounded-md border border-border bg-background/90 px-3 py-2 shadow-sm backdrop-blur">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{selectedModel.coordinate}</Badge>
            <Badge variant="secondary">{selectedModel.geometry}</Badge>
            <Badge variant="outline">{gamutRendering.mode.shortLabel}</Badge>
          </div>
        </div>
      }
      bottomCenter={
        <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur sm:grid-cols-5">
          {modelTabs}
        </div>
      }
      bottomEnd={<PlaygroundTools />}
    >
      <ColorSpaceModelCanvas
        gamutRendering={gamutRendering}
        model={selectedModel}
        showHud={false}
        className="size-full min-h-0 rounded-none border-0 bg-background/70 shadow-none md:min-h-0"
      />
    </PlaygroundStage>
  )
}
