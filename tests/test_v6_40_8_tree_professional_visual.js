// tests/test_v6_40_8_tree_professional_visual.js
// Suíte de testes automatizados para validação do visual profissional da Árvore de Causas (FACIU v6.40.8)

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.8: VISUAL PROFISSIONAL DA ÁRVORE      ===');
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
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.40.8.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.40.8.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.8.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.7.html');

check('Arquivo FACIU-v6.40.8.html preservado (raiz ou backups)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.7.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Contém declaração const APP_VERSION="6.40.8"', htmlContent.includes('const APP_VERSION="6.40.8"') || htmlContent.includes("const APP_VERSION = '6.40.8'"));
check('Contém <title> com v6.40.8', /<title>FACIU\s+v6\.40\.8/i.test(htmlContent));
check('Contém badge de versão v6.40.8 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.8</span>'));
check('Contém badge de versão v6.40.8 na start screen', htmlContent.includes('>v6.40.8</span>'));

// 3. Verificação da Eliminação do AI Slop (Neon Lime #d0f50d) no Canvas Causal
console.log('\n--- 3. Verificação da Eliminação de Slop Neon na Árvore ---');
check('node:selected usa azul cobalto profissional (#2563EB) em vez de verde neon',
  htmlContent.includes("{selector:'node:selected',style:{'overlay-color':'#2563EB'"));
check('node.target-hover usa realce limpo de engenharia (#2563EB)',
  htmlContent.includes("{selector:'node.target-hover',style:{'border-color':'#2563EB'"));
check('edge:selected usa azul cobalto técnico (#2563EB)',
  htmlContent.includes("'line-color':'#2563EB'") && htmlContent.includes("'target-arrow-color':'#2563EB'"));
check('Portas de conexão (.node-port) usam azul técnico (#2563EB) com borda branca',
  htmlContent.includes('.node-port') && htmlContent.includes('background: #2563EB;') && htmlContent.includes('border: 2px solid #FFFFFF;'));
check('Handles de conexão (.eh-source / .eh-preview) atualizados para azul técnico',
  htmlContent.includes('.eh-source') && htmlContent.includes('border-color: #2563EB !important;'));

// 4. Verificação da Paleta Industrial (KIND e KIND_DARK)
console.log('\n--- 4. Verificação da Paleta Industrial Técnica (KIND e KIND_DARK) ---');
check('KIND.evt possui navy técnico de autoridade (#1E293B)',
  htmlContent.includes("evt:      {rot:'Evento topo',        bg:'#1E293B', fg:'#FFFFFF', bd:'#0F172A'"));
check('KIND.imediata possui superfície nítida (#FFFFFF / #94A3B8)',
  htmlContent.includes("imediata: {rot:'Causa imediata',     bg:'#FFFFFF', fg:'#0F172A', bd:'#94A3B8'"));
check('KIND.falha possui teal de engenharia (#F0FDFA / #5EEAD4)',
  htmlContent.includes("falha:    {rot:'Falha de projeto',   bg:'#F0FDFA', fg:'#0F766E', bd:'#5EEAD4'"));
check('KIND.raiz possui esmeralda técnico de alto contraste (#ECFDF5 / #34D399)',
  htmlContent.includes("raiz:     {rot:'Causa-raiz',         bg:'#ECFDF5', fg:'#065F46', bd:'#34D399'"));
check('KIND_DARK possui paleta sóbria alinhada para baixa luminosidade',
  htmlContent.includes("evt:      {rot:'Evento topo',        bg:'#0F172A', fg:'#FFFFFF', bd:'#334155'") &&
  htmlContent.includes("imediata: {rot:'Causa imediata',     bg:'#1E293B', fg:'#F8FAFC', bd:'#475569'"));

// 5. Verificação da Toolbar, Inspector e Stencil Dock
console.log('\n--- 5. Verificação do Acabamento de UI Suíça (Toolbar, Inspector e Stencil) ---');
check('Toolbar do Canvas possui elevação limpa e bordas nítidas de 6px',
  htmlContent.includes('.tree-canvas-toolbar {') && htmlContent.includes('border-radius: 6px;'));
check('Inspector flutuante possui bordas e sombras calibradas de 8px',
  htmlContent.includes('.tree-floating-inspector {') && htmlContent.includes('border-radius: 8px;'));
check('Stencil Dock de blocos possui cantos técnicos e itens mono-espaçados',
  htmlContent.includes('.tree-stencil-dock {') && htmlContent.includes('border-radius: 8px;') &&
  htmlContent.includes('.tree-stencil-item {') && htmlContent.includes('border-radius: 4px;'));
check('Botões da biblioteca de blocos refletem a paleta industrial atualizada',
  htmlContent.includes('title="[ET] Evento Topo (Arrastar para o canvas)" style="background:#1E293B;') &&
  htmlContent.includes('title="[CI] Causa Imediata (Arrastar para o canvas)" style="background:#FFFFFF;') &&
  htmlContent.includes('title="[FP] Falha de Projeto (Arrastar para o canvas)" style="background:#F0FDFA;') &&
  htmlContent.includes('title="[CR] Causa-Raiz (Arrastar para o canvas)" style="background:#ECFDF5;'));
check('Editor de ramificação possui cabeçalho técnico e botão de aplicação com peso visual',
  htmlContent.includes('.tree-branch-editor') && htmlContent.includes('border-radius: 6px;') &&
  htmlContent.includes('id="applyTreeBranchMode">Aplicar alteração</button>'));
check('Grid de papel milimetrado técnico calibrado no #cy',
  htmlContent.includes('rgba(15,23,42,0.07) 1px, transparent 0') && htmlContent.includes('background-size:20px 20px'));
check('Legenda de estados possui tags retangulares funcionais (border-radius: 4px)',
  htmlContent.includes('.state-key{') && htmlContent.includes('border-radius:4px;'));

// 6. Testes em Ambiente JSDOM
console.log('\n--- 6. Testes Estruturais em Ambiente JSDOM ---');
const dom = new JSDOM(htmlContent, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'file://' + targetHtml
});
const { window } = dom;
const { document } = window;

check('Elemento #treeStencilDock presente no DOM com todos os 9 blocos', () => {
  const dock = document.getElementById('treeStencilDock');
  return dock && dock.querySelectorAll('.tree-stencil-item').length === 9;
});

check('Elemento #treeFloatingInspector presente com header e botões de ação', () => {
  const inspector = document.getElementById('treeFloatingInspector');
  const badge = document.getElementById('inspectorBadge');
  const btnDel = document.getElementById('btnDeleteSelected');
  return !!(inspector && badge && btnDel);
});

check('Toolbar do Canvas (#btnCanvasUndo, #btnCanvasRedo, #btnFit, #btnPng) preservada', () => {
  return !!(document.getElementById('btnCanvasUndo') &&
            document.getElementById('btnCanvasRedo') &&
            document.getElementById('btnFit') &&
            document.getElementById('btnPng'));
});

check('Canvas #cy e recipientes estruturais presentes e íntegros', () => {
  return !!(document.getElementById('cy') &&
            document.getElementById('portOverlay') &&
            document.getElementById('dragSvg'));
});

check('Legenda de estados (#tree-hint .state-legend) com os 4 estados presentes', () => {
  const legend = document.querySelector('.state-legend');
  return legend && legend.querySelectorAll('.state-key').length === 4;
});

console.log('\n========================================================================');
console.log(`=== RESUMO DA SUÍTE DE TESTES: ${passed} PASSOU | ${failed} FALHOU ===`);
console.log('========================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
