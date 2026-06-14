import { useEffect, useRef, useState } from "react"
import type { ElementType, ReactNode } from "react"

import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePlaygroundTransitionContext } from "@/playground/playground-route-context"
import {
  PLAYGROUND_ROUTE_MOTION,
  buildPlaygroundRouteHref,
  createPlaygroundHistoryState,
  ensureCurrentPlaygroundHistoryIndex,
  getNextPlaygroundHistoryIndex,
  getPlaygroundGroupEnterAnimation,
} from "@/playground/playground-route-motion"
import type { PlaygroundDirection } from "@/playground/playground-route-motion"

export type PlaygroundFeature = {
  readonly icon: ElementType
  readonly label: string
  readonly path: string
}

export function PlaygroundRouteFeature({
  icon,
  label,
  path,
}: PlaygroundFeature) {
  const RouteIcon = icon

  return (
    <Button asChild variant="outline" className="justify-start">
      <Link to={path}>
        <RouteIcon />
        {label}
      </Link>
    </Button>
  )
}

type PlaygroundRouteIndexProps = PlaygroundFeature & {
  readonly direction?: PlaygroundDirection
}

export function PlaygroundRouteIndex({
  direction = "next",
  icon,
  label,
  path,
}: PlaygroundRouteIndexProps) {
  const RouteIcon = icon
  const [pressed, setPressed] = useState(false)
  const navigate = useNavigate()
  const navigationTimeoutRef = useRef<number | null>(null)
  const pressStartedAtRef = useRef<number | null>(null)
  const isNavigatingRef = useRef(false)
  const { transitionState, setTransitionState } =
    usePlaygroundTransitionContext()

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        window.clearTimeout(navigationTimeoutRef.current)
      }
    }
  }, [])

  const navigateToTarget = (shouldSkipGroups = false) => {
    if (isNavigatingRef.current) {
      return
    }

    isNavigatingRef.current = true
    const targetHistoryIndex = getNextPlaygroundHistoryIndex()

    void navigate({
      href: buildPlaygroundRouteHref(path, direction, shouldSkipGroups),
      state: (previousState) =>
        createPlaygroundHistoryState(previousState, targetHistoryIndex),
    })
  }

  const handleClick = () => {
    if (transitionState.phase === "exiting" || isNavigatingRef.current) {
      return
    }

    ensureCurrentPlaygroundHistoryIndex()
    setPressed(false)

    const pressStartedAt = pressStartedAtRef.current
    const heldDurationMs =
      pressStartedAt === null
        ? Number.POSITIVE_INFINITY
        : performance.now() - pressStartedAt
    pressStartedAtRef.current = null

    if (heldDurationMs < PLAYGROUND_ROUTE_MOTION.exitSkipThresholdMs) {
      navigateToTarget(true)
      return
    }

    setTransitionState({ phase: "exiting", direction })
    navigationTimeoutRef.current = window.setTimeout(() => {
      navigateToTarget(false)
    }, PLAYGROUND_ROUTE_MOTION.exitTransitionDurationSeconds * 1000)
  }

  const handlePressStart = () => {
    pressStartedAtRef.current = performance.now()
    setPressed(true)
  }
  const handlePressEnd = () => setPressed(false)
  const handlePressCancel = () => {
    pressStartedAtRef.current = null
    setPressed(false)
  }

  return (
    <Button
      type="button"
      disabled={transitionState.phase === "exiting"}
      className="group justify-between"
      onBlur={handlePressCancel}
      onClick={handleClick}
      onKeyDown={handlePressStart}
      onKeyUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onMouseUp={handlePressEnd}
      onPointerCancel={handlePressCancel}
      onPointerDown={handlePressStart}
      onPointerLeave={handlePressEnd}
      onPointerUp={handlePressEnd}
    >
      <ArrowLeftIcon
        className={cn(
          "shrink-0 transition-transform duration-200 ease-out",
          direction === "prev" && pressed && "-translate-x-1"
        )}
        style={{ opacity: direction === "next" ? "0%" : "100%" }}
      />
      <span className="flex w-full items-center justify-center gap-2">
        <RouteIcon />
        {label}
      </span>
      <ArrowRightIcon
        className={cn(
          "shrink-0 transition-transform duration-200 ease-out",
          direction === "next" && pressed && "translate-x-1"
        )}
        style={{ opacity: direction === "prev" ? "0%" : "100%" }}
      />
    </Button>
  )
}

export function PlaygroundRouteGroup({
  children,
  icon,
  name,
}: {
  readonly children: ReactNode
  readonly icon?: ElementType
  readonly name?: string
}) {
  const ListIcon = icon
  const { entryDirection, shouldAnimateGroups } =
    usePlaygroundTransitionContext()

  return (
    <motion.div
      className="flex w-[180px] flex-col"
      initial={
        shouldAnimateGroups
          ? getPlaygroundGroupEnterAnimation(entryDirection)
          : false
      }
      animate={shouldAnimateGroups ? { x: 0, opacity: 1 } : undefined}
      transition={
        shouldAnimateGroups
          ? {
              x: {
                duration: PLAYGROUND_ROUTE_MOTION.groupEnterDurationSeconds,
                ease: PLAYGROUND_ROUTE_MOTION.enterXTransitionEase,
              },
              opacity: {
                duration: PLAYGROUND_ROUTE_MOTION.groupEnterDurationSeconds,
                ease: PLAYGROUND_ROUTE_MOTION.enterOpacityTransitionEase,
              },
            }
          : undefined
      }
    >
      {name && (
        <div className="mb-4 flex items-center justify-center gap-1 text-center font-mono text-sm text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          {ListIcon && <ListIcon />}
          {name}
        </div>
      )}
      <div className="flex flex-col gap-1">{children}</div>
    </motion.div>
  )
}

export function PlaygroundRouteColumn({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <div className="flex w-[180px] flex-col justify-start gap-10">
      {children}
    </div>
  )
}
