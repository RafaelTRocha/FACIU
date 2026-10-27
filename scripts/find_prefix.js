const fs = require('fs');
const content = fs.readFileSync('FACIU-v6.36.11.html', 'utf8');

const lines = content.split('\n');

// Search for prefix, getCode, nodeLabel, anexo, tree table in RIA
lines.forEach((line, idx) => {
  if (line.includes('FALHA DE PROJETO') || line.includes('FATORES HUMANOS') || line.includes('hipotese') || line.includes('falha') || line.includes('fatores')) {
    if (line.includes('prefix') || line.includes('code') || line.includes('Code') || line.includes('label') || line.includes('tag') || line.includes('ria') || line.includes('anexo') || line.includes('Anexo')) {
      console.log(`L${idx+1}: ${line.trim().substring(0, 140)}`);
    }
  }
});
