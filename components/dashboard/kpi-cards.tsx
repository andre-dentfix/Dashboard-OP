import { fmtInt, fmtPct, LIMITES, nivelTaxa, sortedEntries, type Filters, type Summary } from "@/lib/ops/aggregate"
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
  periodLabel,
  filters,
}: {
  current: Summary
  previous: Summary | null
  previousLabel?: string
  periodLabel: string
  filters: Filters
}) {
  const nivel = NIVEL[nivelTaxa(current.taxa)]
  const vs = previous && previous.total > 0 ? ` vs ${previousLabel}` : ""
  const pctChange = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0)

  // Com um setor filtrado, o destaque passa a ser o motivo mais frequente dele.
  const [topName, topValue] = filters.setor
    ? (sortedEntries(current.motivos)[0] ?? ["—", 0])
    : (sortedEntries(current.setores)[0] ?? ["—", 0])
  const topBase = filters.setor ? current.nc : current.ocorrencias

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Kpi label="Total de OPs" accent="bg-info" value={fmtInt(current.total)} sub={periodLabel}>
        {vs && (
          <p className="mt-2 text-xs text-muted-foreground">
            <Delta value={pctChange(current.total, previous!.total)} suffix="%" higherIsBad={false} className="text-muted-foreground" />
            {vs}
          </p>
        )}
      </Kpi>

      <Kpi
        label="OPs conformes"
        accent="bg-ok"
        value={fmtInt(current.conformes)}
        sub={`${fmtPct(current.total ? (current.conformes / current.total) * 100 : 0)} do total`}
      />

      <Kpi
        label={filters.setor || filters.motivo ? "OPs com NC (filtro)" : "OPs com NC"}
        accent="bg-nc"
        value={fmtInt(current.nc)}
        sub={`${fmtInt(current.ocorrencias)} ocorrências em setores`}
      >
        {vs && (
          <p className="mt-2 text-xs text-muted-foreground">
            <Delta value={pctChange(current.nc, previous!.nc)} suffix="%" />
            {vs}
          </p>
        )}
      </Kpi>

      <Kpi label="Taxa de NC" accent={nivel.bar} value={fmtPct(current.taxa)} sub="OPs com NC ÷ total de OPs">
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
        className="col-span-2 lg:col-span-1"
        label={filters.setor ? `Principal motivo · ${filters.setor}` : "Setor com mais NCs"}
        accent="bg-primary"
        value={topName}
        valueClassName="text-xl leading-9 truncate"
        sub={topValue ? `${fmtInt(topValue)} ocorrências · ${fmtPct(topBase ? (topValue / topBase) * 100 : 0)} do total` : "Sem ocorrências"}
      />
    </div>
  )
}

export function Kpi({
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
