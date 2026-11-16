import type { OpRecord, OpsDataset, Status } from "./types"

/**
 * Formato compacto para enviar os registros do servidor ao navegador.
 *
 * Mandar `OpRecord[]` direto repete os nomes dos campos em cada uma das milhares de linhas
 * e infla o HTML para alguns MB. Aqui cada linha vira uma tupla e os setores/motivos viram
 * índices de um dicionário. O navegador remonta exatamente os mesmos `OpRecord`.
 *
 * Linha: [id, data, op, situação, finalizada, setores?, motivos?, colaboradores?, obs?]
 * (os quatro últimos só existem em NCs; nas demais linhas são sempre vazios)
 */
type PackedRow =
  | [number, string, string, number, 0 | 1]
  | [number, string, string, number, 0 | 1, number[], number[], string[], string]

export interface PackedDataset {
  dict: string[]
  rows: PackedRow[]
  totalRows: number
  fetchedAt: string
  error?: string
}

const STATUS: Status[] = ["C", "NC", "OUTRO"]

export function packDataset(data: OpsDataset): PackedDataset {
  const dict: string[] = []
  const index = new Map<string, number>()
  const ref = (s: string) => {
    let i = index.get(s)
    if (i === undefined) {
      i = dict.push(s) - 1
      index.set(s, i)
    }
    return i
  }

  const rows = data.records.map((r): PackedRow => {
    const base = [r.id, r.date, r.op, STATUS.indexOf(r.status), r.finalizada ? 1 : 0] as const
    const vazio = !r.setores.length && !r.motivos.length && !r.colaboradores.length && !r.obs
    return vazio ? [...base] : [...base, r.setores.map(ref), r.motivos.map(ref), r.colaboradores, r.obs]
  })

  return { dict, rows, totalRows: data.quality.totalRows, fetchedAt: data.fetchedAt, error: data.error }
}

export function unpackRecords({ dict, rows }: PackedDataset): OpRecord[] {
  return rows.map(([id, date, op, status, finalizada, setores, motivos, colaboradores, obs]) => ({
    id,
    date,
    month: date.slice(0, 7),
    op,
    status: STATUS[status],
    setores: setores ? setores.map((i) => dict[i]) : [],
    motivos: motivos ? motivos.map((i) => dict[i]) : [],
    colaboradores: colaboradores ?? [],
    obs: obs ?? "",
    finalizada: finalizada === 1,
  }))
}
