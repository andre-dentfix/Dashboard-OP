export function DashboardReact() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            SGQ • PCP • Produção
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Dashboard de OPs e Não Conformidades
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Painel em React/Next.js para acompanhamento de Ordens de Produção,
            conformidade, não conformidades por setor e indicadores mensais.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold">Migração em andamento</h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Esta nova página será usada para migrar o dashboard atual em HTML
            para uma estrutura React mais organizada, escalável e fácil de
            manter.
          </p>
        </section>
      </div>
    </main>
  )
}
