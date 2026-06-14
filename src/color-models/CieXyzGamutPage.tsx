import { useMemo, useState } from "react"
import { BoxIcon, CircleDotIcon, OrbitIcon, PaletteIcon } from "lucide-react"

import {
  CieXyzGamutCanvas,
  type CieXyzViewMode,
} from "@/color-models/CieXyzGamutCanvas"
import { CIE_XYZ_GAMUTS } from "@/color-models/cie-xyz-gamut-data"
import type { CieXyzGamutId } from "@/color-models/cie-xyz-gamut-data"
import {
  buildCieXyzGamutMeshes,
  buildCieXyzReferenceMesh,
} from "@/color-models/cie-xyz-gamut-mesh"
import type { CieXyzGamutVisibility } from "@/color-models/three-cie-xyz-gamut-scene"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

const DEFAULT_GAMUT_VISIBILITY = {
  srgb: true,
  "display-p3": true,
  bt2020: true,
} satisfies CieXyzGamutVisibility

function getViewModeLabel(viewMode: CieXyzViewMode) {
  switch (viewMode) {
    case "3d":
      return "3D 회전"
    case "xy":
      return "xy 정면"
    default:
      return assertNeverViewMode(viewMode)
  }
}

function XyzAxisLegend() {
  return (
    <div className="rounded-md border border-border bg-background/90 p-2.5 shadow-sm backdrop-blur">
      <ul className="grid min-w-32 gap-1.5">
        {[
          { label: "X", value: "red response", color: "#ef4444" },
          { label: "Y", value: "luminance", color: "#22c55e" },
          { label: "Z", value: "blue response", color: "#3b82f6" },
        ].map((axis) => (
          <li
            key={axis.label}
            className="grid grid-cols-[auto_1fr] items-center gap-x-2 rounded-md border border-border bg-background/75 px-2.5 py-2"
          >
            <span
              className="row-span-2 size-2 rounded-full"
              style={{ backgroundColor: axis.color }}
            />
            <span className="font-mono text-[0.62rem] leading-none text-muted-foreground">
              {axis.label}
            </span>
            <span className="mt-1 text-xs leading-none font-medium">
              {axis.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

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
      {getViewModeLabel(targetViewMode)}
    </Button>
  )
}

export function CieXyzGamutPage() {
  const [viewMode, setViewMode] = useState<CieXyzViewMode>("3d")
  const [visibleGamuts, setVisibleGamuts] = useState<CieXyzGamutVisibility>(
    DEFAULT_GAMUT_VISIBILITY
  )
  const [showChromaticity, setShowChromaticity] = useState(true)
  const [showWireframe, setShowWireframe] = useState(true)
  const gamutMeshes = useMemo(() => buildCieXyzGamutMeshes(), [])
  const reference = useMemo(() => buildCieXyzReferenceMesh(), [])
  const visibleGamutCount = CIE_XYZ_GAMUTS.filter(
    (gamut) => visibleGamuts[gamut.id]
  ).length
  const triangleCount = gamutMeshes.reduce(
    (total, mesh) => total + mesh.triangleCount,
    0
  )

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
            CIE 1931 XYZ
          </div>
          <h1 className="text-xl leading-tight font-semibold tracking-normal sm:text-2xl">
            XYZ 공간에서 보는 디스플레이 색역
          </h1>
          <p className="mt-2 hidden text-xs leading-5 text-muted-foreground sm:block">
            RGB 큐브를 XYZ로 변환해 부피로 겹치고, 정규화 평면에서는 익숙한
            말발굽 색도 경계를 함께 봅니다.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <OrbitIcon className="size-3" />
              {getViewModeLabel(viewMode)}
            </Badge>
            <Badge variant="secondary">{visibleGamutCount} gamuts</Badge>
            <Badge variant="outline">
              {triangleCount.toLocaleString()} tris
            </Badge>
          </div>
        </div>
      }
      topEnd={
        <div className="grid w-full max-w-[min(100%,42rem)] grid-cols-1 gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur sm:grid-cols-3">
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
      bottomStart={<XyzAxisLegend />}
      bottomCenter={
        <div className="grid gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur sm:grid-cols-[auto_auto_auto_auto]">
          <ViewModeButton
            currentViewMode={viewMode}
            targetViewMode="3d"
            onSelect={setViewMode}
          />
          <ViewModeButton
            currentViewMode={viewMode}
            targetViewMode="xy"
            onSelect={setViewMode}
          />
          <label className="flex h-9 items-center justify-between gap-3 rounded-md border border-border bg-background/75 px-3 text-xs">
            <span className="font-medium">말발굽</span>
            <Switch
              size="sm"
              checked={showChromaticity}
              onCheckedChange={setShowChromaticity}
              aria-label="Toggle CIE spectral locus"
            />
          </label>
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
        showChromaticity={showChromaticity}
        showWireframe={showWireframe}
        viewMode={viewMode}
        visibleGamuts={visibleGamuts}
        className="size-full bg-background/70"
      />
    </PlaygroundStage>
  )
}

function assertNeverViewMode(viewMode: never): never {
  throw new RangeError(`Unknown CIE XYZ view mode: ${viewMode}`)
}
