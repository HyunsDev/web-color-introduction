import { useEffect, useMemo, useRef } from "react"
import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import type { ColorSpaceModelDefinition } from "@/color-models/color-space-models"
import { buildColorSpaceSamples } from "@/color-models/color-space-samples"
import { createModelFrame } from "@/color-models/three-frame"
import {
  createColorPointCloud,
  disposeObjectTree,
} from "@/color-models/three-scene"

export function ColorSpaceModelCanvas({
  model,
}: {
  readonly model: ColorSpaceModelDefinition
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const samples = useMemo(() => buildColorSpaceSamples(model.id), [model.id])

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current

    if (!host || !canvas) {
      return
    }

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.outputColorSpace = SRGBColorSpace
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

    const frame = createModelFrame(model.id)
    const points = createColorPointCloud(samples, model.pointSize)
    scene.add(frame)
    scene.add(points)

    const resize = () => {
      const width = Math.max(1, Math.floor(host.clientWidth))
      const height = Math.max(1, Math.floor(host.clientHeight))

      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()

    let animationFrameId = 0
    const render = () => {
      controls.update()
      renderer.render(scene, camera)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      controls.dispose()
      disposeObjectTree(frame)
      disposeObjectTree(points)
      renderer.dispose()
    }
  }, [model.id, model.pointSize, samples])

  return (
    <div
      ref={hostRef}
      className="relative min-h-[320px] overflow-hidden rounded-md border border-border bg-background shadow-sm md:min-h-[520px]"
    >
      <canvas
        ref={canvasRef}
        aria-label={`${model.name} color space 3D model`}
        className="block size-full"
      />
      <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-foreground shadow-sm backdrop-blur">
          {samples.length.toLocaleString()} samples
        </span>
        <span className="rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[0.65rem] text-muted-foreground shadow-sm backdrop-blur">
          {model.geometry}
        </span>
      </div>
    </div>
  )
}
