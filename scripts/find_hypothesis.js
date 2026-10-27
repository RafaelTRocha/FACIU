const fs = require('fs');
const content = fs.readFileSync('FACIU-v6.36.11.html', 'utf8');

const terms = ['FALHA DE PROJETO', 'FATORES HUMANOS', 'FP1', 'FH1', 'H1', 'hipótese', 'hipotese', 'prefix'];

// Search in JS functions around node creation, prefixes, types
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('FP1') || line.includes('FH1') || line.includes('FALHA DE PROJETO') || line.includes('FATORES HUMANOS')) {
    console.log(`L${idx+1}: ${line.trim().substring(0, 140)}`);
  }
});
