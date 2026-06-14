export function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
            Web Color Introduction
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
            React, Vite, TypeScript, Tailwind CSS 준비 완료
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            이 화면은 Tailwind 유틸리티 클래스가 적용되는지 바로 확인할 수 있는 기본
            프론트엔드 시작점입니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {["pnpm", "TypeScript", "Tailwind CSS"].map((label) => (
            <div
              className="rounded-lg border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/30"
              key={label}
            >
              <p className="text-sm text-slate-400">Ready</p>
              <p className="mt-2 text-xl font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

