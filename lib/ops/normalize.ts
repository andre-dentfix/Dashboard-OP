// Padronização de textos digitados à mão na planilha: setores, motivos, situação e datas.

export const SETORES = [
  "CQ",
  "Produção",
  "Projeto",
  "Rotulagem",
  "Almoxarifado",
  "PCP",
  "Estoque",
  "Laboratório",
  "Gravação",
] as const

export const SETOR_NAO_CONSTA = "Não consta"
export const SETOR_OUTROS = "Outros"

const SECTOR_ALIASES: Record<string, string[]> = {
  Projeto: ["projeto", "projetos", "proj", "desenvolvimento", "engenharia", "eng"],
  PCP: ["pcp", "planejamento", "programacao", "controle de producao"],
  Almoxarifado: ["almoxarifado", "almox", "almoxarif", "almoxarife", "recebimento"],
  Produção: [
    "producao", "prod", "pre lavagem", "prelavagem", "lavagem", "usinagem", "usina",
    "cnc", "manufatura", "fabricacao", "operacao",
  ],
  CQ: ["cq", "controle de qualidade", "controle qualidade", "qualidade", "inspecao", "inspecao final"],
  Gravação: ["gravacao", "gravacao laser", "grav", "laser"],
  Laboratório: ["laboratorio", "lab", "metrologia"],
  Rotulagem: ["rotulagem", "rotulo", "rotulos", "etiqueta", "etiquetas", "etiquetagem", "embalagem"],
  Estoque: ["estoque", "estoq", "armazenamento", "armazem", "expedicao"],
}

export function normTxt(v: unknown): string {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
}

function compact(v: unknown): string {
  return normTxt(v).replace(/[^a-z0-9]/g, "")
}

const EMPTY_VALUES = new Set(["", "na", "n", "nao", "naoconsta", "nconsta", "naoseaplica", "semsetor", "x"])

export function isEmptyValue(v: unknown): boolean {
  const raw = String(v ?? "").trim()
  return EMPTY_VALUES.has(compact(raw)) || /^[-–—]+$/.test(raw)
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = tmp
    }
  }
  return prev[b.length]
}

const ALIAS_LIST = Object.entries(SECTOR_ALIASES).flatMap(([setor, aliases]) =>
  aliases.map((alias) => ({ setor, alias: compact(alias) })),
)

/** Converte um único nome de setor digitado para o nome padrão, ou null se não reconhecer. */
export function standardizeSector(value: string): string | null {
  const c = compact(value)
  if (!c) return null
  for (const { setor, alias } of ALIAS_LIST) if (c === alias) return setor
  // "Controle de qualidade final", "Usinagem CNC"…
  for (const { setor, alias } of ALIAS_LIST) {
    if (c.length >= 5 && alias.length >= 5 && (c.includes(alias) || alias.includes(c))) return setor
  }
  // Erros de digitação ("Peodução", "Rotualgem")
  for (const { setor, alias } of ALIAS_LIST) {
    if (c.length >= 5 && alias.length >= 5 && editDistance(c, alias) <= 2) return setor
  }
  return null
}

/** "PCP / Almoxarifado", "CQ; Produção", "Rotulagem e Estoque" → lista de setores padronizados. */
export function splitSectors(value: string): { setores: string[]; naoReconhecidos: string[] } {
  if (isEmptyValue(value)) return { setores: [], naoReconhecidos: [] }
  const setores = new Set<string>()
  const naoReconhecidos: string[] = []
  for (const part of value.split(/[,;|/\n+]+|\s+e\s+/i)) {
    if (isEmptyValue(part)) continue
    const std = standardizeSector(part)
    if (std) setores.add(std)
    else {
      // Fica visível como "Outros" em vez de sumir da contagem
      setores.add(SETOR_OUTROS)
      naoReconhecidos.push(part.trim())
    }
  }
  return { setores: [...setores], naoReconhecidos }
}

/** "Marcos Ramos / João Roberto" → ["Marcos Ramos", "João Roberto"] */
export function splitPeople(value: string): string[] {
  if (isEmptyValue(value)) return []
  const people = value
    .split(/[,;/|\n+]+|\s+e\s+/i)
    .map((p) => p.trim().replace(/\s+/g, " "))
    .filter((p) => !isEmptyValue(p))
  return [...new Set(people)]
}

