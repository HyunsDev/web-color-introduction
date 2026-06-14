import { useMemo, useState } from "react"
import { EyeIcon, GaugeIcon, PaletteIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  createBrandChromaRows,
  createLightnessStepRows,
  formatDeltaE,
} from "@/color-models/perceptual-color-steps-models"
import type { PerceptualStepRow } from "@/color-models/perceptual-color-steps-models"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

export function PerceptualColorStepsPage() {
  const [stepCount, setStepCount] = useState(7)
  const lightnessRows = useMemo(
    () => createLightnessStepRows(stepCount),
    [stepCount]
  )
  const brandRows = useMemo(() => createBrandChromaRows(stepCount), [stepCount])

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <code className="flex items-center gap-2 text-sm font-bold">
            <EyeIcon className="size-4" />
            같은 숫자, 다른 체감
          </code>
          <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">
            같은 개수의 수치 step도 RGB/HSL과 OKLCH에서는 밝기, 채도, 인접
            색차가 다르게 느껴집니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{stepCount} steps</Badge>
            <Badge variant="outline">ΔE between neighbors</Badge>
          </div>
        </div>
      }
      topEnd={
        <div className="grid w-full max-w-[min(100%,34rem)] gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium">Step count</span>
            <code>{stepCount}</code>
          </div>
          <Slider
            min={5}
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
      }
      bottomEnd={
        <div className="hidden sm:block">
          <PlaygroundTools />
        </div>
      }
    >
      <div className="flex size-full items-start justify-center px-4 pt-[22rem] pb-56 sm:px-8 sm:pt-64">
        <div className="grid w-full max-w-5xl gap-4">
          <RampGroup
            title="Lightness ramp"
            icon={GaugeIcon}
            rows={lightnessRows}
          />
          <RampGroup
            title="Brand chroma ramp"
            icon={PaletteIcon}
            rows={brandRows}
          />
        </div>
      </div>
    </PlaygroundStage>
  )
}

type RampGroupProps = {
  readonly icon: typeof GaugeIcon
  readonly rows: readonly PerceptualStepRow[]
  readonly title: string
}

function RampGroup({ icon: Icon, rows, title }: RampGroupProps) {
  return (
    <section className="rounded-md border border-border bg-background/92 p-3 shadow-sm backdrop-blur">
      <code className="flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4" />
        {title}
      </code>
      <div className="mt-3 grid gap-3">
        {rows.map((row) => (
          <RampRow key={row.id} row={row} />
        ))}
      </div>
    </section>
  )
}

type RampRowProps = {
  readonly row: PerceptualStepRow
}

function RampRow({ row }: RampRowProps) {
  return (
    <div className="grid gap-2 rounded-md border border-border/70 p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <code className="text-xs font-bold">{row.label}</code>
        <span className="text-xs text-muted-foreground">{row.description}</span>
      </div>
      <div className="grid gap-1.5" style={createStepGrid(row.steps.length)}>
        {row.steps.map((step) => (
          <div key={step.label} className="grid min-w-0 gap-1">
            <span
              className="h-12 rounded-md border border-border"
              style={{ backgroundColor: step.hex }}
            />
            <code className="truncate text-center text-[10px] text-muted-foreground">
              {step.label}
            </code>
            <code className="text-center text-[10px] text-muted-foreground">
              {step.deltaFromPrevious === null
                ? "start"
                : `ΔE ${formatDeltaE(step.deltaFromPrevious)}`}
            </code>
          </div>
        ))}
      </div>
    </div>
  )
}

function createStepGrid(stepCount: number) {
  return {
    gridTemplateColumns: `repeat(${stepCount}, minmax(0, 1fr))`,
  }
}
