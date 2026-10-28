/** Baixa um CSV com ";" e BOM, que o Excel em português abre com acentos e colunas certas. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const body = rows
    .map((row) =>
      row
        .map((v) => {
          const s = typeof v === "number" ? v.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : String(v ?? "")
          return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(";"),
    )
    .join("\r\n")
  const blob = new Blob(["﻿" + body], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
