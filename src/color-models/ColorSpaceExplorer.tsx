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
import { ColorSpaceModelCanvas } from "@/color-models/ColorSpaceModelCanvas"
import {
  COLOR_SPACE_MODEL_BY_ID,
  COLOR_SPACE_MODELS,
} from "@/color-models/color-space-models"
import type {
  ColorSpaceAxis,
  ColorSpaceModelId,
} from "@/color-models/color-space-models"
import { cn } from "@/lib/utils"
import { PlaygroundCenter } from "@/playground/PlaygroundRoute"

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

export function ColorSpaceExplorer() {
  const [selectedModelId, setSelectedModelId] =
    useState<ColorSpaceModelId>("rgb")
  const selectedModel = COLOR_SPACE_MODEL_BY_ID[selectedModelId]
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
    <PlaygroundCenter
      title="색 좌표계를 3D 모델로 비교하기"
      description="RGB, HSL, HSV, LCH, OKLCH를 같은 캔버스 안에서 점군과 좌표축으로 비교합니다."
      width="min(100%, 1280px)"
    >
      <div className="flex w-full flex-col gap-5">
        <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-background/85 p-4 shadow-sm backdrop-blur sm:grid-cols-5">
          {modelTabs}
        </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ColorSpaceModelCanvas model={selectedModel} />

          <aside className="grid content-start gap-4">
            <div className="rounded-md border border-border bg-background p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <ActiveIcon className="size-4" />
                    {selectedModel.title}
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {selectedModel.summary}
                  </p>
                </div>
                <span
                  className="mt-1 size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: selectedModel.accent }}
                />
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="outline">{selectedModel.coordinate}</Badge>
                <Badge variant="secondary">{selectedModel.geometry}</Badge>
              </div>

              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs">
                {selectedModel.notation}
              </div>
            </div>

            <div className="rounded-md border border-border bg-background p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <BlendIcon className="size-4" />
                Coordinate axes
              </div>
              <ul className="grid gap-2">
                {selectedModel.axes.map((axis) => (
                  <AxisRow
                    key={`${selectedModel.id}-${axis.label}`}
                    axis={axis}
                  />
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-border bg-background p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold">Model notes</div>
              <ul className="grid gap-2 text-xs leading-5 text-muted-foreground">
                {selectedModel.notes.map((note) => (
                  <li key={note} className="rounded-md bg-muted/45 px-3 py-2">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </PlaygroundCenter>
  )
}
