import { useEffect, useRef } from "react"

import { formatHex } from "culori"

import { isColorInGamut } from "@/color-models/color-gamut-analysis"
import {
  getAxisValueFromRatio,
  getPlaneMarkerPosition,
  requireCoordinateAxis,
  setPlaneCoordinate,
} from "@/color-models/color-coordinate-plane-models"
import type { ColorCoordinatePlane } from "@/color-models/color-coordinate-plane-models"
import {
  readColorCoordinateAxis,
  setColorCoordinateAxis,
  toCuloriColor,
} from "@/color-models/color-coordinate-utils"
import type { ColorCoordinate } from "@/color-models/color-coordinate-utils"
import { cn } from "@/lib/utils"

const CANVAS_SIZE = 180

type ColorPlaneCanvasProps = {
  readonly className?: string
  readonly coordinate: ColorCoordinate
  readonly onChange: (coordinate: ColorCoordinate) => void
  readonly plane: ColorCoordinatePlane
}

export function ColorPlaneCanvas({
  className,
  coordinate,
  onChange,
  plane,
}: ColorPlaneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")

    if (!canvas || !context) {
      return
    }

    drawPlane(context, coordinate, plane)
  }, [coordinate, plane])

  const marker = getPlaneMarkerPosition(coordinate, plane)

  const updateFromPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const xRatio = (event.clientX - rect.left) / rect.width
    const yRatio = (event.clientY - rect.top) / rect.height

    onChange(setPlaneCoordinate(coordinate, plane, xRatio, yRatio))
  }

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-md border border-border bg-background shadow-sm",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="size-full touch-none"
        aria-label={`${plane.label} color plane`}
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
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.8)]"
        style={{
          left: `${marker.x * 100}%`,
          top: `${marker.y * 100}%`,
        }}
      />
    </div>
  )
}

function drawPlane(
  context: CanvasRenderingContext2D,
  coordinate: ColorCoordinate,
  plane: ColorCoordinatePlane
) {
  const imageData = context.createImageData(CANVAS_SIZE, CANVAS_SIZE)
  const xAxis = requireCoordinateAxis(plane.modelId, plane.xAxisId)
  const yAxis = requireCoordinateAxis(plane.modelId, plane.yAxisId)
  const fixedValue = readColorCoordinateAxis(coordinate, plane.fixedAxisId)

  for (let row = 0; row < CANVAS_SIZE; row += 1) {
    for (let column = 0; column < CANVAS_SIZE; column += 1) {
      const xRatio = column / (CANVAS_SIZE - 1)
      const yRatio = row / (CANVAS_SIZE - 1)
      const withFixed = setColorCoordinateAxis(
        coordinate,
        plane.fixedAxisId,
        fixedValue
      )
      const withX = setColorCoordinateAxis(
        withFixed,
        plane.xAxisId,
        getAxisValueFromRatio(xAxis, xRatio)
      )
      const pixelCoordinate = setColorCoordinateAxis(
        withX,
        plane.yAxisId,
        getAxisValueFromRatio(yAxis, 1 - yRatio)
      )
      const color = toCuloriColor(pixelCoordinate)
      const rgb = hexToRgb(formatHex(color))
      const offset = (row * CANVAS_SIZE + column) * 4
      const inSrgb = isColorInGamut(color, "rgb")

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
