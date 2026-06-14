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
  const samples = useMemo(
    () =>
      buildColorSpaceSamples(
        model.id,
        gamutRendering.mode.id,
        gamutRendering.actualOutput.id
      ),
    [gamutRendering.actualOutput.id, gamutRendering.mode.id, model.id]
  )
  const gamutRenderLabel = getColorGamutRenderLabel(gamutRendering)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current

    if (!host || !canvas) {
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

    let resizeFrameId = 0
    const resize = () => {
      resizeFrameId = 0
      const width = Math.max(1, Math.floor(host.clientWidth))
      const height = Math.max(1, Math.floor(host.clientHeight))

      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
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
