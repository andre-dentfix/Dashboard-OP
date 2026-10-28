"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fmtMonthLong, type Filters } from "@/lib/ops/aggregate"
import { cn } from "@/lib/utils"

const ALL = "__all"

export function FilterBar({
  filters,
  onChange,
  years,
  months,
  setores,
  motivos,
}: {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  years: string[]
  months: string[]
  setores: string[]
  motivos: string[]
}) {
  const active = filters.year !== "all" || filters.month || filters.setor || filters.motivo
  const monthOptions = months.filter((m) => filters.year === "all" || m.startsWith(filters.year)).reverse()

  return (
    <div className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <div className="-mx-1 flex max-w-full items-center gap-1 overflow-x-auto px-1" role="group" aria-label="Ano">
          {["all", ...years].map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => onChange({ year: y, month: "" })}
              aria-pressed={filters.year === y}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-xs font-medium transition-colors",
                filters.year === y
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {y === "all" ? "Todos" : y}
            </button>
          ))}
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <FilterSelect
            label="Mês"
            value={filters.month}
            placeholder="Todos os meses"
            options={monthOptions.map((m) => ({ value: m, label: fmtMonthLong(m) }))}
            onChange={(month) => onChange({ month, year: month ? month.slice(0, 4) : filters.year })}
          />
          <FilterSelect
            label="Setor"
            value={filters.setor}
            placeholder="Todos os setores"
            options={setores.map((s) => ({ value: s, label: s }))}
            onChange={(setor) => onChange({ setor })}
          />
          <FilterSelect
            label="Motivo"
            value={filters.motivo}
            placeholder="Todos os motivos"
            options={motivos.map((m) => ({ value: m, label: m }))}
            onChange={(motivo) => onChange({ motivo })}
          />
          {active && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={() => onChange({ year: "all", month: "", setor: "", motivo: "" })}
            >
              <X className="size-3.5" /> Limpar filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)}>
      <SelectTrigger
        size="sm"
        aria-label={label}
        className={cn("h-8 w-full text-xs sm:w-44", value && "border-primary/60 bg-primary/10 text-foreground")}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
