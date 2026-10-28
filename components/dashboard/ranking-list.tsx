"use client"

import { useState } from "react"
import { fmtInt, fmtPct } from "@/lib/ops/aggregate"
import { cn } from "@/lib/utils"
import { Delta } from "./panel"

/** Ranking em barras horizontais; clicar numa linha aplica o filtro correspondente. */
export function RankingList({
  items,
  previous,
  total,
  selected,
  onSelect,
  color = "bg-nc",
  limit = 8,
  emptyText = "Nenhuma ocorrência no período.",
}: {
  items: [string, number][]
  previous?: Map<string, number> | null
  total: number
  selected: string
  onSelect: (name: string) => void
  color?: string
  limit?: number
  emptyText?: string
}) {
  const [expanded, setExpanded] = useState(false)
  if (!items.length) return <p className="py-8 text-center text-sm text-muted-foreground">{emptyText}</p>

  const max = items[0][1]
  const visible = expanded ? items : items.slice(0, limit)

  return (
    <div>
      <ul className="space-y-1">
        {visible.map(([name, value], i) => {
          const prev = previous?.get(name) ?? 0
          const active = selected === name
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => onSelect(active ? "" : name)}
                aria-pressed={active}
                className={cn(
                  "group grid w-full grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent sm:grid-cols-[1.25rem_minmax(0,8.5rem)_1fr_auto]",
                  active && "bg-accent ring-1 ring-primary/50",
                  selected && !active && "opacity-50 hover:opacity-100",
                )}
              >
                <span className="text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                <span className="truncate font-medium" title={name}>
                  {name}
                </span>
                <span className="order-last col-span-3 col-start-2 h-1.5 overflow-hidden rounded-full bg-muted sm:order-none sm:col-span-1 sm:col-start-auto sm:h-2">
                  <span
                    className={cn("block h-full rounded-full transition-[width] duration-500", color)}
                    style={{ width: `${(value / max) * 100}%` }}
                  />
                </span>
                <span className="flex items-center justify-end gap-2 tabular-nums">
                  <span className="font-semibold">{fmtInt(value)}</span>
                  <span className="w-11 text-right text-xs text-muted-foreground">
                    {fmtPct(total ? (value / total) * 100 : 0, 0)}
                  </span>
                  {previous && (
                    <span className="w-16 text-right">
                      {prev ? <Delta value={((value - prev) / prev) * 100} suffix="%" /> : <span className="text-xs text-muted-foreground">novo</span>}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {items.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full rounded-md py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {expanded ? "Mostrar menos" : `Mostrar todos (${items.length})`}
        </button>
      )}
    </div>
  )
}
