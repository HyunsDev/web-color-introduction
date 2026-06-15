import { useMemo, useState } from "react"
import type { ElementType, ReactNode } from "react"
import {
  Axis3dIcon,
  BlendIcon,
  BoxIcon,
  CircleDotIcon,
  ConeIcon,
  CylinderIcon,
  OrbitIcon,
  Scale3dIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ColorGamutControls } from "@/color-models/ColorGamutControls"
import {
  ColorSpaceSolidSliceControls,
  ColorSpaceSolidSliceToggle,
} from "@/color-models/ColorSpaceSolidSliceControls"
import { createColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import {
  buildSolidSliceMesh,
  createDefaultSolidSliceState,
  isSolidSliceModel,
} from "@/color-models/color-space-solid-slice"
import type { SolidSliceState } from "@/color-models/color-space-solid-slice"
import { buildSolidColorSpaceMesh } from "@/color-models/color-space-solid-mesh"
import {
  detectColorGamutCapabilities,
  resolveColorGamutRendering,
} from "@/color-models/color-gamut"
import type {
  ColorGamutCapabilities,
  ColorGamutModeId,
} from "@/color-models/color-gamut"
import { COLOR_SPACE_MODEL_BY_ID } from "@/color-models/color-space-models"
import { COLOR_SPACE_SOLID_MODELS } from "@/color-models/color-space-solid-models"
import type {
  BaseColorSpaceModelId,
  ColorSpaceAxis,
  ColorSpaceModelId,
  HueCubeBaseModelId,
  HueCubeModelId,
} from "@/color-models/color-space-models"
import {
  getBaseColorSpaceModelId,
  isHueCubeModelId,
} from "@/color-models/color-space-models"
import { SolidColorSpaceModelCanvas } from "@/color-models/SolidColorSpaceModelCanvas"
import { cn } from "@/lib/utils"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

const MODEL_ICONS = {
  rgb: BoxIcon,
  hsl: CircleDotIcon,
  "hsl-cube": BoxIcon,
  hsv: ConeIcon,
  "hsv-cube": BoxIcon,
  hwb: BlendIcon,
  "hwb-cube": BoxIcon,
  xyz: Axis3dIcon,
  xyy: CircleDotIcon,
  lab: Axis3dIcon,
  lch: CylinderIcon,
  "lch-cube": BoxIcon,
  oklab: Scale3dIcon,
  oklch: OrbitIcon,
  "oklch-cube": BoxIcon,
} satisfies Record<ColorSpaceModelId, ElementType>

const CIE_REFERENCE_MODEL_IDS = ["xyz", "xyy"] as const

const CUBE_MODEL_BY_BASE_ID = {
  hsl: "hsl-cube",
  hsv: "hsv-cube",
  hwb: "hwb-cube",
  lch: "lch-cube",
  oklch: "oklch-cube",
} as const satisfies Record<HueCubeBaseModelId, HueCubeModelId>

const SOLID_BASE_MODELS = COLOR_SPACE_SOLID_MODELS.filter(
  (model) => !isHueCubeModelId(model.id)
)

function isCieReferenceModel(modelId: ColorSpaceModelId) {
  return CIE_REFERENCE_MODEL_IDS.some((item) => item === modelId)
}

function isSolidBaseModelId(value: string): value is BaseColorSpaceModelId {
  return SOLID_BASE_MODELS.some((model) => model.id === value)
}

function getCubeModelId(modelId: BaseColorSpaceModelId) {
  if (modelId in CUBE_MODEL_BY_BASE_ID) {
    return CUBE_MODEL_BY_BASE_ID[modelId as HueCubeBaseModelId]
  }

  return null
}

function resolveSolidModelId(
  modelId: BaseColorSpaceModelId,
  cubeEnabled: boolean
) {
  const cubeModelId = getCubeModelId(modelId)

  return cubeEnabled && cubeModelId ? cubeModelId : modelId
}

function isSolidGamutModeSupported(
  modelId: ColorSpaceModelId,
  gamutId: ColorGamutModeId
) {
  return gamutId !== "cie-1931" || isCieReferenceModel(modelId)
}

function AxisLegendItem({ axis }: { readonly axis: ColorSpaceAxis }) {
  return (
    <li className="grid grid-cols-[auto_1fr] items-center gap-x-2 rounded-md border border-border bg-background/75 px-2.5 py-2">
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
  )
}

function CoordinateLegendDock({
  axes,
  className,
}: {
  readonly axes: readonly ColorSpaceAxis[]
  readonly className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background/90 p-2.5 shadow-sm backdrop-blur",
        className
      )}
    >
      <ul className="grid min-w-32 gap-1.5">
        {axes.map((axis) => (
          <AxisLegendItem key={`${axis.label}-${axis.value}`} axis={axis} />
        ))}
      </ul>
    </div>
  )
}

