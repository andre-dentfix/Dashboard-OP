import { KpiCardReact } from "./KpiCardReact"
import { monthlyDashboardData } from "@/data/dashboardData"

export function DashboardReact() {
  const selectedMonth = monthlyDashboardData[0]
  
  const totalOps = selectedMonth.totalOps
  const conformes = selectedMonth.conformes
  const naoConformes = selectedMonth.naoConformes
  const pendentes = Math.max(totalOps - conformes - naoConformes, 0)
  
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            QUALIDADE
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Dashboard de OPs e Não Conformidades
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Painel em React/Next.js para acompanhamento de Ordens de Produção,
            conformidade, não conformidades por setor e indicadores mensais.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCardReact
          title="Total de OPs"
          value="{totalOps.toLocaleString("pt-BR")}"
          description="OPs que passaram pelo SGQ no período"
        />
      
        <KpiCardReact
          title="OPs Conformes"
          value="{conformes.toLocaleString("pt-BR")}"
          description="Ordens finalizadas sem não conformidade"
        />
      
        <KpiCardReact
          title="OPs com NC"
          value="{naoConformes.toLocaleString("pt-BR")}"
          description="Ordens finalizadas com não conformidade"
        />
      
        <KpiCardReact
          title="OPs Pendentes"
          value="{pendentes.toLocaleString("pt-BR")}"
          description="OPs que passaram pelo SGQ, mas ainda não foram fechadas"
        />
    </section>
      </div>
    </main>
  )
}
