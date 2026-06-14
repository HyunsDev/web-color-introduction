import { CIE_D65_WHITE, CIE_XYZ_SPECTRAL_LOCUS_5NM } from "@/color-models/cie-xyz-gamut-data"
import type { CieXyzChromaticity } from "@/color-models/cie-xyz-gamut-data"
import type { ColorSampleRenderOptions } from "@/color-models/color-sample-rendering"
import {
  appendGridSurface,
  appendVertex,
  createBuilder,
  finalizeMesh,
} from "@/color-models/color-space-solid-mesh-builder"
import type { MeshBuilder } from "@/color-models/color-space-solid-mesh-builder"
import {
  toXyyCoordinateColor,
  toXyyCoordinateModelPoint,
  toXyyCoordinateXyzModelPoint,
  type XyyCoordinate,
} from "@/color-models/color-space-xyz"
import type { Vector3Point } from "@/color-models/color-space-samples"

type CieReferenceModelId = "xyy" | "xyz"

const LUMINANCE_SEGMENTS = 18
const BOUNDARY_WIREFRAME_STEP = 8

const CIE_REFERENCE_SETTINGS = {
  xyy: {
    label: "CIE 1931 visible locus extruded over Y",
    project: toXyyCoordinateModelPoint,
  },
  xyz: {
    label: "CIE 1931 visible locus transformed into XYZ",
    project: toXyyCoordinateXyzModelPoint,
  },
} satisfies Record<
  CieReferenceModelId,
  {
    readonly label: string
    readonly project: (coordinate: XyyCoordinate) => Vector3Point
  }
>

function getVisibleBoundary() {
  const boundary: CieXyzChromaticity[] = []

  CIE_XYZ_SPECTRAL_LOCUS_5NM.forEach(({ x, y }) => {
    const previous = boundary.at(-1)

    if (!previous || previous.x !== x || previous.y !== y) {
      boundary.push({ x, y })
    }
  })

  return boundary
}

function createBoundaryCoordinate(
  point: CieXyzChromaticity,
  luminance: number
): XyyCoordinate {
  return { luminance, x: point.x, y: point.y }
}

function appendCoordinateVertex(
  builder: MeshBuilder,
  coordinate: XyyCoordinate,
  project: (coordinate: XyyCoordinate) => Vector3Point,
  options: ColorSampleRenderOptions
) {
  return appendVertex(
    builder,
    project(coordinate),
    toXyyCoordinateColor(coordinate),
    options
  )
}

function appendTopFan(
  builder: MeshBuilder,
  boundary: readonly CieXyzChromaticity[],
  project: (coordinate: XyyCoordinate) => Vector3Point,
  options: ColorSampleRenderOptions
) {
  const center = appendCoordinateVertex(
    builder,
    { luminance: 1, x: CIE_D65_WHITE.x, y: CIE_D65_WHITE.y },
    project,
    options
  )
  const ring = boundary.map((point) =>
    appendCoordinateVertex(
      builder,
      createBoundaryCoordinate(point, 1),
      project,
      options
    )
  )

  ring.forEach((current, index) => {
    const next = ring[(index + 1) % ring.length]

    if (next !== undefined) {
      builder.indices.push(center, current, next)
    }
  })
}

export function buildCieReferenceSolidMesh(
  modelId: CieReferenceModelId,
  options: ColorSampleRenderOptions
) {
  const builder = createBuilder()
  const boundary = getVisibleBoundary()
  const settings = CIE_REFERENCE_SETTINGS[modelId]

  appendGridSurface(
    builder,
    LUMINANCE_SEGMENTS,
    boundary.length,
    (row, column) => {
      const luminance = row / LUMINANCE_SEGMENTS
      const point = boundary[column % boundary.length] ?? CIE_D65_WHITE

      return appendCoordinateVertex(
        builder,
        createBoundaryCoordinate(point, luminance),
        settings.project,
        options
      )
    },
    { columnStep: BOUNDARY_WIREFRAME_STEP, rowStep: 6 }
  )
  appendTopFan(builder, boundary, settings.project, options)

  return finalizeMesh(builder, settings.label)
}
