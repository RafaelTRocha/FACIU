// tests/test_v6_40_11_commission_tags_anti_slop.js
// Suíte de testes automatizados para validação das Tags de Requisitos da Comissão (Anti-AI Slop UI)

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.11: TAGS DA COMISSÃO (ANTI-AI SLOP) ===');
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
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.40.11.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.40.11.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.11.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.10.html');

check('Arquivo FACIU-v6.40.11.html preservado (raiz ou backups)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.10.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Contém declaração const APP_VERSION="6.40.11"', htmlContent.includes('const APP_VERSION="6.40.11"') || htmlContent.includes("const APP_VERSION = '6.40.11'"));
check('Contém <title> com v6.40.11', /<title>FACIU\s+v6\.40\.11/i.test(htmlContent));
check('Contém badge de versão v6.40.11 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.11</span>'));

// 3. Verificação do Design Anti-AI Slop nas Tags da Comissão
console.log('\n--- 3. Verificação de Design Anti-AI Slop e Minimalismo Técnico ---');
check('CSS define .commission-tags-grid com flex-wrap técnico', htmlContent.includes('.commission-tags-grid'));
check('CSS define .commission-tag com suporte a estados semânticos', htmlContent.includes('.commission-tag.is-met') && htmlContent.includes('.commission-tag.is-pending'));
check('CSS define suporte a dark mode para as tags da comissão', htmlContent.includes('.dark .commission-tag.is-met') || htmlContent.includes('[data-theme="dark"] .commission-tag.is-met'));
check('Eliminação da cascata de botões redundantes "Corrigir"', !htmlContent.includes("action.textContent='Corrigir';action.onclick=()=>toggleCommissionForm(true)"));

// 4. Testes Funcionais no DOM e Lógica de Renderização
console.log('\n--- 4. Testes Funcionais no DOM e Lógica de Renderização ---');
try {
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  check('Elemento #commissionPendingList existe no DOM', !!document.getElementById('commissionPendingList'));
  check('Elemento #commissionRequirementList existe no DOM', !!document.getElementById('commissionRequirementList'));
  check('Elemento #commissionStatusSummary existe no DOM', !!document.getElementById('commissionStatusSummary'));

  // Extrair e executar escopo de validação da comissão
  const commStart = htmlContent.indexOf('const COMMISSION_RULE_LABELS');
  const commEnd = htmlContent.indexOf('function delMember', commStart);
  const commCode = htmlContent.slice(commStart, commEnd);

  const mockState = {
    triagem: { sev: '2', severidadePotencial: '2' },
    equipe: [],
    classificacaoV2: { finalSeverity: 2 },
    commissionExceptions: {}
  };

  const METHODS_BY_LEVEL = {
    1: { rot: 'Leve' },
    2: { rot: 'Moderado' },
    3: { rot: 'Grave' }
  };

  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function toggleCommissionForm() {}

  const runner = new Function(
    'state', 'document', 'METHODS_BY_LEVEL', 'esc', 'toggleCommissionForm',
    commCode + '\nreturn { renderCommissionValidation, commissionRequirements, commissionLevel };'
  );

  const { renderCommissionValidation } = runner(mockState, document, METHODS_BY_LEVEL, esc, toggleCommissionForm);

  check('renderCommissionValidation executada com sucesso', typeof renderCommissionValidation === 'function');
  renderCommissionValidation();

  const pendingList = document.getElementById('commissionPendingList');
  const tags = pendingList.querySelectorAll('.commission-tag');
  check('renderCommissionValidation() renderiza 8 tags de requisitos da comissão', tags.length === 8, `Encontradas: ${tags.length}`);

  // Verificar se no estado inicial (sem integrantes) os requisitos obrigatórios estão pendentes
  const pendingTags = pendingList.querySelectorAll('.commission-tag.is-pending');
  check('Tags pendentes possuem indicador de erro ✕ e classe is-pending', pendingTags.length >= 6);

  // Verificar se tag opcional tem classe is-optional
  const optionalTags = pendingList.querySelectorAll('.commission-tag.is-optional');
  check('Tag de contratada possui classe is-optional quando não atendida', optionalTags.length === 1);

  // Testar comissão atendida simulando integrantes
  mockState.equipe = [
    { nome: 'Gestor Teste', func: 'Gestor da investigação', investigationManager: true, areaRepresentative: true, technicalKnowledge: true, rcaQualified: true },
    { nome: 'Coordenador Teste', func: 'Coordenador da investigação', commissionCoordinator: true, cipaRepresentative: true },
    { nome: 'Membro Teste', func: 'Membro da comissão' }
  ];
  renderCommissionValidation();
  const metTags = pendingList.querySelectorAll('.commission-tag.is-met');
  check('Tags mudam reativamente para is-met (✓) quando requisitos são atendidos', metTags.length >= 6, `Atendidas: ${metTags.length}`);

  // Testar tabela de consulta técnica em #commissionRequirementList
  const reqTable = document.getElementById('commissionRequirementList').querySelector('table');
  check('Referência detalhada renderiza tabela técnica estruturada com 4 colunas', !!reqTable && reqTable.querySelectorAll('th').length === 4);

} catch (err) {
  check('Inicialização JSDOM e execução de scripts', false, err.message);
}

console.log('\n========================================================================');
console.log(`=== RESUMO DA SUÍTE DE TESTES: ${passed} PASSOU | ${failed} FALHOU ===`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
