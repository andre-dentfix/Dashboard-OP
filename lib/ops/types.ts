export type Status = "C" | "NC" | "OUTRO"

/** Uma linha da planilha, já limpa. */
export interface OpRecord {
  id: number
  /** YYYY-MM-DD (dia 01 quando a planilha só informa o mês) */
  date: string
  /** YYYY-MM */
  month: string
  op: string
  status: Status
  setores: string[]
  motivos: string[]
  /** Colaboradores envolvidos na NC, como estão escritos na planilha */
  colaboradores: string[]
  obs: string
}

export interface DataQuality {
  totalRows: number
  semData: number
  statusDesconhecido: number
  ncSemSetor: number
  setoresNaoReconhecidos: { valor: string; qtd: number }[]
}

export interface OpsDataset {
  records: OpRecord[]
  quality: DataQuality
  fetchedAt: string
  error?: string
}
