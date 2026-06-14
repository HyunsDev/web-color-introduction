import type { ElementType } from "react"
import { BlendIcon, BoxIcon, OrbitIcon, SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  COLOR_GAMUT_MODES,
  getColorGamutStatusLabel,
  resolveColorGamutRendering,
} from "@/color-models/color-gamut"
import type {
  ColorGamutCapabilities,
  ColorGamutModeDefinition,
  ColorGamutModeId,
  ColorGamutRendering,
  ColorGamutRenderStatus,
} from "@/color-models/color-gamut"
import { cn } from "@/lib/utils"

const GAMUT_ICONS = {
  srgb: BoxIcon,
  "display-p3": BlendIcon,
  bt2020: OrbitIcon,
  ideal: SparklesIcon,
} satisfies Record<ColorGamutModeId, ElementType>

function getStatusBadgeClass(
  status: ColorGamutRenderStatus,
  isSelected: boolean
) {
  if (isSelected) {
    return "border-primary-foreground/25 bg-primary-foreground/15 text-primary-foreground"
  }

  switch (status) {
    case "actual":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "simulated":
      return "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "theoretical":
      return "border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300"
    default:
      return assertNeverStatus(status)
  }
}

function GamutModeButton({
  isSelected,
  mode,
  onSelect,
  rendering,
}: {
  readonly isSelected: boolean
  readonly mode: ColorGamutModeDefinition
  readonly onSelect: () => void
  readonly rendering: ColorGamutRendering
}) {
  const GamutIcon = GAMUT_ICONS[mode.id]
  const statusLabel = getColorGamutStatusLabel(rendering.status)

  return (
    <Button
      type="button"
      variant={isSelected ? "default" : "outline"}
      className={cn(
        "h-auto min-h-12 justify-start gap-2 px-3 py-2 text-left text-xs",
        isSelected && "shadow-sm"
      )}
      onClick={onSelect}
    >
      <GamutIcon className="size-4 shrink-0" />
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="truncate font-medium leading-none">{mode.label}</span>
        <span
          className={cn(
            "truncate text-[0.65rem] leading-none font-normal",
            isSelected
              ? "text-primary-foreground/75"
              : "text-muted-foreground"
          )}
        >
          via {rendering.actualOutput.label}
        </span>
      </span>
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 px-1.5 py-0 text-[0.55rem] leading-4 font-semibold tracking-normal uppercase",
          getStatusBadgeClass(rendering.status, isSelected)
        )}
      >
        {statusLabel}
      </Badge>
    </Button>
  )
}

export function ColorGamutControls({
  capabilities,
  onSelect,
  selectedGamutId,
}: {
  readonly capabilities: ColorGamutCapabilities
  readonly onSelect: (gamutId: ColorGamutModeId) => void
  readonly selectedGamutId: ColorGamutModeId
}) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-md border border-border bg-background/85 p-4 shadow-sm backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
      {COLOR_GAMUT_MODES.map((mode) => {
        const rendering = resolveColorGamutRendering(mode.id, capabilities)
        const isSelected = mode.id === selectedGamutId

        return (
          <GamutModeButton
            key={mode.id}
            isSelected={isSelected}
            mode={mode}
            rendering={rendering}
            onSelect={() => onSelect(mode.id)}
          />
        )
      })}
    </div>
  )
}

function assertNeverStatus(status: never): never {
  throw new RangeError(`Unknown color gamut status: ${status}`)
}
