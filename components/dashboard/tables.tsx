"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { downloadCsv } from "@/lib/export-csv"
import { fmtDate, fmtInt, fmtMonthLong, fmtPct, nivelTaxa, type MonthPoint } from "@/lib/ops/aggregate"
import { normTxt, SETOR_NAO_CONSTA } from "@/lib/ops/normalize"
import type { OpRecord } from "@/lib/ops/types"
import { cn } from "@/lib/utils"
import { Delta } from "./panel"

const TH = "px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground uppercase whitespace-nowrap"
const TD = "px-3 py-2 tabular-nums"
const TAXA_BAR = { controlado: "bg-ok", atencao: "bg-warn", critico: "bg-nc" }

export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onClick}>
      <Download className="size-3.5" /> Exportar
    </Button>
  )
}

export function exportMonthly(rows: MonthPoint[]) {
  downloadCsv("historico-mensal-ops.csv", [
    ["Mês", "Total de OPs", "Conformes", "Com NC", "Taxa NC %"],
    ...rows.map((r) => [r.month, r.total, r.conformes, r.nc, Number(r.taxa.toFixed(2))]),
  ])
}

export function MonthlyTable({
  rows,
  selectedMonth,
  onSelectMonth,
}: {
  /** Em ordem cronológica; a tabela mostra do mais recente para o mais antigo. */
  rows: MonthPoint[]
  selectedMonth: string
  onSelectMonth: (m: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const desc = rows.map((r, i) => ({ ...r, prev: rows[i - 1] })).reverse()
  const visible = expanded ? desc : desc.slice(0, 12)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className={TH}>Mês</th>
              <th className={cn(TH, "text-right")}>OPs</th>
              <th className={cn(TH, "text-right")}>Conformes</th>
              <th className={cn(TH, "text-right")}>Com NC</th>
              <th className={cn(TH, "min-w-40")}>Taxa de NC</th>
              <th className={cn(TH, "text-right")}>vs. anterior</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr
                key={r.month}
                onClick={() => onSelectMonth(r.month === selectedMonth ? "" : r.month)}
                className={cn(
                  "cursor-pointer border-b last:border-0 hover:bg-accent/60",
                  r.month === selectedMonth && "bg-accent",
                )}
              >
                <td className={cn(TD, "font-medium whitespace-nowrap")}>{fmtMonthLong(r.month)}</td>
                <td className={cn(TD, "text-right")}>{fmtInt(r.total)}</td>
                <td className={cn(TD, "text-right text-ok")}>{fmtInt(r.conformes)}</td>
                <td className={cn(TD, "text-right text-nc")}>{fmtInt(r.nc)}</td>
                <td className={TD}>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn("block h-full rounded-full", TAXA_BAR[nivelTaxa(r.taxa)])}
                        style={{ width: `${Math.min(r.taxa, 100)}%` }}
                      />
                    </span>
                    <span className="w-12 text-right text-xs font-semibold">{fmtPct(r.taxa)}</span>
                  </div>
                </td>
                <td className={cn(TD, "text-right")}>
                  {r.prev && r.prev.total > 0 ? <Delta value={r.taxa - r.prev.taxa} suffix=" p.p." /> : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {desc.length > 12 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full rounded-md py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {expanded ? "Mostrar menos" : `Mostrar todos os ${desc.length} meses`}
        </button>
      )}
    </div>
  )
}

const PAGE = 15

export function NcTable({ records }: { records: OpRecord[] }) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = normTxt(query)
    if (!q) return records
    return records.filter(
      (r) =>
        r.op.includes(q) ||
        normTxt(r.obs).includes(q) ||
        r.setores.some((s) => normTxt(s).includes(q)) ||
        r.colaboradores.some((c) => normTxt(c).includes(q)),
    )
  }, [records, query])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pages - 1)
  const visible = filtered.slice(current * PAGE, current * PAGE + PAGE)

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Buscar por OP, setor, colaborador ou observação"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">{fmtInt(filtered.length)} OPs</span>
        <div className="ml-auto">
          <ExportButton
            onClick={() =>
              downloadCsv("ops-nao-conformes.csv", [
                ["Data", "OP", "Setores", "Colaboradores", "Motivos", "Observação"],
                ...filtered.map((r) => [
                  fmtDate(r.date),
                  r.op,
                  r.setores.join(", "),
                  r.colaboradores.join(", "),
                  r.motivos.join(", "),
                  r.obs,
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
              <th className={TH}>Data</th>
              <th className={TH}>OP</th>
              <th className={TH}>Setores</th>
              <th className={TH}>Colaboradores</th>
              <th className={TH}>Motivos</th>
              <th className={cn(TH, "w-full")}>Observação</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-b align-top last:border-0">
                <td className={cn(TD, "whitespace-nowrap text-muted-foreground")}>{fmtDate(r.date)}</td>
                <td className={cn(TD, "font-mono text-xs font-medium")}>{r.op || "—"}</td>
                <td className={TD}>
                  <div className="flex min-w-28 flex-wrap gap-1">
                    {(r.setores.length ? r.setores : [SETOR_NAO_CONSTA]).map((s) => (
                      <Badge key={s} variant="secondary" className="font-normal">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className={cn(TD, "min-w-32 text-xs")}>
                  {r.colaboradores.length ? (
                    r.colaboradores.map((c) => (
                      <p key={c} className="whitespace-nowrap">
                        {c}
                      </p>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className={TD}>
                  <div className="flex min-w-32 flex-wrap gap-1">
                    {r.motivos.map((m) => (
                      <Badge key={m} variant="outline" className="border-nc/30 font-normal text-nc">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className={cn(TD, "min-w-64 text-xs text-muted-foreground")}>
                  <p className="line-clamp-2" title={r.obs}>
                    {r.obs || "—"}
                  </p>
                </td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={6}className="py-10 text-center text-sm text-muted-foreground">
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