function CoordinateSliceDock({
  axes,
  className,
  modelId,
  onSliceChange,
  slice,
  sliceEnabled,
}: {
  readonly axes: readonly ColorSpaceAxis[]
  readonly className?: string
  readonly modelId: ColorSpaceModelId
  readonly onSliceChange: (slice: SolidSliceState) => void
  readonly slice: SolidSliceState
  readonly sliceEnabled: boolean
}) {
  return (
    <div
      className={cn(
        "grid max-w-full gap-2 rounded-md border border-border bg-background/90 p-2.5 shadow-sm backdrop-blur sm:grid-cols-[auto_minmax(13rem,1fr)]",
        className
      )}
    >
      <CoordinateLegendDock
        axes={axes}
        className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
      />
      <ColorSpaceSolidSliceControls
        modelId={modelId}
        slice={slice}
        sliceEnabled={sliceEnabled}
        onSliceChange={onSliceChange}
      />
    </div>
  )
}

function SolidModelsBottomDock({
  axes,
  modelId,
  modelControls,
  onSliceChange,
  slice,
  sliceEnabled,
}: {
  readonly axes: readonly ColorSpaceAxis[]
  readonly modelId: ColorSpaceModelId
  readonly modelControls: ReactNode
  readonly onSliceChange: (slice: SolidSliceState) => void
  readonly slice: SolidSliceState
  readonly sliceEnabled: boolean
}) {
  return (
    <div className="grid max-h-[18rem] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] items-end gap-2 overflow-y-auto sm:w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] lg:max-h-none lg:grid-cols-[minmax(20rem,23rem)_minmax(0,1fr)_auto] lg:overflow-visible">
      <CoordinateSliceDock
        axes={axes}
        modelId={modelId}
        slice={slice}
        sliceEnabled={sliceEnabled}
        onSliceChange={onSliceChange}
      />
      {modelControls}
      <div className="justify-self-center sm:justify-self-end">
        <PlaygroundTools />
      </div>
    </div>
  )
}

