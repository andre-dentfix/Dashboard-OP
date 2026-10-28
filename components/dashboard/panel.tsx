import { cn } from "@/lib/utils"

export function Panel({
  title,
  description,
  actions,
  className,
  children,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("min-w-0 rounded-xl border bg-card text-card-foreground shadow-xs", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className="px-5 pb-5">{children}</div>
    </section>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-2 mb-3 flex items-center gap-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase after:h-px after:flex-1 after:bg-border">
      {children}
    </h2>
  )
}

/** Variação em relação ao período anterior. `higherIsBad` pinta aumento de vermelho. */
export function Delta({
  value,
  suffix = "",
  higherIsBad = true,
  className,
}: {
  value: number
  suffix?: string
  higherIsBad?: boolean
  className?: string
}) {
  const rounded = Math.round(value * 10) / 10
  const tone =
    rounded === 0 ? "text-muted-foreground" : (rounded > 0) === higherIsBad ? "text-nc" : "text-ok"
  const sign = rounded > 0 ? "▲" : rounded < 0 ? "▼" : "•"
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap tabular-nums", tone, className)}>
      {sign} {Math.abs(rounded).toLocaleString("pt-BR")}
      {suffix}
    </span>
  )
}
