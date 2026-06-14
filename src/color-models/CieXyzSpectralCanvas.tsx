import { useEffect, useRef } from "react"
import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import type { CieXyzSpectralMesh } from "@/color-models/cie-xyz-spectral-mesh"
import {
  createCieXyzSpectralSceneObject,
  type CieXyzSpectralSceneMode,
} from "@/color-models/three-cie-xyz-spectral-scene"
import { disposeObjectTree } from "@/color-models/three-scene"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

function getCameraTarget(mode: CieXyzSpectralSceneMode) {
  switch (mode) {
    case "projection":
      return new Vector3(0.46, 0.42, 0.62)
    case "xyz":
      return new Vector3(0.58, 0.42, 0.74)
    default:
      return assertNeverMode(mode)
  }
}

function createCamera(mode: CieXyzSpectralSceneMode) {
  const camera = new PerspectiveCamera(42, 1, 0.05, 100)
  const target = getCameraTarget(mode)

  switch (mode) {
    case "projection":
      camera.position.set(3.1, 2.2, 3.45)
      break
    case "xyz":
      camera.position.set(2.9, 2.05, 3.55)
      break
    default:
      return assertNeverMode(mode)
  }

  camera.up.set(0, 1, 0)
  camera.lookAt(target)

  return camera
}

export function CieXyzSpectralCanvas({
  className,
  mesh,
  mode,
}: {
  readonly className?: string
  readonly mesh: CieXyzSpectralMesh
  readonly mode: CieXyzSpectralSceneMode
}) {
  const { resolvedTheme } = useTheme()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current

    if (!host || !canvas) {
      return
    }

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new Scene()
    const camera = createCamera(mode)
    const controls = new OrbitControls(camera, canvas)
    controls.target.copy(getCameraTarget(mode))
    controls.autoRotate = true
    controls.autoRotateSpeed = mode === "projection" ? 0.34 : 0.42
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableRotate = true
    controls.minDistance = 1.7
    controls.maxDistance = 6.5

    const sceneObject = createCieXyzSpectralSceneObject({
      mesh,
      mode,
      theme: resolvedTheme,
    })
    const keyLight = new DirectionalLight("#ffffff", 1.05)
    keyLight.position.set(3, 4, 5)
    scene.add(new AmbientLight("#ffffff", 1.9))
    scene.add(keyLight)
    scene.add(sceneObject)

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
      disposeObjectTree(sceneObject)
      renderer.dispose()
    }
  }, [mesh, mode, resolvedTheme])

  return (
    <div
      ref={hostRef}
      className={cn("relative min-h-[360px] overflow-hidden", className)}
    >
      <canvas
        ref={canvasRef}
        aria-label="CIE 1931 XYZ spectral model"
        className="block size-full"
      />
      <div className="pointer-events-none absolute top-3 left-3 hidden flex-wrap items-center gap-2 lg:flex">
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-foreground shadow-sm backdrop-blur">
          CIE 1931 2deg CMF
        </span>
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-muted-foreground shadow-sm backdrop-blur">
          {mode === "projection" ? "XYZ -> X+Y+Z=1" : "raw X/Y/Z axes"}
        </span>
      </div>
    </div>
  )
}

function assertNeverMode(mode: never): never {
  throw new RangeError(`Unknown CIE XYZ spectral canvas mode: ${mode}`)
}
