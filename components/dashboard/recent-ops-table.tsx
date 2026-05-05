"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OP {
  id: string
  product: string
  sector: string
  type: string
  date: string
  status: "pendente" | "em_analise" | "resolvida" | "critica"
  priority: "alta" | "media" | "baixa"
}

interface RecentOPsTableProps {
  ops: OP[]
}

const statusLabels = {
  pendente: "Pendente",
  em_analise: "Em Análise",
  resolvida: "Resolvida",
  critica: "Crítica",
}

const statusColors = {
  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  em_analise: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  resolvida: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  critica: "bg-red-500/20 text-red-400 border-red-500/30",
}

const priorityColors = {
  alta: "text-red-400",
  media: "text-yellow-400",
  baixa: "text-emerald-400",
}

export function RecentOPsTable({ ops }: RecentOPsTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">
          Últimas Não-Conformidades Registradas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  OP
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Produto
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Setor
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Tipo
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Data
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Prioridade
                </th>
              </tr>
            </thead>
            <tbody>
              {ops.map((op) => (
                <tr
                  key={op.id}
                  className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-mono text-foreground">
                    {op.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {op.product}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {op.sector}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {op.type}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {op.date}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        statusColors[op.status]
                      )}
                    >
                      {statusLabels[op.status]}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "text-sm font-medium capitalize",
                        priorityColors[op.priority]
                      )}
                    >
                      {op.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
