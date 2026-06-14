import { GaugeIcon, ScanLineIcon } from "lucide-react"

import { Slider } from "@/components/ui/slider"
import { analyzeGamutClipping } from "@/color-models/color-gamut-clipping-models"
import type { GamutClippingResult } from "@/color-models/color-gamut-clipping-models"

export type ControlSliderProps = {
  readonly label: string
  readonly max: number
  readonly min: number
  readonly onChange: (value: number) => void
  readonly step: number
  readonly suffix?: string
  readonly value: number
}

export function ControlSlider({
  label,
  max,
  min,
  onChange,
  step,
  suffix = "",
  value,
}: ControlSliderProps) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium">{label}</span>
        <code>
          {Number.isInteger(value) ? value : value.toFixed(3)}
          {suffix}
        </code>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => {
          const nextValue = values[0]

          if (nextValue !== undefined) {
            onChange(nextValue)
          }
        }}
      />
    </div>
  )
}

type GamutRampProps = {
  readonly hue: number
  readonly lightness: number
  readonly result: GamutClippingResult
}

export function GamutRamp({ hue, lightness, result }: GamutRampProps) {
  const swatches = Array.from({ length: 18 }, (_, index) =>
    analyzeGamutClipping({
      targetId: result.target.id,
      lightness,
      hue,
      chroma: (index / 17) * 0.42,
    })
  )

  return (
    <section className="rounded-md border border-border bg-background/92 p-3 shadow-sm backdrop-blur">
      <code className="flex items-center gap-2 text-sm font-bold">
        <ScanLineIcon className="size-4" />
        OKLCH chroma ramp
      </code>
      <div
        className="mt-3 grid overflow-hidden rounded-md border border-border"
        style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
      >
        {swatches.map((swatch) => (
          <div
            key={swatch.sourceCss}
            className="h-16"
            style={{
              backgroundColor: swatch.sourceHex,
              backgroundImage: swatch.inTarget
                ? "none"
                : "repeating-linear-gradient(135deg, rgba(255,255,255,.34) 0 6px, rgba(0,0,0,.16) 6px 12px)",
            }}
            title={swatch.sourceCss}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        사선 패턴은 선택한 target gamut 밖의 OKLCH 좌표입니다.
      </p>
    </section>
  )
}

type ColorResultCardProps = {
  readonly color: string
  readonly css: string
  readonly subtitle: string
  readonly title: string
}

export function ColorResultCard({
  color,
  css,
  subtitle,
  title,
}: ColorResultCardProps) {
  return (
    <section className="grid gap-3 rounded-md border border-border bg-background/92 p-3 shadow-sm backdrop-blur">
      <div
        className="h-24 rounded-md border border-border"
        style={{ backgroundColor: color }}
      />
      <div>
        <code className="flex items-center gap-2 text-sm font-bold">
          <GaugeIcon className="size-4" />
          {title}
        </code>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {subtitle}
        </p>
      </div>
      <code className="min-w-0 rounded-md bg-muted/60 px-3 py-2 text-xs leading-5 break-all">
        {css}
      </code>
    </section>
  )
}
