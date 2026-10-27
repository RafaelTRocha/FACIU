// tests/test_v6_41_0_webhook_and_commission.js
// Suíte de testes automatizados para FACIU v6.41.0:
// 1. Comissão com E-mail Obrigatório (salvo no JSON, omitido no relatório RIA)
// 2. Geração e Sincronização do ID do RIA pelo CII
// 3. Payload Canônico + Standalone HTML para Webhook com envelopes ('teste', 'envio', 'consulta')
// 4. Central de Configurações de Webhook, Teste de Conexão e Rastreabilidade Local

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.41.0: COMISSÃO, ID RIA E WEBHOOK RIA ===');
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
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.41.0.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.41.0.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.41.0.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.16.html');

check('Arquivo FACIU-v6.41.0.html preservado (raiz ou backups/)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.16.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e íntegro', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Declaração const APP_VERSION="6.41.0"', htmlContent.includes('const APP_VERSION="6.41.0"') || htmlContent.includes("const APP_VERSION = '6.41.0'"));
check('<title> contém v6.41.0', /<title>FACIU\s+v6\.41\.0/i.test(htmlContent));
check('Badge de versão no topbar exibe v6.41.0', htmlContent.includes('id="appVersionLabel">v6.41.0</span>'));

// 3. Testes Funcionais no DOM e Regras de Negócio
console.log('\n--- 3. Testes Funcionais da Comissão e Validação de E-mail ---');
try {
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  // 3.1 Verificação de Elementos no DOM
  const emailInput = document.getElementById('m_email');
  check('Campo <input id="m_email"> existe no DOM', !!emailInput);
  check('Campo de e-mail possui type="email"', emailInput?.type === 'email');

  // Extrair o escopo da triagem e comissão
  const commStart = htmlContent.indexOf('function generateRiaIdFromCii');
  const commEnd = htmlContent.indexOf('function delMember', commStart);
  const commCode = htmlContent.slice(commStart, commEnd);

  let toastMessage = '';
  function toast(msg) { toastMessage = msg; }
  function audit() {}

  const mockState = {
    step: 1,
    triagem: { cii: '', sev: '', severidadePotencial: '2' },
    equipe: [],
    tree: { nodes: [] },
    classificacaoV2: { finalSeverity: null },
    commissionExceptions: {},
    ria: { control: { reportNumber: '' } }
  };

  const store = {
    addEquipeMember(m) {
      mockState.equipe.push(m);
    }
  };

  const METHODS_BY_LEVEL = {
    1: { rot: 'Leve' },
    2: { rot: 'Moderado' },
    3: { rot: 'Grave' }
  };

  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function resolveCommissionMember(m) {
    return {
      nome: m.nome,
      email: m.email || '',
      funcComissao: m.papelComissao || m.func || 'Membro da comissão',
      cargoSetor: m.cargoSetor || m.cargo || '',
      empresa: m.empresa || 'Brava Energia'
    };
  }

  const lucide = { createIcons: () => {} };

  const commRunner = new Function(
    'window', 'state', 'store', 'document', 'METHODS_BY_LEVEL', 'esc', 'toast', 'audit', 'resolveCommissionMember', 'lucide', 'save', 'updateTopBarActiveStudy',
    commCode + '\nreturn { generateRiaIdFromCii, syncRiaIdFromCii, onTriage, syncTriage, val, renderCommissionValidation, openCommissionFormFor, toggleCommissionForm, commissionRequirements, commissionLevel, addMember, syncCommissionRoleFlags, resetCommissionForm };'
  );

  const scope = commRunner(dom.window, mockState, store, document, METHODS_BY_LEVEL, esc, toast, audit, resolveCommissionMember, lucide, () => {}, () => {});

  // Cenário A: Sem nome
  document.getElementById('m_nome').value = '';
  document.getElementById('m_email').value = '';
  scope.addMember();
  check('Bloqueia inclusão de membro sem nome', mockState.equipe.length === 0);

  // Cenário B: Com nome, mas SEM e-mail
  document.getElementById('m_nome').value = 'João Silva';
  document.getElementById('m_email').value = '';
  scope.addMember();
  check('Bloqueia inclusão de membro sem e-mail', mockState.equipe.length === 0);
  check('Mensagem de validação de e-mail obrigatório exibida', /e-mail.*obrigatório/i.test(toastMessage), toastMessage);

  // Cenário C: Com e-mail inválido
  document.getElementById('m_nome').value = 'João Silva';
  document.getElementById('m_email').value = 'joao.silva-invalido';
  scope.addMember();
  check('Bloqueia inclusão de membro com e-mail em formato inválido', mockState.equipe.length === 0);
  check('Mensagem de formato inválido exibida', /e-mail.*válido/i.test(toastMessage), toastMessage);

  // Cenário D: Com nome e e-mail corporativo válido
  document.getElementById('m_nome').value = 'João Silva';
  document.getElementById('m_email').value = 'joao.silva@bravaenergia.com.br';
  document.getElementById('m_func').value = 'Membro da comissão';
  document.getElementById('m_cargo').value = 'Operação';
  document.getElementById('m_empresa').value = 'Brava Energia';
  scope.addMember();

  check('Permite inclusão quando e-mail é válido', mockState.equipe.length === 1);
  check('Membro salvo possui propriedade email preenchida', mockState.equipe[0]?.email === 'joao.silva@bravaenergia.com.br');

  // 4. Testes de Geração e Sincronização do ID do RIA baseado no CII
  console.log('\n--- 4. Testes de Geração e Sincronização do ID do RIA pelo CII ---');
  check('Função generateRiaIdFromCii está disponível', typeof scope.generateRiaIdFromCii === 'function');
  const genId1 = scope.generateRiaIdFromCii('CII-080-2026-MACAU');
  check('Gera RIA-CII-080-2026-MACAU a partir de CII-080-2026-MACAU', genId1 === 'RIA-CII-080-2026-MACAU', genId1);

  const genId2 = scope.generateRiaIdFromCii('RIA-CII-080-2026-MACAU');
  check('Idempotência: não duplica prefixo RIA- caso já exista', genId2 === 'RIA-CII-080-2026-MACAU', genId2);

  // Sincronização reativa via syncTriage()
  document.getElementById('f_cii').value = 'CII-099-2026-POLOPOTIGUAR';
  scope.syncTriage();
  check('syncTriage() sincroniza automaticamente control.reportNumber', mockState.ria?.control?.reportNumber === 'RIA-CII-099-2026-POLOPOTIGUAR', mockState.ria?.control?.reportNumber);

  // Botão de geração rápida no HTML
  check('Botão "Gerar via CII" existe em renderInitial()', htmlContent.includes('syncRiaIdFromCii(true)'));

  // 5. Testes do Módulo RIA, Webhook e Standalone HTML
  console.log('\n--- 5. Testes do Payload do Webhook, Standalone HTML e Rastreabilidade ---');
  // Extrair o bloco de funções do Webhook
  const wbStart = htmlContent.indexOf('function downloadRiaCanonicalJson');
  const wbEnd = htmlContent.indexOf('window.faciuRia=', wbStart);
  const wbCode = htmlContent.slice(wbStart, wbEnd);

  // Mock de storage local
  const storageMock = {};
  const localStorageObj = {
    getItem: (k) => storageMock[k] || null,
    setItem: (k, v) => { storageMock[k] = String(v); },
    removeItem: (k) => { delete storageMock[k]; }
  };

  const APP_VERSION = '6.41.0';
  const riaObj = () => mockState.ria;
  const riaSyncDefaults = () => {};
  const riaEsc = esc;
  const riaDocumentHtml = () => '<div class="ria-doc-page"><div class="ria-doc-header">FORM-CORP-SMS-088</div><div>Página 1</div></div>';
  const buildRiaCanonicalRev08Json = () => ({
    dados_iniciais: { numero_ria: mockState.ria?.control?.reportNumber || 'RIA-TESTE' },
    investigacao: {
      comissao: mockState.equipe.map(m => ({
        nome: m.nome,
        email: m.email || '',
        funcao: m.func || 'Membro da comissão',
        cargo_setor: m.cargo || '',
        empresa: m.empresa || 'Brava Energia'
      }))
    }
  });

  const wbRunner = new Function(
    'window', 'state', 'document', 'esc', 'toast', 'audit', 'save', 'localStorage', 'APP_VERSION', 'riaObj', 'riaSyncDefaults', 'riaEsc', 'riaDocumentHtml', 'buildRiaCanonicalRev08Json', 'generateRiaIdFromCii', 'lucide', 'renderRiaModule', 'validationResult', 'printRia', 'riaGet', 'riaSet', 'CANONICAL_SUBSTANCES', 'riaSetCanonicalSubstance', 'riaGetCanonicalSubstancesData', 'renderConsequences', 'renderCanonicalSubstancesHtml',
    wbCode + '\nreturn { buildRiaStandaloneHtml, buildWebhookPayload, getFaciuWebhookUrl, setFaciuWebhookUrl, getFaciuWebhookToken, setFaciuWebhookToken, saveWebhookSettings, testWebhookConnection, queryWebhookStatus, sendRiaToWebhook, updateWebhookStatusBadge };'
  );

  const wbScope = wbRunner(
    dom.window, mockState, document, esc, toast, audit, () => {}, localStorageObj, APP_VERSION, riaObj, riaSyncDefaults, riaEsc, riaDocumentHtml, buildRiaCanonicalRev08Json, scope.generateRiaIdFromCii, lucide, () => {}, () => [], () => {}, () => '', () => {}, [], () => {}, () => ({}), () => '', () => ''
  );

  // 5.1 Standalone HTML
  const standaloneHtml = wbScope.buildRiaStandaloneHtml();
  check('Standalone HTML contém doctype HTML5', standaloneHtml.includes('<!DOCTYPE html>'));
  check('Standalone HTML contém estilos CSS embutidos (.ria-doc-page)', standaloneHtml.includes('.ria-doc-page'));
  check('Standalone HTML embute as páginas do relatório RIA', standaloneHtml.includes('FORM-CORP-SMS-088'));

  // 5.2 Payloads com Envelopes ('teste', 'envio', 'consulta')
  const payloadTeste = wbScope.buildWebhookPayload('teste');
  check('Payload de teste possui tipo_requisicao === "teste"', payloadTeste.tipo_requisicao === 'teste');
  check('Payload de teste possui timestamp ISO', !!payloadTeste.timestamp);
  check('Payload possui identificação com número do RIA sincronizado', payloadTeste.identificacao?.numero_ria === 'RIA-CII-099-2026-POLOPOTIGUAR');
  check('Payload possui documento_html e dados_canonicos', !!payloadTeste.documento_html && !!payloadTeste.dados_canonicos);
  check('Dados canônicos no payload contêm e-mail do integrante', payloadTeste.dados_canonicos.investigacao.comissao[0]?.email === 'joao.silva@bravaenergia.com.br');

  const payloadEnvio = wbScope.buildWebhookPayload('envio');
  check('Payload de envio possui tipo_requisicao === "envio"', payloadEnvio.tipo_requisicao === 'envio');

  const payloadConsulta = wbScope.buildWebhookPayload('consulta');
  check('Payload de consulta possui tipo_requisicao === "consulta"', payloadConsulta.tipo_requisicao === 'consulta');

  // 5.3 Configurações do Webhook e persistência
  wbScope.setFaciuWebhookUrl('https://endpoint.bravaenergia.com.br/api/webhook');
  wbScope.setFaciuWebhookToken('Bearer token-secreto-xyz');
  check('getFaciuWebhookUrl() recupera URL salva', wbScope.getFaciuWebhookUrl() === 'https://endpoint.bravaenergia.com.br/api/webhook');
  check('getFaciuWebhookToken() recupera Token salvo', wbScope.getFaciuWebhookToken() === 'Bearer token-secreto-xyz');

  // 5.4 Rastreabilidade de Envio no Estado e Badges
  check('Badge #riaWebhookStatusBadge presente no HTML', htmlContent.includes('id="riaWebhookStatusBadge"'));
  check('Botão de envio presente nas ações do RIA', htmlContent.includes('data-ria-action="send-webhook"'));
  check('Botão de envio presente no encerramento (Passo 5)', htmlContent.includes('id="btnSendRiaWebhookFinal"'));

  // Garantir elemento hospedeiro no DOM de teste
  let riaBadge = document.getElementById('riaWebhookStatusBadge');
  if (!riaBadge) {
    riaBadge = document.createElement('div');
    riaBadge.id = 'riaWebhookStatusBadge';
    document.body.appendChild(riaBadge);
  }

  // Testar badge não enviado
  wbScope.updateWebhookStatusBadge();
  check('Badge inicial indica "Webhook: Não enviado"', riaBadge.innerHTML.includes('Não enviado'));

  // Simular estado de envio bem-sucedido
  mockState.webhookDelivery = {
    enviado: true,
    ultimo_envio: '2026-10-21T18:00:00.000Z',
    data_formatada: '21/10/2026 18:00:00',
    tipo_acao: 'envio',
    url_destino: 'https://endpoint.bravaenergia.com.br/api/webhook',
    status_resposta: 200,
    numero_ria: 'RIA-CII-099-2026-POLOPOTIGUAR'
  };
  wbScope.updateWebhookStatusBadge();
  check('Badge atualizado exibe "Webhook: Enviado" com data', riaBadge.innerHTML.includes('Webhook: Enviado') && riaBadge.innerHTML.includes('21/10/2026 18:00:00'));

  // 6. Testes da Central de Configurações no DOM
  console.log('\n--- 6. Testes da Interface do Modal de Configurações ---');
  const tabWebhookBtn = document.getElementById('tabBtnCfgWebhook');
  check('Botão da aba "Integrações / Webhook" existe no modal', !!tabWebhookBtn);

  const webhookContent = document.getElementById('cfgTabWebhookContent');
  check('Painel #cfgTabWebhookContent existe no modal', !!webhookContent);

  const webhookUrlInput = document.getElementById('cfg_webhook_url');
  check('Campo de URL do Webhook existe no formulário de configuração', !!webhookUrlInput);

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
