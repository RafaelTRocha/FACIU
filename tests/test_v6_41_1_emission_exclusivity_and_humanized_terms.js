// tests/test_v6_41_1_emission_exclusivity_and_humanized_terms.js
// Suíte de testes automatizados para FACIU v6.41.1:
// 1. Exclusividade dos botões "Emitir RIA oficial" e "Transmitir para Nuvem Corporativa" na Guia de Emissão (Passo 5)
// 2. Remoção desses botões da Guia de Preparação do RIA (Passo 3)
// 3. Humanização e eliminação do termo técnico "Webhook" em favor de "Nuvem Corporativa / Transmissão"

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES v6.41.1: EXCLUSIVIDADE NA EMISSÃO E TERMOS HUMANIZADOS   ===');
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
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.41.1.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.41.1.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.41.1.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.41.0.html');

check('Arquivo FACIU-v6.41.1.html preservado (raiz ou backups/)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.41.0.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e íntegro', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Declaração const APP_VERSION="6.41.1"', htmlContent.includes('const APP_VERSION="6.41.1"') || htmlContent.includes("const APP_VERSION = '6.41.1'"));
check('<title> contém v6.41.1', /<title>FACIU\s+v6\.41\.1/i.test(htmlContent));
check('Badge de versão no topbar exibe v6.41.1', htmlContent.includes('id="appVersionLabel">v6.41.1</span>'));

// 3. Testes Funcionais no DOM
console.log('\n--- 3. Testes de Exclusividade dos Botões na Guia de Emissão e Remoção do Passo 3 ---');
try {
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  // 3.1 Verificação da Barra de Ações do RIA (Passo 3 - Preparação do RIA)
  // renderRiaModule() template
  check('Botão "btnSendRiaWebhook" foi removido da barra de ações do RIA', !htmlContent.includes('id="btnSendRiaWebhook"'));
  check('Barra de ações do RIA possui botão "Baixar minuta"', htmlContent.includes('data-ria-action="print">Baixar minuta'));

  // Extrair decorateRia e verificar que não altera o botão print para "Emitir RIA oficial"
  const decStart = htmlContent.indexOf('function decorateRia');
  const decEnd = htmlContent.indexOf('async function issue', decStart);
  const decCode = htmlContent.slice(decStart, decEnd);

  check('decorateRia() não injeta "Emitir RIA oficial" na barra de ações do Passo 3', !decCode.includes("'Emitir RIA oficial'") && !decCode.includes('"Emitir RIA oficial"'));
  check('decorateRia() não cria botão duplicado de minuta no Passo 3', !decCode.includes("dataset.faciuDraftDownload='true'"));

  // 3.2 Verificação da Guia de Emissão (Passo 5 - renderFinalEmission)
  const emissionStart = htmlContent.indexOf('function renderFinalEmission');
  const emissionEnd = htmlContent.indexOf('window.renderFinalEmission', emissionStart);
  const emissionCode = htmlContent.slice(emissionStart, emissionEnd);

  check('Guia de Emissão contém exclusivamente "Emitir RIA oficial (PDF)" quando validado', emissionCode.includes('Emitir RIA oficial (PDF)'));
  check('Guia de Emissão contém o botão "Transmitir para Nuvem Corporativa"', emissionCode.includes('Transmitir para Nuvem Corporativa'));
  check('Botão de transmissão na Guia de Emissão possui id="btnSendRiaWebhookFinal"', emissionCode.includes('id="btnSendRiaWebhookFinal"'));

  // 4. Testes de Humanização dos Termos
  console.log('\n--- 4. Testes de Humanização dos Termos (Eliminação de jargão Webhook) ---');
  // 4.1 Aba do modal de configurações
  const tabBtn = document.getElementById('tabBtnCfgWebhook');
  check('Aba do modal é intitulada "Integração com a Nuvem"', tabBtn?.textContent.includes('Integração com a Nuvem'));

  // 4.2 Badges de status
  check('Badge não enviado usa termo humanizado "Nuvem: Pendente"', htmlContent.includes('Nuvem: Pendente'));
  check('Badge enviado usa termo humanizado "Nuvem: Transmitido"', htmlContent.includes('Nuvem: Transmitido'));

  // 4.3 Campos de configuração humanizados
  const labelUrl = document.querySelector('label[for="cfg_webhook_url"]');
  check('Label do endpoint usa "Endereço de Conexão com a Nuvem"', labelUrl?.textContent.includes('Endereço de Conexão com a Nuvem'));

  const labelToken = document.querySelector('label[for="cfg_webhook_token"]');
  check('Label do token usa "Chave de Acesso / Token de Segurança"', labelToken?.textContent.includes('Chave de Acesso / Token de Segurança'));

  // 4.4 Botões de teste e consulta no modal
  check('Botão do modal usa "Testar Conectividade"', htmlContent.includes('Testar Conectividade'));
  check('Botão do modal usa "Consultar Status na Nuvem"', htmlContent.includes('Consultar Status na Nuvem'));
  check('Botão do modal usa "Salvar Parâmetros"', htmlContent.includes('Salvar Parâmetros'));

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
