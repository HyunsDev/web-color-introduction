import { useMemo } from "react"
import { ActivityIcon, Axis3DIcon, WavesIcon } from "lucide-react"

import { CiePageLinks } from "@/color-models/CiePageLinks"
import { CieXyzSpectralCanvas } from "@/color-models/CieXyzSpectralCanvas"
import { buildCieXyzSpectralMesh } from "@/color-models/cie-xyz-spectral-mesh"
import { Badge } from "@/components/ui/badge"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

function XyzAxisLegend() {
  return (
    <div className="rounded-md border border-border bg-background/90 p-2.5 shadow-sm backdrop-blur">
      <ul className="grid min-w-32 gap-1.5">
        {[
          { label: "X", value: "x_bar", color: "#ef4444" },
          { label: "Y", value: "y_bar luminance", color: "#22c55e" },
          { label: "Z", value: "z_bar", color: "#3b82f6" },
        ].map((axis) => (
          <li
            key={axis.label}
            className="grid grid-cols-[auto_1fr] items-center gap-x-2 rounded-md border border-border bg-background/75 px-2.5 py-2"
          >
            <span
              className="row-span-2 size-2 rounded-full"
              style={{ backgroundColor: axis.color }}
            />
            <span className="font-mono text-[0.62rem] leading-none text-muted-foreground">
              {axis.label}
            </span>
            <span className="mt-1 text-xs leading-none font-medium">
              {axis.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CieXyzSpectralPage() {
  const mesh = useMemo(() => buildCieXyzSpectralMesh(), [])

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold">
            <Axis3DIcon className="size-4" />
            CIE 1931 XYZ
          </div>
          <h1 className="text-xl leading-tight font-semibold tracking-normal sm:text-2xl">
            원래 XYZ colour-matching curve
          </h1>
          <p className="mt-2 hidden text-xs leading-5 text-muted-foreground sm:block">
            각 파장의 x_bar, y_bar, z_bar 값을 그대로 3D 좌표에 둔 곡선입니다.
            말발굽 그래프가 아니라 정규화 전의 XYZ 성분 크기를 보여줍니다.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <WavesIcon className="size-3" />
              360-830nm
            </Badge>
            <Badge variant="secondary">5nm samples</Badge>
            <Badge variant="outline" className="gap-1">
              <ActivityIcon className="size-3" />
              raw XYZ axes
            </Badge>
          </div>
        </div>
      }
      topEnd={<CiePageLinks current="xyz" />}
      bottomStart={<XyzAxisLegend />}
      bottomCenter={
        <div className="max-w-md rounded-md border border-border bg-background/90 p-3 text-xs leading-5 text-muted-foreground shadow-sm backdrop-blur">
          이 곡선의 한 점을 원점에서 같은 방향으로 스케일하면 같은 색도입니다.
          그 방향을 X+Y+Z=1 평면까지 정규화한 결과가 xy 말발굽입니다.
        </div>
      }
      bottomEnd={<PlaygroundTools />}
    >
      <CieXyzSpectralCanvas
        mesh={mesh}
        mode="xyz"
        className="size-full bg-background/70"
      />
    </PlaygroundStage>
  )
}
