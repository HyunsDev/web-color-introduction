import { createContext, useContext } from "react"
import type { Dispatch, SetStateAction } from "react"

import type {
  PlaygroundDirection,
  PlaygroundTransitionState,
} from "@/playground/playground-route-motion"

export type PlaygroundTransitionContextValue = {
  readonly transitionState: PlaygroundTransitionState
  readonly setTransitionState: Dispatch<
    SetStateAction<PlaygroundTransitionState>
  >
  readonly entryDirection: PlaygroundDirection | null
  readonly shouldAnimateGroups: boolean
}

class PlaygroundContextError extends Error {
  constructor() {
    super("Playground transition context is missing.")
    this.name = "PlaygroundContextError"
  }
}

export const PlaygroundTransitionContext =
  createContext<PlaygroundTransitionContextValue | null>(null)

export function usePlaygroundTransitionContext() {
  const context = useContext(PlaygroundTransitionContext)

  if (!context) {
    throw new PlaygroundContextError()
  }

  return context
}
