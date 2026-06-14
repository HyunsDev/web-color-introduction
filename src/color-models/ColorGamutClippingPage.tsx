import { useMemo, useState } from "react"
import { LayersIcon, ScissorsIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ColorResultCard,
  ControlSlider,
  GamutRamp,
} from "@/color-models/ColorGamutClippingPanels"
import {
  analyzeGamutClipping,
  GAMUT_CLIPPING_TARGETS,
} from "@/color-models/color-gamut-clipping-models"
import type { GamutClippingTargetId } from "@/color-models/color-gamut-clipping-models"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

export function ColorGamutClippingPage() {
  const [targetId, setTargetId] = useState<GamutClippingTargetId>("srgb")
  const [lightness, setLightness] = useState(70)
  const [chroma, setChroma] = useState(0.32)
  const [hue, setHue] = useState(32)
  const result = useMemo(
    () => analyzeGamutClipping({ targetId, lightness, chroma, hue }),
    [chroma, hue, lightness, targetId]
  )

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <code className="flex items-center gap-2 text-sm font-bold">
            <ScissorsIcon className="size-4" />
            색역과 Clipping
          </code>
          <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">
            OKLCH chroma를 올리면 같은 색도 sRGB, Display P3, Rec.2020 경계에서
            다르게 잘리거나 gamut mapping됩니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={result.inTarget ? "secondary" : "destructive"}>
              {result.inTarget ? "inside gamut" : "out of gamut"}
            </Badge>
            <Badge variant="outline">{result.target.label}</Badge>
          </div>
        </div>
      }
      topEnd={
        <div className="grid w-full max-w-[min(100%,44rem)] gap-3 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur">
          <div className="grid grid-cols-3 gap-2">
            {GAMUT_CLIPPING_TARGETS.map((target) => (
              <Button
                key={target.id}
                type="button"
                variant={target.id === targetId ? "default" : "outline"}
                className="justify-start gap-2 text-xs"
                onClick={() => setTargetId(target.id)}
              >
                <LayersIcon className="size-4" />
                {target.label}
              </Button>
            ))}
          </div>
          <ControlSlider
            label="Lightness"
            value={lightness}
            min={35}
            max={90}
            step={1}
            suffix="%"
            onChange={setLightness}
          />
          <ControlSlider
            label="Chroma"
            value={chroma}
            min={0}
            max={0.42}
            step={0.005}
            onChange={setChroma}
          />
          <ControlSlider
            label="Hue"
            value={hue}
            min={0}
            max={360}
            step={1}
            suffix="deg"
            onChange={setHue}
          />
        </div>
      }
      bottomEnd={
        <div className="hidden sm:block">
          <PlaygroundTools />
        </div>
      }
    >
      <div className="flex size-full items-start justify-center px-4 pt-[30rem] pb-60 sm:px-8 sm:pt-72 lg:pt-64">
        <div className="grid w-full max-w-5xl gap-3">
          <GamutRamp result={result} lightness={lightness} hue={hue} />
          <div className="grid gap-3 lg:grid-cols-3">
            <ColorResultCard
              title="Original OKLCH"
              subtitle="좌표는 유지되고, 화면 preview는 현재 출력 색역에 맞게 보입니다."
              color={result.sourceHex}
              css={result.sourceCss}
            />
            <ColorResultCard
              title="Channel clipped"
              subtitle="대상 색역의 채널 범위로 값을 잘라 경계에 붙입니다."
              color={result.clippedHex}
              css={result.clippedCss}
            />
            <ColorResultCard
              title="Gamut mapped"
              subtitle="OKLCH chroma를 줄여 더 비슷한 인상으로 색역 안에 넣습니다."
              color={result.mappedHex}
              css={result.mappedCss}
            />
          </div>
        </div>
      </div>
    </PlaygroundStage>
  )
}
