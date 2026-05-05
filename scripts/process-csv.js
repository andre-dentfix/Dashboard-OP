const fs = require('fs');
const path = require('path');

// Ler o CSV
const csvPath = path.join(__dirname, '../data/ops-data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Processar linhas
const lines = csvContent.split('\n').filter(line => line.trim() && !line.startsWith('Data de fechamento'));

const monthlyData = {};
const setorData = {};
const setorAnual = {};
const setorMensal = {};

// Normalizar setores
function normalizeSetor(setor) {
  if (!setor || setor === 'N/A' || setor === '-' || setor.trim() === '') return null;
  
  const mapping = {
    'pcp': 'PCP',
    'cq': 'CQ',
    'rotulagem': 'Rotulagem',
    'produção': 'Produção',
    'almoxarifado': 'Almoxarifado',
    'projeto': 'Projeto',
    'estoque': 'Estoque',
    'engenharia': 'Engenharia',
    'gravação': 'Gravação',
    'laboratório': 'Laboratório',
    'usinagem': 'Usinagem',
    'rotualgem': 'Rotulagem',
    'peodução': 'Produção'
  };
  
  // Pode ter múltiplos setores separados por / ou ;
  const setores = setor.split(/[\/;]/).map(s => s.trim().toLowerCase());
  const normalized = [];
  
  for (const s of setores) {
    for (const [key, value] of Object.entries(mapping)) {
      if (s.includes(key)) {
        if (!normalized.includes(value)) {
          normalized.push(value);
        }
        break;
      }
    }
  }
  
  return normalized.length > 0 ? normalized : null;
}

for (const line of lines) {
  const parts = line.split(';');
  if (parts.length < 3) continue;
  
  const dateStr = parts[0].trim();
  const situacao = parts[2].trim().toUpperCase();
  const setor = parts[4];
  
  // Parse date DD/MM/YYYY
  const dateParts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!dateParts) continue;
  
  const day = parseInt(dateParts[1]);
  const month = parseInt(dateParts[2]);
  const year = parseInt(dateParts[3]);
  
  if (year < 2022 || year > 2030) continue;
  
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  
  // Inicializar mês
  if (!monthlyData[monthKey]) {
    monthlyData[monthKey] = { T: 0, C: 0, NC: 0 };
  }
  
  // Contar
  monthlyData[monthKey].T++;
  if (situacao === 'C') {
    monthlyData[monthKey].C++;
  } else if (situacao === 'NC') {
    monthlyData[monthKey].NC++;
    
    // Processar setores para NCs
    const setores = normalizeSetor(setor);
    if (setores) {
      for (const s of setores) {
        // Total geral
        setorData[s] = (setorData[s] || 0) + 1;
        
        // Por ano
        if (!setorAnual[s]) setorAnual[s] = {};
        setorAnual[s][year] = (setorAnual[s][year] || 0) + 1;
        
        // Por mês
        if (!setorMensal[monthKey]) setorMensal[monthKey] = {};
        setorMensal[monthKey][s] = (setorMensal[monthKey][s] || 0) + 1;
      }
    }
  }
}

// Converter para array ordenado
const RAW = Object.entries(monthlyData)
  .map(([m, data]) => ({ m, ...data }))
  .sort((a, b) => a.m.localeCompare(b.m));

// Gerar output
console.log('// Dados gerados automaticamente a partir do CSV');
console.log('// Período:', RAW[0]?.m, 'até', RAW[RAW.length - 1]?.m);
console.log('');
console.log('const RAW = ' + JSON.stringify(RAW, null, 2) + ';');
console.log('');
console.log('const SETOR_NC = ' + JSON.stringify(setorData, null, 2) + ';');
console.log('');
console.log('const SETOR_ANUAL = ' + JSON.stringify(setorAnual, null, 2) + ';');
console.log('');
console.log('const SETOR_MENSAL = ' + JSON.stringify(setorMensal, null, 2) + ';');

// Estatísticas
const totalOps = RAW.reduce((sum, d) => sum + d.T, 0);
const totalNCs = RAW.reduce((sum, d) => sum + d.NC, 0);
console.log('');
console.log('// Estatísticas:');
console.log('// Total de OPs:', totalOps);
console.log('// Total de NCs:', totalNCs);
console.log('// Taxa média NC:', (totalNCs / totalOps * 100).toFixed(2) + '%');
console.log('// Meses:', RAW.length);