function SolidModelControls({
  cubeEnabled,
  cubeSupported,
  onCubeEnabledChange,
  onModelSelect,
  selectedBaseModelId,
  selectedModelId,
}: {
  readonly cubeEnabled: boolean
  readonly cubeSupported: boolean
  readonly onCubeEnabledChange: (enabled: boolean) => void
  readonly onModelSelect: (modelId: BaseColorSpaceModelId) => void
  readonly selectedBaseModelId: BaseColorSpaceModelId
  readonly selectedModelId: ColorSpaceModelId
}) {
  const ActiveIcon = MODEL_ICONS[selectedModelId]

  return (
    <div className="grid gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur sm:grid-cols-[minmax(12rem,18rem)_auto] sm:items-end">
      <label className="grid gap-1.5 text-xs">
        <span className="font-medium text-muted-foreground">Model</span>
        <Select
          value={selectedBaseModelId}
          onValueChange={(value) => {
            if (isSolidBaseModelId(value)) {
              onModelSelect(value)
            }
          }}
        >
          <SelectTrigger
            className="h-9 w-full justify-between bg-background/75"
            aria-label="Select solid color space model"
          >
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            {SOLID_BASE_MODELS.map((model) => {
              const ModelIcon = MODEL_ICONS[model.id]

              return (
                <SelectItem key={model.id} value={model.id}>
                  <ModelIcon />
                  {model.name}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </label>
      <label
        className={cn(
          "flex h-9 items-center justify-between gap-3 rounded-md border border-border bg-background/75 px-2.5 text-xs",
          !cubeSupported && "opacity-60"
        )}
      >
        <span className="flex items-center gap-2 font-medium">
          <ActiveIcon className="size-3.5" />
          Cube
        </span>
        <Switch
          size="sm"
          checked={cubeEnabled}
          disabled={!cubeSupported}
          onCheckedChange={onCubeEnabledChange}
          aria-label="Toggle cube coordinate model"
        />
      </label>
    </div>
  )
}

export function ColorSpaceSolidModelsPage() {
  const [selectedModelId, setSelectedModelId] =
    useState<ColorSpaceModelId>("oklch")
  const [selectedGamutId, setSelectedGamutId] =
    useState<ColorGamutModeId>("srgb")
  const [showWireframe, setShowWireframe] = useState(true)
  const [showSlice, setShowSlice] = useState(false)
  const [slice, setSlice] = useState<SolidSliceState>(() =>
    createDefaultSolidSliceState("rgb")
  )
  const [gamutCapabilities] = useState<ColorGamutCapabilities>(() =>
    detectColorGamutCapabilities()
  )
  const selectedModel = COLOR_SPACE_MODEL_BY_ID[selectedModelId]
  const selectedBaseModelId = getBaseColorSpaceModelId(selectedModel.id)
  const cubeModelId = getCubeModelId(selectedBaseModelId)
  const cubeSupported = cubeModelId !== null
  const cubeEnabled = isHueCubeModelId(selectedModel.id)
  const gamutRendering = useMemo(
    () => resolveColorGamutRendering(selectedGamutId, gamutCapabilities),
    [gamutCapabilities, selectedGamutId]
  )

  const mesh = useMemo(
    () =>
      buildSolidColorSpaceMesh(
        selectedModel.id,
        gamutRendering.mode.id,
        gamutRendering.actualOutput.id
      ),
    [gamutRendering.actualOutput.id, gamutRendering.mode.id, selectedModel.id]
  )
  const sliceMesh = useMemo(() => {
    if (!showSlice || !isSolidSliceModel(selectedModel.id)) {
      return null
    }

    return buildSolidSliceMesh(
      selectedModel.id,
      slice,
      createColorSampleRenderOptions(
        gamutRendering.mode.id,
        gamutRendering.actualOutput.id
      )
    )
  }, [
    gamutRendering.actualOutput.id,
    gamutRendering.mode.id,
    selectedModel.id,
    showSlice,
    slice,
  ])
  const ActiveIcon = MODEL_ICONS[selectedModel.id]

  function selectSolidModel(modelId: ColorSpaceModelId) {
    setSelectedModelId(modelId)

    if (!isSolidGamutModeSupported(modelId, selectedGamutId)) {
      setSelectedGamutId("srgb")
    }

    if (isSolidSliceModel(modelId)) {
      setSlice(createDefaultSolidSliceState(modelId))
    }
  }

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <code className="text-sm font-bold">
            색 공간을 실제 3D 표면으로 보기
          </code>
          <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">
            점군 대신 닫힌 표면 mesh로 RGB, HSL, HSV, HWB, XYZ, xyY, Lab, LCH,
            OKLab, OKLCH와 펼친 Cube 모델의 형태 차이를 비교합니다. CIE 1931은
            디스플레이 색역이 아니라 XYZ/xyY reference boundary입니다.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <ActiveIcon className="size-3" />
              {selectedModel.name}
            </Badge>
            <Badge variant="secondary">{mesh.shapeLabel}</Badge>
          </div>
          <label className="mt-3 flex items-center justify-between gap-3 rounded-md border border-border bg-background/75 px-2.5 py-2 text-xs">
            <span className="font-medium">Wireframe</span>
            <Switch
              size="sm"
              checked={showWireframe}
              onCheckedChange={setShowWireframe}
              aria-label="Toggle wireframe overlay"
            />
          </label>
          <ColorSpaceSolidSliceToggle
            className="mt-2"
            modelId={selectedModel.id}
            sliceEnabled={showSlice}
            onEnabledChange={setShowSlice}
          />
        </div>
      }
      topEnd={
        <ColorGamutControls
          capabilities={gamutCapabilities}
          selectedGamutId={selectedGamutId}
          onSelect={setSelectedGamutId}
          isModeSupported={(gamutId) =>
            isSolidGamutModeSupported(selectedModel.id, gamutId)
          }
          orientation="vertical"
          className="w-full max-w-[18rem] p-3 sm:p-4"
        />
      }
      bottomCenter={
        <SolidModelsBottomDock
          axes={selectedModel.axes}
          modelId={selectedModel.id}
          modelControls={
            <SolidModelControls
              cubeEnabled={cubeEnabled}
              cubeSupported={cubeSupported}
              selectedBaseModelId={selectedBaseModelId}
              selectedModelId={selectedModel.id}
              onModelSelect={(modelId) => {
                selectSolidModel(resolveSolidModelId(modelId, cubeEnabled))
              }}
              onCubeEnabledChange={(enabled) => {
                selectSolidModel(
                  resolveSolidModelId(selectedBaseModelId, enabled)
                )
              }}
            />
          }
          slice={slice}
          sliceEnabled={showSlice}
          onSliceChange={setSlice}
        />
      }
    >
      <SolidColorSpaceModelCanvas
        gamutRendering={gamutRendering}
        mesh={mesh}
        model={selectedModel}
        sliceMesh={sliceMesh}
        showWireframe={showWireframe}
        className="size-full min-h-0 rounded-none border-0 bg-background/70 shadow-none md:min-h-0"
      />
    </PlaygroundStage>
  )
}
