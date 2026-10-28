"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="max-w-md rounded-xl border bg-card p-6 text-center shadow-xs">
        <AlertCircle className="mx-auto size-8 text-nc" />
        <h1 className="mt-3 font-semibold">Não foi possível ler a planilha do Google</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verifique se a planilha continua publicada na web como CSV e tente de novo em alguns instantes.
        </p>
        <Button className="mt-4" onClick={reset}>
          <RefreshCw className="size-4" /> Tentar novamente
        </Button>
      </div>
    </main>
  )
}
