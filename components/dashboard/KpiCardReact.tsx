type KpiCardReactProps = {
  title: string
  value: string
  description: string
}

export function KpiCardReact({
  title,
  value,
  description,
}: KpiCardReactProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-400">{title}</p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-100">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  )
}
