import { CanvasTexture, Sprite, SpriteMaterial } from "three"

import type { XyzPoint } from "@/color-models/cie-xyz-gamut-space"

export function createCieXyzTextLabel({
  color,
  label,
  position,
}: {
  readonly color: string
  readonly label: string
  readonly position: XyzPoint
}) {
  const canvas = document.createElement("canvas")
  canvas.width = 128
  canvas.height = 64
  const context = canvas.getContext("2d")

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = color
    context.font = "600 24px ui-monospace, SFMono-Regular, Menlo, monospace"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(label, canvas.width / 2, canvas.height / 2)
  }

  const texture = new CanvasTexture(canvas)
  const sprite = new Sprite(
    new SpriteMaterial({
      depthTest: false,
      map: texture,
      transparent: true,
    })
  )
  sprite.position.set(position.x, position.y, position.z)
  sprite.scale.set(label.length > 1 ? 0.22 : 0.14, 0.11, 1)

  return sprite
}
