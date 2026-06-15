import { useMemo, useState } from "react"
import type { ElementType } from "react"
import {
  CircleDotIcon,
  ConeIcon,
  CrosshairIcon,
  CylinderIcon,
  GaugeIcon,
  PaletteIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ColorCoordinatePlanePanel } from "@/color-models/ColorCoordinatePlanePanel"
import { formatCssColorSet } from "@/color-models/color-css-format"
import { getColorGamutChecks } from "@/color-models/color-gamut-analysis"
import {
  COLOR_COORDINATE_MODEL_BY_ID,
  COLOR_COORDINATE_MODELS,
  createDefaultColorCoordinate,
  toCuloriColor,
} from "@/color-models/color-coordinate-utils"
import type {
  ColorCoordinate,
  ColorCoordinateModelId,
} from "@/color-models/color-coordinate-utils"
import { getCoordinatePlanes } from "@/color-models/color-coordinate-plane-models"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

const MODEL_ICONS = {
  rgb: PaletteIcon,
  hsl: CircleDotIcon,
  hsv: ConeIcon,
  lch: CylinderIcon,
  oklch: GaugeIcon,
} satisfies Record<ColorCoordinateModelId, ElementType>

export function ColorCoordinatePlanesPage() {
  const [selectedModelId, setSelectedModelId] =
    useState<ColorCoordinateModelId>("oklch")
  const [coordinate, setCoordinate] = useState<ColorCoordinate>(() =>
    createDefaultColorCoordinate("oklch")
  )
  const planes = useMemo(
    () => getCoordinatePlanes(selectedModelId),
    [selectedModelId]
  )
  const selectedModel = COLOR_COORDINATE_MODEL_BY_ID[selectedModelId]
  const color = toCuloriColor(coordinate)
  const cssFormats = formatCssColorSet(color)
  const gamutChecks = getColorGamutChecks(color)
  const ActiveIcon = MODEL_ICONS[selectedModelId]

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <code className="flex items-center gap-2 text-sm font-bold">
            <CrosshairIcon className="size-4" />색 좌표 2D 단면 조절기
          </code>
          <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">
            세 개의 2D 단면을 함께 보고, 각 단면 아래 bar로 빠진 축을 움직여 색
            좌표의 깊이를 비교합니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <ActiveIcon className="size-3" />
              {selectedModel.label}
            </Badge>
            <Badge variant="secondary">3 coordinate planes</Badge>
          </div>
        </div>
      }
      topEnd={
        <div className="grid w-full max-w-[min(100%,42rem)] gap-3 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {COLOR_COORDINATE_MODELS.map((model) => {
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
                    setCoordinate(createDefaultColorCoordinate(model.id))
                  }}
                >
                  <ModelIcon />
                  {model.label}
                </Button>
              )
            })}
          </div>
        </div>
      }
      bottomCenter={
        <div className="hidden w-full max-w-[min(100%,44rem)] gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur sm:grid sm:grid-cols-2">
          <div
            className="min-h-16 rounded-md border border-border"
            style={{ backgroundColor: cssFormats.hex }}
          />
          <div className="grid gap-1 text-xs">
            <code>{cssFormats.hex}</code>
            <code>{cssFormats.rgb}</code>
            <code>{cssFormats.hsl}</code>
            <code>{cssFormats.oklch}</code>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {gamutChecks.map((check) => (
                <Badge
                  key={check.gamut}
                  variant={check.inGamut ? "default" : "secondary"}
                >
                  {check.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      }
      bottomEnd={<PlaygroundTools />}
    >
      <div className="size-full overflow-y-auto px-4 pt-80 pb-72 sm:flex sm:items-center sm:justify-center sm:overflow-visible sm:px-8 sm:pt-48 sm:pb-40">
        <div className="grid w-full max-w-[min(92vw,54rem)] gap-3 sm:grid-cols-3">
          {planes.map((plane) => (
            <ColorCoordinatePlanePanel
              key={plane.id}
              coordinate={coordinate}
              plane={plane}
              onChange={setCoordinate}
            />
          ))}
        </div>
      </div>
    </PlaygroundStage>
  )
}
