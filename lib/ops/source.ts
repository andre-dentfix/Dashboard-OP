import "server-only"
import { buildRecords } from "./parse"
import type { OpsDataset } from "./types"

/** Planilha "Controle de fechamento de OPs" publicada como CSV no Google Planilhas. */
const DEFAULT_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8NJ0RGailXqtI6DqFlBa7KUsJUiQz8ZXsiVRvTsagP61ssGSY0CWBbtxReBPEFxCXrjKY8AK1aiPC/pub?gid=1895178999&single=true&output=csv"

export const SHEET_CACHE_SECONDS = 300

export async function loadOpsDataset(): Promise<OpsDataset> {
  const url = process.env.SHEET_CSV_URL || DEFAULT_SHEET_CSV_URL
  try {
    // Lido no servidor: sem problema de CORS e com cache de 5 minutos.
    const res = await fetch(url, { next: { revalidate: SHEET_CACHE_SECONDS, tags: ["ops-sheet"] } })
    if (!res.ok) throw new Error(`Google Planilhas respondeu HTTP ${res.status}`)
    const { records, quality } = buildRecords(await res.text())
    return { records, quality, fetchedAt: new Date().toISOString() }
  } catch (err) {
    return {
      records: [],
      quality: { totalRows: 0, semData: 0, statusDesconhecido: 0, ncSemSetor: 0, setoresNaoReconhecidos: [] },
      fetchedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
