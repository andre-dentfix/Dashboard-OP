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
  /** Marcada com X na coluna "Finalizadas": OP arquivada pelo SGQ */
  finalizada: boolean
}

export interface DataQuality {
  totalRows: number
  semData: number
  statusDesconhecido: number
  ncSemSetor: number
  /** Linhas sem número de OP válido (ficam fora da visão por OP) */
  semOp: number
  /** A planilha não tem a coluna "Finalizadas" */
  semColunaFinalizadas: boolean
  setoresNaoReconhecidos: { valor: string; qtd: number }[]
}

export interface OpsDataset {
  records: OpRecord[]
  quality: DataQuality
  fetchedAt: string
  error?: string
}
