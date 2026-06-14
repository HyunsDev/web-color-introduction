export type CanvasPixel = {
  readonly a: number
  readonly b: number
  readonly g: number
  readonly r: number
}

export type PixelDataSource = {
  readonly data: Uint8ClampedArray
  readonly height: number
  readonly width: number
}

export function samplePixel(
  source: PixelDataSource,
  x: number,
  y: number
): CanvasPixel | null {
  const column = Math.floor(x)
  const row = Math.floor(y)

  if (column < 0 || row < 0 || column >= source.width || row >= source.height) {
    return null
  }

  const offset = (row * source.width + column) * 4
  const r = source.data[offset]
  const g = source.data[offset + 1]
  const b = source.data[offset + 2]
  const a = source.data[offset + 3]

  if (
    r === undefined ||
    g === undefined ||
    b === undefined ||
    a === undefined
  ) {
    return null
  }

  return { r, g, b, a }
}

export function sampleCanvasPixel(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): CanvasPixel | null {
  const context = canvas.getContext("2d")

  if (!context) {
    return null
  }

  return samplePixel(
    context.getImageData(0, 0, canvas.width, canvas.height),
    x,
    y
  )
}
