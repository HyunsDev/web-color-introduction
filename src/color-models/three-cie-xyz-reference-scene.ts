import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from "three"

import type { CieXyChartGeometry } from "@/color-models/cie-xy-chart-geometry"
import type { CieXyzReferenceMesh } from "@/color-models/cie-xyz-reference-mesh"
import { createCieXyzTextLabel } from "@/color-models/three-cie-xyz-label"
import { CIE_XYZ_SCENE_PALETTE } from "@/color-models/three-cie-xyz-palette"
import type { CieXyzSceneTheme } from "@/color-models/three-cie-xyz-palette"

function createLineSegments(
  positions: Float32Array,
  color: string,
  opacity: number
) {
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(positions, 3))

  const line = new LineSegments(
    geometry,
    new LineBasicMaterial({
      color,
      depthWrite: false,
      opacity,
      transparent: true,
    })
  )
  line.renderOrder = 2

  return line
}

function createVisibleConeObject({
  reference,
  theme,
}: {
  readonly reference: CieXyzReferenceMesh
  readonly theme: CieXyzSceneTheme
}) {
  const palette = CIE_XYZ_SCENE_PALETTE[theme]
  const group = new Group()
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    "position",
    new BufferAttribute(reference.visibleConePositions, 3)
  )
  geometry.setIndex(new BufferAttribute(reference.visibleConeIndices, 1))
  geometry.computeVertexNormals()
  group.add(
    new Mesh(
      geometry,
      new MeshBasicMaterial({
        color: palette.visibleCone,
        depthWrite: false,
        opacity: 0.14,
        side: DoubleSide,
        transparent: true,
      })
    )
  )
  group.add(
    createLineSegments(
      reference.visibleConeWireframePositions,
      palette.visibleConeWire,
      0.34
    )
  )

  return group
}

function createChromaticityColorObject(chart: CieXyChartGeometry) {
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    "position",
    new BufferAttribute(chart.colorPositions, 3)
  )
  geometry.setAttribute("color", new BufferAttribute(chart.colorRgb, 3))
  geometry.setIndex(new BufferAttribute(chart.colorIndices, 1))

  const mesh = new Mesh(
    geometry,
    new MeshBasicMaterial({
      depthWrite: false,
      opacity: 0.92,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      side: DoubleSide,
      transparent: true,
      vertexColors: true,
    })
  )
  mesh.renderOrder = 0

  return mesh
}

function createChartObject({
  chart,
  theme,
}: {
  readonly chart: CieXyChartGeometry
  readonly theme: CieXyzSceneTheme
}) {
  const palette = CIE_XYZ_SCENE_PALETTE[theme]
  const group = new Group()

  group.add(createChromaticityColorObject(chart))
  group.add(createLineSegments(chart.gridLinePositions, palette.xyGrid, 0.38))
  chart.labels.forEach((label) => {
    group.add(
      createCieXyzTextLabel({
        color: palette.textColor,
        label: label.label,
        position: label.position,
      })
    )
  })

  return group
}

export function createCieXyzReferenceObject({
  reference,
  showChromaticity,
  showVisibleCone,
  showXyChart,
  theme,
}: {
  readonly reference: CieXyzReferenceMesh
  readonly showChromaticity: boolean
  readonly showVisibleCone: boolean
  readonly showXyChart: boolean
  readonly theme: CieXyzSceneTheme
}) {
  const palette = CIE_XYZ_SCENE_PALETTE[theme]
  const group = new Group()
  const pointGeometry = new SphereGeometry(0.035, 18, 12)
  const originPoint = new Mesh(
    pointGeometry,
    new MeshBasicMaterial({ color: palette.frameColor })
  )
  const whitePoint = new Mesh(
    pointGeometry.clone(),
    new MeshBasicMaterial({ color: palette.whitePoint })
  )

  if (showVisibleCone && !showXyChart) {
    group.add(createVisibleConeObject({ reference, theme }))
  }

  if (showChromaticity) {
    const chart = showXyChart ? reference.xyChart : reference.chromaticityChart

    group.add(createChartObject({ chart, theme }))
    group.add(
      createLineSegments(chart.locusPositions, palette.spectralLocus, 0.9)
    )
    group.add(
      createLineSegments(
        chart.purpleBoundaryPositions,
        palette.purpleBoundary,
        0.88
      )
    )
    whitePoint.position.set(
      chart.whitePointPosition[0] ?? 0,
      chart.whitePointPosition[1] ?? 0,
      chart.whitePointPosition[2] ?? 0
    )
    group.add(whitePoint)
  }

  originPoint.position.set(
    reference.originPosition[0] ?? -1,
    reference.originPosition[1] ?? -1,
    reference.originPosition[2] ?? -1
  )
  if (!showXyChart) {
    group.add(originPoint)
  }

  return group
}
