"use client"

import { useMemo } from "react"
import { AlertCircle } from "lucide-react"
import {
  fmtMonth,
  fmtMonthLong,
  inPeriod,
  matchesNc,
  monthlySeries,
  opHistories,
  previousPeriod,
  sectorMonthMatrix,
  shiftMonth,
  sortedEntries,
  summarize,
  summarizeOps,
} from "@/lib/ops/aggregate"
import { MOTIVOS, SETOR_NAO_CONSTA, SETOR_OUTROS, SETORES } from "@/lib/ops/normalize"
import type { OpsDataset } from "@/lib/ops/types"
import { AnnualSummary, type YearRow } from "./annual-summary"
import { DataQualityPanel } from "./data-quality"
import { FilterBar } from "./filter-bar"
import { DashboardHeader } from "./header"
import { Heatmap } from "./heatmap"
import { KpiCards } from "./kpi-cards"
import { OpKpis, OpTable } from "./op-view"
import { Panel, SectionTitle } from "./panel"
import { RankingList } from "./ranking-list"
import { ExportButton, exportMonthly, MonthlyTable, NcTable } from "./tables"
import { TrendChart, TrendLegend } from "./trend-chart"
import { useUrlFilters } from "./use-filters"

export function Dashboard({ data }: { data: OpsDataset }) {
  const { records } = data
  const [filters, setFilters] = useUrlFilters()

  // Todos os meses entre o primeiro e o último registro, sem buracos.
  const allMonths = useMemo(() => {
    if (!records.length) return []
    const months: string[] = []
    const last = records[records.length - 1].month
    for (let m = records[0].month; m <= last; m = shiftMonth(m, 1)) months.push(m)
    return months
  }, [records])
  const years = useMemo(() => [...new Set(allMonths.map((m) => m.slice(0, 4)))], [allMonths])
  const lastMonth = allMonths[allMonths.length - 1] ?? ""
  const histories = useMemo(() => opHistories(records), [records])

  const view = useMemo(() => {
    const current = summarize(records, filters, (r) => inPeriod(r, filters))
    const prev = previousPeriod(filters, lastMonth)
    const previous = prev ? summarize(records, filters, prev.test) : null

    const trendMonths = filters.year === "all" ? allMonths : allMonths.filter((m) => m.startsWith(filters.year))
    const series = monthlySeries(records, filters, trendMonths)
    const heatMonths = filters.year === "all" ? allMonths.slice(-12) : trendMonths

    const yearRows: YearRow[] = years.map((year) => {
      const s = { year, total: 0, conformes: 0, nc: 0, taxa: 0 }
      for (const p of monthlySeries(records, filters, allMonths.filter((m) => m.startsWith(year)))) {
        s.total += p.total
        s.conformes += p.conformes
        s.nc += p.nc
      }
      s.taxa = s.total ? (s.nc / s.total) * 100 : 0
      return s
    })

    // Visão por OP: só o período vale aqui; setor e motivo filtram as linhas, não as OPs.
    const opsNoPeriodo = histories.filter((h) => inPeriod(h, filters))
    const ops = summarizeOps(opsNoPeriodo, () => true)
    const opsPrevious = prev ? summarizeOps(histories, prev.test) : null

    const ncRecords = records.filter((r) => inPeriod(r, filters) && matchesNc(r, filters)).reverse()

    return {
      current,
      previous: previous && previous.total ? previous : null,
      previousLabel: prev?.label,
      series,
      heatMonths,
      matrix: sectorMonthMatrix(records, filters, heatMonths),
      yearRows,
      ncRecords,
      ops,
      opsPrevious: opsPrevious && opsPrevious.total ? opsPrevious : null,
      opsNoPeriodo,
    }
  }, [records, histories, filters, allMonths, years, lastMonth])

  const periodLabel = filters.month
    ? fmtMonthLong(filters.month)
    : filters.year !== "all"
      ? `Ano de ${filters.year}`
      : allMonths.length
        ? `${fmtMonth(allMonths[0])} a ${fmtMonth(lastMonth)}`
        : "Sem dados"

  const filterNote = [filters.setor && `setor ${filters.setor}`, filters.motivo && `motivo “${filters.motivo}”`]
    .filter(Boolean)
    .join(" · ")

  const setorOptions = [...SETORES, SETOR_OUTROS, SETOR_NAO_CONSTA]
  const selectMonth = (month: string) => setFilters({ month })

  return (
    <div className="min-h-screen">
      <DashboardHeader fetchedAt={data.fetchedAt} totalRows={data.quality.totalRows} />
      <FilterBar
        filters={filters}
        onChange={setFilters}
        years={years}
        months={allMonths}
        setores={setorOptions}
        motivos={[...MOTIVOS]}
      />

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6">
        {data.error && (
          <div className="flex items-start gap-3 rounded-xl border border-nc/40 bg-nc/10 p-4 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-nc" />
            <div>
              <p className="font-medium">Não foi possível ler a planilha do Google.</p>
              <p className="text-muted-foreground">
                {data.error}. Verifique se ela continua publicada na web como CSV e clique em “Atualizar”.
              </p>
            </div>
          </div>
        )}

        <div>
          <SectionTitle>
            Indicadores · {periodLabel}
            {filterNote && <span className="normal-case tracking-normal text-primary">({filterNote})</span>}
          </SectionTitle>
          <KpiCards
            current={view.current}
            previous={view.previous}
            previousLabel={view.previousLabel}
            periodLabel={periodLabel}
            filters={filters}
          />
        </div>

        <div>
          <SectionTitle>Visão por OP · {periodLabel}</SectionTitle>
          <OpKpis current={view.ops} previous={view.opsPrevious} previousLabel={view.previousLabel} />
        </div>

        <Panel
          title={filters.year === "all" ? "Evolução mensal" : `Evolução mensal · ${filters.year}`}
          description="OPs conformes e com NC por mês, com a taxa de NC. Clique em um mês para detalhá-lo."
          actions={<TrendLegend />}
        >
          <TrendChart data={view.series} selectedMonth={filters.month} onSelectMonth={selectMonth} />
        </Panel>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel
            title="NCs por setor"
            description={
              <>
                Uma OP pode envolver mais de um setor.
                {view.previous && ` Variação vs ${view.previousLabel}.`} Clique para filtrar.
              </>
            }
          >
            <RankingList
              items={sortedEntries(view.current.setores)}
              previous={view.previous?.setores}
              total={view.current.ocorrencias}
              selected={filters.setor}
              onSelect={(setor) => setFilters({ setor })}
            />
          </Panel>
          <Panel
            title="Principais motivos"
            description="Classificados a partir das observações; uma OP pode ter vários motivos. Clique para filtrar."
          >
            <RankingList
              items={sortedEntries(view.current.motivos)}
              previous={view.previous?.motivos}
              total={view.current.nc}
              selected={filters.motivo}
              onSelect={(motivo) => setFilters({ motivo })}
              color="bg-warn"
            />
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Panel
            title="Mapa de calor · setor × mês"
            description={
              filters.year === "all"
                ? "Últimos 12 meses. Clique em uma célula para ver o setor naquele mês."
                : "Clique em uma célula para ver o setor naquele mês."
            }
          >
            <Heatmap
              matrix={view.matrix}
              months={view.heatMonths}
              selectedMonth={filters.month}
              selectedSetor={filters.setor}
              onSelect={(setor, month) =>
                filters.setor === setor && filters.month === month
                  ? setFilters({ setor: "", month: "" })
                  : setFilters({ setor, month, year: month.slice(0, 4) })
              }
            />
          </Panel>
          <Panel title="Resumo anual" description="OPs com NC / total e taxa de NC por ano.">
            <AnnualSummary
              rows={view.yearRows}
              selectedYear={filters.year}
              onSelectYear={(year) => setFilters({ year, month: "" })}
            />
          </Panel>
        </div>

        <Panel
          title="Histórico mensal"
          description="Clique em uma linha para detalhar o mês."
          actions={<ExportButton onClick={() => exportMonthly(view.series)} />}
        >
          <MonthlyTable rows={view.series} selectedMonth={filters.month} onSelectMonth={selectMonth} />
        </Panel>

        <Panel
          title="Passagens por OP"
          description={`${periodLabel} · cada OP aparece uma vez; finalizada só quando a última passagem tem X em Finalizadas. Passe o mouse no histórico para ver a observação.`}
        >
          <OpTable key={`${filters.year}-${filters.month}`} histories={view.opsNoPeriodo} />
        </Panel>

        <Panel title="OPs com não conformidade" description={`${periodLabel}${filterNote ? ` · ${filterNote}` : ""}`}>
          <NcTable key={`${filters.year}-${filters.month}-${filters.setor}-${filters.motivo}`} records={view.ncRecords} />
        </Panel>

        <DataQualityPanel quality={data.quality} />
      </main>
    </div>
  )
}
