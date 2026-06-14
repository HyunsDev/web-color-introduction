import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  SphereGeometry,
} from "three"

import type { CieXyChartGeometry } from "@/color-models/cie-xy-chart-geometry"
import type { CieXyzSpectralMesh } from "@/color-models/cie-xyz-spectral-mesh"
import { XYZ_AXIS_MAX } from "@/color-models/cie-xyz-spectral-mesh"
import { createCieXyzTextLabel } from "@/color-models/three-cie-xyz-label"
import { CIE_XYZ_SCENE_PALETTE } from "@/color-models/three-cie-xyz-palette"
import type { CieXyzSceneTheme } from "@/color-models/three-cie-xyz-palette"

export type CieXyzSpectralSceneMode = "projection" | "xyz"

function createLineSegments(
  positions: Float32Array,
  color: string,
  opacity: number
) {
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(positions, 3))

  return new LineSegments(
    geometry,
    new LineBasicMaterial({
      color,
      depthWrite: false,
      opacity,
      transparent: true,
    })
  )
}

function createAxes(theme: CieXyzSceneTheme) {
  const palette = CIE_XYZ_SCENE_PALETTE[theme]
  const group = new Group()

  group.add(
    createLineSegments(
      new Float32Array([0, 0, 0, XYZ_AXIS_MAX.x, 0, 0]),
      "#ef4444",
      palette.axisOpacity
    )
  )
  group.add(
    createLineSegments(
      new Float32Array([0, 0, 0, 0, XYZ_AXIS_MAX.y, 0]),
      "#22c55e",
      palette.axisOpacity
    )
  )
  group.add(
    createLineSegments(
      new Float32Array([0, 0, 0, 0, 0, XYZ_AXIS_MAX.z]),
      "#3b82f6",
      palette.axisOpacity
    )
  )
  group.add(
    createCieXyzTextLabel({
      color: "#ef4444",
      label: "X",
      position: { x: XYZ_AXIS_MAX.x + 0.08, y: 0, z: 0 },
    })
  )
  group.add(
    createCieXyzTextLabel({
      color: "#22c55e",
      label: "Y",
      position: { x: 0, y: XYZ_AXIS_MAX.y + 0.08, z: 0 },
    })
  )
  group.add(
    createCieXyzTextLabel({
      color: "#3b82f6",
      label: "Z",
      position: { x: 0, y: 0, z: XYZ_AXIS_MAX.z + 0.08 },
    })
  )

  return group
}

function createSpectralPoints(mesh: CieXyzSpectralMesh) {
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    "position",
    new BufferAttribute(mesh.spectralPointPositions, 3)
  )
  geometry.setAttribute(
    "color",
    new BufferAttribute(mesh.spectralPointColors, 3)
  )

  return new Points(
    geometry,
    new PointsMaterial({
      depthWrite: false,
      opacity: 0.96,
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      vertexColors: true,
    })
  )
}

function createChromaticitySurface(chart: CieXyChartGeometry) {
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    "position",
    new BufferAttribute(chart.colorPositions, 3)
  )
  geometry.setAttribute("color", new BufferAttribute(chart.colorRgb, 3))
  geometry.setIndex(new BufferAttribute(chart.colorIndices, 1))

  return new Mesh(
    geometry,
    new MeshBasicMaterial({
      depthWrite: false,
      opacity: 0.78,
      side: DoubleSide,
      transparent: true,
      vertexColors: true,
    })
  )
}

function createCone(mesh: CieXyzSpectralMesh, theme: CieXyzSceneTheme) {
  const palette = CIE_XYZ_SCENE_PALETTE[theme]
  const group = new Group()
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(mesh.conePositions, 3))
  geometry.setIndex(new BufferAttribute(mesh.coneIndices, 1))

  group.add(
    new Mesh(
      geometry,
      new MeshBasicMaterial({
        color: palette.visibleCone,
        depthWrite: false,
        opacity: 0.12,
        side: DoubleSide,
        transparent: true,
      })
    )
  )
  group.add(
    createLineSegments(
      mesh.coneWireframePositions,
      palette.visibleConeWire,
      0.3
    )
  )

  return group
}

function createProjectionPlane(
  mesh: CieXyzSpectralMesh,
  theme: CieXyzSceneTheme
) {
  const palette = CIE_XYZ_SCENE_PALETTE[theme]
  const chart = mesh.chromaticityPlane
  const group = new Group()
  const whitePointGeometry = new SphereGeometry(0.035, 18, 12)
  const whitePoint = new Mesh(
    whitePointGeometry,
    new MeshBasicMaterial({ color: palette.whitePoint })
  )

  group.add(createChromaticitySurface(chart))
  group.add(createLineSegments(chart.gridLinePositions, palette.xyGrid, 0.32))
  group.add(
    createLineSegments(chart.locusPositions, palette.spectralLocus, 0.86)
  )
  group.add(
    createLineSegments(
      chart.purpleBoundaryPositions,
      palette.purpleBoundary,
      0.8
    )
  )
  whitePoint.position.set(
    chart.whitePointPosition[0] ?? 0,
    chart.whitePointPosition[1] ?? 0,
    chart.whitePointPosition[2] ?? 0
  )
  group.add(whitePoint)
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

export function createCieXyzSpectralSceneObject({
  mesh,
  mode,
  theme,
}: {
  readonly mesh: CieXyzSpectralMesh
  readonly mode: CieXyzSpectralSceneMode
  readonly theme: CieXyzSceneTheme
}) {
  const palette = CIE_XYZ_SCENE_PALETTE[theme]
  const group = new Group()

  group.add(createAxes(theme))
  group.add(
    createLineSegments(mesh.spectralCurvePositions, palette.spectralLocus, 0.8)
  )
  group.add(createSpectralPoints(mesh))
  mesh.spectralLabels.forEach((label) => {
    group.add(
      createCieXyzTextLabel({
        color: palette.textColor,
        label: label.label,
        position: label.position,
      })
    )
  })

  switch (mode) {
    case "projection":
      group.add(createCone(mesh, theme))
      group.add(createProjectionPlane(mesh, theme))
      group.add(
        createLineSegments(
          mesh.normalizationLinePositions,
          palette.visibleConeWire,
          0.46
        )
      )
      return group
    case "xyz":
      return group
    default:
      return assertNeverMode(mode)
  }
}

function assertNeverMode(mode: never): never {
  throw new RangeError(`Unknown CIE XYZ spectral scene mode: ${mode}`)
}
