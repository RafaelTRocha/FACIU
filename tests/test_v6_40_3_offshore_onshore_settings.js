// tests/test_v6_40_3_offshore_onshore_settings.js
// Suíte de testes automatizados para validação do Modo Offshore/Onshore,
// migração do seletor para Configurações do Sistema e Heurística/Confirmação no CII no FACIU v6.40.3

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.3: MODO OFFSHORE/ONSHORE E CONFIGS    ===');
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

const rootDir = path.resolve(__dirname, '..');
const targetHtmlPath = fs.existsSync(path.join(rootDir, 'FACIU-v6.40.3.html'))
  ? path.join(rootDir, 'FACIU-v6.40.3.html')
  : path.join(rootDir, 'backups', 'FACIU-v6.40.3.html');
const backupHtmlPath = path.join(rootDir, 'backups', 'FACIU-v6.40.2.html');

// 1. Verificação de Preservação e Backup Atômico
check('Arquivo FACIU-v6.40.3.html preservado (raiz ou backups)', fs.existsSync(targetHtmlPath));
check('Backup backups/FACIU-v6.40.2.html preservado', fs.existsSync(backupHtmlPath) && fs.statSync(backupHtmlPath).size > 3000000);

const rawHtml = fs.readFileSync(targetHtmlPath, 'utf8');

// 2. Verificação de Versionamento no Código-fonte
check('Contém declaração const APP_VERSION="6.40.3"', rawHtml.includes('const APP_VERSION="6.40.3";'));
check('Contém <title> com v6.40.3', rawHtml.includes('<title>FACIU v6.40.3 |'));
check('Contém badge de versão v6.40.3', rawHtml.includes('v<span class="appv">6.40.3</span>'));

// 3. Verificação do DOM via JSDOM
const dom = new JSDOM(rawHtml);
const doc = dom.window.document;

// 4. Verificação de Limpeza da View 1 (Triagem)
const view1 = doc.querySelector('section[data-view="1"]');
check('View 1 (Triagem) existe no DOM', !!view1);

const triagemOldButtons = view1 ? view1.querySelector('#btnAmbOffshore') : null;
check('Seletor de Ambiente Operacional foi removido da View 1 (Triagem)', !triagemOldButtons);

// 5. Verificação dos Badges de Ambiente Operacional nos Cabeçalhos
const startBadge = doc.getElementById('startAmbienceBadge');
const startBadgeText = doc.getElementById('startAmbienceBadgeText');
const startBadgeIcon = doc.getElementById('startAmbienceBadgeIcon');
check('Badge de Ambiente Operacional presente no Start Header (#startAmbienceBadge)', !!startBadge && !!startBadgeText && !!startBadgeIcon);
check('Badge de Ambiente Operacional no Start Header inicia com Onshore', startBadgeText && startBadgeText.textContent.trim() === 'Onshore');

const topbarBadge = doc.getElementById('topbarAmbienceBadge');
const topbarBadgeText = doc.getElementById('topbarAmbienceBadgeText');
const topbarBadgeIcon = doc.getElementById('topbarAmbienceBadgeIcon');
check('Badge de Ambiente Operacional presente no Topbar de estudo (#topbarAmbienceBadge)', !!topbarBadge && !!topbarBadgeText && !!topbarBadgeIcon);
check('Badge de Ambiente Operacional no Topbar inicia com Onshore', topbarBadgeText && topbarBadgeText.textContent.trim() === 'Onshore');

// 6. Verificação dos Botões de Configurações chamando openSystemSettings()
const startBtnConfig = doc.getElementById('startBtnConfig');
check('Botão de configurações do Start Header invoca openSystemSettings()',
  startBtnConfig && startBtnConfig.getAttribute('onclick') && startBtnConfig.getAttribute('onclick').includes('openSystemSettings()'));

// 7. Verificação da Central de Configurações do Sistema
const configModal = doc.getElementById('aiConfigModal');
check('Modal de Configurações (#aiConfigModal) existe no DOM', !!configModal);

