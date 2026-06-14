import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export type CiePageId = "projection" | "xy" | "xyz"

const CIE_PAGE_LINKS = [
  { id: "xy", label: "xy 색도도", path: "/cie-1931-xy" },
  { id: "xyz", label: "XYZ 3D", path: "/cie-1931-xyz" },
  { id: "projection", label: "투영 관계", path: "/cie-1931-projection" },
] as const satisfies readonly {
  readonly id: CiePageId
  readonly label: string
  readonly path: string
}[]

export function CiePageLinks({ current }: { readonly current: CiePageId }) {
  return (
    <div className="grid w-full max-w-[min(100%,42rem)] grid-cols-1 gap-2 rounded-md border border-border bg-background/90 p-3 shadow-sm backdrop-blur sm:grid-cols-3">
      {CIE_PAGE_LINKS.map((item) => (
        <Button
          key={item.id}
          asChild
          variant={item.id === current ? "default" : "outline"}
          className="h-10 justify-start px-3 text-xs"
        >
          <Link to={item.path}>{item.label}</Link>
        </Button>
      ))}
    </div>
  )
}
