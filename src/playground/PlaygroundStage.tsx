import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PlaygroundStageProps = {
  readonly bottomCenter?: ReactNode
  readonly bottomEnd?: ReactNode
  readonly bottomStart?: ReactNode
  readonly children: ReactNode
  readonly className?: string
  readonly endPanel?: ReactNode
  readonly mainClassName?: string
  readonly topEnd?: ReactNode
  readonly topStart?: ReactNode
}

function PlaygroundStageSlot({
  children,
  className,
}: {
  readonly children?: ReactNode
  readonly className?: string
}) {
  if (!children) {
    return null
  }

  return (
    <div className={cn("pointer-events-auto min-w-0", className)}>
      {children}
    </div>
  )
}

export function PlaygroundStage({
  bottomCenter,
  bottomEnd,
  bottomStart,
  children,
  className,
  endPanel,
  mainClassName,
  topEnd,
  topStart,
}: PlaygroundStageProps) {
  return (
    <div
      className={cn(
        "bg-dot-grid relative min-h-svh overflow-hidden bg-muted/40 text-foreground",
        className
      )}
    >
      <main className={cn("absolute inset-0 min-h-0", mainClassName)}>
        {children}
      </main>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-4">
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <PlaygroundStageSlot className="justify-self-start">
            {topStart}
          </PlaygroundStageSlot>
          <PlaygroundStageSlot className="justify-self-stretch lg:justify-self-end">
            {topEnd}
          </PlaygroundStageSlot>
        </div>

        <PlaygroundStageSlot className="hidden max-h-[calc(100svh-2rem)] w-[360px] self-end overflow-y-auto lg:block">
          {endPanel}
        </PlaygroundStageSlot>

        <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <PlaygroundStageSlot className="hidden justify-self-start lg:block">
            {bottomStart}
          </PlaygroundStageSlot>
          <PlaygroundStageSlot className="justify-self-stretch lg:col-start-2 lg:justify-self-center">
            {bottomCenter}
          </PlaygroundStageSlot>
          <PlaygroundStageSlot className="justify-self-center sm:justify-self-end lg:col-start-3">
            {bottomEnd}
          </PlaygroundStageSlot>
        </div>
      </div>
    </div>
  )
}
