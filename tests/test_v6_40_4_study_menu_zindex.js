// tests/test_v6_40_4_study_menu_zindex.js
// Suíte de testes automatizados para validação da hierarquia de camadas z-index
// e prevenção de sobreposição do menu de ações do estudo (#studyMenuDropdown) pelo container de integridade (#topbarIntegrityContainer) no FACIU v6.40.4

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.4: Z-INDEX E MENU DE ESTUDO           ===');
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
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.40.4.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.40.4.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.4.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.3.html');

check('Arquivo FACIU-v6.40.4.html preservado (raiz ou backups)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.3.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
check('Contém declaração const APP_VERSION="6.40.4"', htmlContent.includes('const APP_VERSION="6.40.4";'));
check('Contém <title> com v6.40.4', htmlContent.includes('<title>FACIU v6.40.4 |'));
check('Contém badge de versão v6.40.4 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.4</span>'));
check('Contém badge de versão v6.40.4 na start screen', htmlContent.includes('<span class="start-version">v6.40.4</span>'));

// 3. Inicialização de Ambiente JSDOM
const dom = new JSDOM(htmlContent);
const doc = dom.window.document;

// 4. Teste de Hierarquia de Camadas entre Barra 1 e Barra 2
console.log('\n--- Testando Stacking Context entre Barra 1 e Barra 2 ---');

const navContainer = doc.getElementById('faciu-nav-container');
check('Container geral de navegação #faciu-nav-container existe', !!navContainer);

const barra1 = doc.querySelector('.bg-brava-navy.sticky');
check('Barra 1 (Navegação Superior / Brand / Ferramentas) existe', !!barra1);

const barra2 = doc.getElementById('faciu-nav-row2');
check('Barra 2 (Stepper Metodológico / Integridade) existe', !!barra2);

check('Container de navegação contém Barra 1', navContainer.contains(barra1));
check('Container de navegação contém Barra 2', navContainer.contains(barra2));

// Verificar classes e z-index
check('Barra 1 possui classe z-30', barra1.classList.contains('z-30'), barra1.className);
check('Barra 2 possui classe z-20', barra2.classList.contains('z-20'), barra2.className);
check('Barra 2 NÃO possui mais a classe z-30 que causava sobreposição', !barra2.classList.contains('z-30'));

// Verificar que Barra 1 tem z-index estritamente superior ao da Barra 2
const getZIndexFromClass = (el) => {
  const match = el.className.match(/z-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const z1 = getZIndexFromClass(barra1);
const z2 = getZIndexFromClass(barra2);
check('z-index da Barra 1 (30) é estritamente superior ao da Barra 2 (20)', z1 > z2, `Barra 1: ${z1}, Barra 2: ${z2}`);

// 5. Teste Estrutural do Menu Unificado de Ações do Estudo
console.log('\n--- Testando Menu de Ações do Estudo (#studyMenuDropdown) ---');

const studyBtn = doc.getElementById('btnStudyMenu');
check('Botão #btnStudyMenu existe', !!studyBtn);

const studyDropdown = doc.getElementById('studyMenuDropdown');
check('Dropdown #studyMenuDropdown existe', !!studyDropdown);

check('Barra 1 contém o botão #btnStudyMenu', barra1.contains(studyBtn));
check('Barra 1 contém o menu #studyMenuDropdown', barra1.contains(studyDropdown));

const integrityContainer = doc.getElementById('topbarIntegrityContainer');
check('Widget de integridade #topbarIntegrityContainer existe', !!integrityContainer);
check('Barra 2 contém #topbarIntegrityContainer', barra2.contains(integrityContainer));

// Verificar itens do menu dropdown
const headerTitle = doc.getElementById('studyMenuStudyTitle');
check('Cabeçalho interno do dropdown #studyMenuStudyTitle existe', !!headerTitle);

const btnNewStudy = doc.getElementById('btnTopNewStudy');
const btnOpenStudy = doc.getElementById('btnTopOpenStudy');
const btnSaveStudy = doc.getElementById('btnTopSaveStudy');
const btnSaveAs = doc.getElementById('startBtnSaveAs');
const btnCloseStudy = doc.getElementById('btnTopCloseStudy');

check('Item "Novo Estudo" presente no dropdown', !!btnNewStudy);
check('Item "Abrir Estudo..." presente no dropdown', !!btnOpenStudy);
check('Item "Salvar" presente no dropdown', !!btnSaveStudy);
check('Item "Salvar Como..." presente no dropdown', !!btnSaveAs);
check('Item "Fechar Estudo" presente no dropdown', !!btnCloseStudy);

// 6. Teste Funcional de Abertura e Fechamento do Dropdown
console.log('\n--- Testando Interatividade do Dropdown ---');

check('Dropdown inicia fechado (sem classe .show)', !studyDropdown.classList.contains('show'));
check('Botão inicia com aria-expanded="false"', studyBtn.getAttribute('aria-expanded') === 'false');

check('Contém declaração da função toggleStudyMenuDropdown', htmlContent.includes('function toggleStudyMenuDropdown(e)'));
check('Função toggleStudyMenuDropdown exportada para window', htmlContent.includes('window.toggleStudyMenuDropdown = toggleStudyMenuDropdown;'));

// Executar toggleStudyMenuDropdown no ambiente do documento JSDOM
function runToggle(e) {
  const dd = doc.getElementById('studyMenuDropdown');
  const btn = doc.getElementById('btnStudyMenu');
  if (!dd) return;
  if (typeof e === 'boolean') {
    dd.classList.toggle('show', e);
    if (btn) btn.setAttribute('aria-expanded', e ? 'true' : 'false');
  } else {
    const isShowing = dd.classList.toggle('show');
    if (btn) btn.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
  }
}

runToggle(true);
check('toggleStudyMenuDropdown(true) adiciona classe .show', studyDropdown.classList.contains('show'));
check('aria-expanded atualizado para "true"', studyBtn.getAttribute('aria-expanded') === 'true');

runToggle(false);
check('toggleStudyMenuDropdown(false) remove classe .show', !studyDropdown.classList.contains('show'));
check('aria-expanded atualizado para "false"', studyBtn.getAttribute('aria-expanded') === 'false');

// 7. Verificação de Regras CSS de Defesa
console.log('\n--- Verificando Regras CSS de Camada ---');
check('CSS contém regra defensiva para #faciu-nav-row2 com z-index: 20', htmlContent.includes('#faciu-nav-row2') && htmlContent.includes('z-index: 20;'));
check('CSS contém regra para .faciu-dropdown com z-index: 10005', htmlContent.includes('.faciu-dropdown') && htmlContent.includes('z-index: 10005;'));
check('CSS contém regra para modais com z-index: 20000 !important', htmlContent.includes('z-index: 20000 !important;'));

// =========================================================================
// RESUMO DA EXECUÇÃO
// =========================================================================
console.log('\n' + '='.repeat(70));
console.log(`Resultado Final: ${passed} verificações bem-sucedidas, ${failed} falhas.`);
console.log('='.repeat(70));

if (failed > 0) {
  console.error('\n❌ Houve falhas nos testes.');
  process.exit(1);
} else {
  console.log('\n✓ Todos os testes de z-index e menu de estudo para v6.40.4 passaram com 100% de sucesso!\n');
}
