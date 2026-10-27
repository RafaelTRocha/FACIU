const fs = require('fs');
const content = fs.readFileSync('FACIU-v6.36.11.html', 'utf8');

const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes("'falha'") || line.includes('"falha"') || line.includes("'fatores'") || line.includes('"fatores"') || line.includes("'fator_sub'") || line.includes('"fator_sub"')) {
    console.log(`L${idx+1}: ${line.trim().substring(0, 130)}`);
  }
});