const tabAmb = doc.getElementById('tabBtnCfgAmbience');
const tabAi = doc.getElementById('tabBtnCfgAi');
check('Aba Ambiente Operacional (#tabBtnCfgAmbience) presente no modal', !!tabAmb);
check('Aba Diretrizes Copilot/IA (#tabBtnCfgAi) presente no modal', !!tabAi);

const cardOn = doc.getElementById('cfgAmbOnshoreCard');
const cardOff = doc.getElementById('cfgAmbOffshoreCard');
check('Card interativo Onshore (#cfgAmbOnshoreCard) presente no modal', !!cardOn);
check('Card interativo Offshore (#cfgAmbOffshoreCard) presente no modal', !!cardOff);

const contentAmb = doc.getElementById('cfgTabAmbienceContent');
const contentAi = doc.getElementById('cfgTabAiContent');
check('Seção de conteúdo de Ambiente Operacional existe', !!contentAmb);
check('Seção de conteúdo de Diretrizes Copilot/IA existe', !!contentAi);

// 8. Verificação da Função detectCiiEnvironment e Heurística de Detecção
check('Contém declaração de function detectCiiEnvironment', rawHtml.includes('function detectCiiEnvironment(parsed)'));

// Extrair e testar detectCiiEnvironment isoladamente
const detectStart = rawHtml.indexOf('function detectCiiEnvironment(parsed)');
const detectEnd = rawHtml.indexOf('window.detectCiiEnvironment = detectCiiEnvironment;', detectStart);
const detectCode = rawHtml.slice(detectStart, detectEnd);
const detectCiiEnvironment = new Function('parsed', detectCode + '\nreturn detectCiiEnvironment(parsed);');

const sampleOffshore = {
  polo: 'Bacia de Campos',
  instalacao: 'FPSO Frade',
  local: 'Módulo de Processamento',
  descricao: 'Vazamento de gás inerte no FPSO',
  tipoIncidente: 'Incidente de Processo'
};
check('Heurística detecta Offshore para FPSO / Bacia de Campos', detectCiiEnvironment(sampleOffshore) === 'offshore');

const sampleOnshore = {
  polo: 'Polo Potiguar',
  instalacao: 'Estação Coletora CAM-07',
  local: 'Área de bombas',
  descricao: 'Gotejamento em flange da estação coletora',
  tipoIncidente: 'Vazamento em Linha'
};
check('Heurística detecta Onshore para Estação Coletora / Polo Potiguar', detectCiiEnvironment(sampleOnshore) === 'onshore');

const sampleEmpty = {};
check('Heurística retorna Onshore para dados vazios ou não marítimos', detectCiiEnvironment(sampleEmpty) === 'onshore');

// 9. Verificação do Modal de Pré-visualização do CII
check('showCiiPreviewModal contém bloco de Ambiente Operacional', rawHtml.includes('3. Ambiente Operacional do Incidente'));
check('showCiiPreviewModal contém rádio ciiAmbienceChoice', rawHtml.includes('name="ciiAmbienceChoice"'));
check('confirmCiiImport lê ciiAmbienceChoice', rawHtml.includes('input[name="ciiAmbienceChoice"]:checked'));
check('applyCiiParsedData configura o ambiente no estado', rawHtml.includes('targetAmbience = options.ambiente ||'));

// 10. Verificação do Estado Padrão (novoEstado e hydrateTriage)
check('novoEstado() define ambiente: "onshore" por padrão', rawHtml.includes("ambiente:'onshore'"));
check('hydrateTriage() utiliza fallback seguro para "onshore"', rawHtml.includes("t.ambiente||'onshore'"));

// 11. Verificação de openSystemSettings e compatibilidade com configurarIA
check('openSystemSettings definido e exportado para window', rawHtml.includes('window.openSystemSettings = function'));
check('configurarIA mantido como ponte para openSystemSettings("ai")', rawHtml.includes('window.openSystemSettings(\'ai\')'));
check('switchSettingsTab definido e exportado para window', rawHtml.includes('window.switchSettingsTab = function'));

console.log(`\nResultado Final: ${passed} verificações bem-sucedidas, ${failed} falhas.\n`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('✓ Todos os testes de unidade e integração para v6.40.3 passaram com 100% de sucesso!\n');
}
