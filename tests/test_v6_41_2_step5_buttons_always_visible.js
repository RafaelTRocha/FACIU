// tests/test_v6_41_2_step5_buttons_always_visible.js
// Suíte de testes automatizados para FACIU v6.41.2:
// Garante que o botão "Emitir RIA oficial (PDF)" NUNCA desaparece no Passo 5 (Emissão),
// mesmo quando o estudo contém pendências bloqueantes (isDraft === true).

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES v6.41.2: BOTÕES SEMPRE VISÍVEIS NO PASSO 5 (EMISSÃO)       ===');
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
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.41.2.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.41.2.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.41.2.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.41.1.html');

check('Arquivo FACIU-v6.41.2.html preservado (raiz ou backups/)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.41.1.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e íntegro', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Declaração const APP_VERSION="6.41.2"', htmlContent.includes('const APP_VERSION="6.41.2"') || htmlContent.includes("const APP_VERSION = '6.41.2'"));
check('<title> contém v6.41.2', /<title>FACIU\s+v6\.41\.2/i.test(htmlContent));
check('Badge de versão no topbar exibe v6.41.2', htmlContent.includes('id="appVersionLabel">v6.41.2</span>'));

// 3. Testes Funcionais no DOM e Lógica de Renderização do Passo 5
console.log('\n--- 3. Testes Funcionais da Renderização do Passo 5 (renderFinalEmission) ---');
try {
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  // Extrair renderFinalEmission
  const emissionStart = htmlContent.indexOf('function renderFinalEmission');
  const emissionEnd = htmlContent.indexOf('window.renderFinalEmission', emissionStart);
  const emissionCode = htmlContent.slice(emissionStart, emissionEnd);

  // Criar mock runner
  function createEmissionRunner(isDraftVal, issuesList = []) {
    const evaluate = () => issuesList.map(t => ({ ok: false, title: t }));
    const lucide = { createIcons: () => {} };
    const runner = new Function(
      'window', 'document', 'evaluate', 'lucide', 'updateWebhookStatusBadge',
      emissionCode + '\nreturn renderFinalEmission;'
    );
    return runner(dom.window, document, evaluate, lucide, () => {});
  }

  // 3.1 Cenário A: Estudo COM pendências bloqueantes (exatamente como na imagem do usuário)
  console.log('\n- Cenário A: Estudo com 21 pendências bloqueantes (isDraft = true):');
  const issues21 = Array.from({ length: 21 }, (_, i) => `Pendência bloqueante ${i + 1}`);
  const renderWithIssues = createEmissionRunner(true, issues21);

  // Executar renderFinalEmission no DOM
  renderWithIssues();
  const hostArea = document.getElementById('emissionContentArea');

  check('Painel #emissionContentArea foi renderizado', !!hostArea);
  check('Alerta de pendências bloqueantes está presente', hostArea?.innerHTML.includes('Atenção: Estudo com pendências'));
  check('Indica a contagem de 21 pendência(s) bloqueante(s)', hostArea?.innerHTML.includes('21 pendência(s) bloqueante(s)'));

  const btnEmitirComPendencias = hostArea?.querySelector('#btnEmitRiaOfficial');
  check('Botão #btnEmitRiaOfficial ESTÁ PRESENTE no Passo 5 mesmo com pendências', !!btnEmitirComPendencias);
  check('Botão de emissão oficial exibe "Emitir RIA oficial (PDF)"', btnEmitirComPendencias?.textContent.includes('Emitir RIA oficial (PDF)'));
  check('Botão "Baixar Minuta (PDF)" também está presente', hostArea?.innerHTML.includes('Baixar Minuta (PDF)'));
  check('Botão "Transmitir para Nuvem Corporativa" está presente', hostArea?.innerHTML.includes('Transmitir para Nuvem Corporativa'));
  check('Botão "Visualizar Minuta na Tela" está presente', hostArea?.innerHTML.includes('Visualizar Minuta na Tela'));

  // 3.2 Cenário B: Estudo SEM pendências bloqueantes (isDraft = false)
  console.log('\n- Cenário B: Estudo validado e completo (isDraft = false):');
  const renderClean = createEmissionRunner(false, []);
  renderClean();

  check('Mensagem de estudo validado está presente', hostArea?.innerHTML.includes('Estudo validado'));
  const btnEmitirLimpo = hostArea?.querySelector('#btnEmitRiaOfficial');
  check('Botão #btnEmitRiaOfficial ESTÁ PRESENTE quando validado', !!btnEmitirLimpo);
  check('Botão "Baixar Minuta (PDF)" continua disponível', hostArea?.innerHTML.includes('Baixar Minuta (PDF)'));
  check('Botão "Transmitir para Nuvem Corporativa" continua disponível', hostArea?.innerHTML.includes('Transmitir para Nuvem Corporativa'));

  // 4. Verificação de Ausência no Passo 3 (Preparação do RIA)
  console.log('\n--- 4. Verificação de Ausência dos Botões no Passo 3 (Preparação do RIA) ---');
  check('Passo 3 NÃO possui o botão btnSendRiaWebhook', !htmlContent.includes('id="btnSendRiaWebhook"'));
  check('Passo 3 NÃO injeta "Emitir RIA oficial" no .ria-actions', !htmlContent.includes('.textContent=\' Emitir RIA oficial\''));
  check('Passo 3 possui apenas ações de minuta e json', htmlContent.includes('data-ria-action="print">Baixar minuta (PDF)'));

  // 5. Verificação da Exportação de window.issue
  console.log('\n--- 5. Verificação da Exportação Global de issue ---');
  check('Declaração window.issue = issue presente no script', htmlContent.includes('window.issue = issue;'));

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
