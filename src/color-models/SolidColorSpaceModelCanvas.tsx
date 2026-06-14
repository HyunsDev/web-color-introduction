import { useEffect, useMemo, useRef } from "react"
import {
  AmbientLight,
  ColorManagement,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import {
  ColorSpaceAxisLabelLayer,
} from "@/color-models/ColorSpaceAxisLabelLayer"
import { createAxisLabelProjector } from "@/color-models/color-space-axis-label-projection"
import { getColorSpaceAxisLabels } from "@/color-models/color-space-axis-labels"
import type { SolidColorSpaceMesh } from "@/color-models/color-space-solid-mesh"
import {
  getColorGamutRenderLabel,
  type ColorGamutRendering,
} from "@/color-models/color-gamut"
import type { ColorSpaceModelDefinition } from "@/color-models/color-space-models"
import {
  getThreeOutputColorSpace,
  getThreeWorkingColorSpace,
  registerWideGamutColorSpaces,
} from "@/color-models/three-color-spaces"
import { createModelFrame } from "@/color-models/three-frame"
import { createSolidColorSpaceObject } from "@/color-models/three-solid-scene"
import { disposeObjectTree } from "@/color-models/three-scene"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function SolidColorSpaceModelCanvas({
  className,
  gamutRendering,
  mesh,
  model,
  showWireframe,
}: {
  readonly className?: string
  readonly gamutRendering: ColorGamutRendering
  readonly mesh: SolidColorSpaceMesh
  readonly model: ColorSpaceModelDefinition
  readonly showWireframe: boolean
}) {
  const { resolvedTheme } = useTheme()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const labelLayerRef = useRef<HTMLDivElement | null>(null)
  const axisLabels = useMemo(
    () => getColorSpaceAxisLabels(model.id),
    [model.id]
  )
  const gamutRenderLabel = getColorGamutRenderLabel(gamutRendering)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const labelLayer = labelLayerRef.current

    if (!host || !canvas || !labelLayer) {
      return
    }

    registerWideGamutColorSpaces()
    const previousWorkingColorSpace = ColorManagement.workingColorSpace
    ColorManagement.workingColorSpace = getThreeWorkingColorSpace(
      gamutRendering.actualOutput.id
    )

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.outputColorSpace = getThreeOutputColorSpace(
      gamutRendering.actualOutput.id
    )
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new Scene()
    const camera = new PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(3.15, 2.2, 3.15)
    camera.lookAt(0, 0, 0)

    const controls = new OrbitControls(camera, canvas)
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.52
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 2.2
    controls.maxDistance = 5.5

    const frame = createModelFrame(model.id, resolvedTheme)
    const solid = createSolidColorSpaceObject({
      mesh,
      showWireframe,
      theme: resolvedTheme,
    })
    const keyLight = new DirectionalLight("#ffffff", 1.2)
    keyLight.position.set(3, 4, 5)
    scene.add(keyLight)
    scene.add(new AmbientLight("#ffffff", 1.6))
    scene.add(frame)
    scene.add(solid)

    const updateAxisLabels = createAxisLabelProjector(labelLayer, axisLabels)

    let resizeFrameId = 0
    let renderWidth = 1
    let renderHeight = 1
    const resize = () => {
      resizeFrameId = 0
      renderWidth = Math.max(1, Math.floor(host.clientWidth))
      renderHeight = Math.max(1, Math.floor(host.clientHeight))

      renderer.setSize(renderWidth, renderHeight, false)
      camera.aspect = renderWidth / renderHeight
      camera.updateProjectionMatrix()
      updateAxisLabels(camera, renderWidth, renderHeight)
    }
    const queueResize = () => {
      if (resizeFrameId !== 0) {
        return
      }

      resizeFrameId = window.requestAnimationFrame(resize)
    }
    const resizeObserver = new ResizeObserver(queueResize)
    resizeObserver.observe(host)
    queueResize()

    let animationFrameId = 0
    const render = () => {
      controls.update()
      renderer.render(scene, camera)
      updateAxisLabels(camera, renderWidth, renderHeight)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      if (resizeFrameId !== 0) {
        window.cancelAnimationFrame(resizeFrameId)
      }
      resizeObserver.disconnect()
      controls.dispose()
      disposeObjectTree(frame)
      disposeObjectTree(solid)
      renderer.dispose()
      ColorManagement.workingColorSpace = previousWorkingColorSpace
    }
  }, [
    gamutRendering.actualOutput.id,
    axisLabels,
    mesh,
    model.id,
    resolvedTheme,
    showWireframe,
  ])

  return (
    <div
      ref={hostRef}
      className={cn(
        "relative min-h-[320px] overflow-hidden rounded-md border border-border bg-background shadow-sm md:min-h-[520px]",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        aria-label={`${model.name} solid color space model`}
        className="block size-full"
      />
      <ColorSpaceAxisLabelLayer
        labelLayerRef={labelLayerRef}
        labels={axisLabels}
      />
      <div className="pointer-events-none absolute top-3 left-3 hidden max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 lg:flex">
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-foreground shadow-sm backdrop-blur">
          {mesh.vertexCount.toLocaleString()} vertices
        </span>
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-foreground shadow-sm backdrop-blur">
          {mesh.triangleCount.toLocaleString()} triangles
        </span>
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-muted-foreground shadow-sm backdrop-blur">
          {gamutRenderLabel}
        </span>
      </div>
    </div>
  )
}
