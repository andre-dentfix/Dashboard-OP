"use client"

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts"
import { fmtInt, fmtMonthLong, fmtPct, LIMITES, type MonthPoint } from "@/lib/ops/aggregate"

const AXIS = { fontSize: 11, fill: "var(--muted-foreground)" }

export function TrendChart({
  data,
  selectedMonth,
  onSelectMonth,
}: {
  data: MonthPoint[]
  selectedMonth: string
  onSelectMonth: (month: string) => void
}) {
  const dim = (m: string) => (selectedMonth && m !== selectedMonth ? 0.35 : 1)
  const maxTaxa = Math.max(LIMITES.atencao + 5, ...data.map((d) => d.taxa))

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
          onClick={(e) => {
            const m = e?.activePayload?.[0]?.payload?.month as string | undefined
            if (m) onSelectMonth(m === selectedMonth ? "" : m)
          }}
          style={{ cursor: "pointer" }}
        >
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} minTickGap={12} />
          <YAxis yAxisId="ops" tick={AXIS} tickLine={false} axisLine={false} width={48} />
          <YAxis
            yAxisId="taxa"
            orientation="right"
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={40}
            domain={[0, Math.ceil(maxTaxa / 10) * 10]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.5 }} />
          <ReferenceLine yAxisId="taxa" y={LIMITES.controlado} stroke="var(--ok)" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine yAxisId="taxa" y={LIMITES.atencao} stroke="var(--nc)" strokeDasharray="4 4" strokeOpacity={0.6} />
          <Bar yAxisId="ops" dataKey="conformes" name="Conformes" stackId="ops" fill="var(--ok)" fillOpacity={0.55} maxBarSize={28}>
            {data.map((d) => (
              <Cell key={d.month} opacity={dim(d.month)} />
            ))}
          </Bar>
          <Bar yAxisId="ops" dataKey="nc" name="Com NC" stackId="ops" fill="var(--nc)" radius={[3, 3, 0, 0]} maxBarSize={28}>
            {data.map((d) => (
              <Cell key={d.month} opacity={dim(d.month)} />
            ))}
          </Bar>
          <Line
            yAxisId="taxa"
            dataKey="taxa"
            name="Taxa de NC"
            type="linear"
            stroke="var(--warn)"
            strokeWidth={2}
            dot={data.length <= 24 ? { r: 2.5, fill: "var(--warn)" } : false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TrendLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <LegendItem className="bg-ok/60" label="Conformes" />
      <LegendItem className="bg-nc" label="Com NC" />
      <LegendItem className="h-0.5 bg-warn" label="Taxa de NC" />
      <span className="flex items-center gap-1.5">
        <span className="w-4 border-t border-dashed border-ok" />
        {LIMITES.controlado}%
        <span className="ml-1 w-4 border-t border-dashed border-nc" />
        {LIMITES.atencao}%
      </span>
    </div>
  )
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-sm ${className}`} />
      {label}
    </span>
  )
}

function TrendTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as MonthPoint
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1 font-semibold">{fmtMonthLong(d.month)}</p>
      <Row label="Total de OPs" value={fmtInt(d.total)} />
      <Row label="Conformes" value={fmtInt(d.conformes)} dot="bg-ok" />
      <Row label="Com NC" value={fmtInt(d.nc)} dot="bg-nc" />
      <Row label="Taxa de NC" value={fmtPct(d.taxa)} dot="bg-warn" />
      <p className="mt-1.5 text-[10px] text-muted-foreground">Clique para ver só este mês</p>
    </div>
  )
}

function Row({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <p className="flex items-center justify-between gap-6 tabular-nums">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {dot && <span className={`size-2 rounded-full ${dot}`} />}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </p>
  )
}
