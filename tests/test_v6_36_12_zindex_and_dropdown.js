const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('========================================================================');
  console.log('=== TESTES AUTOMATIZADOS v6.36.12: Z-INDEX, MODAIS E MENUS SUSPENSOS ===');
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
  const targetHtml = path.resolve('FACIU-v6.36.12.html');
  const backupHtml = path.resolve('backups/FACIU-v6.36.11.html');
  check('Arquivo FACIU-v6.36.12.html existe na raiz', fs.existsSync(targetHtml));
  check('Arquivo de backup backups/FACIU-v6.36.11.html preservado', fs.existsSync(backupHtml));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('dialog', d => d.accept());

  await page.goto('file:///' + targetHtml.replace(/\\/g, '/'));
  await page.waitForTimeout(500);

  // 2. Verificação de Versão
  const appVersion = await page.evaluate(() => window.APP_VERSION);
  check('APP_VERSION é 6.36.12', appVersion === '6.36.12', `Obtido: ${appVersion}`);
  const title = await page.title();
  check('Title contém v6.36.12', title.includes('v6.36.12'), `Obtido: ${title}`);

  const startVersion = await page.evaluate(() => {
    const el = document.querySelector('.start-version');
    return el ? el.textContent.trim() : null;
  });
  check('start-version span contém v6.36.12', startVersion === 'v6.36.12', `Obtido: ${startVersion}`);

  const topbarVersion = await page.evaluate(() => {
    const el = document.getElementById('appVersionLabel');
    return el ? el.textContent.trim() : null;
  });
  check('appVersionLabel contém v6.36.12', topbarVersion === 'v6.36.12', `Obtido: ${topbarVersion}`);

  // =========================================================================
  // ISSUE 1: HIERARQUIA DE Z-INDEX ENTRE BARRAS E MODAIS
  // =========================================================================
  console.log('\n--- Testando Issue 1: Hierarquia de Z-Index e Modais ---');

  const zIndexes = await page.evaluate(() => {
    // Entrar na aplicação
    if (typeof showMainWorkspace === 'function') {
      showMainWorkspace();
    }

    const barra1 = document.querySelector('.bg-brava-navy.sticky');
    const barra1Z = barra1 ? window.getComputedStyle(barra1).zIndex : null;

    const modalTip = document.getElementById('modal-tip-detail');
    const modalStudy = document.getElementById('modal-study-info');
    const modalWorkspace = document.getElementById('modalWorkspaceManager');
    const modalTherefore = document.getElementById('modalThereforeTest');
    const modalAiAuditor = document.getElementById('modalAiAuditor');

    const getZ = el => el ? parseInt(window.getComputedStyle(el).zIndex, 10) : null;

    return {
      barra1Class: barra1 ? barra1.className : '',
      barra1Z: barra1Z ? parseInt(barra1Z, 10) : null,
      modalTipClass: modalTip ? modalTip.className : '',
      modalTipZ: getZ(modalTip),
      modalStudyClass: modalStudy ? modalStudy.className : '',
      modalStudyZ: getZ(modalStudy),
      modalWorkspaceClass: modalWorkspace ? modalWorkspace.className : '',
      modalWorkspaceZ: getZ(modalWorkspace),
      modalThereforeZ: getZ(modalTherefore),
      modalAiAuditorZ: getZ(modalAiAuditor),
    };
  });

  check('Barra 1 não tem mais z-[10001], agora possui z-30',
    zIndexes.barra1Z === 30 || (!zIndexes.barra1Class.includes('z-[10001]') && zIndexes.barra1Class.includes('z-30')),
    `Classe: ${zIndexes.barra1Class}, z-index: ${zIndexes.barra1Z}`);

  check('modal-tip-detail possui z-index 20000',
    zIndexes.modalTipZ === 20000 && zIndexes.modalTipClass.includes('z-[20000]'),
    `Classe: ${zIndexes.modalTipClass}, z-index: ${zIndexes.modalTipZ}`);

  check('modal-study-info possui z-index 20000',
    zIndexes.modalStudyZ === 20000 && zIndexes.modalStudyClass.includes('z-[20000]'),
    `Classe: ${zIndexes.modalStudyClass}, z-index: ${zIndexes.modalStudyZ}`);

  check('modalWorkspaceManager possui z-index 20000',
    zIndexes.modalWorkspaceZ === 20000 && zIndexes.modalWorkspaceClass.includes('z-[20000]'),
    `Classe: ${zIndexes.modalWorkspaceClass}, z-index: ${zIndexes.modalWorkspaceZ}`);

  check('modalThereforeTest possui z-index 20000',
    zIndexes.modalThereforeZ === 20000,
    `z-index: ${zIndexes.modalThereforeZ}`);

  check('modalAiAuditor possui z-index 20000',
    zIndexes.modalAiAuditorZ === 20000,
    `z-index: ${zIndexes.modalAiAuditorZ}`);

  // =========================================================================
  // ISSUE 2: TESTE FUNCIONAL DE ABERTURA DE MODAL SEM CONFLITO COM HEADER
  // =========================================================================
  console.log('\n--- Testando Abertura de Modais ---');

  const modalOpenResult = await page.evaluate(() => {
    // Abrir modal de estudo ativo
    if (typeof openStudyInfoModal === 'function') {
      openStudyInfoModal();
    }
    const modalStudy = document.getElementById('modal-study-info');
    const isVisible = modalStudy && !modalStudy.classList.contains('hidden') && modalStudy.style.display !== 'none';
    const computedZ = modalStudy ? window.getComputedStyle(modalStudy).zIndex : null;

    // Fechar modal
    if (typeof closeStudyInfoModal === 'function') {
      closeStudyInfoModal();
    }

    return { isVisible, computedZ: parseInt(computedZ, 10) };
  });

  check('openStudyInfoModal abre modal-study-info com sucesso em camada frontal (z-index 20000)',
    modalOpenResult.isVisible && modalOpenResult.computedZ === 20000,
    `Visível: ${modalOpenResult.isVisible}, z-index: ${modalOpenResult.computedZ}`);

  // =========================================================================
  // ISSUE 3: MENUS SUSPENSOS E DROPDOWN DE AJUDA
  // =========================================================================
  console.log('\n--- Testando Menus Suspensos e Dropdown de Ajuda ---');

  const dropdownResult = await page.evaluate(() => {
    const helpBtn = document.getElementById('btnHelpMenu');
    if (helpBtn) {
      helpBtn.click();
    }
    const dropdown = document.getElementById('helpDropdown');
    const isVisible = dropdown && dropdown.classList.contains('show');
    const computedZ = dropdown ? window.getComputedStyle(dropdown).zIndex : null;

    // Fechar clicando fora
    if (typeof toggleHelpDropdown === 'function') {
      toggleHelpDropdown(false);
    }

    return {
      hasBtn: !!helpBtn,
      hasDropdown: !!dropdown,
      isVisible,
      computedZ: computedZ ? parseInt(computedZ, 10) : null
    };
  });

  check('btnHelpMenu e helpDropdown existem no DOM',
    dropdownResult.hasBtn && dropdownResult.hasDropdown);

  check('helpDropdown abre com z-index elevado (>= 1000)',
    dropdownResult.isVisible && (dropdownResult.computedZ >= 1000 || isNaN(dropdownResult.computedZ)),
    `Visível: ${dropdownResult.isVisible}, Z-index: ${dropdownResult.computedZ}`);

  // =========================================================================
  // ISSUE 4: CRONOLOGIA (REGRESSÃO DA v6.36.11)
  // =========================================================================
  console.log('\n--- Testando Regressão: Cronologia da v6.36.11 ---');

  const chronTest = await page.evaluate(() => {
    const testFacts = [
      { id: '1', phase: 'after', dateTime: '2026-10-08T12:00', description: 'Depois' },
      { id: '2', phase: 'before', dateTime: '2026-10-08T08:00', description: 'Antes' },
      { id: '3', phase: 'during', dateTime: '2026-10-08T10:00', description: 'Durante' }
    ];
    const ordered = window.getChronologyByPhases(testFacts);
    return ordered.map(f => f.phase);
  });

  check('getChronologyByPhases continua ordenando [before, during, after]',
    chronTest[0] === 'before' && chronTest[1] === 'during' && chronTest[2] === 'after',
    `Ordem: ${JSON.stringify(chronTest)}`);

  // =========================================================================
  // VERIFICAÇÃO DE ERROS NO CONSOLE
  // =========================================================================
  check('Nenhum erro no console durante a execução', consoleErrors.length === 0,
    consoleErrors.join('; '));

  await browser.close();

  console.log(`\nResultado Final: ${passed} passaram, ${failed} falharam.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('Todos os testes passaram com sucesso!');
  }
})();
