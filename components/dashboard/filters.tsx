"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, RefreshCw } from "lucide-react"

interface FiltersProps {
  period: string
  setPeriod: (value: string) => void
  sector: string
  setSector: (value: string) => void
  status: string
  setStatus: (value: string) => void
  onRefresh: () => void
}

export function Filters({
  period,
  setPeriod,
  sector,
  setSector,
  status,
  setStatus,
  onRefresh,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px] bg-secondary border-border">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="12m">Últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select value={sector} onValueChange={setSector}>
        <SelectTrigger className="w-[160px] bg-secondary border-border">
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Setores</SelectItem>
          <SelectItem value="producao">Produção</SelectItem>
          <SelectItem value="qualidade">Qualidade</SelectItem>
          <SelectItem value="embalagem">Embalagem</SelectItem>
          <SelectItem value="expedicao">Expedição</SelectItem>
          <SelectItem value="manutencao">Manutenção</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[140px] bg-secondary border-border">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pendente">Pendente</SelectItem>
          <SelectItem value="em_analise">Em Análise</SelectItem>
          <SelectItem value="resolvida">Resolvida</SelectItem>
          <SelectItem value="critica">Crítica</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        className="bg-secondary border-border hover:bg-primary hover:text-primary-foreground"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  )
}
