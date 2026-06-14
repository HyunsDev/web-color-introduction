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
import { Slider } from "@/components/ui/slider"
import { ColorPlaneCanvas } from "@/color-models/ColorPlaneCanvas"
import { formatCssColorSet } from "@/color-models/color-css-format"
import { getColorGamutChecks } from "@/color-models/color-gamut-analysis"
import {
  COLOR_COORDINATE_MODEL_BY_ID,
  COLOR_COORDINATE_MODELS,
  createDefaultColorCoordinate,
  readColorCoordinateAxis,
  setColorCoordinateAxis,
  toCuloriColor,
} from "@/color-models/color-coordinate-utils"
import type {
  ColorCoordinate,
  ColorCoordinateModelId,
} from "@/color-models/color-coordinate-utils"
import {
  getCoordinatePlanes,
  requireCoordinateAxis,
} from "@/color-models/color-coordinate-plane-models"
import { cn } from "@/lib/utils"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

const MODEL_ICONS = {
  rgb: PaletteIcon,
  hsl: CircleDotIcon,
  hsv: ConeIcon,
  lch: CylinderIcon,
  oklch: GaugeIcon,
} satisfies Record<ColorCoordinateModelId, ElementType>

function formatAxisValue(value: number, unit: string) {
  switch (unit) {
    case "degree":
      return `${Math.round(value)}deg`
    case "percent":
      return `${Math.round(value)}%`
    case "number":
      return Number.isInteger(value) ? String(value) : value.toFixed(3)
    default:
      return String(value)
  }
}

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
  const [selectedPlaneIndex, setSelectedPlaneIndex] = useState(0)
  const selectedModel = COLOR_COORDINATE_MODEL_BY_ID[selectedModelId]
  const selectedPlane = planes[selectedPlaneIndex] ?? planes[0]
  const fixedAxis = requireCoordinateAxis(
    selectedModelId,
    selectedPlane.fixedAxisId
  )
  const fixedValue = readColorCoordinateAxis(coordinate, fixedAxis.id)
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
            두 좌표축은 평면에서 직접 고르고, 남은 축은 슬라이더로 고정해 색이
            어떻게 움직이는지 확인합니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <ActiveIcon className="size-3" />
              {selectedModel.label}
            </Badge>
            <Badge variant="secondary">{selectedPlane.label}</Badge>
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
                    setSelectedPlaneIndex(0)
                  }}
                >
                  <ModelIcon />
                  {model.label}
                </Button>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {planes.map((plane, index) => (
              <Button
                key={plane.id}
                type="button"
                size="sm"
                variant={index === selectedPlaneIndex ? "default" : "outline"}
                onClick={() => setSelectedPlaneIndex(index)}
              >
                {plane.label}
              </Button>
            ))}
          </div>
        </div>
      }
      bottomStart={
        <div className="grid w-full gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur lg:w-80">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium">{fixedAxis.label}</span>
            <code>{formatAxisValue(fixedValue, fixedAxis.unit)}</code>
          </div>
          <Slider
            min={fixedAxis.min}
            max={fixedAxis.max}
            step={fixedAxis.step}
            value={[fixedValue]}
            onValueChange={(values) => {
              const nextValue = values[0]

              if (nextValue !== undefined) {
                setCoordinate(
                  setColorCoordinateAxis(coordinate, fixedAxis.id, nextValue)
                )
              }
            }}
          />
        </div>
      }
      bottomCenter={
        <div className="grid w-full max-w-[min(100%,44rem)] gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur sm:grid-cols-2">
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
      <div className="flex size-full items-center justify-center px-4 py-36 sm:px-8">
        <ColorPlaneCanvas
          coordinate={coordinate}
          plane={selectedPlane}
          onChange={setCoordinate}
          className={cn("w-full max-w-[min(78svh,34rem)]")}
        />
      </div>
    </PlaygroundStage>
  )
}
