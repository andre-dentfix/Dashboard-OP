# Dashboard OP — Controle de Não Conformidades

Dashboard para acompanhar as **não conformidades (NC) no fechamento de ordens de produção**, apoiando o Sistema de Gestão da Qualidade na identificação de setores críticos, motivos recorrentes e tendências.

Os dados vêm direto da planilha **“Controle de fechamento de OPs”** no Google Planilhas. Não é preciso exportar nada: o dashboard lê a planilha publicada e se atualiza sozinho a cada 5 minutos (ou na hora, pelo botão **Atualizar**).

## O que o dashboard mostra

- **Indicadores**: total de OPs, conformes, OPs com NC, taxa de NC (com faixas *Controlado ≤ 20%*, *Atenção ≤ 30%*, *Crítico*) e o setor com mais NCs, sempre comparando com o período anterior equivalente.
- **Evolução mensal**: OPs conformes × com NC e a linha da taxa de NC.
- **Ranking de setores e de motivos**, com variação em relação ao período anterior.
- **Mapa de calor setor × mês**, para ver rapidamente onde e quando os problemas se concentram.
- **Resumo anual**, **histórico mensal** e a **lista de OPs com NC**, com busca e exportação para Excel (CSV).
- **Qualidade dos dados**: linhas sem data, NCs sem setor e nomes de setor que não foram reconhecidos, para corrigir na planilha.

Tudo é clicável: clicar em um mês, setor, motivo, ano ou célula do mapa de calor aplica o filtro. Os filtros ficam na URL (ex.: `/?ano=2025&setor=CQ`), então dá para compartilhar o link de uma visão específica.

## Como os dados são interpretados

| Coluna da planilha | Uso |
|---|---|
| Data de fechamento | Mês/ano da OP |
| Número da OP | Identificação na lista de NCs |
| Situação do fechamento | `C` = conforme, `NC` = não conforme |
| Setor (es) | Setores envolvidos. Aceita vários separados por `/`, `;`, `,` ou “e”; corrige erros de digitação comuns |
| Observações encontradas | Classificadas em motivos (uma OP pode ter vários) |
| Colaborador(es) envolvido(s) | Exibidos na lista de OPs com NC, na busca e na exportação |

- **Taxa de NC** = OPs com NC ÷ total de OPs do período.
- Uma OP pode envolver mais de um setor, por isso a soma das ocorrências por setor é maior que o número de OPs com NC.
- **Usinagem** é contada como **Produção**, **Engenharia** como **Projeto** e **Embalagem** como **Rotulagem**.

Os nomes de setores e as regras de classificação de motivos ficam em [`lib/ops/normalize.ts`](lib/ops/normalize.ts); os limites da taxa, em [`lib/ops/aggregate.ts`](lib/ops/aggregate.ts).

## Rodando localmente

Requer Node.js 20 ou superior e [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Abra http://localhost:3000.

Para usar outra planilha, publique-a em *Arquivo → Compartilhar → Publicar na Web → CSV* e coloque o link em `SHEET_CSV_URL` (veja `.env.example`).

## Estrutura

```txt
app/                    Página (lê a planilha no servidor) e ação de atualizar
components/dashboard/   Indicadores, gráficos, mapa de calor e tabelas
components/ui/          Componentes base (shadcn/ui)
lib/ops/                Leitura da planilha, padronização e cálculos
```

## Tecnologias

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts e hospedagem na Vercel.
