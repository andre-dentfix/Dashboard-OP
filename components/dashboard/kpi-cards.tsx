import {
  fmtInt,
  fmtPct,
  LIMITES,
  nivelTaxa,
  sortedEntries,
  type Filters,
  type OpSummary,
  type Summary,
} from "@/lib/ops/aggregate"
import { cn } from "@/lib/utils"
import { Delta } from "./panel"

const NIVEL = {
  controlado: { label: "Controlado", cls: "bg-ok/15 text-ok", bar: "bg-ok" },
  atencao: { label: "Atenção", cls: "bg-warn/15 text-warn", bar: "bg-warn" },
  critico: { label: "Crítico", cls: "bg-nc/15 text-nc", bar: "bg-nc" },
}

export function KpiCards({
  current,
  previous,
  previousLabel,
  ops,
  opsPrevious,
  filters,
}: {
  current: Summary
  previous: Summary | null
  previousLabel?: string
  ops: OpSummary
  opsPrevious: OpSummary | null
  filters: Filters
}) {
  const nivel = NIVEL[nivelTaxa(current.taxa)]
  const vs = previous && previous.total > 0 ? ` vs ${previousLabel}` : ""
  const opsVs = opsPrevious && opsPrevious.total > 0 ? ` vs ${previousLabel}` : ""
  const pct = (n: number, d: number) => (d ? (n / d) * 100 : 0)
  const pctChange = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0)
  const primeira = pct(ops.primeira, ops.total)

  // Com um setor filtrado, o destaque passa a ser o motivo mais frequente dele.
  const [topName, topValue] = filters.setor
    ? (sortedEntries(current.motivos)[0] ?? ["—", 0])
    : (sortedEntries(current.setores)[0] ?? ["—", 0])
  const topBase = filters.setor ? current.nc : current.ocorrencias

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Kpi
        label="Total de OPs"
        accent="bg-info"
        value={fmtInt(ops.total)}
        sub={`${fmtInt(ops.passagens)} passagens pelo SGQ · ${fmtInt(ops.retrabalho)} OPs voltaram mais de uma vez`}
      >
        {opsVs && (
          <p className="mt-2 text-xs text-muted-foreground">
            <Delta value={pctChange(ops.total, opsPrevious!.total)} suffix="%" higherIsBad={false} className="text-muted-foreground" />
            {opsVs}
          </p>
        )}
      </Kpi>

      <Kpi
        label="Finalizadas (X)"
        accent="bg-ok"
        value={fmtInt(ops.finalizadas)}
        sub={`${fmtPct(pct(ops.finalizadas, ops.total))} do total`}
      >
        <p className="mt-2 text-xs">
          <span className="font-semibold text-warn tabular-nums">{fmtInt(ops.emAberto)}</span>{" "}
          <span className="text-muted-foreground">em aberto (sem X)</span>
        </p>
      </Kpi>

      <Kpi label="Aprovadas de primeira" accent="bg-ok" value={fmtPct(primeira)} sub={`${fmtInt(ops.primeira)} OPs sem nenhuma NC`}>
        {opsVs && (
          <p className="mt-2 text-xs text-muted-foreground">
            <Delta value={primeira - pct(opsPrevious!.primeira, opsPrevious!.total)} suffix=" p.p." higherIsBad={false} />
            {opsVs}
          </p>
        )}
      </Kpi>

      <Kpi
        label={filters.setor || filters.motivo ? "NCs registradas (filtro)" : "NCs registradas"}
        accent="bg-nc"
        value={fmtInt(current.nc)}
        sub={`Passagens NC · ${fmtInt(current.ocorrencias)} ocorrências em setores`}
      >
        {vs && (
          <p className="mt-2 text-xs text-muted-foreground">
            <Delta value={pctChange(current.nc, previous!.nc)} suffix="%" />
            {vs}
          </p>
        )}
      </Kpi>

      <Kpi label="Taxa de NC" accent={nivel.bar} value={fmtPct(current.taxa)} sub="NCs ÷ passagens pelo SGQ">
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", nivel.cls)}>{nivel.label}</span>
          {vs && (
            <span className="text-xs text-muted-foreground">
              <Delta value={current.taxa - previous!.taxa} suffix=" p.p." />
              {vs}
            </span>
          )}
        </div>
        <RateGauge taxa={current.taxa} />
      </Kpi>

      <Kpi
        label={filters.setor ? `Principal motivo · ${filters.setor}` : "Setor com mais NCs"}
        accent="bg-primary"
        value={topName}
        valueClassName="text-xl leading-9 truncate"
        sub={topValue ? `${fmtInt(topValue)} ocorrências · ${fmtPct(topBase ? (topValue / topBase) * 100 : 0)} do total` : "Sem ocorrências"}
      />
    </div>
  )
}

function Kpi({
  label,
  value,
  sub,
  accent,
  className,
  valueClassName,
  children,
}: {
  label: string
  value: string
  sub: string
  accent: string
  className?: string
  valueClassName?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl border bg-card p-4 shadow-xs", className)}>
      <span className={cn("absolute inset-x-0 top-0 h-0.5", accent)} />
      <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-3xl font-semibold tracking-tight tabular-nums", valueClassName)} title={value}>
        {value}
      </p>
      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{sub}</p>
      {children}
    </div>
  )
}

/** Régua 0–50% com as faixas controlado / atenção / crítico. */
function RateGauge({ taxa }: { taxa: number }) {
  const max = 50
  const pos = Math.min(taxa, max) / max
  return (
    <div className="mt-3" aria-hidden>
      <div className="relative flex h-1.5 overflow-hidden rounded-full">
        <span className="bg-ok/40" style={{ width: `${(LIMITES.controlado / max) * 100}%` }} />
        <span className="bg-warn/40" style={{ width: `${((LIMITES.atencao - LIMITES.controlado) / max) * 100}%` }} />
        <span className="flex-1 bg-nc/40" />
      </div>
      <div className="relative h-2">
        <span
          className="absolute -top-2.5 h-3.5 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
          style={{ left: `${pos * 100}%` }}
        />
      </div>
    </div>
  )
}
