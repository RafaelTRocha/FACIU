// tests/test_v6_40_12_commission_tag_prefill.js
// Suíte de testes automatizados para validação do pré-preenchimento ao clicar nas tags da comissão

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.12: PRÉ-PREENCHIMENTO POR TAG (COMISSÃO) ===');
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

// 1. Verificação de Governança de Versão (Passo Zero Inviolável)
console.log('--- 1. Verificação de Governança de Versão (Passo Zero) ---');
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.40.12.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.40.12.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.12.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.11.html');

check('Arquivo FACIU-v6.40.12.html preservado (raiz ou backups)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.11.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Contém declaração const APP_VERSION="6.40.12"', htmlContent.includes('const APP_VERSION="6.40.12"') || htmlContent.includes("const APP_VERSION = '6.40.12'"));
check('Contém <title> com v6.40.12', /<title>FACIU\s+v6\.40\.12/i.test(htmlContent));
check('Contém badge de versão v6.40.12 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.12</span>'));

// 3. Testes Funcionais do Pré-Preenchimento via JSDOM
console.log('\n--- 3. Testes Funcionais do Pré-Preenchimento via JSDOM ---');
try {
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  // Extrair o escopo da comissão
  const commStart = htmlContent.indexOf('function val(id)');
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

  const runner = new Function(
    'state', 'document', 'METHODS_BY_LEVEL', 'esc',
    commCode + '\nreturn { renderCommissionValidation, openCommissionFormFor, toggleCommissionForm, commissionRequirements, commissionLevel };'
  );

  const scope = runner(mockState, document, METHODS_BY_LEVEL, esc);
  check('Função openCommissionFormFor definida no escopo', typeof scope.openCommissionFormFor === 'function');

  // Inicializar renderização
  scope.renderCommissionValidation();

  // Testar clique na tag do Gestor
  scope.openCommissionFormFor('manager');
  const panel = document.getElementById('commissionFormPanel');
  check('Painel #commissionFormPanel é exibido ao abrir por tag', !panel.hidden);
  check('Função selecionada é "Gestor da investigação"', document.getElementById('m_func').value === 'Gestor da investigação');
  check('Checkbox #m_manager marcado como true', document.getElementById('m_manager').checked === true);

  // Testar clique na tag do Coordenador
  scope.openCommissionFormFor('coordinator');
  check('Função selecionada é "Coordenador da investigação"', document.getElementById('m_func').value === 'Coordenador da investigação');
  check('Checkbox #m_coordinator marcado como true', document.getElementById('m_coordinator').checked === true);
  check('Checkbox #m_manager desmarcado ao trocar de tag', document.getElementById('m_manager').checked === false);

  // Testar clique na tag de Representante da Área
  scope.openCommissionFormFor('area');
  check('Checkbox #m_areaRep marcado como true', document.getElementById('m_areaRep').checked === true);

  // Testar clique na tag de Conhecimento Técnico
  scope.openCommissionFormFor('technical');
  check('Checkbox #m_technical marcado como true', document.getElementById('m_technical').checked === true);

  // Testar clique na tag de Qualificação RCA
  scope.openCommissionFormFor('qualified');
  check('Checkbox #m_rcaQualified marcado como true', document.getElementById('m_rcaQualified').checked === true);

  // Testar clique na tag de CIPA/CIPLAT
  scope.openCommissionFormFor('cipa');
  check('Checkbox #m_cipa marcado como true', document.getElementById('m_cipa').checked === true);

  // Testar clique na tag de Contratada
  scope.openCommissionFormFor('contractor');
  check('Checkbox #m_contractorRep marcado como true', document.getElementById('m_contractorRep').checked === true);
  check('Campo empresa limpo para preenchimento de contratada', document.getElementById('m_empresa').value === '');

} catch (err) {
  check('Execução do teste de pré-preenchimento', false, err.message);
}

console.log('\n========================================================================');
console.log(`=== RESUMO DA SUÍTE DE TESTES: ${passed} PASSOU | ${failed} FALHOU ===`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
