export type PlaygroundDirection = "prev" | "next"

export type PlaygroundTransitionState = {
  readonly phase: "idle" | "exiting"
  readonly direction: PlaygroundDirection | null
}

export type PlaygroundHistoryState = Readonly<Record<string, unknown>>

type PlaygroundMotionTarget =
  | false
  | {
      readonly x: number
      readonly opacity: number
    }

const PLAYGROUND_DIRECTION_QUERY_KEY = "playground-direction"
const PLAYGROUND_GROUP_ANIMATION_QUERY_KEY = "playground-group-animation"
const PLAYGROUND_EXIT_TRANSITION_OFFSET_PX = 24
const PLAYGROUND_ENTER_TRANSITION_OFFSET_PX = 48
const PLAYGROUND_GROUP_ENTER_OFFSET_PX = 24

export const PLAYGROUND_ROUTE_MOTION = {
  exitSkipThresholdMs: 150,
  exitTransitionDurationSeconds: 0.05,
  enterTransitionDurationSeconds: 0.1,
  groupEnterDurationSeconds: 0.16,
  groupColumnDelaySeconds: 0.05,
  groupRowDelaySeconds: 0.025,
  exitXTransitionEase: [0, 0.5, 0, 1],
  enterXTransitionEase: [0, 0.5, 0, 1],
  exitOpacityTransitionEase: [0.35, 0.35, 0.65, 0.65],
  enterOpacityTransitionEase: [0.35, 0.35, 0.65, 0.65],
} as const

let nextPlaygroundHistoryIndex = 0
let lastSeenPlaygroundHistoryIndex: number | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isPlaygroundDirection(
  value: string | null
): value is PlaygroundDirection {
  return value === "prev" || value === "next"
}

export function readCurrentPlaygroundDirection(): PlaygroundDirection | null {
  const url = new URL(window.location.href)
  const direction = url.searchParams.get(PLAYGROUND_DIRECTION_QUERY_KEY)

  return isPlaygroundDirection(direction) ? direction : null
}

function readShouldSkipPlaygroundGroupAnimation() {
  const url = new URL(window.location.href)

  return url.searchParams.get(PLAYGROUND_GROUP_ANIMATION_QUERY_KEY) === "skip"
}

function readPlaygroundHistoryState(): PlaygroundHistoryState {
  const currentState: unknown = window.history.state

  return isRecord(currentState) ? currentState : {}
}

function readPlaygroundHistoryIndex(state: PlaygroundHistoryState) {
  const historyIndex = state["playgroundHistoryIndex"]

  return typeof historyIndex === "number" ? historyIndex : null
}

export function ensureCurrentPlaygroundHistoryIndex() {
  const currentState = readPlaygroundHistoryState()
  const currentHistoryIndex = readPlaygroundHistoryIndex(currentState)

  if (currentHistoryIndex !== null) {
    nextPlaygroundHistoryIndex = Math.max(
      nextPlaygroundHistoryIndex,
      currentHistoryIndex + 1
    )

    return currentHistoryIndex
  }

  const historyIndex = nextPlaygroundHistoryIndex
  nextPlaygroundHistoryIndex += 1

  window.history.replaceState(
    {
      ...currentState,
      playgroundHistoryIndex: historyIndex,
    },
    "",
    window.location.href
  )

  return historyIndex
}

export function getNextPlaygroundHistoryIndex() {
  const historyIndex = nextPlaygroundHistoryIndex
  nextPlaygroundHistoryIndex += 1

  return historyIndex
}

export function createPlaygroundHistoryState(
  previousState: unknown,
  playgroundHistoryIndex: number
): PlaygroundHistoryState {
  const previousRecord = isRecord(previousState) ? previousState : {}

  return {
    ...previousRecord,
    playgroundHistoryIndex,
  }
}

export function preservePlaygroundHistoryState(
  previousState: unknown
): PlaygroundHistoryState {
  return isRecord(previousState) ? previousState : {}
}

export function buildPlaygroundRouteHref(
  path: string,
  direction: PlaygroundDirection,
  shouldSkipGroups = false
) {
  const url = new URL(path, window.location.origin)

  url.searchParams.set(PLAYGROUND_DIRECTION_QUERY_KEY, direction)

  if (shouldSkipGroups) {
    url.searchParams.set(PLAYGROUND_GROUP_ANIMATION_QUERY_KEY, "skip")
  } else {
    url.searchParams.delete(PLAYGROUND_GROUP_ANIMATION_QUERY_KEY)
  }

  return `${url.pathname}${url.search}${url.hash}`
}

export function getPlaygroundCurrentHrefWithoutDirection() {
  const url = new URL(window.location.href)

  url.searchParams.delete(PLAYGROUND_DIRECTION_QUERY_KEY)
  url.searchParams.delete(PLAYGROUND_GROUP_ANIMATION_QUERY_KEY)

  return `${url.pathname}${url.search}${url.hash}`
}

export function getPlaygroundEntryDirection() {
  const directionFromQuery = readCurrentPlaygroundDirection()

  if (directionFromQuery) {
    return directionFromQuery
  }

  const currentHistoryIndex = readPlaygroundHistoryIndex(
    readPlaygroundHistoryState()
  )

  if (currentHistoryIndex === null || lastSeenPlaygroundHistoryIndex === null) {
    return null
  }

  if (currentHistoryIndex === lastSeenPlaygroundHistoryIndex) {
    return null
  }

  return currentHistoryIndex > lastSeenPlaygroundHistoryIndex ? "next" : "prev"
}

export function rememberLastSeenPlaygroundHistoryIndex(historyIndex: number) {
  lastSeenPlaygroundHistoryIndex = historyIndex
}

export function getShouldAnimatePlaygroundGroups(
  direction: PlaygroundDirection | null
) {
  if (readShouldSkipPlaygroundGroupAnimation()) {
    return false
  }

  if (direction === "next" && !readCurrentPlaygroundDirection()) {
    return false
  }

  return direction !== null
}

export function getPlaygroundEnterAnimation(
  direction: PlaygroundDirection | null
): PlaygroundMotionTarget {
  if (direction === "next") {
    return { x: PLAYGROUND_ENTER_TRANSITION_OFFSET_PX, opacity: 0 }
  }

  if (direction === "prev") {
    return { x: -PLAYGROUND_ENTER_TRANSITION_OFFSET_PX, opacity: 0 }
  }

  return false
}

export function getPlaygroundAnimateState(
  transitionState: PlaygroundTransitionState
) {
  if (transitionState.phase === "exiting" && transitionState.direction) {
    return {
      x:
        transitionState.direction === "next"
          ? -PLAYGROUND_EXIT_TRANSITION_OFFSET_PX
          : PLAYGROUND_EXIT_TRANSITION_OFFSET_PX,
      opacity: 0,
    }
  }

  return { x: 0, opacity: 1 }
}

export function getPlaygroundGroupEnterAnimation(
  direction: PlaygroundDirection | null
): PlaygroundMotionTarget {
  if (direction === "next") {
    return { x: PLAYGROUND_GROUP_ENTER_OFFSET_PX, opacity: 0 }
  }

  if (direction === "prev") {
    return { x: -PLAYGROUND_GROUP_ENTER_OFFSET_PX, opacity: 0 }
  }

  return false
}
