const fs = require('fs');
const content = fs.readFileSync('FACIU-v6.36.11.html', 'utf8');

const regex = /\.faciu-nav-root[^{]*\{[^}]*\}/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log(m[0]);
}

// Also check all CSS rules for header, nav, or sticky top
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('.faciu-nav-root') && !l.includes('<header')) {
    console.log(`L${i+1}: ${l}`);
  }
});
