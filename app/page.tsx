import { Dashboard } from "@/components/dashboard/dashboard"
import { loadOpsDataset } from "@/lib/ops/source"

// A página é regenerada a cada 5 minutos com os dados mais recentes da planilha.
export const revalidate = 300

export default async function Home() {
  const data = await loadOpsDataset()
  // Fora do build, uma falha na planilha não deve apagar os dados: lançar o erro faz o
  // Next.js manter a última versão boa em cache (ou mostrar app/error.tsx se não houver).
  if (data.error && process.env.NEXT_PHASE !== "phase-production-build") throw new Error(data.error)
  return <Dashboard data={data} />
}
