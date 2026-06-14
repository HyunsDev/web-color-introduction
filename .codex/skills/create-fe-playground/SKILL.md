---
name: "create-fe-playground"
description: "Create new frontend playground or demo pages for the web-color-introduction Vite app. Use when asked to add a color-learning, UI experiment, or routed React playground page in this project."
metadata:
  author: local
  version: "1.0.0"
  argument-hint: "<route-path> <label> [index|feature]"
---

# Create FE Playground

Create a new frontend playground or demo page in the
`web-color-introduction` Vite React app. This project is not a monorepo and
does not use TanStack file-based routing.

## Before Editing

1. Read the project files that define the current app shape:
   - `package.json`
   - `src/router.tsx`
   - `src/App.tsx`
   - `src/playground/PlaygroundRoute.tsx`
   - nearby feature files under `src/color-models/` or the target feature folder
2. Check for dirty worktree changes before editing:
   - `git status --short`
3. Do not edit generated or dependency output:
   - `dist/**`
   - `.vite/**`
   - `.pnpm-store/**`
   - `node_modules/**`

## Project Shape

- App type: Vite + React + TypeScript.
- Router: manual TanStack Router tree in `src/router.tsx`.
- Main entry: `src/main.tsx`.
- Root route: `/`, currently rendered through `src/App.tsx`.
- UI: shadcn/ui components under `src/components/ui`.
- Styling: Tailwind CSS v4 through `src/index.css`.
- Alias: use `@/*` for imports from `src`.
- Icons: use `lucide-react`.
- Motion helpers: `src/playground/*`.
- Existing color-learning feature folder: `src/color-models/`.

## Page Types

### Feature Page

Use a Feature page when the route directly demonstrates a concept,
interaction, color model, UI state, or small learning module.

Expected component pattern:

```tsx
import { PaletteIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ExampleFeaturePage() {
  return (
    <main className="bg-dot-grid min-h-svh bg-muted/30 px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="rounded-md border border-border bg-background/85 p-4 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold">
            <PaletteIcon className="size-4" />
            Example
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-balance sm:text-3xl">
            Example Feature
          </h1>
        </header>

        <section className="rounded-md border border-border bg-background p-4 shadow-sm">
          <Button type="button">Try it</Button>
        </section>
      </div>
    </main>
  )
}
```

Feature page rules:

- Keep the component self-contained unless shared logic already exists nearby.
- Prefer domain folders such as `src/color-models/` for color-learning pages.
- Add focused controls and visible state for verification.
- Use `Button`, `Badge`, `Tabs`, `Slider`, `Select`, and other existing
  shadcn/ui components before introducing new primitives.
- Use lucide icons for buttons and section labels when an icon is useful.
- Keep card radius at the existing `rounded-md` style unless a nearby component
  uses something else.
- Avoid marketing-page scaffolding; build the actual interactive page.

### Playground Index Page

Use an Index page when the route is a hub that links to child demo routes.
Use the helpers from `src/playground/PlaygroundRoute.tsx`.

Expected component pattern:

```tsx
import { BlendIcon, PaletteIcon } from "lucide-react"

import {
  PlaygroundIndexPage,
  PlaygroundRouteColumn,
  PlaygroundRouteFeature,
  PlaygroundRouteGroup,
} from "@/playground/PlaygroundRoute"

export function ColorPlaygroundIndexPage() {
  return (
    <PlaygroundIndexPage
      title="Color Playground"
      description="Explore web color models through focused demos."
    >
      <PlaygroundRouteColumn>
        <PlaygroundRouteGroup name="Models" icon={PaletteIcon}>
          <PlaygroundRouteFeature
            icon={BlendIcon}
            label="Color Spaces"
            path="/color-spaces"
          />
        </PlaygroundRouteGroup>
      </PlaygroundRouteColumn>
    </PlaygroundIndexPage>
  )
}
```

Index page rules:

- Use `PlaygroundRouteFeature` for direct child demo links.
- Use `PlaygroundRouteIndex` only when linking to another hub/index page and
  the transition behavior is desired.
- Use `direction="next"` or `direction="prev"` only when the route order is
  intentionally directional.
- Do not replace the root `App` experience unless the user asks for the new
  page to become the home page.

## Manual Route Registration

This project uses manual TanStack Router routes. Register new pages in
`src/router.tsx`.

Expected route pattern:

```tsx
import { ExampleFeaturePage } from "@/color-models/ExampleFeaturePage"

const exampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/example",
  component: ExampleFeaturePage,
})

const routeTree = rootRoute.addChildren([indexRoute, exampleRoute])
```

Route rules:

- Keep `rootRoute` as the parent unless the project has already introduced a
  nested route for the requested area.
- Use route paths that start with `/`.
- Keep route variable names descriptive and unique.
- Add the new route to `rootRoute.addChildren`.
- If the new route should replace the home screen, update `src/App.tsx`
  deliberately and mention that in the final response.
- Do not create `src/routes` or TanStack file-route files unless the project has
  migrated to file-based routing.
- Do not create or edit `routeTree.gen.ts`.

## Implementation Steps

1. Determine the route path, label, page type, and feature folder from the user
   request.
2. If the route destination or page type is ambiguous, ask one concise question
   before editing.
3. Create the component file in the nearest domain folder under `src/`.
4. Register the component in `src/router.tsx` using `createRoute`.
5. Add or update an index page link only when the request includes a hub or
   visible navigation surface.
6. Preserve import grouping:
   - React and type imports
   - external packages
   - `@/*` imports
   - relative imports
7. Keep the diff focused on the new page, route registration, and required
   navigation entry.

## Validation

Run the smallest useful validation:

```sh
pnpm build
```

If the change is narrow and build is too broad, run:

```sh
pnpm typecheck
```

For UI-facing changes, start the dev server when practical:

```sh
pnpm dev
```

Then open the new route in a browser and check at desktop and mobile widths.
For 3D or canvas pages, verify that the canvas is nonblank, framed correctly,
and interactive.

## Reporting

In the final response, include:

- The new route path.
- The created or changed files.
- The validation command and result.
- Any skipped browser QA or follow-up risk.
