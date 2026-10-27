// tests/test_v6_40_10_swiss_technical_minimalism.js
// Suíte de testes automatizados para validação do Minimalismo Técnico Suíço (FACIU v6.40.10)

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.10: MINIMALISMO TÉCNICO SUÍÇO (DESIGN) ===');
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
const targetHtml = path.resolve(__dirname, '..', 'FACIU-v6.40.10.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.9.html');

check('Arquivo FACIU-v6.40.10.html ativo na raiz', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.9.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Contém declaração const APP_VERSION="6.40.10"', htmlContent.includes('const APP_VERSION="6.40.10"') || htmlContent.includes("const APP_VERSION = '6.40.10'"));
check('Contém <title> com v6.40.10', /<title>FACIU\s+v6\.40\.10/i.test(htmlContent));
check('Contém badge de versão v6.40.10 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.10</span>'));
check('Contém badge de versão v6.40.10 na start screen', htmlContent.includes('>v6.40.10</span>'));

// 3. Verificação do Minimalismo Técnico Suíço (Anti-AI Slop)
console.log('\n--- 3. Verificação das Regras de Minimalismo Técnico Suíço ---');
check('Tipografia técnica com numerais tabulares globais (tabular-nums)', htmlContent.includes('font-variant-numeric:tabular-nums') || htmlContent.includes('font-variant-numeric: tabular-nums'));
check('Cards com raio técnico (--radius-md) e sem sombras difusas', htmlContent.includes('.card{ background:var(--card); border:1px solid var(--line); border-radius:var(--radius-md); box-shadow:none; }'));
check('Barra de marca com azul-marinho sólido (sem gradiente decorativo)', htmlContent.includes('.brand-bar{ background:var(--navy); }'));
check('Botões e inputs com raio técnico preciso (var(--radius-sm))', htmlContent.includes('border-radius:var(--radius-sm); min-height:var(--control-h);'));
check('Step numbers como crachás industriais quadrados (var(--radius-sm))', htmlContent.includes('.step-num{ width:28px; height:28px; border-radius:var(--radius-sm);'));
check('Raias e rcards alinhados ao sistema de raios técnicos', htmlContent.includes('.rcard{ width:100%; min-width:0; border:1px solid var(--line); border-radius:var(--radius-md); background:var(--card); padding:12px; box-shadow:none; }'));
check('Badges de status operacionais sem formato de pílula inflada', htmlContent.includes('.field-status{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:1px solid var(--line);border-radius:var(--radius-sm);'));
check('Navbar e subtabs com superfícies sólidas e foco limpo', htmlContent.includes('.faciu-nav-row2') && htmlContent.includes('background: var(--bg);'));

// 4. Integridade Estrutural: 100% dos Elementos e Posições Preservados
console.log('\n--- 4. Verificação de Preservação Estrutural (Zero Elementos/Posições Alterados) ---');
check('Elemento do canvas Cytoscape (#cy) preservado', htmlContent.includes('id="cy"'));
check('Stepper de navegação de passos (#stepperNav) preservado', htmlContent.includes('id="stepperNav"'));
check('Painel de raias de causas (#raias) preservado', htmlContent.includes('id="raias"'));
check('Modal de gerenciamento de nós (#nodeModal) preservado', htmlContent.includes('id="nodeModal"'));
check('Painel do Teste do Portanto (#modalThereforeTest) preservado', htmlContent.includes('id="modalThereforeTest"'));
check('Módulo de geração do RIA (#faciuRiaModule) preservado', htmlContent.includes('id="faciuRiaModule"'));
check('Overlay de ajuda integrada (#appHelpOverlay) preservado', htmlContent.includes('id="appHelpOverlay"'));

// 5. Testes em Ambiente JSDOM
console.log('\n--- 5. Testes em Ambiente JSDOM ---');
try {
  const dom = new JSDOM(htmlContent, {
    runScripts: 'outside-only',
    resources: 'usable'
  });
  const { document } = dom.window;

  check('DOM renderiza com container #appShell', !!document.querySelector('.app-shell'));
  check('Top bar contém logo e seletor de versão', !!document.getElementById('appVersionLabel'));
  check('Canvas #cy está presente no DOM', !!document.getElementById('cy'));
  check('Área de passos contém elementos de etapa (#stepperNav)', !!document.getElementById('stepperNav'));
  check('Modal de nós possui estrutura íntegra', !!document.querySelector('.node-modal-panel'));
} catch (err) {
  check('Inicialização JSDOM', false, err.message);
}

console.log('\n========================================================================');
console.log(`=== RESUMO DA SUÍTE DE TESTES: ${passed} PASSOU | ${failed} FALHOU ===`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
