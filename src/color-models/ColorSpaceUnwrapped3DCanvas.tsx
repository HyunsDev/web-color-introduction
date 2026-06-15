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

import { buildUnwrappedColorSpaceMesh } from "@/color-models/color-space-unwrapped-mesh"
import { UNWRAPPED_COLOR_MODEL_BY_ID } from "@/color-models/color-space-unwrapped-models"
import type { UnwrappedColorModelId } from "@/color-models/color-space-unwrapped-models"
import {
  getThreeOutputColorSpace,
  getThreeWorkingColorSpace,
  registerWideGamutColorSpaces,
} from "@/color-models/three-color-spaces"
import {
  createUnwrappedColorSpaceObject,
  createUnwrappedReferenceFrame,
} from "@/color-models/three-unwrapped-scene"
import { disposeObjectTree } from "@/color-models/three-scene"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const BASE_CAMERA_POSITION = { x: 2.55, y: 1.8, z: 2.55 } as const
const BASE_CONTROLS_MIN_DISTANCE = 1.8
const BASE_CONTROLS_MAX_DISTANCE = 4.8

type ColorSpaceUnwrapped3DCanvasProps = {
  readonly className?: string
  readonly fixedValue: number
  readonly modelId: UnwrappedColorModelId
}

export function ColorSpaceUnwrapped3DCanvas({
  className,
  fixedValue,
  modelId,
}: ColorSpaceUnwrapped3DCanvasProps) {
  const { resolvedTheme } = useTheme()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mesh = useMemo(
    () => buildUnwrappedColorSpaceMesh(modelId, fixedValue),
    [fixedValue, modelId]
  )
  const model = UNWRAPPED_COLOR_MODEL_BY_ID[modelId]

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current

    if (!host || !canvas) {
      return
    }

    registerWideGamutColorSpaces()
    const previousWorkingColorSpace = ColorManagement.workingColorSpace
    ColorManagement.workingColorSpace = getThreeWorkingColorSpace("srgb")

    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.outputColorSpace = getThreeOutputColorSpace("srgb")
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new Scene()
    const camera = new PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(
      BASE_CAMERA_POSITION.x,
      BASE_CAMERA_POSITION.y,
      BASE_CAMERA_POSITION.z
    )
    camera.lookAt(0, 0, 0)

    const controls = new OrbitControls(camera, canvas)
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.44
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = BASE_CONTROLS_MIN_DISTANCE
    controls.maxDistance = BASE_CONTROLS_MAX_DISTANCE

    const fixedY = fixedValue * 2 - 1
    const frame = createUnwrappedReferenceFrame({
      fixedY,
      theme: resolvedTheme,
    })
    const surface = createUnwrappedColorSpaceObject({
      mesh,
      theme: resolvedTheme,
    })
    const keyLight = new DirectionalLight("#ffffff", 0.8)
    keyLight.position.set(3, 4, 5)
    scene.add(keyLight)
    scene.add(new AmbientLight("#ffffff", 1.4))
    scene.add(frame)
    scene.add(surface)

    let resizeFrameId = 0
    const resize = () => {
      resizeFrameId = 0
      const renderWidth = Math.max(1, Math.floor(host.clientWidth))
      const renderHeight = Math.max(1, Math.floor(host.clientHeight))
      const cameraScale = getCameraScale(renderWidth, renderHeight)

      renderer.setSize(renderWidth, renderHeight, false)
      camera.position.set(
        BASE_CAMERA_POSITION.x * cameraScale,
        BASE_CAMERA_POSITION.y * cameraScale,
        BASE_CAMERA_POSITION.z * cameraScale
      )
      camera.lookAt(0, 0, 0)
      controls.minDistance = BASE_CONTROLS_MIN_DISTANCE * cameraScale
      controls.maxDistance = BASE_CONTROLS_MAX_DISTANCE * cameraScale
      camera.aspect = renderWidth / renderHeight
      camera.updateProjectionMatrix()
      controls.update()
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
      disposeObjectTree(surface)
      renderer.dispose()
      ColorManagement.workingColorSpace = previousWorkingColorSpace
    }
  }, [fixedValue, mesh, resolvedTheme])

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
        aria-label={`${model.label} wrapped 3D color space slice`}
        className="block size-full"
      />
      <div className="pointer-events-none absolute top-3 left-3 hidden max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 lg:flex">
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-foreground shadow-sm backdrop-blur">
          {mesh.vertexCount.toLocaleString()} vertices
        </span>
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-muted-foreground shadow-sm backdrop-blur">
          {mesh.shapeLabel}
        </span>
      </div>
    </div>
  )
}

function getCameraScale(width: number, height: number) {
  return width < 520 || height < 420 ? 1.24 : 1
}
