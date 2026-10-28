import { classifyMotivos, normTxt, parseDate, parseStatus, splitPeople, splitSectors } from "./normalize"
import type { DataQuality, OpRecord } from "./types"

export function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false
  const pushRow = () => {
    row.push(cell)
    if (row.some((v) => v.trim() !== "")) rows.push(row)
    row = []
    cell = ""
  }
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cell += '"'
        i++
      } else inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      row.push(cell)
      cell = ""
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++
      pushRow()
    } else cell += ch
  }
  pushRow()
  return rows
}

function findColumn(headers: string[], candidates: string[]): number {
  const normalized = headers.map(normTxt)
  for (const c of candidates) {
    const i = normalized.indexOf(normTxt(c))
    if (i >= 0) return i
  }
  for (const c of candidates) {
    const t = normTxt(c)
    const i = normalized.findIndex((h) => h && h.includes(t))
    if (i >= 0) return i
  }
  return -1
}

export function buildRecords(csvText: string): { records: OpRecord[]; quality: DataQuality } {
  const rows = parseCSV(csvText.replace(/^﻿/, ""))
  if (rows.length < 2) throw new Error("A planilha não tem linhas de dados.")
  const headers = rows[0]

  const colDate = findColumn(headers, ["Data de fechamento", "Data", "Mês", "Mes", "Competência", "Fechamento"])
  const colOp = findColumn(headers, ["Número da OP", "Numero da OP", "OP", "Ordem de produção"])
  const colStatus = findColumn(headers, ["Situação do fechamento", "Situação", "Status", "Resultado"])
  const colSector = findColumn(headers, ["Setor (es)", "Setores", "Setor", "Área", "Departamento"])
  const colObs = findColumn(headers, ["Observações encontradas", "Observações", "Observação", "Motivo", "Descrição"])
  const colPeople = findColumn(headers, ["Colaborador(es) envolvido(s)", "Colaboradores", "Colaborador", "Responsável"])
  const colFinal = findColumn(headers, ["Finalizadas", "Finalizada", "Arquivada"])
  if (colDate < 0) throw new Error("Coluna de data não encontrada na planilha.")
  if (colStatus < 0) throw new Error("Coluna de situação não encontrada na planilha.")

  const quality: DataQuality = {
    totalRows: rows.length - 1,
    semData: 0,
    statusDesconhecido: 0,
    ncSemSetor: 0,
    semOp: 0,
    semColunaFinalizadas: colFinal < 0,
    setoresNaoReconhecidos: [],
  }
  const unknownSectors = new Map<string, number>()
  const records: OpRecord[] = []

  rows.slice(1).forEach((row, idx) => {
    const date = parseDate(row[colDate] ?? "")
    if (!date) {
      quality.semData++
      return
    }
    const status = parseStatus(row[colStatus] ?? "")
    if (status === "OUTRO") quality.statusDesconhecido++

    let setores: string[] = []
    let motivos: string[] = []
    let colaboradores: string[] = []
    const obs = colObs >= 0 ? (row[colObs] ?? "").trim() : ""
    if (status === "NC") {
      const parsed = splitSectors(colSector >= 0 ? row[colSector] ?? "" : "")
      setores = parsed.setores
      for (const v of parsed.naoReconhecidos) unknownSectors.set(v, (unknownSectors.get(v) ?? 0) + 1)
      if (!setores.length) quality.ncSemSetor++
      motivos = classifyMotivos(obs)
      colaboradores = colPeople >= 0 ? splitPeople(row[colPeople] ?? "") : []
    }

    const op = colOp >= 0 ? (row[colOp] ?? "").trim() : ""
    if (!/\d/.test(op)) quality.semOp++

    records.push({
      id: idx,
      date,
      month: date.slice(0, 7),
      op,
      status,
      setores,
      motivos,
      colaboradores,
      obs: status === "NC" ? obs : "",
      finalizada: colFinal >= 0 && normTxt(row[colFinal]) === "x",
    })
  })

  quality.setoresNaoReconhecidos = [...unknownSectors]
    .map(([valor, qtd]) => ({ valor, qtd }))
    .sort((a, b) => b.qtd - a.qtd)

  records.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
  return { records, quality }
}
