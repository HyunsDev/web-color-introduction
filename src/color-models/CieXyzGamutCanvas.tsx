import { useEffect, useRef } from "react"
import {
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import type { CieXyzGamutMesh } from "@/color-models/cie-xyz-gamut-mesh"
import type { CieXyzReferenceMesh } from "@/color-models/cie-xyz-reference-mesh"
import {
  createCieXyzGamutSceneObject,
  type CieXyzGamutVisibility,
} from "@/color-models/three-cie-xyz-gamut-scene"
import { disposeObjectTree } from "@/color-models/three-scene"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export type CieXyzViewMode = "3d" | "xy"

function getCameraTarget(viewMode: CieXyzViewMode) {
  switch (viewMode) {
    case "3d":
      return new Vector3(0, 0, 0)
    case "xy":
      return new Vector3(-0.45, 0, 0)
    default:
      return assertNeverViewMode(viewMode)
  }
}

function createCamera(viewMode: CieXyzViewMode) {
  const target = getCameraTarget(viewMode)

  switch (viewMode) {
    case "3d": {
      const camera = new PerspectiveCamera(40, 1, 0.1, 100)

      camera.position.set(3.25, 2.05, 3.45)
      camera.up.set(0, 1, 0)
      camera.lookAt(target)

      return camera
    }
    case "xy": {
      const camera = new OrthographicCamera(-2.5, 2.5, 2.25, -2.25, 0.1, 100)

      camera.position.set(target.x, target.y, 5)
      camera.up.set(0, 1, 0)
      camera.lookAt(target)

      return camera
    }
    default:
      return assertNeverViewMode(viewMode)
  }
}

export function CieXyzGamutCanvas({
  className,
  gamutMeshes,
  reference,
  showChromaticity,
  showVisibleCone,
  showWireframe,
  viewMode,
  visibleGamuts,
}: {
  readonly className?: string
  readonly gamutMeshes: readonly CieXyzGamutMesh[]
  readonly reference: CieXyzReferenceMesh
  readonly showChromaticity: boolean
  readonly showVisibleCone: boolean
  readonly showWireframe: boolean
  readonly viewMode: CieXyzViewMode
  readonly visibleGamuts: CieXyzGamutVisibility
}) {
  const { resolvedTheme } = useTheme()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const visibleCount = gamutMeshes.filter(
    (mesh) => visibleGamuts[mesh.id]
  ).length

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current

    if (!host || !canvas) {
      return
    }

    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new Scene()
    const camera = createCamera(viewMode)

    const controls = new OrbitControls(camera, canvas)
    controls.target.copy(getCameraTarget(viewMode))
    controls.autoRotate = viewMode === "3d"
    controls.autoRotateSpeed = 0.42
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableRotate = viewMode === "3d"
    controls.minDistance = 2.1
    controls.maxDistance = viewMode === "xy" ? 10 : 6

    const gamutObject = createCieXyzGamutSceneObject({
      gamutMeshes,
      reference,
      showChromaticity,
      showVisibleCone,
      showWireframe,
      showXyChart: viewMode === "xy",
      theme: resolvedTheme,
      visibleGamuts,
    })
    const keyLight = new DirectionalLight("#ffffff", 1.1)
    keyLight.position.set(3, 4, 5)
    scene.add(new AmbientLight("#ffffff", 1.8))
    scene.add(keyLight)
    scene.add(gamutObject)

    let resizeFrameId = 0
    const resize = () => {
      resizeFrameId = 0
      const width = Math.max(1, Math.floor(host.clientWidth))
      const height = Math.max(1, Math.floor(host.clientHeight))

      renderer.setSize(width, height, false)
      if (camera instanceof PerspectiveCamera) {
        camera.aspect = width / height
      } else {
        const aspect = width / height
        const viewWidth = 4.9
        const viewHeight = Math.max(4.5, viewWidth / aspect)

        camera.left = (-viewHeight * aspect) / 2
        camera.right = (viewHeight * aspect) / 2
        camera.top = viewHeight / 2
        camera.bottom = -viewHeight / 2
      }
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
      disposeObjectTree(gamutObject)
      renderer.dispose()
    }
  }, [
    gamutMeshes,
    reference,
    resolvedTheme,
    showChromaticity,
    showVisibleCone,
    showWireframe,
    viewMode,
    visibleGamuts,
  ])

  return (
    <div
      ref={hostRef}
      className={cn("relative min-h-[360px] overflow-hidden", className)}
    >
      <canvas
        ref={canvasRef}
        aria-label="CIE 1931 XYZ 3D gamut model"
        className="block size-full"
      />
      <div className="pointer-events-none absolute top-3 left-3 hidden flex-wrap items-center gap-2 lg:flex">
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-foreground shadow-sm backdrop-blur">
          {visibleCount} gamuts
        </span>
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-muted-foreground shadow-sm backdrop-blur">
          {showVisibleCone && visibleCount === 0
            ? "visible cone"
            : viewMode === "xy"
              ? "x: 0-0.9 / y: 0-0.8"
              : "XYZ volume"}
        </span>
      </div>
    </div>
  )
}

function assertNeverViewMode(viewMode: never): never {
  throw new RangeError(`Unknown CIE XYZ view mode: ${viewMode}`)
}
