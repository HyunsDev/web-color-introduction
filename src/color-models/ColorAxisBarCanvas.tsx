import { useEffect, useRef } from "react"

import { formatHex } from "culori"

import { isColorInGamut } from "@/color-models/color-gamut-analysis"
import {
  getCoordinateAxisRatio,
  setCoordinateAxisFromRatio,
} from "@/color-models/color-coordinate-plane-models"
import type { ColorCoordinateAxisId } from "@/color-models/color-coordinate-utils"
import { toCuloriColor } from "@/color-models/color-coordinate-utils"
import type {
  ColorCoordinate,
  ColorCoordinateModelId,
} from "@/color-models/color-coordinate-utils"
import { cn } from "@/lib/utils"

const BAR_WIDTH = 180
const BAR_HEIGHT = 26

type ColorAxisBarCanvasProps = {
  readonly axisId: ColorCoordinateAxisId
  readonly className?: string
  readonly coordinate: ColorCoordinate
  readonly modelId: ColorCoordinateModelId
  readonly onChange: (coordinate: ColorCoordinate) => void
}

export function ColorAxisBarCanvas({
  axisId,
  className,
  coordinate,
  modelId,
  onChange,
}: ColorAxisBarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")

    if (!canvas || !context) {
      return
    }

    drawAxisBar(context, coordinate, modelId, axisId)
  }, [axisId, coordinate, modelId])

  const markerRatio = getCoordinateAxisRatio(coordinate, modelId, axisId)

  const updateFromPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width

    onChange(setCoordinateAxisFromRatio(coordinate, modelId, axisId, ratio))
  }

  return (
    <div
      className={cn(
        "relative h-8 overflow-hidden rounded-md border border-border bg-background shadow-sm",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        width={BAR_WIDTH}
        height={BAR_HEIGHT}
        className="size-full touch-none"
        aria-label={`${axisId} color axis bar`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          updateFromPointer(event)
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            updateFromPointer(event)
          }
        }}
      />
      <span
        className="pointer-events-none absolute top-0 h-full w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.85)]"
        style={{ left: `${markerRatio * 100}%` }}
      />
    </div>
  )
}

function drawAxisBar(
  context: CanvasRenderingContext2D,
  coordinate: ColorCoordinate,
  modelId: ColorCoordinateModelId,
  axisId: ColorCoordinateAxisId
) {
  const imageData = context.createImageData(BAR_WIDTH, BAR_HEIGHT)

  for (let column = 0; column < BAR_WIDTH; column += 1) {
    const ratio = column / (BAR_WIDTH - 1)
    const pixelCoordinate = setCoordinateAxisFromRatio(
      coordinate,
      modelId,
      axisId,
      ratio
    )
    const color = toCuloriColor(pixelCoordinate)
    const rgb = hexToRgb(formatHex(color))
    const inSrgb = isColorInGamut(color, "rgb")

    for (let row = 0; row < BAR_HEIGHT; row += 1) {
      const offset = (row * BAR_WIDTH + column) * 4
      imageData.data[offset] = inSrgb ? rgb.r : 230
      imageData.data[offset + 1] = inSrgb ? rgb.g : 230
      imageData.data[offset + 2] = inSrgb ? rgb.b : 230
      imageData.data[offset + 3] = 255
    }
  }

  context.putImageData(imageData, 0, 0)
}

function hexToRgb(hex: string) {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  }
}
