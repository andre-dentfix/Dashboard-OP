"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { downloadCsv } from "@/lib/export-csv"
import { fmtDate, fmtInt, type OpHistory } from "@/lib/ops/aggregate"
import { cn } from "@/lib/utils"
import { ExportButton } from "./tables"

type Mostrar = "retrabalho" | "aberto" | "todas"

const MOSTRAR: { value: Mostrar; label: string }[] = [
  { value: "retrabalho", label: "Voltaram ao SGQ" },
  { value: "aberto", label: "Em aberto" },
  { value: "todas", label: "Todas" },
]

const TH = "px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground uppercase whitespace-nowrap"
const TD = "px-3 py-2 tabular-nums"
const PAGE = 15

export function OpTable({ histories }: { histories: OpHistory[] }) {
  const [mostrar, setMostrar] = useState<Mostrar>("retrabalho")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.replace(/\s+/g, "")
    return histories
      .filter((h) => {
        if (mostrar === "retrabalho" && h.passagens.length < 2) return false
        if (mostrar === "aberto" && h.finalizada) return false
        return !q || h.op.includes(q)
      })
      .sort((a, b) => b.passagens.length - a.passagens.length || b.nc - a.nc || b.date.localeCompare(a.date))
  }, [histories, mostrar, query])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pages - 1)
  const visible = filtered.slice(current * PAGE, current * PAGE + PAGE)

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border p-0.5">
          {MOSTRAR.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => {
                setMostrar(m.value)
                setPage(0)
              }}
              className={cn(
                "rounded px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground",
                mostrar === m.value && "bg-accent font-medium text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Buscar número da OP"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">{fmtInt(filtered.length)} OPs</span>
        <div className="ml-auto">
          <ExportButton
            onClick={() =>
              downloadCsv("ops-por-numero.csv", [
                ["OP", "Situação", "Passagens", "Passagens NC", "Setores", "Última passagem", "Histórico"],
                ...filtered.map((h) => [
                  h.op,
                  h.finalizada ? "Finalizada" : "Em aberto",
                  h.passagens.length,
                  h.nc,
                  h.setores.join(", "),
                  fmtDate(h.date),
                  h.passagens.map((p) => `${fmtDate(p.date)} ${p.status}${p.finalizada ? " X" : ""}`).join(" | "),
                ]),
              ])
            }
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className={TH}>OP</th>
              <th className={TH}>Situação</th>
              <th className={cn(TH, "text-right")}>Passagens</th>
              <th className={cn(TH, "text-right")}>NCs</th>
              <th className={TH}>Setores das NCs</th>
              <th className={cn(TH, "w-full")}>Histórico</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((h) => (
              <tr key={h.op} className="border-b align-top last:border-0">
                <td className={cn(TD, "font-mono text-xs font-medium")}>{h.op}</td>
                <td className={TD}>
                  <Badge
                    variant="outline"
                    className={cn("font-normal", h.finalizada ? "border-ok/40 text-ok" : "border-warn/40 text-warn")}
                  >
                    {h.finalizada ? "Finalizada" : "Em aberto"}
                  </Badge>
                </td>
                <td className={cn(TD, "text-right")}>{h.passagens.length}</td>
                <td className={cn(TD, "text-right", h.nc && "text-nc")}>{h.nc}</td>
                <td className={TD}>
                  <div className="flex min-w-28 flex-wrap gap-1">
                    {h.setores.length ? (
                      h.setores.map((s) => (
                        <Badge key={s} variant="secondary" className="font-normal">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
                <td className={TD}>
                  <ol className="flex min-w-64 flex-wrap items-center gap-1 text-xs">
                    {h.passagens.map((p, i) => (
                      <li key={p.id} className="flex items-center gap-1">
                        {i > 0 && <span className="text-muted-foreground">→</span>}
                        <span
                          title={p.obs || undefined}
                          className={cn(
                            "rounded px-1.5 py-0.5 whitespace-nowrap",
                            p.status === "NC" ? "bg-nc/10 text-nc" : p.status === "C" ? "bg-ok/10 text-ok" : "bg-muted",
                          )}
                        >
                          {fmtDate(p.date)} · {p.status === "OUTRO" ? "?" : p.status}
                          {p.finalizada && " · X"}
                        </span>
                      </li>
                    ))}
                  </ol>
                </td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma OP encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          Página {current + 1} de {pages}
          <Button variant="outline" size="icon" className="size-8" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Página anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Próxima página">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
