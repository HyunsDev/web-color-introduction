import { Badge } from "@/components/ui/badge"
import { ColorAxisBarCanvas } from "@/color-models/ColorAxisBarCanvas"
import { ColorPlaneCanvas } from "@/color-models/ColorPlaneCanvas"
import { requireCoordinateAxis } from "@/color-models/color-coordinate-plane-models"
import type { ColorCoordinatePlane } from "@/color-models/color-coordinate-plane-models"
import { readColorCoordinateAxis } from "@/color-models/color-coordinate-utils"
import type { ColorCoordinate } from "@/color-models/color-coordinate-utils"

type ColorCoordinatePlanePanelProps = {
  readonly coordinate: ColorCoordinate
  readonly onChange: (coordinate: ColorCoordinate) => void
  readonly plane: ColorCoordinatePlane
}

export function ColorCoordinatePlanePanel({
  coordinate,
  onChange,
  plane,
}: ColorCoordinatePlanePanelProps) {
  const xAxis = requireCoordinateAxis(plane.modelId, plane.xAxisId)
  const yAxis = requireCoordinateAxis(plane.modelId, plane.yAxisId)
  const fixedAxis = requireCoordinateAxis(plane.modelId, plane.fixedAxisId)
  const fixedValue = readColorCoordinateAxis(coordinate, fixedAxis.id)

  return (
    <section className="grid min-w-0 gap-3 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <code className="block truncate text-xs font-bold">
            {plane.label}
          </code>
          <p className="mt-1 text-[0.68rem] leading-4 text-muted-foreground">
            {xAxis.label} x {yAxis.label}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {fixedAxis.label}
        </Badge>
      </div>
      <ColorPlaneCanvas
        coordinate={coordinate}
        plane={plane}
        onChange={onChange}
        className="w-full"
      />
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-2 text-[0.68rem]">
          <span className="font-medium">{fixedAxis.label}</span>
          <code>{formatAxisValue(fixedValue, fixedAxis.unit)}</code>
        </div>
        <ColorAxisBarCanvas
          axisId={fixedAxis.id}
          coordinate={coordinate}
          modelId={plane.modelId}
          onChange={onChange}
        />
      </div>
    </section>
  )
}

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
