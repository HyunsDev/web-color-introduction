import { useMemo, useState } from "react"
import { BlendIcon, MoveRightIcon, RouteIcon } from "lucide-react"
import { formatHex } from "culori"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ColorInterpolationPathView } from "@/color-models/ColorInterpolationPathView"
import { ColorInterpolationRowView } from "@/color-models/ColorInterpolationRowView"
import {
  createInterpolationRows,
  HUE_STRATEGIES,
  parseInterpolationColor,
} from "@/color-models/color-interpolation-models"
import type { HueStrategyId } from "@/color-models/color-interpolation-models"
import { cn } from "@/lib/utils"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

const DEFAULT_START_COLOR = "#ff5a3d"
const DEFAULT_END_COLOR = "#325bff"

export function ColorInterpolationPage() {
  const [startInput, setStartInput] = useState(DEFAULT_START_COLOR)
  const [endInput, setEndInput] = useState(DEFAULT_END_COLOR)
  const [hueStrategyId, setHueStrategyId] = useState<HueStrategyId>("shorter")
  const [stepCount, setStepCount] = useState(7)
  const startColor = parseInterpolationColor(startInput)
  const endColor = parseInterpolationColor(endInput)
  const rows = useMemo(
    () =>
      createInterpolationRows({
        startColor: startInput,
        endColor: endInput,
        hueStrategyId,
        stepCount,
      }),
    [endInput, hueStrategyId, startInput, stepCount]
  )
  const isValid = Boolean(startColor && endColor)

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <code className="flex items-center gap-2 text-sm font-bold">
            <BlendIcon className="size-4" />색 보간 경로 비교
          </code>
          <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">
            같은 시작색과 끝색도 RGB, HSL, Lab, LCH, OKLCH 중 어디에서 섞는지에
            따라 중간색과 경로가 달라집니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={isValid ? "secondary" : "destructive"}>
              {isValid ? "parsed" : "invalid color"}
            </Badge>
            <Badge variant="outline">{stepCount} steps</Badge>
          </div>
        </div>
      }
      topEnd={
        <div className="grid w-full max-w-[min(100%,46rem)] gap-3 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
            <ColorInput
              label="Start"
              value={startInput}
              onChange={setStartInput}
            />
            <MoveRightIcon className="mx-auto hidden size-5 self-end text-muted-foreground sm:block" />
            <ColorInput label="End" value={endInput} onChange={setEndInput} />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium">Hue direction</span>
              <code>
                {
                  HUE_STRATEGIES.find((item) => item.id === hueStrategyId)
                    ?.label
                }
              </code>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {HUE_STRATEGIES.map((strategy) => (
                <Button
                  key={strategy.id}
                  type="button"
                  variant={
                    strategy.id === hueStrategyId ? "default" : "outline"
                  }
                  className="justify-start text-xs"
                  title={strategy.description}
                  onClick={() => setHueStrategyId(strategy.id)}
                >
                  {strategy.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium">Steps</span>
              <code>{stepCount}</code>
            </div>
            <Slider
              min={3}
              max={11}
              step={1}
              value={[stepCount]}
              onValueChange={(values) => {
                const nextValue = values[0]

                if (nextValue !== undefined) {
                  setStepCount(nextValue)
                }
              }}
            />
          </div>
        </div>
      }
      bottomEnd={
        <div className="hidden sm:block">
          <PlaygroundTools />
        </div>
      }
    >
      <div className="flex size-full items-start justify-center px-4 pt-[26rem] pb-80 sm:px-8 sm:pt-80 lg:pt-64">
        <div className="grid w-full max-w-5xl gap-3">
          <div className="rounded-md border border-border bg-background/92 p-3 shadow-sm backdrop-blur">
            <code className="flex items-center gap-2 text-xs font-bold">
              <RouteIcon className="size-4" />
              OKLCH lightness path
            </code>
            <ColorInterpolationPathView rows={rows} className="mt-2" />
          </div>
          {rows.map((row) => (
            <ColorInterpolationRowView key={row.id} row={row} />
          ))}
        </div>
      </div>
    </PlaygroundStage>
  )
}

type ColorInputProps = {
  readonly label: string
  readonly onChange: (value: string) => void
  readonly value: string
}

function ColorInput({ label, onChange, value }: ColorInputProps) {
  const parsedColor = parseInterpolationColor(value)
  const pickerValue = parsedColor ? formatHex(parsedColor) : "#000000"

  return (
    <label className="grid gap-1.5 text-xs">
      <span className="font-medium">{label}</span>
      <span className="grid grid-cols-[2.75rem_1fr] gap-2">
        <input
          type="color"
          value={pickerValue}
          className="h-10 w-11 rounded-md border border-border bg-transparent p-1"
          aria-label={`${label} color picker`}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        <input
          type="text"
          value={value}
          className={cn(
            "h-10 min-w-0 rounded-md border border-input bg-background px-3 font-mono text-xs ring-offset-background transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !parsedColor && "border-destructive text-destructive"
          )}
          aria-label={`${label} CSS color`}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </span>
    </label>
  )
}
