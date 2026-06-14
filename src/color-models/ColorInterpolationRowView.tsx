import { SwatchBookIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  createInterpolationRows,
  formatInterpolationStepPosition,
} from "@/color-models/color-interpolation-models"

type InterpolationRowViewProps = {
  readonly row: ReturnType<typeof createInterpolationRows>[number]
}

export function ColorInterpolationRowView({ row }: InterpolationRowViewProps) {
  const gradient = `linear-gradient(90deg, ${row.steps
    .map(
      (step) => `${step.hex} ${formatInterpolationStepPosition(step.position)}`
    )
    .join(", ")})`

  return (
    <section className="rounded-md border border-border bg-background/92 p-3 shadow-sm backdrop-blur">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <code className="flex items-center gap-2 text-sm font-bold">
          <SwatchBookIcon className="size-4" />
          {row.label}
        </code>
        <Badge
          variant={
            row.steps.every((step) => step.inSrgb) ? "secondary" : "outline"
          }
        >
          {row.steps.every((step) => step.inSrgb) ? "sRGB" : "clipped preview"}
        </Badge>
      </div>
      <div
        className="h-12 rounded-md border border-border"
        style={{ background: gradient }}
      />
      <div
        className="mt-2 grid gap-1.5"
        style={createStepGrid(row.steps.length)}
      >
        {row.steps.map((step) => (
          <div key={step.position} className="grid min-w-0 gap-1">
            <span
              className="h-9 rounded-md border border-border"
              style={{ backgroundColor: step.hex }}
            />
            <code className="truncate text-center text-[10px] text-muted-foreground">
              {step.hex}
            </code>
          </div>
        ))}
      </div>
    </section>
  )
}

function createStepGrid(stepCount: number) {
  return {
    gridTemplateColumns: `repeat(${stepCount}, minmax(0, 1fr))`,
  }
}
