import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import type { ReactNode } from "react"

import {
  Link,
  useCanGoBack,
  useNavigate,
  useRouter,
} from "@tanstack/react-router"
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PlaygroundTransitionContext } from "@/playground/playground-route-context"
import { usePlaygroundTransitionContext } from "@/playground/playground-route-context"
import {
  PLAYGROUND_ROUTE_MOTION,
  ensureCurrentPlaygroundHistoryIndex,
  getPlaygroundAnimateState,
  getPlaygroundCurrentHrefWithoutDirection,
  getPlaygroundEnterAnimation,
  getPlaygroundEntryDirection,
  getShouldAnimatePlaygroundGroups,
  preservePlaygroundHistoryState,
  readCurrentPlaygroundDirection,
  rememberLastSeenPlaygroundHistoryIndex,
} from "@/playground/playground-route-motion"
import type { PlaygroundTransitionState } from "@/playground/playground-route-motion"

function PlaygroundNavigationTools() {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const canGoForward = useSyncExternalStore(
    router.history.subscribe,
    () => router.history.location.state.__TSR_index < router.history.length - 1
  )

  return (
    <ButtonGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => router.history.back()}
            disabled={!canGoBack}
          >
            <ArrowLeftIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Back</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon-sm" variant="outline" asChild>
            <Link to="/">
              <HomeIcon />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Home</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => router.history.forward()}
            disabled={!canGoForward}
          >
            <ArrowRightIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Forward</TooltipContent>
      </Tooltip>
    </ButtonGroup>
  )
}

function PlaygroundIndexPageContent({
  children,
}: {
  readonly children?: ReactNode
}) {
  const navigate = useNavigate()
  const { transitionState } = usePlaygroundTransitionContext()
  const entryDirection = useMemo(() => getPlaygroundEntryDirection(), [])

  useEffect(() => {
    rememberLastSeenPlaygroundHistoryIndex(
      ensureCurrentPlaygroundHistoryIndex()
    )
  }, [])

  useEffect(() => {
    if (!readCurrentPlaygroundDirection()) {
      return
    }

    void navigate({
      href: getPlaygroundCurrentHrefWithoutDirection(),
      replace: true,
      state: preservePlaygroundHistoryState,
    })
  }, [navigate])

  return (
    <motion.div
      className="flex flex-wrap items-start justify-center gap-4"
      initial={getPlaygroundEnterAnimation(entryDirection)}
      animate={getPlaygroundAnimateState(transitionState)}
      transition={{
        x: {
          duration:
            transitionState.phase === "exiting"
              ? PLAYGROUND_ROUTE_MOTION.exitTransitionDurationSeconds
              : PLAYGROUND_ROUTE_MOTION.enterTransitionDurationSeconds,
          ease:
            transitionState.phase === "exiting"
              ? PLAYGROUND_ROUTE_MOTION.exitXTransitionEase
              : PLAYGROUND_ROUTE_MOTION.enterXTransitionEase,
        },
        opacity: {
          duration:
            transitionState.phase === "exiting"
              ? PLAYGROUND_ROUTE_MOTION.exitTransitionDurationSeconds
              : PLAYGROUND_ROUTE_MOTION.enterTransitionDurationSeconds,
          ease:
            transitionState.phase === "exiting"
              ? PLAYGROUND_ROUTE_MOTION.exitOpacityTransitionEase
              : PLAYGROUND_ROUTE_MOTION.enterOpacityTransitionEase,
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function PlaygroundIndexPage({
  children,
  description,
  title,
}: {
  readonly children?: ReactNode
  readonly description?: string
  readonly title: string
}) {
  const entryDirection = useMemo(() => getPlaygroundEntryDirection(), [])
  const shouldAnimateGroups = useMemo(
    () => getShouldAnimatePlaygroundGroups(entryDirection),
    [entryDirection]
  )
  const [transitionState, setTransitionState] =
    useState<PlaygroundTransitionState>({ phase: "idle", direction: null })
  const contextValue = useMemo(
    () => ({
      transitionState,
      setTransitionState,
      entryDirection,
      shouldAnimateGroups,
    }),
    [transitionState, setTransitionState, entryDirection, shouldAnimateGroups]
  )

  return (
    <PlaygroundTransitionContext.Provider value={contextValue}>
      <div className="bg-dot-grid flex min-h-svh flex-col bg-muted/40 text-foreground">
        <header className="flex min-h-18 shrink-0 flex-col items-center justify-center gap-1 px-4 py-3 text-center">
          <code className="text-sm font-bold">{title}</code>
          {description && (
            <p className="max-w-xl text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </header>
        <main className="flex flex-1 items-center justify-center px-6 py-10">
          <PlaygroundIndexPageContent>{children}</PlaygroundIndexPageContent>
        </main>
        <footer className="flex shrink-0 items-center justify-center px-4 py-3">
          <PlaygroundNavigationTools />
        </footer>
      </div>
    </PlaygroundTransitionContext.Provider>
  )
}
