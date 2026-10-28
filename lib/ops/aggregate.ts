import { SETOR_NAO_CONSTA } from "./normalize"
import type { OpRecord } from "./types"

export interface Filters {
  /** "all" ou "2025" */
  year: string
  /** "" ou "2025-04" */
  month: string
  setor: string
  motivo: string
}

export const EMPTY_FILTERS: Filters = { year: "all", month: "", setor: "", motivo: "" }

/** Faixas da taxa de NC usadas nos alertas (em %). */
export const LIMITES = { controlado: 20, atencao: 30 }

export type Nivel = "controlado" | "atencao" | "critico"

export function nivelTaxa(taxa: number): Nivel {
  if (taxa <= LIMITES.controlado) return "controlado"
  if (taxa <= LIMITES.atencao) return "atencao"
  return "critico"
}

export function inPeriod(r: { month: string }, f: Pick<Filters, "year" | "month">): boolean {
  if (f.month) return r.month === f.month
  if (f.year !== "all") return r.month.startsWith(f.year)
  return true
}

/** OP não conforme que bate com os filtros de setor e motivo. */
export function matchesNc(r: OpRecord, f: Pick<Filters, "setor" | "motivo">): boolean {
  if (r.status !== "NC") return false
  if (f.setor) {
    const ok = f.setor === SETOR_NAO_CONSTA ? r.setores.length === 0 : r.setores.includes(f.setor)
    if (!ok) return false
  }
  return !f.motivo || r.motivos.includes(f.motivo)
}

export interface Summary {
  total: number
  conformes: number
  nc: number
  /** OPs NC / total de OPs, em % */
  taxa: number
  /** Soma dos setores envolvidos (uma OP pode envolver mais de um) */
  ocorrencias: number
  setores: Map<string, number>
  motivos: Map<string, number>
}

export function summarize(records: OpRecord[], f: Filters, period: (r: OpRecord) => boolean): Summary {
  const s: Summary = { total: 0, conformes: 0, nc: 0, taxa: 0, ocorrencias: 0, setores: new Map(), motivos: new Map() }
  for (const r of records) {
    if (!period(r)) continue
    s.total++
    if (r.status === "C") s.conformes++
    if (!matchesNc(r, f)) continue
    s.nc++
    const setores = r.setores.length ? r.setores : [SETOR_NAO_CONSTA]
    for (const setor of setores) {
      if (f.setor && setor !== f.setor) continue
      s.setores.set(setor, (s.setores.get(setor) ?? 0) + 1)
      s.ocorrencias++
    }
    for (const m of r.motivos) s.motivos.set(m, (s.motivos.get(m) ?? 0) + 1)
  }
  s.taxa = s.total ? (s.nc / s.total) * 100 : 0
  return s
}

/** Todas as passagens de uma mesma OP pelo SGQ, em ordem cronológica. */
export interface OpHistory {
  op: string
  passagens: OpRecord[]
  /** Passagens com situação NC */
  nc: number
  /** A última passagem está marcada com X em "Finalizadas" */
  finalizada: boolean
  /** Data da última passagem; define o período em que a OP é contada */
  date: string
  month: string
  /** Setores envolvidos nas NCs da OP */
  setores: string[]
}

/** Agrupa as linhas pelo número da OP. Espera os registros já ordenados por data. */
export function opHistories(records: OpRecord[]): OpHistory[] {
  const map = new Map<string, OpRecord[]>()
  for (const r of records) {
    const op = r.op.replace(/\s+/g, "")
    if (!/\d/.test(op)) continue
    const list = map.get(op)
    if (list) list.push(r)
    else map.set(op, [r])
  }
  return [...map].map(([op, passagens]) => {
    const last = passagens[passagens.length - 1]
    const setores = new Set<string>()
    let nc = 0
    for (const p of passagens) {
      if (p.status !== "NC") continue
      nc++
      for (const s of p.setores.length ? p.setores : [SETOR_NAO_CONSTA]) setores.add(s)
    }
    return { op, passagens, nc, finalizada: last.finalizada, date: last.date, month: last.month, setores: [...setores] }
  })
}

