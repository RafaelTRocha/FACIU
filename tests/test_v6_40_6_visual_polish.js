// tests/test_v6_40_6_visual_polish.js
// Suíte de testes automatizados para validação do refino visual e acabamento sem regressão no FACIU v6.40.6

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.6: REFINO VISUAL E ACABAMENTO DE UI  ===');
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
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.40.6.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.40.6.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.6.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.5.html');

check('Arquivo FACIU-v6.40.6.html preservado (raiz ou backups)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.5.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Contém declaração const APP_VERSION="6.40.6"', htmlContent.includes('const APP_VERSION="6.40.6"') || htmlContent.includes("const APP_VERSION = '6.40.6'"));
check('Contém <title> com v6.40.6', /<title>FACIU\s+v6\.40\.6/i.test(htmlContent));
check('Contém badge de versão v6.40.6 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.6</span>'));
check('Contém badge de versão v6.40.6 na start screen', htmlContent.includes('>v6.40.6</span>'));

// 3. Verificação das Diretrizes de Refino Visual (Minimalismo Técnico e Acabamento)
console.log('\n--- 3. Verificação de Estilos e Tokens Refinados ---');
check('Contém token de linha com nitidez calibrada (--line:#cbd5e1)', htmlContent.includes('--line:#cbd5e1'));
check('Contém token de linha do modo escuro harmonizado (--line:#2e384d)', htmlContent.includes('--line:#2e384d'));
check('Contém regra de alinhamento ótico para ícones Lucide', htmlContent.includes('[data-lucide], svg.lucide') && htmlContent.includes('vertical-align: middle'));
check('Contém estilo de foco calibrado para inputs', htmlContent.includes('.inp:focus, .inp:focus-visible{ border-color:var(--navy)'));

// 4. Verificação de Integridade da Notificação Toast
console.log('\n--- 4. Verificação de Higienização de Toasts ---');
check('Função toast limpa notificações anteriores antes de exibir nova', htmlContent.includes('while (t.firstChild)') && htmlContent.includes('t.removeChild(t.firstChild)'));

// 5. Testes no Ambiente JSDOM
console.log('\n--- 5. Testes no Ambiente DOM (Estrutura e Stacking Context) ---');
const dom = new JSDOM(htmlContent, {
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  url: 'file:///workspace/FACIU/FACIU-v6.40.6.html'
});

const { window } = dom;
const { document } = window;

// Topbar Stacking Context
const barra1 = document.querySelector('.bg-brava-navy.border-b');
const barra2 = document.getElementById('faciu-nav-row2');
check('Barra 1 possui classe z-30', barra1 && barra1.classList.contains('z-30'));
check('Barra 2 possui classe z-20', barra2 && barra2.classList.contains('z-20'));

// Menu de Estudo Unificado
const btnStudy = document.getElementById('btnStudyMenu');
const menuDropdown = document.getElementById('studyMenuDropdown');
check('Botão #btnStudyMenu existe', !!btnStudy);
check('Dropdown #studyMenuDropdown existe', !!menuDropdown);
check('Dropdown contém ação Novo Estudo', !!document.getElementById('btnTopNewStudy'));
check('Dropdown contém ação Abrir Estudo', !!document.getElementById('btnTopOpenStudy'));
check('Dropdown contém ação Salvar Estudo', !!document.getElementById('btnTopSaveStudy'));
check('Dropdown contém ação Salvar Como', !!document.getElementById('startBtnSaveAs'));
check('Dropdown contém ação Fechar Estudo', !!document.getElementById('btnTopCloseStudy'));

// Tela Inicial Ações Preservadas
check('Botão Início Rápido Novo existe', !!document.getElementById('startBtnNew'));
check('Botão Início Rápido CII existe', !!document.getElementById('startBtnCii'));
check('Botão Início Rápido Abrir existe', !!document.getElementById('startBtnOpen'));
check('Botão Início Rápido Pasta existe', !!document.getElementById('startBtnFolder'));

// 6. Verificação de Não-Regressão do Módulo RIA Rev. 08
console.log('\n--- 6. Verificação de Não-Regressão do Módulo RIA Rev. 08 ---');
check('Tag <style id="faciuRiaStyles"> presente', !!document.getElementById('faciuRiaStyles'));
check('Tag <script id="faciuRiaScript"> encontrada no HTML', !!document.getElementById('faciuRiaScript'));

console.log('\n========================================================================');
console.log(`=== RESUMO DA SUÍTE DE TESTES: ${passed} PASSOU | ${failed} FALHOU ===`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✓ Todos os testes de acabamento visual da v6.40.6 passaram com sucesso!');
  process.exit(0);
}
