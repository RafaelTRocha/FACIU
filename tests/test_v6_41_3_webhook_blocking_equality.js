// tests/test_v6_41_3_webhook_blocking_equality.js
// Suíte de testes automatizados para FACIU v6.41.3:
// Valida que o botão de envio à nuvem corporativa possui o mesmo bloqueio rigoroso do botão "Emitir RIA oficial (PDF)"
// quando o estudo contém pendências impeditivas.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES v6.41.3: BLOQUEIO DA TRANSMISSÃO COM PENDÊNCIAS          ===');
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
const targetHtml = path.resolve(__dirname, '..', 'FACIU-v6.41.3.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.41.2.html');

check('Arquivo FACIU-v6.41.3.html ativo e presente na raiz', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.41.2.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e íntegro', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Declaração const APP_VERSION="6.41.3"', htmlContent.includes('const APP_VERSION="6.41.3"') || htmlContent.includes("const APP_VERSION = '6.41.3'"));
check('<title> contém v6.41.3', /<title>FACIU\s+v6\.41\.3/i.test(htmlContent));
check('Badge de versão no topbar exibe v6.41.3', htmlContent.includes('id="appVersionLabel">v6.41.3</span>'));

// 3. Testes Funcionais do Bloqueio de Transmissão
console.log('\n--- 3. Testes Funcionais da Trava de Bloqueio em sendRiaToWebhook ---');
try {
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  // Extrair o bloco de funções do Webhook
  const wbStart = htmlContent.indexOf('function downloadRiaCanonicalJson');
  const wbEnd = htmlContent.indexOf('window.faciuRia=', wbStart);
  const wbCode = htmlContent.slice(wbStart, wbEnd);

  let showIssuesCalled = false;
  let showIssuesScope = '';
  function showIssues(scope) {
    showIssuesCalled = true;
    showIssuesScope = scope;
  }

  let toastMessage = '';
  function toast(msg) { toastMessage = msg; }
  function audit() {}
  function esc(s) { return String(s || ''); }

  const storageMock = {
    'faciu_webhook_url': 'https://servidor.bravaenergia.com.br/api/receber-ria'
  };
  const localStorageObj = {
    getItem: (k) => storageMock[k] || null,
    setItem: (k, v) => { storageMock[k] = String(v); },
    removeItem: (k) => { delete storageMock[k]; }
  };

  const mockState = {
    triagem: { cii: 'CII-080-2026-MACAU', titulo: 'Teste de Bloqueio' },
    equipe: [{ nome: 'Carlos', email: 'carlos@brava.com.br' }],
    ria: { control: { reportNumber: 'RIA-CII-080-2026-MACAU', status: 'draft' } },
    webhookDelivery: null
  };

  let mockIssues = [];
  const validationResult = () => mockIssues;
  const riaIssues = () => mockIssues;

  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return { ok: true, status: 200, text: async () => 'OK', json: async () => ({}) };
  };

  const APP_VERSION = '6.41.3';
  const riaObj = () => mockState.ria;
  const riaSyncDefaults = () => {};
  const riaEsc = esc;
  const riaDocumentHtml = () => '<div>Doc</div>';
  const buildRiaCanonicalRev08Json = () => ({ dados_iniciais: { numero_ria: 'RIA-TESTE' } });
  const generateRiaIdFromCii = (c) => `RIA-${c}`;
  const lucide = { createIcons: () => {} };

  let confirmAnswer = true;
  const confirm = (msg) => confirmAnswer;

  const wbRunner = new Function(
    'window', 'state', 'document', 'esc', 'toast', 'audit', 'save', 'localStorage', 'APP_VERSION', 'riaObj', 'riaSyncDefaults', 'riaEsc', 'riaDocumentHtml', 'buildRiaCanonicalRev08Json', 'generateRiaIdFromCii', 'lucide', 'renderRiaModule', 'validationResult', 'printRia', 'riaGet', 'riaSet', 'CANONICAL_SUBSTANCES', 'riaSetCanonicalSubstance', 'riaGetCanonicalSubstancesData', 'renderConsequences', 'renderCanonicalSubstancesHtml', 'showIssues', 'riaIssues', 'confirm',
    wbCode + '\nreturn { sendRiaToWebhook, buildWebhookPayload, getFaciuWebhookUrl };'
  );

  const scope = wbRunner(
    dom.window, mockState, document, esc, toast, audit, () => {}, localStorageObj, APP_VERSION, riaObj, riaSyncDefaults, riaEsc, riaDocumentHtml, buildRiaCanonicalRev08Json, generateRiaIdFromCii, lucide, () => {}, validationResult, () => {}, () => '', () => {}, [], () => {}, () => ({}), () => '', () => '', showIssues, riaIssues, confirm
  );

  // Cenário 1: Estudo com 21 pendências bloqueantes
  console.log('\n- Cenário 1: Tentativa de envio com pendências bloqueantes:');
  mockIssues = Array.from({ length: 21 }, (_, i) => `Bloqueio ${i + 1}`);
  showIssuesCalled = false;
  fetchCalled = false;

  const resultBlocked = await scope.sendRiaToWebhook('envio');

  check('Transmissão foi BLOQUEADA', resultBlocked.ok === false);
  check('Retornou erro de pendências bloqueantes', resultBlocked.error === 'Estudo com pendências bloqueantes');
  check('Acionou showIssues("ria-official") para direcionar o usuário à correção', showIssuesCalled && showIssuesScope === 'ria-official');
  check('NÃO realizou requisição HTTP fetch para a nuvem', fetchCalled === false);
  check('Estado webhookDelivery permaneceu nulo (não enviado)', mockState.webhookDelivery === null);

  // Cenário 2: Estudo 100% validado (0 pendências)
  console.log('\n- Cenário 2: Envio com estudo 100% validado (0 pendências):');
  mockIssues = [];
  showIssuesCalled = false;
  fetchCalled = false;
  dom.window.confirm = () => true; // Simular confirmação do usuário

  const resultSuccess = await scope.sendRiaToWebhook('envio');

  check('Transmissão foi PERMITIDA quando não há pendências', resultSuccess.ok === true);
  check('Executou a chamada de rede HTTP para a nuvem', fetchCalled === true);
  check('Estado webhookDelivery foi atualizado com sucesso', mockState.webhookDelivery?.enviado === true);
  check('Registrou número do RIA enviado no estado', mockState.webhookDelivery?.numero_ria === 'RIA-CII-080-2026-MACAU');

  // Cenário 3: Tooltip no Passo 5 (renderFinalEmission)
  console.log('\n- Cenário 3: Tooltip informativo de bloqueio no Passo 5:');
  const emissionStart = htmlContent.indexOf('function renderFinalEmission');
  const emissionEnd = htmlContent.indexOf('window.renderFinalEmission', emissionStart);
  const emissionCode = htmlContent.slice(emissionStart, emissionEnd);

  check('renderFinalEmission define tooltip alertando sobre o bloqueio da transmissão', emissionCode.includes('A transmissão está bloqueada: existem'));

  globalThis.fetch = originalFetch;
} catch (err) {
  failed++;
  console.error('Erro fatal durante a execução dos testes:', err);
}

console.log('\n========================================================================');
console.log(`=== RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU ===`);
console.log('========================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
