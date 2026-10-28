"use client"

import { fmtInt, fmtMonth, fmtMonthLong } from "@/lib/ops/aggregate"
import { cn } from "@/lib/utils"

/** Setores × meses: quanto mais forte a cor, mais NCs naquele setor e mês. */
export function Heatmap({
  matrix,
  months,
  selectedMonth,
  selectedSetor,
  onSelect,
}: {
  matrix: Map<string, Map<string, number>>
  months: string[]
  selectedMonth: string
  selectedSetor: string
  onSelect: (setor: string, month: string) => void
}) {
  const rows = [...matrix]
    .map(([setor, byMonth]) => ({ setor, byMonth, total: [...byMonth.values()].reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total)
  const max = Math.max(1, ...rows.flatMap((r) => [...r.byMonth.values()]))

  if (!rows.length) return <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma NC no período.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0.5 text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card pr-2 text-left font-medium text-muted-foreground">Setor</th>
            {months.map((m) => (
              <th
                key={m}
                className={cn(
                  "min-w-9 px-0.5 pb-1 text-center font-normal whitespace-nowrap text-muted-foreground",
                  m === selectedMonth && "font-semibold text-foreground",
                )}
              >
                {fmtMonth(m)}
              </th>
            ))}
            <th className="pl-2 text-right font-medium text-muted-foreground">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ setor, byMonth, total }) => (
            <tr key={setor}>
              <th
                scope="row"
                className={cn(
                  "sticky left-0 z-10 max-w-32 truncate bg-card pr-2 text-left font-medium",
                  setor === selectedSetor && "text-primary",
                )}
              >
                {setor}
              </th>
              {months.map((m) => {
                const v = byMonth.get(m) ?? 0
                const intensity = v ? 12 + (v / max) * 88 : 0
                return (
                  <td key={m} className="p-0">
                    <button
                      type="button"
                      title={`${setor} · ${fmtMonthLong(m)}: ${fmtInt(v)} NC`}
                      onClick={() => onSelect(setor, m)}
                      className={cn(
                        "grid h-7 w-full place-items-center rounded-[4px] tabular-nums transition-transform hover:scale-110 hover:ring-1 hover:ring-foreground/40",
                        v ? "font-medium" : "text-transparent",
                        intensity > 55 ? "text-white" : "text-foreground",
                        m === selectedMonth && setor === selectedSetor && "ring-2 ring-foreground",
                      )}
                      style={{
                        background: v
                          ? `color-mix(in oklch, var(--nc) ${intensity}%, transparent)`
                          : "color-mix(in oklch, var(--muted) 60%, transparent)",
                      }}
                    >
                      {v || "·"}
                    </button>
                  </td>
                )
              })}
              <td className="pl-2 text-right font-semibold tabular-nums">{fmtInt(total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
