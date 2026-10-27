/**
 * tests/test_v6_36_4_close_study_lifecycle.js
 * Validação da Correção do Ciclo de Vida ao Fechar Estudo (v6.36.4):
 * 1. SemVer e Metadados (v6.36.4)
 * 2. Preservação de Backups (backups/FACIU-v6.36.3.html)
 * 3. Inspeção Estática de Limpeza em closeStudy(), save() e recordCurrentStudy()
 * 4. Teste Funcional E2E no Chromium (Playwright):
 *    - Criação de estudo com dados em tela
 *    - Acionamento de closeStudy()
 *    - Verificação de limpeza total do DOM, Estado e Armazenamento (IndexedDB/localStorage)
 *    - Verificação de que o Hero Card exibe "Nenhuma Investigação Ativa no Navegador"
 *    - Recarga de página (Reload) sem ressurreição de dados
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

console.log('=======================================================================');
console.log('=== TESTES DE INTEGRIDADE: CICLO DE VIDA AO FECHAR ESTUDO (v6.36.4) ===');
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
  const htmlFile = path.resolve('FACIU-v6.36.4.html');
  check('Arquivo FACIU-v6.36.4.html existe na raiz', fs.existsSync(htmlFile));

  const html = fs.readFileSync(htmlFile, 'utf-8');

  // 1. SemVer e Metadados
  console.log('\n--- 1. SEMVER E METADADOS (v6.36.4) ---');
  check('Título da página contém v6.36.4', html.includes('<title>FACIU v6.36.4 | Ferramenta de Análise de Causas e Investigação Unificada</title>'));
  check('const APP_VERSION="6.36.4"', html.includes('const APP_VERSION="6.36.4";'));
  check('Start version no rodapé contém v6.36.4', html.includes('FACIU <span class="start-version">v6.36.4</span>'));
  check('appVersionLabel contém v6.36.4', html.includes('id="appVersionLabel">v6.36.4</span>'));
  check('Start screen pill contém v6.36.4', html.includes('v<span class="appv">6.36.4</span>'));

  // 2. Preservação de Backups
  console.log('\n--- 2. PRESERVAÇÃO DE BACKUPS ---');
  const backup6363 = path.resolve('backups', 'FACIU-v6.36.3.html');
  check('Backup backups/FACIU-v6.36.3.html existe e está íntegro', fs.existsSync(backup6363) && fs.statSync(backup6363).size > 2000000);

  // 3. Inspeção Estática de Estrutura
  console.log('\n--- 3. ESTRUTURA DE LIMPEZA E CONTROLE DE ESTADO ---');
  check('closeStudy cancela temporizadores pendentes (idbTimeout, saveTimer, riaRevalTimer, invalPendente)',
    html.includes('window.store.idbTimeout = null;') &&
    html.includes('FaciuFolderMonitor.saveTimer = null;') &&
    html.includes('riaRevalTimer = null;')
  );
  check('closeStudy limpa campos de formulário e chama hydrateTriage()',
    html.includes("if (typeof hydrateTriage === 'function') hydrateTriage();") &&
    html.includes("['f_cii', 'f_titulo', 'f_ocorr'")
  );
  check('closeStudy purga IndexedDB (active_study) e chaves de localStorage',
    html.includes("await faciuDB.delete('active_study')") &&
    html.includes("localStorage.removeItem(STORE)")
  );
  check('save() possui trava para não persistir estudo vazio involuntariamente',
    html.includes("const hasData = state && (state.triagem?.cii || state.triagem?.titulo || state.audit?.length")
  );
  check('recordCurrentStudy possui trava hasData para evitar fantasmas no catálogo',
    html.includes("const hasData = !!(currentState.triagem?.cii || currentState.triagem?.titulo || currentState.audit?.length || currentState.chronology?.length);") &&
    html.includes("if (!hasData) return;")
  );

  // 4. Testes Funcionais no Navegador Real (Chromium)
  console.log('\n--- 4. TESTE FUNCIONAL E2E (CHROMIUM / PLAYWRIGHT) ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const fileUrl = 'file:///' + htmlFile.replace(/\\/g, '/');
  await page.goto(fileUrl);
  await page.waitForTimeout(1000);

  // Manipulador de diálogo confirm()
  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  // A. Inserir dados de estudo e simular trabalho em andamento
  await page.evaluate(() => {
    const ciiInp = document.getElementById('f_cii');
    const titInp = document.getElementById('f_titulo');
    if (ciiInp) ciiInp.value = 'CII-2026-PLAYWRIGHT';
    if (titInp) titInp.value = 'Vazamento Sob Pressão em Válvula';
    window.onTriage();
  });
  await page.waitForTimeout(500);

  // B. Verificar que o estudo está ativo na tela inicial
  await page.evaluate(() => window.showStartScreen());
  await page.waitForTimeout(300);

  const heroTitleBefore = (await page.locator('#card-title').textContent()).trim();
  const heroStatusBefore = (await page.locator('#card-status-label').textContent()).trim();
  const btnCloseBeforeVisible = await page.locator('#btn-close-active-study').isVisible();

  check('Estudo aparece ativo no Hero Card antes de fechar', heroTitleBefore.includes('CII-2026-PLAYWRIGHT'));
  check('Status exibe "Status da Investigação Ativa"', heroStatusBefore.includes('Status da Investigação Ativa'));
  check('Botão "Fechar Estudo" visível no Hero Card', btnCloseBeforeVisible === true);

  // C. Clicar em "Fechar Estudo"
  console.log('\n  [AÇÃO] Clicando no botão Fechar Estudo...');
  await page.click('#btn-close-active-study');
  await page.waitForTimeout(800);

  // D. Verificar estado imediato pós-fechamento
  const heroTitleAfter = (await page.locator('#card-title').textContent()).trim();
  const heroStatusAfter = (await page.locator('#card-status-label').textContent()).trim();
  const btnCloseAfterVisible = await page.locator('#btn-close-active-study').isVisible();

  check('Hero Card exibe título de início limpo', heroTitleAfter.includes('Inicie uma Nova Investigação ou Importe um Estudo Salvo'));
  check('Status exibe "Nenhuma Investigação Ativa no Navegador"', heroStatusAfter.includes('Nenhuma Investigação Ativa no Navegador'));
  check('Botão "Fechar Estudo" oculto após fechamento', btnCloseAfterVisible === false);

  const evalAfter = await page.evaluate(async () => {
    const activeInDB = await window.faciuDB.get('active_study');
    const fileHandleInDB = await window.faciuDB.get('file_handle', 'handles');
    const fileNameInDB = await window.faciuDB.get('file_name', 'handles');
    const domCii = document.getElementById('f_cii')?.value || '';
    const domTit = document.getElementById('f_titulo')?.value || '';
    const stateCii = window.state?.triagem?.cii || '';
    const stateTit = window.state?.triagem?.titulo || '';

    return {
      activeInDB: !!activeInDB,
      fileHandleInDB: !!fileHandleInDB,
      fileNameInDB: !!fileNameInDB,
      domCii,
      domTit,
      stateCii,
      stateTit
    };
  });

  check('DOM #f_cii está limpo após fechar', evalAfter.domCii === '');
  check('DOM #f_titulo está limpo após fechar', evalAfter.domTit === '');
  check('state.triagem.cii está limpo na memória', evalAfter.stateCii === '');
  check('state.triagem.titulo está limpo na memória', evalAfter.stateTit === '');
  check('active_study purgado do IndexedDB', evalAfter.activeInDB === false);
  check('file_handle purgado do IndexedDB', evalAfter.fileHandleInDB === false);
  check('file_name purgado do IndexedDB', evalAfter.fileNameInDB === false);

  // E. Recarregar a página para comprovar resiliência
  console.log('\n  [AÇÃO] Recarregando a página (F5 / Reload)...');
  await page.reload();
  await page.waitForTimeout(1000);

  const heroTitleReloaded = (await page.locator('#card-title').textContent()).trim();
  const heroStatusReloaded = (await page.locator('#card-status-label').textContent()).trim();
  const btnCloseReloadedVisible = await page.locator('#btn-close-active-study').isVisible();

  check('Após Reload: Hero Card mantém "Inicie uma Nova Investigação"', heroTitleReloaded.includes('Inicie uma Nova Investigação ou Importe um Estudo Salvo'));
  check('Após Reload: Status mantém "Nenhuma Investigação Ativa"', heroStatusReloaded.includes('Nenhuma Investigação Ativa no Navegador'));
  check('Após Reload: Botão "Fechar Estudo" permanece oculto', btnCloseReloadedVisible === false);

  const evalReloaded = await page.evaluate(() => {
    return {
      domCii: document.getElementById('f_cii')?.value || '',
      stateCii: window.state?.triagem?.cii || ''
    };
  });
  check('Após Reload: DOM continua sem ressuscitar dados', evalReloaded.domCii === '');
  check('Após Reload: Estado na memória continua limpo', evalReloaded.stateCii === '');

  await browser.close();

  // Resumo
  console.log('\n=======================================================================');
  console.log(`TOTAL DE TESTES: ${totalTests}`);
  console.log(`SUCESSOS [PASS]: ${passedTests}`);
  console.log(`FALHAS   [FAIL]: ${failedTests}`);
  console.log('=======================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
})();