export function parseStatus(value: string): "C" | "NC" | "OUTRO" {
  const s = normTxt(value)
  if (s === "nc" || s.includes("nao conforme")) return "NC"
  if (s === "c" || s === "conforme" || s.endsWith(" conforme")) return "C"
  return "OUTRO"
}

export const MOTIVOS = [
  "Sem preenchimento",
  "Qtd. não confere",
  "Sem desenho",
  "Cota divergente",
  "Sem assinatura",
  "Tolerância/CNC",
  "Sem visto",
  "Sem cód. barras",
  "Sem certificado",
  "Sem inspeção",
  "Matéria-prima",
  "Sem nota fiscal",
  "Layout/doc. desatualizado",
  "Registro incorreto",
  "Outros",
  "Não informado",
] as const

function classifyFragment(s: string): string {
  if (s.includes("preench")) return "Sem preenchimento"
  if (s.includes("qtd") || s.includes("quantidade") || s.includes("nao confere")) return "Qtd. não confere"
  if (s.includes("desenho")) return "Sem desenho"
  if (s.includes("cota") || s.includes("medida") || s.includes("divergente")) return "Cota divergente"
  if (s.includes("assinatura") || s.includes("assinado")) return "Sem assinatura"
  // "valores registrados: +0.02 -0.01", "comprimento 12.5: +0.1 -0.05"
  if (s.includes("tolerancia") || s.includes("cnc") || /[+-]\s?\d/.test(s)) return "Tolerância/CNC"
  if (s.includes("visto")) return "Sem visto"
  if (s.includes("barra") || s.includes("codigo")) return "Sem cód. barras"
  if (s.includes("certificado")) return "Sem certificado"
  if (s.includes("inspecao")) return "Sem inspeção"
  if (s.includes("materia prima") || s.includes("materia-prima") || /\bmp\b/.test(s)) return "Matéria-prima"
  if (s.includes("nota fiscal") || /\bnf\b/.test(s)) return "Sem nota fiscal"
  if (s.includes("layout") || s.includes("refeita") || s.includes("fsq") || s.includes("versao")) return "Layout/doc. desatualizado"
  if (s.includes("cargo") || s.includes("sem data") || s.includes("rasura") || s.includes("assinou") || s.includes("registr"))
    return "Registro incorreto"
  return "Outros"
}

/** Uma observação pode listar vários problemas separados por ";" — cada um vira um motivo. */
export function classifyMotivos(obs: string): string[] {
  if (isEmptyValue(obs)) return ["Não informado"]
  const motivos = new Set<string>()
  for (const part of obs.split(/[;\n]+/)) {
    const s = normTxt(part)
    if (s) motivos.add(classifyFragment(s))
  }
  return motivos.size ? [...motivos] : ["Não informado"]
}

const MONTH_NAMES: Record<string, number> = {
  jan: 1, janeiro: 1, fev: 2, fevereiro: 2, mar: 3, marco: 3, abr: 4, abril: 4,
  mai: 5, maio: 5, jun: 6, junho: 6, jul: 7, julho: 7, ago: 8, agosto: 8,
  set: 9, setembro: 9, out: 10, outubro: 10, nov: 11, novembro: 11, dez: 12, dezembro: 12,
}

const pad = (n: number | string) => String(n).padStart(2, "0")

/** Aceita DD/MM/AAAA, AAAA-MM-DD, MM/AAAA e "Jan/2025". Retorna AAAA-MM-DD ou null. */
export function parseDate(value: string): string | null {
  const raw = String(value ?? "").trim()
  if (!raw) return null
  let m = raw.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?/)
  if (m) return valid(+m[1], +m[2], m[3] ? +m[3] : 1)
  m = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/)
  if (m) return valid(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1])
  m = raw.match(/^(\d{1,2})[-/.](\d{4})$/)
  if (m) return valid(+m[2], +m[1], 1)
  m = normTxt(raw).match(/^([a-z]{3,9})[/\- ]+(\d{2,4})$/)
  if (m && MONTH_NAMES[m[1]]) return valid(m[2].length === 2 ? 2000 + +m[2] : +m[2], MONTH_NAMES[m[1]], 1)
  return null
}

function valid(y: number, mo: number, d: number): string | null {
  if (y < 2000 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return `${y}-${pad(mo)}-${pad(d)}`
}