export interface OpSummary {
  /** OPs distintas cuja última passagem cai no período */
  total: number
  finalizadas: number
  emAberto: number
  /** OPs sem nenhuma passagem NC */
  primeira: number
  /** OPs que passaram mais de uma vez pelo SGQ */
  retrabalho: number
  passagens: number
}

export function summarizeOps(histories: OpHistory[], period: (h: OpHistory) => boolean): OpSummary {
  const s: OpSummary = { total: 0, finalizadas: 0, emAberto: 0, primeira: 0, retrabalho: 0, passagens: 0 }
  for (const h of histories) {
    if (!period(h)) continue
    s.total++
    if (h.finalizada) s.finalizadas++
    else s.emAberto++
    if (!h.nc) s.primeira++
    if (h.passagens.length > 1) s.retrabalho++
    s.passagens += h.passagens.length
  }
  return s
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

/**
 * Período anterior equivalente: mês anterior, ou o ano anterior até o mesmo mês
 * (para comparar um ano em andamento de forma justa). Sem comparação em "todos".
 */
export function previousPeriod(f: Filters, lastMonth: string) {
  if (f.month) {
    const prev = shiftMonth(f.month, -1)
    return { label: fmtMonth(prev), test: (r: { month: string }) => r.month === prev }
  }
  if (f.year !== "all") {
    const prevYear = String(+f.year - 1)
    const cutoff = lastMonth.startsWith(f.year) ? `${prevYear}-${lastMonth.slice(5)}` : `${prevYear}-12`
    const partial = !cutoff.endsWith("-12")
    return {
      label: partial ? `${prevYear} (até ${MESES[+cutoff.slice(5) - 1].toLowerCase()})` : prevYear,
      test: (r: { month: string }) => r.month.startsWith(prevYear) && r.month <= cutoff,
    }
  }
  return null
}

export interface MonthPoint {
  month: string
  label: string
  total: number
  conformes: number
  nc: number
  taxa: number
}

export function monthlySeries(records: OpRecord[], f: Filters, months: string[]): MonthPoint[] {
  const map = new Map(months.map((m) => [m, { month: m, label: fmtMonth(m), total: 0, conformes: 0, nc: 0, taxa: 0 }]))
  for (const r of records) {
    const p = map.get(r.month)
    if (!p) continue
    p.total++
    if (r.status === "C") p.conformes++
    if (matchesNc(r, f)) p.nc++
  }
  for (const p of map.values()) p.taxa = p.total ? (p.nc / p.total) * 100 : 0
  return [...map.values()]
}

export function sectorMonthMatrix(records: OpRecord[], f: Filters, months: string[]) {
  const set = new Set(months)
  const matrix = new Map<string, Map<string, number>>()
  for (const r of records) {
    if (!set.has(r.month) || !matchesNc(r, f)) continue
    for (const setor of r.setores.length ? r.setores : [SETOR_NAO_CONSTA]) {
      if (f.setor && setor !== f.setor) continue
      const row = matrix.get(setor) ?? new Map<string, number>()
      row.set(r.month, (row.get(r.month) ?? 0) + 1)
      matrix.set(setor, row)
    }
  }
  return matrix
}

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export function fmtMonth(month: string): string {
  const [y, m] = month.split("-")
  return `${MESES[+m - 1].slice(0, 3)}/${y.slice(2)}`
}

export function fmtMonthLong(month: string): string {
  const [y, m] = month.split("-")
  return `${MESES[+m - 1]} de ${y}`
}

export const fmtInt = (n: number) => n.toLocaleString("pt-BR")
export const fmtPct = (n: number, digits = 1) =>
  `${n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`

export function fmtDate(date: string): string {
  const [y, m, d] = date.split("-")
  return `${d}/${m}/${y}`
}

export function sortedEntries(map: Map<string, number>): [string, number][] {
  return [...map].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}
