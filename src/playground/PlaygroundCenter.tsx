import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { PlaygroundTools } from "@/playground/PlaygroundIndexPage"

export function PlaygroundCenter({
  children,
  className,
  description,
  title,
  width = "400px",
}: {
  readonly children?: ReactNode
  readonly className?: string
  readonly description?: ReactNode
  readonly title?: ReactNode
  readonly width?: string
}) {
  return (
    <div
      className={cn(
        "bg-dot-grid flex min-h-svh flex-col items-center bg-muted/40 text-foreground",
        className
      )}
    >
      <header className="flex min-h-18 shrink-0 flex-col items-center justify-center gap-1 px-4 py-3 text-center">
        {title && <code className="text-sm font-bold">{title}</code>}
        {description && (
          <p className="max-w-xl text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full" style={{ width }}>
          {children}
        </div>
      </main>
      <footer className="flex shrink-0 items-center justify-center px-4 py-3">
        <PlaygroundTools />
      </footer>
    </div>
  )
}
