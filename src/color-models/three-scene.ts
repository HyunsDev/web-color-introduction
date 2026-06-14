import {
  BufferAttribute,
  BufferGeometry,
  Line,
  LineSegments,
  Material,
  Mesh,
  Object3D,
  Points,
  PointsMaterial,
  Sprite,
  Texture,
} from "three"

import type { ColorSpaceSample } from "@/color-models/color-space-samples"

export function createColorPointCloud(
  samples: readonly ColorSpaceSample[],
  pointSize: number
) {
  const positions = new Float32Array(samples.length * 3)
  const colors = new Float32Array(samples.length * 3)

  samples.forEach((sample, index) => {
    const offset = index * 3
    positions[offset] = sample.position.x
    positions[offset + 1] = sample.position.y
    positions[offset + 2] = sample.position.z
    colors[offset] = sample.color.r
    colors[offset + 1] = sample.color.g
    colors[offset + 2] = sample.color.b
  })

  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(positions, 3))
  geometry.setAttribute("color", new BufferAttribute(colors, 3))

  const material = new PointsMaterial({
    size: pointSize,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    depthWrite: false,
  })

  return new Points(geometry, material)
}

export function disposeObjectTree(object: Object3D) {
  object.traverse((child) => {
    if (
      child instanceof Line ||
      child instanceof LineSegments ||
      child instanceof Mesh ||
      child instanceof Points ||
      child instanceof Sprite
    ) {
      child.geometry.dispose()

      if (Array.isArray(child.material)) {
        child.material.forEach(disposeMaterial)
        return
      }

      disposeMaterial(child.material)
    }
  })
}

function disposeMaterial(material: Material) {
  Object.values(material).forEach((value) => {
    if (value instanceof Texture) {
      value.dispose()
    }
  })
  material.dispose()
}
