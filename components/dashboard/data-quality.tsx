import { AlertTriangle } from "lucide-react"
import { fmtInt } from "@/lib/ops/aggregate"
import type { DataQuality } from "@/lib/ops/types"

/** Mostra o que não pôde ser interpretado na planilha, para que seja corrigido na fonte. */
export function DataQualityPanel({ quality }: { quality: DataQuality }) {
  const issues = [
    { n: quality.semData, text: "linhas sem data válida (ignoradas)" },
    { n: quality.statusDesconhecido, text: "OPs com situação diferente de C ou NC" },
    { n: quality.ncSemSetor, text: "NCs sem setor informado (aparecem como “Não consta”)" },
  ].filter((i) => i.n > 0)
  const unknown = quality.setoresNaoReconhecidos

  if (!issues.length && !unknown.length) return null

  return (
    <details className="group rounded-xl border bg-card text-sm shadow-xs">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 text-muted-foreground hover:text-foreground">
        <AlertTriangle className="size-4 text-warn" />
        <span>
          <span className="font-medium text-foreground">Qualidade dos dados:</span>{" "}
          {issues.length + (unknown.length ? 1 : 0)} pontos de atenção na planilha
        </span>
        <span className="ml-auto text-xs group-open:hidden">ver detalhes</span>
      </summary>
      <div className="grid gap-4 border-t px-5 py-4 md:grid-cols-2">
        <ul className="space-y-1.5">
          {issues.map((i) => (
            <li key={i.text}>
              <span className="font-semibold tabular-nums">{fmtInt(i.n)}</span>{" "}
              <span className="text-muted-foreground">{i.text}</span>
            </li>
          ))}
        </ul>
        {unknown.length > 0 && (
          <div>
            <p className="mb-2 text-muted-foreground">
              Setores não reconhecidos (contados como <span className="font-medium text-foreground">“Outros”</span>):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unknown.map((u) => (
                <span key={u.valor} className="rounded-md border px-2 py-0.5 text-xs">
                  {u.valor} <span className="text-muted-foreground tabular-nums">×{u.qtd}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  )
}
