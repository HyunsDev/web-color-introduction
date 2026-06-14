import { ScissorsLineDashedIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  getSolidSliceAxes,
  getSolidSliceAxis,
  isSolidSliceModel,
} from "@/color-models/color-space-solid-slice"
import type {
  SolidSliceAxisId,
  SolidSliceModelId,
  SolidSliceState,
} from "@/color-models/color-space-solid-slice"
import type { ColorSpaceModelId } from "@/color-models/color-space-models"

type ColorSpaceSolidSliceControlsProps = {
  readonly modelId: ColorSpaceModelId
  readonly onEnabledChange: (enabled: boolean) => void
  readonly onSliceChange: (slice: SolidSliceState) => void
  readonly slice: SolidSliceState
  readonly sliceEnabled: boolean
}

export function ColorSpaceSolidSliceControls({
  modelId,
  onEnabledChange,
  onSliceChange,
  slice,
  sliceEnabled,
}: ColorSpaceSolidSliceControlsProps) {
  const isSupported = isSolidSliceModel(modelId)
  const axis = isSupported
    ? getSolidSliceAxis(modelId, slice.axisId)
    : undefined

  return (
    <div className="mt-3 grid gap-2 rounded-md border border-border bg-background/75 p-2.5">
      <label className="flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-2 font-medium">
          <ScissorsLineDashedIcon className="size-3.5" />
          Slice
        </span>
        <Switch
          size="sm"
          checked={sliceEnabled && isSupported}
          disabled={!isSupported}
          onCheckedChange={onEnabledChange}
          aria-label="Toggle slice plane"
        />
      </label>

      {isSupported && axis ? (
        <SupportedSliceControls
          modelId={modelId}
          axisId={axis.id}
          value={slice.value}
          onSliceChange={onSliceChange}
        />
      ) : (
        <p className="text-xs leading-5 text-muted-foreground">
          RGB, HSL, HSV, LCH, OKLCH 모델에서 내부 단면을 볼 수 있습니다.
        </p>
      )}
    </div>
  )
}

function SupportedSliceControls({
  axisId,
  modelId,
  onSliceChange,
  value,
}: {
  readonly axisId: SolidSliceAxisId
  readonly modelId: SolidSliceModelId
  readonly onSliceChange: (slice: SolidSliceState) => void
  readonly value: number
}) {
  const axes = getSolidSliceAxes(modelId)
  const axis = getSolidSliceAxis(modelId, axisId) ?? axes[0]

  if (!axis) {
    return null
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        {axes.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={item.id === axisId ? "default" : "outline"}
            onClick={() =>
              onSliceChange({ axisId: item.id, value: item.defaultValue })
            }
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">Fixed {axis.label}</span>
          <code>{formatSliceValue(value, axis.unit)}</code>
        </div>
        <Slider
          min={axis.min}
          max={axis.max}
          step={axis.step}
          value={[value]}
          onValueChange={(values) => {
            const nextValue = values[0]

            if (nextValue !== undefined) {
              onSliceChange({ axisId, value: nextValue })
            }
          }}
        />
      </div>
    </div>
  )
}

function formatSliceValue(
  value: number,
  unit: "degree" | "number" | "percent"
) {
  switch (unit) {
    case "degree":
      return `${Math.round(value)}deg`
    case "percent":
      return `${Math.round(value * 100)}%`
    case "number":
      return value.toFixed(2)
    default:
      return assertNeverUnit(unit)
  }
}

function assertNeverUnit(unit: never): never {
  throw new RangeError(`Unknown slice value unit: ${unit}`)
}
