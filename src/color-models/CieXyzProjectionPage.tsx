import { useMemo } from "react"
import { ArrowDownToLineIcon, ConeIcon, OrbitIcon } from "lucide-react"

import { CiePageLinks } from "@/color-models/CiePageLinks"
import { CieXyzSpectralCanvas } from "@/color-models/CieXyzSpectralCanvas"
import { buildCieXyzSpectralMesh } from "@/color-models/cie-xyz-spectral-mesh"
import { Badge } from "@/components/ui/badge"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

export function CieXyzProjectionPage() {
  const mesh = useMemo(() => buildCieXyzSpectralMesh(), [])

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold">
            <ArrowDownToLineIcon className="size-4" />
            XYZ to xy
          </div>
          <h1 className="text-xl leading-tight font-semibold tracking-normal sm:text-2xl">
            원 XYZ에서 말발굽으로 정규화
          </h1>
          <p className="mt-2 hidden text-xs leading-5 text-muted-foreground sm:block">
            원 XYZ spectral curve의 각 점을 같은 방향으로 X+Y+Z=1 평면에 맞추면
            familiar한 xy 말발굽 경계가 됩니다.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <ConeIcon className="size-3" />
              visible cone
            </Badge>
            <Badge variant="secondary">X+Y+Z=1 plane</Badge>
            <Badge variant="outline" className="gap-1">
              <OrbitIcon className="size-3" />
              drag rotate
            </Badge>
          </div>
        </div>
      }
      topEnd={<CiePageLinks current="projection" />}
      bottomStart={
        <div className="max-w-xs rounded-md border border-border bg-background/90 p-3 text-xs leading-5 text-muted-foreground shadow-sm backdrop-blur">
          선들은 같은 파장 방향의 원 XYZ 점과 정규화된 색도 평면 위치를
          연결합니다.
        </div>
      }
      bottomCenter={
        <div className="max-w-md rounded-md border border-border bg-background/90 p-3 text-xs leading-5 text-muted-foreground shadow-sm backdrop-blur">
          xy 색도도는 원 XYZ 공간의 한 단면이 아니라, 원점에서 본 방향을 X+Y+Z=1
          평면에 다시 찍은 결과입니다.
        </div>
      }
      bottomEnd={<PlaygroundTools />}
    >
      <CieXyzSpectralCanvas
        mesh={mesh}
        mode="projection"
        className="size-full bg-background/70"
      />
    </PlaygroundStage>
  )
}
