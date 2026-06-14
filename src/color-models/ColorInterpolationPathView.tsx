import { converter } from "culori"

import type { InterpolationRow } from "@/color-models/color-interpolation-models"
import { cn } from "@/lib/utils"

type ColorInterpolationPathViewProps = {
  readonly className?: string
  readonly rows: readonly InterpolationRow[]
}

const toOklch = converter("oklch")

export function ColorInterpolationPathView({
  className,
  rows,
}: ColorInterpolationPathViewProps) {
  return (
    <svg
      aria-label="Interpolation path mini view"
      className={cn("h-44 w-full overflow-visible", className)}
      viewBox="0 0 720 180"
      role="img"
    >
      <rect
        x="1"
        y="1"
        width="718"
        height="178"
        rx="8"
        className="fill-background/75 stroke-border"
      />
      <line x1="48" x2="672" y1="134" y2="134" className="stroke-border" />
      <line x1="48" x2="48" y1="30" y2="134" className="stroke-border" />
      <text x="48" y="160" className="fill-muted-foreground text-[13px]">
        0%
      </text>
      <text
        x="672"
        y="160"
        textAnchor="end"
        className="fill-muted-foreground text-[13px]"
      >
        100%
      </text>
      <text x="18" y="30" className="fill-muted-foreground text-[13px]">
        L
      </text>
      {rows.map((row, index) => {
        const path = createPath(row, index)

        return (
          <g key={row.id}>
            <path
              d={path}
              fill="none"
              stroke={`hsl(${index * 62 + 16} 72% 45%)`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            {row.steps.map((step) => {
              const point = getPoint(step.color, step.position, index)

              return (
                <circle
                  key={`${row.id}-${step.position}`}
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill={step.hex}
                  className="stroke-background"
                  strokeWidth="2"
                />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

function createPath(row: InterpolationRow, index: number) {
  return row.steps
    .map((step, stepIndex) => {
      const point = getPoint(step.color, step.position, index)
      const command = stepIndex === 0 ? "M" : "L"

      return `${command}${point.x.toFixed(1)},${point.y.toFixed(1)}`
    })
    .join(" ")
}

function getPoint(
  color: InterpolationRow["steps"][number]["color"],
  position: number,
  index: number
) {
  const oklch = toOklch(color)
  const lightness = Number.isFinite(oklch.l) ? oklch.l : 0
  const laneOffset = (index - 2) * 3

  return {
    x: 48 + position * 624,
    y: 134 - lightness * 104 + laneOffset,
  }
}
