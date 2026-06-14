import { useEffect, useRef } from "react"
import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import type {
  CieXyzGamutMesh,
  CieXyzReferenceMesh,
} from "@/color-models/cie-xyz-gamut-mesh"
import {
  createCieXyzGamutSceneObject,
  type CieXyzGamutVisibility,
} from "@/color-models/three-cie-xyz-gamut-scene"
import { disposeObjectTree } from "@/color-models/three-scene"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export type CieXyzViewMode = "3d" | "xy"

function setCameraPreset(camera: PerspectiveCamera, viewMode: CieXyzViewMode) {
  switch (viewMode) {
    case "3d":
      camera.position.set(3.25, 2.05, 3.45)
      camera.up.set(0, 1, 0)
      camera.lookAt(0, 0, 0)
      return
    case "xy":
      camera.position.set(2.65, 2.65, 2.65)
      camera.up.set(-0.5, 1, -0.5)
      camera.lookAt(0, 0, 0)
      return
    default:
      return assertNeverViewMode(viewMode)
  }
}

export function CieXyzGamutCanvas({
  className,
  gamutMeshes,
  reference,
  showChromaticity,
  showWireframe,
  viewMode,
  visibleGamuts,
}: {
  readonly className?: string
  readonly gamutMeshes: readonly CieXyzGamutMesh[]
  readonly reference: CieXyzReferenceMesh
  readonly showChromaticity: boolean
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
    const camera = new PerspectiveCamera(40, 1, 0.1, 100)
    setCameraPreset(camera, viewMode)

    const controls = new OrbitControls(camera, canvas)
    controls.autoRotate = viewMode === "3d"
    controls.autoRotateSpeed = 0.42
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 2.1
    controls.maxDistance = 6

    const gamutObject = createCieXyzGamutSceneObject({
      gamutMeshes,
      reference,
      showChromaticity,
      showWireframe,
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
      disposeObjectTree(gamutObject)
      renderer.dispose()
    }
  }, [
    gamutMeshes,
    reference,
    resolvedTheme,
    showChromaticity,
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
          {viewMode === "xy" ? "X + Y + Z = 1" : "XYZ volume"}
        </span>
      </div>
    </div>
  )
}

function assertNeverViewMode(viewMode: never): never {
  throw new RangeError(`Unknown CIE XYZ view mode: ${viewMode}`)
}
