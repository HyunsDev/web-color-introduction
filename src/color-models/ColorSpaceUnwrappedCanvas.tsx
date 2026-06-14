import { useEffect, useRef } from "react"

import { formatHex } from "culori"

import { isColorInGamut } from "@/color-models/color-gamut-analysis"
import {
  createUnwrappedColor,
  UNWRAPPED_COLOR_MODEL_BY_ID,
} from "@/color-models/color-space-unwrapped-models"
import type { UnwrappedColorModelId } from "@/color-models/color-space-unwrapped-models"
import { cn } from "@/lib/utils"

const CANVAS_WIDTH = 720
const CANVAS_HEIGHT = 460
const SHEET_TOP = 62
const SHEET_LEFT = 66
const SHEET_WIDTH = 588
const SHEET_HEIGHT = 300

type ColorSpaceUnwrappedCanvasProps = {
  readonly className?: string
  readonly fixedValue: number
  readonly modelId: UnwrappedColorModelId
}

export function ColorSpaceUnwrappedCanvas({
  className,
  fixedValue,
  modelId,
}: ColorSpaceUnwrappedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")

    if (!canvas || !context) {
      return
    }

    drawUnwrappedSpace(context, modelId, fixedValue)
  }, [fixedValue, modelId])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className={cn(
        "aspect-[36/23] w-full rounded-md border border-border bg-background shadow-sm",
        className
      )}
      aria-label={`${UNWRAPPED_COLOR_MODEL_BY_ID[modelId].label} unwrapped color space`}
    />
  )
}

function drawUnwrappedSpace(
  context: CanvasRenderingContext2D,
  modelId: UnwrappedColorModelId,
  fixedValue: number
) {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  drawSheet(context, modelId, fixedValue)
  drawGrid(context)
  drawSeamMarkers(context)
  drawGrayAxis(context, modelId, fixedValue)
  drawAxisLabels(context)
}

function drawSheet(
  context: CanvasRenderingContext2D,
  modelId: UnwrappedColorModelId,
  fixedValue: number
) {
  const imageData = context.createImageData(SHEET_WIDTH, SHEET_HEIGHT)

  for (let row = 0; row < SHEET_HEIGHT; row += 1) {
    for (let column = 0; column < SHEET_WIDTH; column += 1) {
      const hue = (column / (SHEET_WIDTH - 1)) * 360
      const radiusRatio = 1 - row / (SHEET_HEIGHT - 1)
      const color = createUnwrappedColor(modelId, hue, radiusRatio, fixedValue)
      const hex = formatHex(color)
      const rgb = hexToRgb(hex)
      const offset = (row * SHEET_WIDTH + column) * 4
      const inSrgb = isColorInGamut(color, "rgb")

      imageData.data[offset] = inSrgb ? rgb.r : 236
      imageData.data[offset + 1] = inSrgb ? rgb.g : 236
      imageData.data[offset + 2] = inSrgb ? rgb.b : 236
      imageData.data[offset + 3] = inSrgb ? 255 : 180
    }
  }

  context.putImageData(imageData, SHEET_LEFT, SHEET_TOP)
}

function drawGrid(context: CanvasRenderingContext2D) {
  context.save()
  context.strokeStyle = "rgba(15, 23, 42, 0.28)"
  context.lineWidth = 1

  for (let index = 0; index <= 6; index += 1) {
    const x = SHEET_LEFT + (SHEET_WIDTH / 6) * index
    context.beginPath()
    context.moveTo(x, SHEET_TOP)
    context.lineTo(x, SHEET_TOP + SHEET_HEIGHT)
    context.stroke()
  }

  for (let index = 0; index <= 4; index += 1) {
    const y = SHEET_TOP + (SHEET_HEIGHT / 4) * index
    context.beginPath()
    context.moveTo(SHEET_LEFT, y)
    context.lineTo(SHEET_LEFT + SHEET_WIDTH, y)
    context.stroke()
  }

  context.restore()
}

function drawSeamMarkers(context: CanvasRenderingContext2D) {
  context.save()
  context.fillStyle = "rgba(15, 23, 42, 0.88)"
  context.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace"
  context.fillText("0deg seam", SHEET_LEFT, SHEET_TOP - 12)
  context.textAlign = "right"
  context.fillText("360deg seam", SHEET_LEFT + SHEET_WIDTH, SHEET_TOP - 12)
  context.restore()
}

function drawGrayAxis(
  context: CanvasRenderingContext2D,
  modelId: UnwrappedColorModelId,
  fixedValue: number
) {
  const y = SHEET_TOP + SHEET_HEIGHT + 24
  const color = createUnwrappedColor(modelId, 0, 0, fixedValue)

  context.save()
  context.fillStyle = formatHex(color)
  context.fillRect(SHEET_LEFT, y, SHEET_WIDTH, 18)
  context.strokeStyle = "rgba(15, 23, 42, 0.28)"
  context.strokeRect(SHEET_LEFT, y, SHEET_WIDTH, 18)
  context.fillStyle = "rgba(15, 23, 42, 0.82)"
  context.font = "600 12px ui-sans-serif, system-ui, sans-serif"
  context.fillText(
    "radius 0: hue values collapse into the same gray axis",
    SHEET_LEFT,
    y + 34
  )
  context.restore()
}

function drawAxisLabels(context: CanvasRenderingContext2D) {
  context.save()
  context.fillStyle = "rgba(15, 23, 42, 0.82)"
  context.font = "600 12px ui-sans-serif, system-ui, sans-serif"
  context.fillText(
    "Hue -> X",
    SHEET_LEFT + SHEET_WIDTH / 2 - 28,
    CANVAS_HEIGHT - 18
  )
  context.translate(18, SHEET_TOP + SHEET_HEIGHT / 2 + 36)
  context.rotate(-Math.PI / 2)
  context.fillText("Saturation / Chroma -> Y", 0, 0)
  context.restore()
}

function hexToRgb(hex: string) {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  }
}
