# Dashboard OP - Controle de Não Conformidades

Dashboard para acompanhamento e controle de **Não Conformidades (NC) em ordens de produção**.

O objetivo do projeto é apoiar as áreas do **Sistema de Gestão da Qualidade** na visualização de problemas recorrentes, indicadores de desempenho, tendências mensais e pontos críticos do processo produtivo.


## Objetivo do dashboard

Este dashboard foi desenvolvido para facilitar a análise de:

- OPs conformes;
- OPs com não conformidade;
- NCs por setor;
- evolução mensal das não conformidades;
- comparação entre meses;
- ranking de setores com maior incidência;
- principais motivos de NC;
- histórico mensal de OPs e NCs.

## Tecnologias utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Vercel

## Estrutura principal do projeto

```txt
app/                 Página principal da aplicação
components/          Componentes React reutilizáveis
components/dashboard Componentes específicos do dashboard
components/ui        Componentes visuais de interface
data/                Base de dados em CSV
public/              Arquivos públicos e dashboard estático
scripts/             Scripts para processar dados
styles/              Arquivos de estilo
