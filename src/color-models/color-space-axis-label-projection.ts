import type { Camera, Object3D } from "three"
import { Raycaster, Vector3 } from "three"

import type { ColorSpaceAxisLabel } from "@/color-models/color-space-axis-labels"

export type AxisLabelProjectorOptions = {
  readonly occluders?: Object3D[]
  readonly occludeTicksOnly?: boolean
  readonly occlusionPadding?: number
}

const DEFAULT_OCCLUSION_PADDING = 0.24

export function createAxisLabelProjector(
  labelLayer: HTMLDivElement,
  labels: readonly ColorSpaceAxisLabel[],
  options: AxisLabelProjectorOptions = {}
) {
  const labelElements = Array.from(
    labelLayer.querySelectorAll("[data-axis-label-index]")
  ).filter((element): element is HTMLElement => element instanceof HTMLElement)
  const cameraWorldPoint = new Vector3()
  const labelWorldPoint = new Vector3()
  const projectedLabelPoint = new Vector3()
  const rayDirection = new Vector3()
  const raycaster = new Raycaster()

  return (camera: Camera, width: number, height: number) => {
    camera.getWorldPosition(cameraWorldPoint)

    labels.forEach((label, index) => {
      const element = labelElements[index]

      if (!element) {
        return
      }

      projectedLabelPoint
        .set(label.position.x, label.position.y, label.position.z)
        .project(camera)

      labelWorldPoint.set(label.position.x, label.position.y, label.position.z)
      const isVisible =
        projectedLabelPoint.z >= -1 &&
        projectedLabelPoint.z <= 1 &&
        !isOccludedByModel({
          cameraWorldPoint,
          label,
          labelWorldPoint,
          occluders: options.occluders ?? [],
          occludeTicksOnly: options.occludeTicksOnly ?? false,
          occlusionPadding:
            options.occlusionPadding ?? DEFAULT_OCCLUSION_PADDING,
          rayDirection,
          raycaster,
        })
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
        ? getAxisLabelOpacity(label.kind)
        : "0"
      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    })
  }
}

function isOccludedByModel({
  cameraWorldPoint,
  label,
  labelWorldPoint,
  occluders,
  occludeTicksOnly,
  occlusionPadding,
  rayDirection,
  raycaster,
}: {
  readonly cameraWorldPoint: Vector3
  readonly label: ColorSpaceAxisLabel
  readonly labelWorldPoint: Vector3
  readonly occluders: Object3D[]
  readonly occludeTicksOnly: boolean
  readonly occlusionPadding: number
  readonly rayDirection: Vector3
  readonly raycaster: Raycaster
}) {
  if (occluders.length === 0) {
    return false
  }

  if (occludeTicksOnly && label.kind !== "tick") {
    return false
  }

  const labelDistance = cameraWorldPoint.distanceTo(labelWorldPoint)

  if (labelDistance <= occlusionPadding) {
    return false
  }

  rayDirection.subVectors(labelWorldPoint, cameraWorldPoint).normalize()
  raycaster.set(cameraWorldPoint, rayDirection)
  raycaster.near = 0
  raycaster.far = labelDistance - occlusionPadding

  return raycaster.intersectObjects(occluders, true).length > 0
}

function getAxisLabelOpacity(kind: ColorSpaceAxisLabel["kind"]) {
  switch (kind) {
    case "axis":
      return "1"
    case "tick":
      return "0.78"
    default:
      return assertNeverLabelKind(kind)
  }
}

function clampLabelPosition(value: number, labelSize: number, hostSize: number) {
  const inset = labelSize / 2 + 8

  return Math.min(hostSize - inset, Math.max(inset, value))
}

function assertNeverLabelKind(kind: never): never {
  throw new RangeError(`Unknown axis label kind: ${kind}`)
}
