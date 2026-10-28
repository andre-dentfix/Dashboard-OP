"use client"

import { useCallback, useEffect, useState } from "react"
import { EMPTY_FILTERS, type Filters } from "@/lib/ops/aggregate"

const KEYS = { year: "ano", month: "mes", setor: "setor", motivo: "motivo" } as const

/** Filtros guardados na URL (?ano=2025&setor=CQ), para que um link compartilhado abra a mesma visão. */
export function useUrlFilters(): [Filters, (patch: Partial<Filters>) => void] {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setFilters({
      year: params.get(KEYS.year) || EMPTY_FILTERS.year,
      month: params.get(KEYS.month) || "",
      setor: params.get(KEYS.setor) || "",
      motivo: params.get(KEYS.motivo) || "",
    })
  }, [])

  const update = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch }
      const params = new URLSearchParams()
      if (next.year !== "all") params.set(KEYS.year, next.year)
      if (next.month) params.set(KEYS.month, next.month)
      if (next.setor) params.set(KEYS.setor, next.setor)
      if (next.motivo) params.set(KEYS.motivo, next.motivo)
      const qs = params.toString()
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)
      return next
    })
  }, [])

  return [filters, update]
}
