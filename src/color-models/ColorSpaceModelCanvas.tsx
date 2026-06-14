import { useEffect, useMemo, useRef } from "react"
import {
  AmbientLight,
  ColorManagement,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import { getColorSpaceAxisLabels } from "@/color-models/color-space-axis-labels"
import {
  getColorGamutRenderLabel,
  type ColorGamutRendering,
} from "@/color-models/color-gamut"
import type { ColorSpaceModelDefinition } from "@/color-models/color-space-models"
import { buildColorSpaceSamples } from "@/color-models/color-space-samples"
import {
  getThreeOutputColorSpace,
  getThreeWorkingColorSpace,
  registerWideGamutColorSpaces,
} from "@/color-models/three-color-spaces"
import { createModelFrame } from "@/color-models/three-frame"
import {
  createColorPointCloud,
  disposeObjectTree,
} from "@/color-models/three-scene"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function ColorSpaceModelCanvas({
  className,
  gamutRendering,
  model,
  showHud = true,
}: {
  readonly className?: string
  readonly gamutRendering: ColorGamutRendering
  readonly model: ColorSpaceModelDefinition
  readonly showHud?: boolean
}) {
  const { resolvedTheme } = useTheme()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const labelLayerRef = useRef<HTMLDivElement | null>(null)
  const samples = useMemo(
    () =>
      buildColorSpaceSamples(
        model.id,
        gamutRendering.mode.id,
        gamutRendering.actualOutput.id
      ),
    [gamutRendering.actualOutput.id, gamutRendering.mode.id, model.id]
  )
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
    camera.position.set(3.1, 2.35, 3.1)
    camera.lookAt(0, 0, 0)

    const controls = new OrbitControls(camera, canvas)
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.75
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 2.4
    controls.maxDistance = 5.5

    const keyLight = new DirectionalLight("#ffffff", 1.3)
    keyLight.position.set(3, 4, 5)
    scene.add(keyLight)
    scene.add(new AmbientLight("#ffffff", 1.8))

    const frame = createModelFrame(model.id, resolvedTheme)
    const points = createColorPointCloud(samples, model.pointSize)
    scene.add(frame)
    scene.add(points)

    const labelElements = Array.from(
      labelLayer.querySelectorAll("[data-axis-label-index]")
    ).filter((element): element is HTMLElement => element instanceof HTMLElement)
    const projectedLabelPoint = new Vector3()

    const updateAxisLabels = (width: number, height: number) => {
      axisLabels.forEach((label, index) => {
        const element = labelElements[index]

        if (!element) {
          return
        }

        projectedLabelPoint
          .set(label.position.x, label.position.y, label.position.z)
          .project(camera)

        const isVisible =
          projectedLabelPoint.z >= -1 && projectedLabelPoint.z <= 1
        const x = clampLabelPosition(
          (projectedLabelPoint.x * 0.5 + 0.5) * width,
          element.offsetWidth,
          width
        )
        const y = clampLabelPosition(
          (-projectedLabelPoint.y * 0.5 + 0.5) * height,
          element.offsetHeight,
          height
        )

        element.style.opacity = isVisible
          ? label.kind === "axis"
            ? "1"
            : "0.78"
          : "0"
        element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      })
    }

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
      updateAxisLabels(renderWidth, renderHeight)
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
      updateAxisLabels(renderWidth, renderHeight)
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
      disposeObjectTree(points)
      renderer.dispose()
      ColorManagement.workingColorSpace = previousWorkingColorSpace
    }
  }, [
    gamutRendering.actualOutput.id,
    axisLabels,
    model.id,
    model.pointSize,
    resolvedTheme,
    samples,
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
        aria-label={`${model.name} color space 3D model`}
        className="block size-full"
      />
      <div
        ref={labelLayerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        {axisLabels.map((label, index) => (
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
      {showHud && (
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-foreground shadow-sm backdrop-blur">
            {samples.length.toLocaleString()} samples
          </span>
          <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-foreground shadow-sm backdrop-blur">
            {gamutRenderLabel}
          </span>
          <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-muted-foreground shadow-sm backdrop-blur">
            {model.geometry}
          </span>
        </div>
      )}
    </div>
  )
}

function clampLabelPosition(value: number, labelSize: number, hostSize: number) {
  const inset = labelSize / 2 + 8

  return Math.min(hostSize - inset, Math.max(inset, value))
}
