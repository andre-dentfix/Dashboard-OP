"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, RefreshCw, Sun } from "lucide-react"
import { refreshSheet } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { fmtInt } from "@/lib/ops/aggregate"
import { cn } from "@/lib/utils"

export function DashboardHeader({ fetchedAt, totalRows }: { fetchedAt: string; totalRows: number }) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [refreshing, startRefresh] = useTransition()

  const updated = new Date(fetchedAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/logo-sgq.png" alt="Allied Titanium · SGQ" className="size-9 shrink-0 rounded-lg" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight">Fechamento de OPs</h1>
            <p className="truncate text-xs text-muted-foreground">Não conformidades · Gestão da Qualidade</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="hidden text-right text-xs text-muted-foreground md:block" suppressHydrationWarning>
            Planilha lida em <span className="font-medium text-foreground">{updated}</span>
            <br />
            {fmtInt(totalRows)} linhas · atualiza a cada 5 min
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() =>
              startRefresh(async () => {
                await refreshSheet()
                router.refresh()
              })
            }
          >
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
            <span className="hidden sm:inline">{refreshing ? "Atualizando…" : "Atualizar"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Alternar tema claro/escuro"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 dark:hidden" />
            <Moon className="hidden size-4 dark:block" />
          </Button>
        </div>
      </div>
    </header>
  )
}
