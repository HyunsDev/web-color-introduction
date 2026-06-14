import { useMemo, useState } from "react"
import { BoxIcon, CircleDotIcon, Grid3X3Icon, PaletteIcon } from "lucide-react"

import {
  CieXyzGamutCanvas,
  type CieXyzViewMode,
} from "@/color-models/CieXyzGamutCanvas"
import { CiePageLinks } from "@/color-models/CiePageLinks"
import { CIE_XYZ_GAMUTS } from "@/color-models/cie-xyz-gamut-data"
import type { CieXyzGamutId } from "@/color-models/cie-xyz-gamut-data"
import { buildCieXyzGamutMeshes } from "@/color-models/cie-xyz-gamut-mesh"
import { buildCieXyzReferenceMesh } from "@/color-models/cie-xyz-reference-mesh"
import type { CieXyzGamutVisibility } from "@/color-models/three-cie-xyz-gamut-scene"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

const DEFAULT_GAMUT_VISIBILITY = {
  srgb: false,
  "display-p3": false,
  bt2020: false,
} satisfies CieXyzGamutVisibility

function GamutToggleButton({
  gamutId,
  isVisible,
  onToggle,
}: {
  readonly gamutId: CieXyzGamutId
  readonly isVisible: boolean
  readonly onToggle: (gamutId: CieXyzGamutId) => void
}) {
  const gamut = CIE_XYZ_GAMUTS.find((item) => item.id === gamutId)

  if (!gamut) {
    return null
  }

  return (
    <Button
      type="button"
      variant={isVisible ? "default" : "outline"}
      className={cn(
        "h-10 justify-start gap-2 px-3 text-xs",
        isVisible && "shadow-sm"
      )}
      onClick={() => onToggle(gamut.id)}
    >
      <span
        className="size-2.5 rounded-full border border-background/50"
        style={{ backgroundColor: gamut.lineColor }}
      />
      <span className="min-w-0 truncate">{gamut.label}</span>
    </Button>
  )
}

function ViewModeButton({
  currentViewMode,
  targetViewMode,
  onSelect,
}: {
  readonly currentViewMode: CieXyzViewMode
  readonly targetViewMode: CieXyzViewMode
  readonly onSelect: (viewMode: CieXyzViewMode) => void
}) {
  const isSelected = currentViewMode === targetViewMode
  const Icon = targetViewMode === "3d" ? BoxIcon : CircleDotIcon

  return (
    <Button
      type="button"
      variant={isSelected ? "default" : "outline"}
      className="h-9 gap-2 px-3 text-xs"
      onClick={() => onSelect(targetViewMode)}
    >
      <Icon />
      {targetViewMode === "3d" ? "3D 단면" : "xy 정면"}
    </Button>
  )
}

export function CieXyChromaticityPage() {
  const [viewMode, setViewMode] = useState<CieXyzViewMode>("xy")
  const [visibleGamuts, setVisibleGamuts] = useState<CieXyzGamutVisibility>(
    DEFAULT_GAMUT_VISIBILITY
  )
  const [showWireframe, setShowWireframe] = useState(true)
  const gamutMeshes = useMemo(() => buildCieXyzGamutMeshes(), [])
  const reference = useMemo(() => buildCieXyzReferenceMesh(), [])
  const visibleGamutCount = CIE_XYZ_GAMUTS.filter(
    (gamut) => visibleGamuts[gamut.id]
  ).length

  const toggleGamut = (gamutId: CieXyzGamutId) => {
    setVisibleGamuts((current) => ({
      ...current,
      [gamutId]: !current[gamutId],
    }))
  }

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold">
            <PaletteIcon className="size-4" />
            CIE 1931 xy
          </div>
          <h1 className="text-xl leading-tight font-semibold tracking-normal sm:text-2xl">
            정규화된 색도 말발굽
          </h1>
          <p className="mt-2 hidden text-xs leading-5 text-muted-foreground sm:block">
            X, Y, Z의 크기를 합으로 나눈 x/y 좌표입니다. 밝기 크기는 버리고,
            파장 방향과 디스플레이 primary 삼각형을 한 평면에서 비교합니다.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Grid3X3Icon className="size-3" />x 0.0-0.8 / y 0.0-0.9
            </Badge>
            <Badge variant="secondary">
              {visibleGamutCount === 0
                ? "display gamuts off"
                : `${visibleGamutCount} gamuts`}
            </Badge>
          </div>
        </div>
      }
      topEnd={<CiePageLinks current="xy" />}
      bottomStart={
        <div className="grid gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur sm:grid-cols-3">
          {CIE_XYZ_GAMUTS.map((gamut) => (
            <GamutToggleButton
              key={gamut.id}
              gamutId={gamut.id}
              isVisible={visibleGamuts[gamut.id]}
              onToggle={toggleGamut}
            />
          ))}
        </div>
      }
      bottomCenter={
        <div className="grid gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur sm:grid-cols-[auto_auto_auto]">
          <ViewModeButton
            currentViewMode={viewMode}
            targetViewMode="xy"
            onSelect={setViewMode}
          />
          <ViewModeButton
            currentViewMode={viewMode}
            targetViewMode="3d"
            onSelect={setViewMode}
          />
          <label className="flex h-9 items-center justify-between gap-3 rounded-md border border-border bg-background/75 px-3 text-xs">
            <span className="font-medium">Wire</span>
            <Switch
              size="sm"
              checked={showWireframe}
              onCheckedChange={setShowWireframe}
              aria-label="Toggle gamut wireframe"
            />
          </label>
        </div>
      }
      bottomEnd={<PlaygroundTools />}
    >
      <CieXyzGamutCanvas
        gamutMeshes={gamutMeshes}
        reference={reference}
        showChromaticity={true}
        showVisibleCone={false}
        showWireframe={showWireframe}
        viewMode={viewMode}
        visibleGamuts={visibleGamuts}
        className="size-full bg-background/70"
      />
    </PlaygroundStage>
  )
}
