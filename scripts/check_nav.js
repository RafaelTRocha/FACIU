const fs = require('fs');
const content = fs.readFileSync('FACIU-v6.36.11.html', 'utf8');

// Find faciu-nav-row2 in the file
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('faciu-nav-row2')) {
    console.log(`L${i+1}: ${l}`);
  }
});
