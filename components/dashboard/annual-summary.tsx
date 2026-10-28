"use client"

import { fmtInt, fmtPct, nivelTaxa } from "@/lib/ops/aggregate"
import { cn } from "@/lib/utils"

export interface YearRow {
  year: string
  total: number
  conformes: number
  nc: number
  taxa: number
}

const TONE = { controlado: "text-ok", atencao: "text-warn", critico: "text-nc" }

/** Uma linha por ano: barra empilhada conformes/NC e a taxa. Clicar filtra o ano. */
export function AnnualSummary({
  rows,
  selectedYear,
  onSelectYear,
}: {
  rows: YearRow[]
  selectedYear: string
  onSelectYear: (y: string) => void
}) {
  const max = Math.max(1, ...rows.map((r) => r.total))
  return (
    <ul className="space-y-1">
      {rows.map((r) => {
        const active = selectedYear === r.year
        return (
          <li key={r.year}>
            <button
              type="button"
              onClick={() => onSelectYear(active ? "all" : r.year)}
              aria-pressed={active}
              className={cn(
                "grid w-full grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent",
                active && "bg-accent ring-1 ring-primary/50",
              )}
            >
              <span className="font-semibold tabular-nums">{r.year}</span>
              <span className="flex h-3 overflow-hidden rounded-full bg-muted" style={{ width: `${(r.total / max) * 100}%` }}>
                <span className="h-full bg-ok/60" style={{ width: `${(r.conformes / r.total) * 100}%` }} />
                <span className="h-full bg-nc" style={{ width: `${(r.nc / r.total) * 100}%` }} />
              </span>
              <span className="flex items-baseline gap-3 tabular-nums">
                <span className="text-xs text-muted-foreground">
                  {fmtInt(r.nc)} / {fmtInt(r.total)}
                </span>
                <span className={cn("w-12 text-right font-semibold", TONE[nivelTaxa(r.taxa)])}>{fmtPct(r.taxa)}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
