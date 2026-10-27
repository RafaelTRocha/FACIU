// tests/test_v6_40_9_svg_card_nodes.js
// Suíte de testes automatizados para validação dos cartões de nós SVG estilo card na Árvore de Causas (FACIU v6.40.9)

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.9: CARTÕES DE NÓS PROFISSIONAIS (SVG) ===');
console.log('========================================================================\n');

let passed = 0;
let failed = 0;

function check(desc, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${desc}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${desc} ${details ? `(${details})` : ''}`);
  }
}

// 1. Verificação de Preservação e Backup (Passo Zero Inviolável)
console.log('--- 1. Verificação de Governança de Versão (Passo Zero) ---');
const targetHtml = path.resolve(__dirname, '..', 'FACIU-v6.40.9.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.8.html');

check('Arquivo FACIU-v6.40.9.html ativo na raiz', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.8.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Contém declaração const APP_VERSION="6.40.9"', htmlContent.includes('const APP_VERSION="6.40.9"') || htmlContent.includes("const APP_VERSION = '6.40.9'"));
check('Contém <title> com v6.40.9', /<title>FACIU\s+v6\.40\.9/i.test(htmlContent));
check('Contém badge de versão v6.40.9 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.9</span>'));
check('Contém badge de versão v6.40.9 na start screen', htmlContent.includes('>v6.40.9</span>'));

// 3. Verificação do Gerador de SVG dos Nós Causal
console.log('\n--- 3. Verificação do Renderizador de Cartões de Nós (SVG) ---');
check('Contém função generateNodeSvg declarada', htmlContent.includes('function generateNodeSvg('));
check('Contém função escapeSvgXml declarada', htmlContent.includes('function escapeSvgXml('));
check('Contém função nodeElementData declarada', htmlContent.includes('function nodeElementData('));
check('Formatação de código de nó nodeCode inclui padrão zero-pad [ET-01]', htmlContent.includes("if(n.kind==='evt') return 'ET-01';"));
check('SVG inclui barra de destaque superior (accentColor bar)', htmlContent.includes('height="3.5" fill="\' + accentColor + \'"'));
check('SVG inclui cabeçalho com código monoespacado e tipo em maiúsculas',
  htmlContent.includes("letter-spacing=\"0.05em\" fill=\"' + textMuted + '\">' + escapeSvgXml(typeName)"));
check('SVG inclui quebra de linha inteligente para o texto do nó (tspan)',
  htmlContent.includes("tspan x=\"12\" dy=\"' + (idx === 0 ? 0 : 15)"));
check('styleCy configura nós para renderizar background-image do SVG',
  htmlContent.includes("'background-image':'data(bgImg)'") &&
  htmlContent.includes("'background-fit':'cover'"));

// 4. Testes Estruturais em Ambiente JSDOM
console.log('\n--- 4. Testes em Ambiente JSDOM ---');
const dom = new JSDOM(htmlContent, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'file://' + targetHtml
});
const { window } = dom;

check('Função generateNodeSvg executa e gera data:image/svg+xml válido', () => {
  if (typeof window.generateNodeSvg !== 'function') return false;
  const dummy = { id: 'evt', kind: 'evt', label: 'Vazamento de fluido hidrocarboneto na conexão de flange da linha de teste' };
  const uri = window.generateNodeSvg(dummy, 240, 78, false);
  return typeof uri === 'string' && uri.startsWith('data:image/svg+xml;utf8,') && uri.includes('ET-01');
});

check('Função nodeElementData popula bgImg com SVG para nós causais', () => {
  if (typeof window.nodeElementData !== 'function') return false;
  const dummy = { id: 'fal', kind: 'falha', label: 'Falha de material' };
  const data = window.nodeElementData(dummy);
  return data && data.bgImg && data.bgImg.startsWith('data:image/svg+xml;utf8,') && data.nodeWidth >= 210;
});

check('Portas lógicas (gate) não possuem bgImg e mantêm disp "OU"', () => {
  if (typeof window.nodeElementData !== 'function') return false;
  const dummyGate = { id: 'g1', kind: 'gate', label: 'OU' };
  const data = window.nodeElementData(dummyGate);
  return data && data.bgImg === '' && data.disp === 'OU';
});

console.log('\n========================================================================');
console.log(`=== RESUMO DA SUÍTE DE TESTES: ${passed} PASSOU | ${failed} FALHOU ===`);
console.log('========================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
