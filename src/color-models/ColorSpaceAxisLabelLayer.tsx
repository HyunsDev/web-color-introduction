import type { RefObject } from "react"

import type { ColorSpaceAxisLabel } from "@/color-models/color-space-axis-labels"
import { cn } from "@/lib/utils"

export function ColorSpaceAxisLabelLayer({
  labelLayerRef,
  labels,
}: {
  readonly labelLayerRef: RefObject<HTMLDivElement | null>
  readonly labels: readonly ColorSpaceAxisLabel[]
}) {
  return (
    <div
      ref={labelLayerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      {labels.map((label, index) => (
        <span
          key={`${label.kind}-${label.text}`}
          data-axis-label-index={index}
          className={cn(
            "absolute top-0 left-0 rounded-md border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[0.62rem] leading-none font-semibold whitespace-nowrap shadow-sm backdrop-blur transition-opacity",
            label.kind === "axis"
              ? "text-foreground"
              : "hidden text-muted-foreground sm:block"
          )}
          style={{
            color: label.kind === "axis" ? label.color : undefined,
            opacity: 0,
            transform: "translate3d(-9999px, -9999px, 0)",
          }}
        >
          {label.text}
        </span>
      ))}
    </div>
  )
}
