import type { Camera } from "three"
import { Vector3 } from "three"

import type { ColorSpaceAxisLabel } from "@/color-models/color-space-axis-labels"

export function createAxisLabelProjector(
  labelLayer: HTMLDivElement,
  labels: readonly ColorSpaceAxisLabel[]
) {
  const labelElements = Array.from(
    labelLayer.querySelectorAll("[data-axis-label-index]")
  ).filter((element): element is HTMLElement => element instanceof HTMLElement)
  const projectedLabelPoint = new Vector3()

  return (camera: Camera, width: number, height: number) => {
    labels.forEach((label, index) => {
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
        ? getAxisLabelOpacity(label.kind)
        : "0"
      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    })
  }
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
