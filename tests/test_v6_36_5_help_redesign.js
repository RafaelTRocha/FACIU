/**
 * tests/test_v6_36_5_help_redesign.js
 * Validação do Redesign da Central de Ajuda e Coerência de Temas (v6.36.5):
 * 1. SemVer e Metadados (v6.36.5)
 * 2. Preservação de Backups (backups/FACIU-v6.36.4.html)
 * 3. Inspeção Estática de Design Tokens e Estrutura do Header da Ajuda
 * 4. Testes Funcionais E2E no Chromium (Playwright):
 *    - Abertura e fechamento da Central de Ajuda (via API e tecla Esc)
 *    - Alternância e estilo de abas no switcher segmentado (Pill Brava Lima)
 *    - Renderização coerente no Tema Claro e Tema Escuro (sem fundo branco cego)
 *    - Busca de tópicos em tempo real
 *    - Alternância do Editor de Ajuda e preservação do modo leitura
 *    - Não-regressão do Ciclo de Vida ao Fechar Estudo (closeStudy)
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

console.log('=======================================================================');
console.log('=== TESTES DE INTEGRIDADE: REDESIGN DA AJUDA & TEMAS (v6.36.5)      ===');
console.log('=======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function check(desc, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${desc}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${desc} ${details ? `(${details})` : ''}`);
  }
}

(async () => {
  const htmlFile = fs.existsSync(path.resolve('FACIU-v6.36.5.html'))
    ? path.resolve('FACIU-v6.36.5.html')
    : path.resolve('backups', 'FACIU-v6.36.5.html');
  check('Arquivo FACIU-v6.36.5.html existe e está acessível', fs.existsSync(htmlFile));

  const html = fs.readFileSync(htmlFile, 'utf-8');

  // 1. SemVer e Metadados
  console.log('\n--- 1. SEMVER E METADADOS (v6.36.5) ---');
  check('Título da página contém v6.36.5', html.includes('<title>FACIU v6.36.5 | Ferramenta de Análise de Causas e Investigação Unificada</title>'));
  check('const APP_VERSION="6.36.5"', html.includes('const APP_VERSION="6.36.5";'));
  check('Start version no rodapé contém v6.36.5', html.includes('FACIU <span class="start-version">v6.36.5</span>'));
  check('appVersionLabel contém v6.36.5', html.includes('id="appVersionLabel">v6.36.5</span>'));
  check('Start screen pill contém v6.36.5', html.includes('v<span class="appv">6.36.5</span>'));

  // 2. Preservação de Backups
  console.log('\n--- 2. PRESERVAÇÃO DE BACKUPS ---');
  const backup6364 = path.resolve('backups', 'FACIU-v6.36.4.html');
  check('Backup backups/FACIU-v6.36.4.html existe e está íntegro', fs.existsSync(backup6364) && fs.statSync(backup6364).size > 2000000);

  // 3. Inspeção Estática do CSS e Header da Ajuda
  console.log('\n--- 3. DESIGN TOKENS E HEADER DA AJUDA ---');
  check('Estilo faciuAjudaIntegradaStyle presente', html.includes('id="faciuAjudaIntegradaStyle"'));
  check('Tokens de Tema Claro definidos (--header-bg, --segmented-bg, --tab-active-bg)',
    html.includes('--header-bg: linear-gradient') &&
    html.includes('--tab-active-bg: #d0f50d') &&
    html.includes('--segmented-bg:'));
  check('Tokens de Tema Escuro com seletor html[data-theme="dark"] e html.dark',
    html.includes('html[data-theme="dark"] #appHelpOverlay .faciu-ajuda-integrada') &&
    html.includes('html.dark #appHelpOverlay .faciu-ajuda-integrada'));
  check('Header modernizado com marca, navegação segmentada (.abas) e ações (.topo-acoes)',
    html.includes('class="topo-marca"') &&
    html.includes('class="help-rev-pill"') &&
    html.includes('class="abas"') &&
    html.includes('class="topo-acoes"'));
  check('Botões obrigatórios presentes com IDs mantidos (#btRecarregar, #btEditar, .faciu-ajuda-fechar)',
    html.includes('id="btRecarregar"') &&
    html.includes('id="btEditar"') &&
    html.includes('class="faciu-ajuda-fechar"'));

  // 4. Testes Funcionais no Navegador (Chromium / Playwright)
  console.log('\n--- 4. TESTES FUNCIONAIS E2E DA AJUDA (PLAYWRIGHT) ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const fileUrl = 'file:///' + htmlFile.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load' });

  // Abertura da ajuda
  await page.evaluate(() => window.openAppHelp('overview'));
  await page.waitForTimeout(300);
  const helpVisible = await page.isVisible('#appHelpOverlay');
  check('openAppHelp abre o overlay de ajuda com sucesso', helpVisible);

  // Verificação do Switcher Segmentado
  const activeTabDefault = await page.$eval('.aba[aria-selected="true"]', el => el.dataset.aba);
  check('Aba padrão selecionada é "aplicacao"', activeTabDefault === 'aplicacao');

  // Alternância para Conteúdo Técnico
  await page.click('.aba[data-aba="central"]');
  await page.waitForTimeout(300);
  const activeTabCentral = await page.$eval('.aba[aria-selected="true"]', el => el.dataset.aba);
  check('Alternância para "central" atualiza aria-selected="true"', activeTabCentral === 'central');

  // Validação da cor do Pill ativo (Brava Lima: rgb(208, 245, 13))
  const activeTabBg = await page.$eval('.aba[aria-selected="true"]', el => window.getComputedStyle(el).backgroundColor);
  check('Pill ativo tem cor de destaque Brava Lima (#d0f50d)', activeTabBg === 'rgb(208, 245, 13)');

  // Alternância para Tema Escuro
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(300);

  // Verificação de que o fundo do modal no tema escuro não é branco
  const helpOverlayBg = await page.$eval('#appHelpOverlay .faciu-ajuda-integrada', el => window.getComputedStyle(el).backgroundColor);
  const isDarkBg = helpOverlayBg === 'rgb(11, 7, 26)'; // #0b071a
  check('Fundo da Ajuda no Tema Escuro é #0b071a (rgb(11, 7, 26)), eliminando ofuscamento branco', isDarkBg, `recebeu ${helpOverlayBg}`);

  // Teste de Busca em tempo real
  await page.fill('#busca', 'árvore');
  await page.waitForTimeout(200);
  const filteredCount = await page.$$eval('#indice li', lis => lis.filter(li => li.style.display !== 'none').length);
  check('Busca em tempo real filtra a lista de tópicos', filteredCount > 0 && filteredCount < 30);

  await page.fill('#busca', '');
  await page.waitForTimeout(200);

  // Teste do Editor de Ajuda
  await page.click('#btEditar');
  await page.waitForTimeout(300);
  const editorVisible = await page.isVisible('#editor');
  check('Botão #btEditar abre o painel de edição (#editor)', editorVisible);

  // Fechamento do Editor
  await page.click('#btEditar');
  await page.waitForTimeout(300);
  const editorClosed = await page.isVisible('#leitura');
  check('Segundo clique em #btEditar retorna ao modo de leitura (#leitura)', editorClosed);

  // Fechamento com tecla Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const helpClosedEsc = !(await page.isVisible('#appHelpOverlay'));
  check('Tecla Escape fecha o overlay de ajuda com sucesso', helpClosedEsc);

  // Reabertura e fechamento via botão Fechar (.faciu-ajuda-fechar)
  await page.evaluate(() => window.openAppHelp('overview'));
  await page.waitForTimeout(200);
  await page.click('.faciu-ajuda-fechar');
  await page.waitForTimeout(300);
  const helpClosedBtn = !(await page.isVisible('#appHelpOverlay'));
  check('Botão .faciu-ajuda-fechar fecha o overlay de ajuda com sucesso', helpClosedBtn);

  // 5. Teste de Regressão do Ciclo de Vida (closeStudy)
  console.log('\n--- 5. NÃO-REGRESSÃO: CICLO DE VIDA AO FECHAR ESTUDO ---');
  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  await page.evaluate(() => {
    const ciiInp = document.getElementById('f_cii');
    const titInp = document.getElementById('f_titulo');
    if (ciiInp) ciiInp.value = 'CII-2026-REGRESSAO';
    if (titInp) titInp.value = 'Incidente Teste Regressao';
    window.onTriage();
    window.showStartScreen();
  });
  await page.waitForTimeout(400);

  const btnCloseVisible = await page.locator('#btn-close-active-study').isVisible();
  check('Botão "Fechar Estudo" visível no Hero Card quando estudo está ativo', btnCloseVisible);

  await page.click('#btn-close-active-study');
  await page.waitForTimeout(600);

  const heroStatusAfter = (await page.locator('#card-status-label').textContent()).trim();
  const btnCloseAfterVisible = await page.locator('#btn-close-active-study').isVisible();
  const stateReset = await page.evaluate(() => window.state?.triagem?.cii === '' && window.state?.triagem?.titulo === '');

  check('closeStudy fecha o estudo, restaura a tela inicial e reseta o state',
    heroStatusAfter.includes('Nenhuma Investigação Ativa no Navegador') &&
    btnCloseAfterVisible === false &&
    stateReset === true);

  await browser.close();

  console.log('\n=======================================================================');
  console.log(`TOTAL DE TESTES EXECUTADOS: ${totalTests}`);
  console.log(`SUCESSOS: [PASS] ${passedTests}`);
  console.log(`FALHAS:   [FAIL] ${failedTests}`);
  console.log('=======================================================================');

  if (failedTests > 0) {
    console.error(`\n>>> ${failedTests} TESTE(S) FALHARAM!`);
    process.exit(1);
  } else {
    console.log('\n>>> TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! <<<');
    process.exit(0);
  }
})();
