import { useMemo, useState } from "react"
import {
  CheckIcon,
  Code2Icon,
  CopyIcon,
  FlaskConicalIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { formatHex } from "culori"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getColorGamutChecks } from "@/color-models/color-gamut-analysis"
import {
  createCssNotationRows,
  CSS_COLOR_PRESETS,
  parseCssColorInput,
} from "@/color-models/css-color-notation-models"
import type { CssNotationRow } from "@/color-models/css-color-notation-models"
import { cn } from "@/lib/utils"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"
import { PlaygroundStage } from "@/playground/PlaygroundRoute"

const DEFAULT_COLOR_INPUT = "oklch(70% 0.18 32)"

export function CssColorNotationPage() {
  const [inputValue, setInputValue] = useState(DEFAULT_COLOR_INPUT)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const parsed = parseCssColorInput(inputValue)
  const rows = useMemo(
    () =>
      parsed.status === "parsed" ? createCssNotationRows(parsed.color) : [],
    [parsed]
  )
  const gamutChecks =
    parsed.status === "parsed" ? getColorGamutChecks(parsed.color) : []
  const pickerValue =
    parsed.status === "parsed" ? formatHex(parsed.color) : "#000000"

  function handleCopy(row: CssNotationRow) {
    setCopiedId(row.id)

    if (navigator.clipboard) {
      void navigator.clipboard.writeText(row.value)
    }
  }

  return (
    <PlaygroundStage
      topStart={
        <div className="max-w-sm rounded-md border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
          <code className="flex items-center gap-2 text-sm font-bold">
            <FlaskConicalIcon className="size-4" />
            CSS 색상 표기 실험실
          </code>
          <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">
            하나의 색을 hex, rgb, hsl, lab, lch, oklab, oklch, display-p3
            문법으로 나란히 변환합니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              variant={parsed.status === "parsed" ? "secondary" : "destructive"}
            >
              {parsed.status === "parsed" ? "parsed" : "invalid"}
            </Badge>
            {gamutChecks.map((check) => (
              <Badge
                key={check.gamut}
                variant={check.inGamut ? "outline" : "secondary"}
              >
                {check.label}: {check.inGamut ? "in" : "out"}
              </Badge>
            ))}
          </div>
        </div>
      }
      topEnd={
        <div className="grid w-full max-w-[min(100%,42rem)] gap-3 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur">
          <label className="grid gap-1.5 text-xs">
            <span className="font-medium">CSS color input</span>
            <span className="grid grid-cols-[2.75rem_1fr] gap-2">
              <input
                type="color"
                value={pickerValue}
                className="h-10 w-11 rounded-md border border-border bg-transparent p-1"
                aria-label="CSS color picker"
                onChange={(event) => setInputValue(event.currentTarget.value)}
              />
              <input
                value={inputValue}
                className={cn(
                  "h-10 min-w-0 rounded-md border border-input bg-background px-3 font-mono text-xs ring-offset-background transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  parsed.status === "invalid" &&
                    "border-destructive text-destructive"
                )}
                aria-label="CSS color text input"
                onChange={(event) => setInputValue(event.currentTarget.value)}
              />
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {CSS_COLOR_PRESETS.map((preset) => (
              <PresetButton
                key={preset}
                preset={preset}
                onSelect={setInputValue}
              />
            ))}
          </div>
        </div>
      }
      bottomEnd={
        <div className="hidden sm:block">
          <PlaygroundTools />
        </div>
      }
    >
      <div className="flex size-full items-start justify-center px-4 pt-[22rem] pb-56 sm:px-8 sm:pt-72 lg:pt-60">
        <div className="grid w-full max-w-4xl gap-3">
          {parsed.status === "invalid" ? (
            <InvalidColorPanel />
          ) : (
            rows.map((row) => (
              <NotationRow
                key={row.id}
                row={row}
                copied={copiedId === row.id}
                onCopy={handleCopy}
              />
            ))
          )}
        </div>
      </div>
    </PlaygroundStage>
  )
}

type PresetButtonProps = {
  readonly onSelect: (value: string) => void
  readonly preset: string
}

function PresetButton({ onSelect, preset }: PresetButtonProps) {
  const parsedPreset = parseCssColorInput(preset)
  const swatchColor =
    parsedPreset.status === "parsed" ? formatHex(parsedPreset.color) : "#000000"

  return (
    <Button
      type="button"
      variant="outline"
      className="min-w-0 justify-start gap-2 overflow-hidden text-xs"
      onClick={() => onSelect(preset)}
    >
      <span
        className="size-4 shrink-0 rounded-sm border border-border"
        style={{ backgroundColor: swatchColor }}
      />
      <span className="truncate">{preset}</span>
    </Button>
  )
}

type NotationRowProps = {
  readonly copied: boolean
  readonly onCopy: (row: CssNotationRow) => void
  readonly row: CssNotationRow
}

function NotationRow({ copied, onCopy, row }: NotationRowProps) {
  const CopyStateIcon = copied ? CheckIcon : CopyIcon

  return (
    <section className="grid gap-2 rounded-md border border-border bg-background/92 p-3 shadow-sm backdrop-blur sm:grid-cols-[8rem_1fr_auto] sm:items-center">
      <code className="flex items-center gap-2 text-sm font-bold">
        <Code2Icon className="size-4" />
        {row.label}
      </code>
      <code className="min-w-0 rounded-md bg-muted/60 px-3 py-2 text-xs leading-5 break-all whitespace-pre-wrap">
        {row.value}
      </code>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={() => onCopy(row)}
      >
        <CopyStateIcon className="size-4" />
        {copied ? "Copied" : "Copy"}
      </Button>
    </section>
  )
}

function InvalidColorPanel() {
  return (
    <div className="rounded-md border border-destructive/40 bg-background/92 p-4 text-sm shadow-sm backdrop-blur">
      <code className="flex items-center gap-2 font-bold text-destructive">
        <TriangleAlertIcon className="size-4" />
        파싱할 수 없는 CSS 색상입니다.
      </code>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        예: <code>#ff5a3d</code>, <code>rgb(255 90 61)</code>,{" "}
        <code>oklch(70% 0.18 32)</code>,{" "}
        <code>color(display-p3 1 0.45 0.12)</code>
      </p>
    </div>
  )
}
