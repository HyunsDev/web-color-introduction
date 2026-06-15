import { ScissorsLineDashedIcon } from "lucide-react"

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
import { cn } from "@/lib/utils"

type ColorSpaceSolidSliceToggleProps = {
  readonly className?: string
  readonly modelId: ColorSpaceModelId
  readonly onEnabledChange: (enabled: boolean) => void
  readonly sliceEnabled: boolean
}

export function ColorSpaceSolidSliceToggle({
  className,
  modelId,
  onEnabledChange,
  sliceEnabled,
}: ColorSpaceSolidSliceToggleProps) {
  const isSupported = isSolidSliceModel(modelId)

  return (
    <label
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border border-border bg-background/75 px-2.5 py-2 text-xs",
        className
      )}
    >
      <span className="grid gap-1">
        <span className="flex items-center gap-2 font-medium">
          <ScissorsLineDashedIcon className="size-3.5" />
          Slice
        </span>
        {!isSupported && (
          <span className="text-[0.68rem] leading-none text-muted-foreground">
            RGB, HSL, HSV, LCH, OKLCH only
          </span>
        )}
      </span>
      <Switch
        size="sm"
        checked={sliceEnabled && isSupported}
        disabled={!isSupported}
        onCheckedChange={onEnabledChange}
        aria-label="Toggle slice plane"
      />
    </label>
  )
}

type ColorSpaceSolidSliceControlsProps = {
  readonly className?: string
  readonly modelId: ColorSpaceModelId
  readonly onSliceChange: (slice: SolidSliceState) => void
  readonly slice: SolidSliceState
  readonly sliceEnabled: boolean
}

export function ColorSpaceSolidSliceControls({
  className,
  modelId,
  onSliceChange,
  slice,
  sliceEnabled,
}: ColorSpaceSolidSliceControlsProps) {
  if (!isSolidSliceModel(modelId)) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed border-border bg-background/55 px-3 py-2 text-xs leading-5 text-muted-foreground",
          className
        )}
      >
        RGB, HSL, HSV, LCH, OKLCH 모델에서 내부 단면을 볼 수 있습니다.
      </div>
    )
  }

  return (
    <SupportedSliceControls
      className={className}
      modelId={modelId}
      axisId={slice.axisId}
      value={slice.value}
      sliceEnabled={sliceEnabled}
      onSliceChange={onSliceChange}
    />
  )
}

function AxisSliceSlider({
  axis,
  isActive,
  onSliceChange,
  value,
}: {
  readonly axis: ReturnType<typeof getSolidSliceAxes>[number]
  readonly isActive: boolean
  readonly onSliceChange: (slice: SolidSliceState) => void
  readonly value: number
}) {
  return (
    <div
      className={cn(
        "grid gap-1.5 rounded-md border px-2.5 py-2 transition-colors",
        isActive
          ? "border-primary/60 bg-primary/10"
          : "border-border bg-background/70"
      )}
    >
      <div className="flex items-center justify-between gap-3 text-xs">
        <span
          className={cn(
            "font-medium",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Fixed {axis.label}
        </span>
        <code className="text-[0.68rem]">
          {formatSliceValue(value, axis.unit)}
        </code>
      </div>
      <Slider
        min={axis.min}
        max={axis.max}
        step={axis.step}
        value={[value]}
        aria-label={`Fixed ${axis.label} slice value`}
        onValueChange={(values) => {
          const nextValue = values[0]

          if (nextValue !== undefined) {
            onSliceChange({ axisId: axis.id, value: nextValue })
          }
        }}
      />
    </div>
  )
}

function SupportedSliceControls({
  className,
  axisId,
  modelId,
  onSliceChange,
  sliceEnabled,
  value,
}: {
  readonly className?: string
  readonly axisId: SolidSliceAxisId
  readonly modelId: SolidSliceModelId
  readonly onSliceChange: (slice: SolidSliceState) => void
  readonly sliceEnabled: boolean
  readonly value: number
}) {
  const axes = getSolidSliceAxes(modelId)
  const activeAxis = getSolidSliceAxis(modelId, axisId) ?? axes[0]

  if (!activeAxis) {
    return null
  }

  return (
    <div
      className={cn(
        "grid gap-2 rounded-md border border-border bg-background/75 p-2.5",
        !sliceEnabled && "opacity-65",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium">Slice axis</span>
        <code>{activeAxis.label}</code>
      </div>
      <div className="grid gap-1.5">
        {axes.map((axis) => (
          <AxisSliceSlider
            key={axis.id}
            axis={axis}
            isActive={axis.id === activeAxis.id}
            value={axis.id === activeAxis.id ? value : axis.defaultValue}
            onSliceChange={onSliceChange}
          />
        ))}
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
