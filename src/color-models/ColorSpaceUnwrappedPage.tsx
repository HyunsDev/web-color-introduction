import { useState } from "react"
import type { ElementType } from "react"
import {
  BoxIcon,
  CircleDotIcon,
  ConeIcon,
  CylinderIcon,
  PanelTopIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ColorSpaceUnwrapped3DCanvas } from "@/color-models/ColorSpaceUnwrapped3DCanvas"
import { ColorSpaceUnwrappedCanvas } from "@/color-models/ColorSpaceUnwrappedCanvas"
import {
  formatUnwrappedValue,
  UNWRAPPED_COLOR_MODEL_BY_ID,
  UNWRAPPED_COLOR_MODELS,
} from "@/color-models/color-space-unwrapped-models"
import type { UnwrappedColorModelId } from "@/color-models/color-space-unwrapped-models"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

const MODEL_ICONS = {
  hsl: CircleDotIcon,
  hsv: ConeIcon,
  lch: CylinderIcon,
  oklch: PanelTopIcon,
} satisfies Record<UnwrappedColorModelId, ElementType>

type UnwrappedViewMode = "flat" | "wrapped"

export function ColorSpaceUnwrappedPage() {
  const [selectedModelId, setSelectedModelId] =
    useState<UnwrappedColorModelId>("oklch")
  const selectedModel = UNWRAPPED_COLOR_MODEL_BY_ID[selectedModelId]
  const [fixedValue, setFixedValue] = useState<number>(
    selectedModel.fixedDefault
  )
  const [viewMode, setViewMode] = useState<UnwrappedViewMode>("wrapped")
  const ActiveIcon = MODEL_ICONS[selectedModelId]

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <code className="flex items-center gap-2 text-sm font-bold">
            <PanelTopIcon className="size-4" />
            원통형 색 공간 펼쳐 보기
          </code>
          <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">
            Hue 원형 좌표를 가로로 펼치면 0deg와 360deg가 양끝 seam으로
            갈라지고, radius 0에서는 hue가 모두 같은 회색축으로 겹칩니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <ActiveIcon className="size-3" />
              {selectedModel.label}
            </Badge>
            <Badge variant="secondary">
              Hue {viewMode === "flat" ? "-> X" : "-> angle"}
            </Badge>
            <Badge variant="secondary">
              {selectedModel.radiusLabel}{" "}
              {viewMode === "flat" ? "-> Y" : "-> radius"}
            </Badge>
          </div>
        </div>
      }
      topEnd={
        <div className="grid w-full max-w-[min(100%,42rem)] gap-3 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {UNWRAPPED_COLOR_MODELS.map((model) => {
              const ModelIcon = MODEL_ICONS[model.id]
              const isSelected = model.id === selectedModelId

              return (
                <Button
                  key={model.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="justify-start gap-2 text-xs"
                  onClick={() => {
                    setSelectedModelId(model.id)
                    setFixedValue(model.fixedDefault)
                  }}
                >
                  <ModelIcon />
                  {model.label}
                </Button>
              )
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={viewMode === "flat" ? "default" : "outline"}
              className="justify-start gap-2 text-xs"
              onClick={() => {
                setViewMode("flat")
              }}
            >
              <PanelTopIcon />
              2D unfold
            </Button>
            <Button
              type="button"
              variant={viewMode === "wrapped" ? "default" : "outline"}
              className="justify-start gap-2 text-xs"
              onClick={() => {
                setViewMode("wrapped")
              }}
            >
              <BoxIcon />
              3D wrap
            </Button>
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-medium">
                {selectedModel.fixedAxisLabel}
              </span>
              <code>
                {formatUnwrappedValue(fixedValue, selectedModel.fixedUnit)}
              </code>
            </div>
            <Slider
              min={selectedModel.fixedMin}
              max={selectedModel.fixedMax}
              step={selectedModel.fixedStep}
              value={[fixedValue]}
              onValueChange={(values) => {
                const nextValue = values[0]

                if (nextValue !== undefined) {
                  setFixedValue(nextValue)
                }
              }}
            />
          </div>
        </div>
      }
      bottomCenter={
        <div className="grid w-full max-w-[min(100%,46rem)] gap-2 rounded-md border border-border bg-background/90 p-3 text-xs shadow-sm backdrop-blur sm:grid-cols-3">
          <div>
            <code>{viewMode === "flat" ? "0deg" : "0deg / 360deg"}</code>
            <p className="mt-1 text-muted-foreground">
              {viewMode === "flat" ? "left seam" : "joined seam"}
            </p>
          </div>
          <div>
            <code>radius 0</code>
            <p className="mt-1 text-muted-foreground">
              {viewMode === "flat" ? "duplicated gray axis" : "central axis"}
            </p>
          </div>
          <div>
            <code>
              {viewMode === "flat" ? "360deg" : selectedModel.fixedAxisLabel}
            </code>
            <p className="mt-1 text-muted-foreground">
              {viewMode === "flat"
                ? "right seam"
                : formatUnwrappedValue(fixedValue, selectedModel.fixedUnit)}
            </p>
          </div>
        </div>
      }
      bottomEnd={<PlaygroundTools />}
    >
      <div className="flex size-full items-center justify-center px-4 py-36 sm:px-8">
        {viewMode === "flat" ? (
          <ColorSpaceUnwrappedCanvas
            modelId={selectedModelId}
            fixedValue={fixedValue}
            className="mt-12 max-w-[min(92vw,52rem)]"
          />
        ) : (
          <ColorSpaceUnwrapped3DCanvas
            modelId={selectedModelId}
            fixedValue={fixedValue}
            className="mt-12 w-full max-w-[min(92vw,52rem)]"
          />
        )}
      </div>
    </PlaygroundStage>
  )
}
