const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('========================================================================');
  console.log('=== TESTES AUTOMATIZADOS v6.36.11: CRONOLOGIA NO RIA E MENUS NA ÁRVORE ===');
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
  const targetHtml = path.resolve('FACIU-v6.36.11.html');
  const backupHtml = path.resolve('backups/FACIU-v6.36.10.html');
  check('Arquivo FACIU-v6.36.11.html existe na raiz', fs.existsSync(targetHtml));
  check('Arquivo de backup backups/FACIU-v6.36.10.html preservado', fs.existsSync(backupHtml));

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
  check('APP_VERSION é 6.36.11', appVersion === '6.36.11', `Obtido: ${appVersion}`);
  const title = await page.title();
  check('Title contém v6.36.11', title.includes('v6.36.11'), `Obtido: ${title}`);

  // =========================================================================
  // ISSUE 1: ORDENAÇÃO DA CRONOLOGIA NO RIA (ANTES, DURANTE, DEPOIS)
  // =========================================================================
  console.log('\n--- Testando Issue 1: Cronologia no RIA por Fases (Antes, Durante, Depois) ---');

  const chronTestResult = await page.evaluate(() => {
    // Definir conjunto propositalmente desordenado de fatos
    const testFacts = [
      { id: 'CHR-001', phase: 'during', dateTime: '2026-10-08T10:00', description: 'Fato Durante 1 (10h)' },
      { id: 'CHR-002', phase: 'after', dateTime: '2026-10-08T14:00', description: 'Fato Depois 1 (14h)' },
      { id: 'CHR-003', phase: 'before', dateTime: '2026-10-08T08:30', description: 'Fato Antes 2 (08h30)' },
      { id: 'CHR-004', phase: 'during', dateTime: '2026-10-08T10:15', description: 'Fato Durante 2 (10h15)' },
      { id: 'CHR-005', phase: 'before', dateTime: '2026-10-08T07:00', description: 'Fato Antes 1 (07h00)' },
      { id: 'CHR-006', phase: 'after', dateTime: '2026-10-08T12:00', description: 'Fato Depois 0 (12h00)' }
    ];

    window.state.chronology = testFacts;

    // 1. Testar ordenação canônica por fases
    const ordered = window.getChronologyByPhases(testFacts);
    const orderedDescs = ordered.map(x => x.description);

    // 2. Testar renderização HTML das linhas da tabela do RIA (riaChronRows)
    const rowsHtml = window.faciuRia.chronRows();
    const tempDiv = document.createElement('tbody');
    tempDiv.innerHTML = rowsHtml;
    const tableDescs = [...tempDiv.querySelectorAll('tr td:last-child .value')].map(el => el.textContent.trim());

    // 3. Testar modelo consumido pelo gerador vetorial/PDF (riaModelo)
    const modelo = window.faciuRiaGenerator ? window.faciuRiaGenerator.riaModelo() : null;
    const modeloDescs = modelo ? modelo.crono.map(x => x.t) : [];

    // 4. Testar estrutura de colunas do relatório (deve manter formato de 3 colunas padrão: Data, Hora, Descrição)
    const docHtml = window.faciuRia.documentHtml();
    const parser = new DOMParser();
    const doc = parser.parseFromString(docHtml, 'text/html');
    const chronTable = [...doc.querySelectorAll('table.ria-form-table')].find(t => t.textContent.includes('Cronologia dos principais fatos'));
    const cols = chronTable ? [...chronTable.querySelectorAll('tr:nth-child(2) td')].map(td => td.textContent.replace(/\s+/g, ' ').trim()) : [];

    return {
      orderedDescs,
      tableDescs,
      modeloDescs,
      cols,
      tableRowsCount: tableDescs.length
    };
  });

  check('getChronologyByPhases() ordena primeiro Antes, depois Durante, depois Depois',
    chronTestResult.orderedDescs[0] === 'Fato Antes 1 (07h00)' &&
    chronTestResult.orderedDescs[1] === 'Fato Antes 2 (08h30)' &&
    chronTestResult.orderedDescs[2] === 'Fato Durante 1 (10h)' &&
    chronTestResult.orderedDescs[3] === 'Fato Durante 2 (10h15)' &&
    chronTestResult.orderedDescs[4] === 'Fato Depois 0 (12h00)' &&
    chronTestResult.orderedDescs[5] === 'Fato Depois 1 (14h)',
    `Obtido: ${JSON.stringify(chronTestResult.orderedDescs)}`
  );

  check('riaChronRows() renderiza exatamente as 6 linhas na ordem Antes -> Durante -> Depois',
    chronTestResult.tableDescs[0] === 'Fato Antes 1 (07h00)' &&
    chronTestResult.tableDescs[1] === 'Fato Antes 2 (08h30)' &&
    chronTestResult.tableDescs[2] === 'Fato Durante 1 (10h)' &&
    chronTestResult.tableDescs[3] === 'Fato Durante 2 (10h15)' &&
    chronTestResult.tableDescs[4] === 'Fato Depois 0 (12h00)' &&
    chronTestResult.tableDescs[5] === 'Fato Depois 1 (14h)',
    `Obtido: ${JSON.stringify(chronTestResult.tableDescs)}`
  );

  check('riaModelo().crono segue rigorosamente a mesma ordenação por fases',
    chronTestResult.modeloDescs[0] === 'Fato Antes 1 (07h00)' &&
    chronTestResult.modeloDescs[1] === 'Fato Antes 2 (08h30)' &&
    chronTestResult.modeloDescs[5] === 'Fato Depois 1 (14h)',
    `Obtido: ${JSON.stringify(chronTestResult.modeloDescs)}`
  );

  check('Formato de apresentação do relatório RIA permanece inalterado (3 colunas: Data, Hora, Descrição)',
    chronTestResult.cols.length === 3 &&
    chronTestResult.cols[0].includes('Data') &&
    chronTestResult.cols[1].includes('Hora') &&
    chronTestResult.cols[2].includes('Descrição do evento'),
    `Colunas: ${JSON.stringify(chronTestResult.cols)}`
  );

  // =========================================================================
  // ISSUE 2: MENU SUSPENSO NA ÁRVORE E BOLINHAS AMARELAS
  // =========================================================================
  console.log('\n--- Testando Issue 2: Menu Suspenso na Árvore e Isolamento das Bolinhas ---');

  await page.evaluate(() => {
    window.goStep(2);
    window.switchStructureTab('tree');
  });
  await page.waitForTimeout(500);

  const zIndexCheck = await page.evaluate(() => {
    const navRoot = document.querySelector('.faciu-nav-root');
    const headerRow1 = navRoot?.firstElementChild;
    const studyDropdown = document.querySelector('#studyMenuDropdown');
    const cxtmenu = document.querySelector('.cxtmenu');
    const portOverlay = document.getElementById('portOverlay');
    const inspector = document.getElementById('treeFloatingInspector');

    const navZ = parseInt(window.getComputedStyle(navRoot).zIndex, 10);
    const dropZ = parseInt(window.getComputedStyle(studyDropdown).zIndex, 10);
    const overlayZ = parseInt(window.getComputedStyle(portOverlay).zIndex, 10);
    const inspectorZ = parseInt(window.getComputedStyle(inspector).zIndex, 10);
    const cxtZ = cxtmenu ? parseInt(window.getComputedStyle(cxtmenu).zIndex, 10) : 0;

    return { navZ, dropZ, overlayZ, inspectorZ, cxtZ };
  });

  check('Cabeçalho .faciu-nav-root possui z-index elevado (10000)', zIndexCheck.navZ >= 10000, `Obtido: ${zIndexCheck.navZ}`);
  check('Menu suspenso .faciu-dropdown possui z-index superior a toda árvore (10005)', zIndexCheck.dropZ >= 10005, `Obtido: ${zIndexCheck.dropZ}`);
  check('Menu radial .cxtmenu possui z-index inferior ao cabeçalho (9000 < 10000)', zIndexCheck.cxtZ < zIndexCheck.navZ, `Cxt: ${zIndexCheck.cxtZ}, Nav: ${zIndexCheck.navZ}`);
  check('Inspector da árvore possui z-index inferior ao cabeçalho (50 < 10000)', zIndexCheck.inspectorZ < zIndexCheck.navZ, `Inspector: ${zIndexCheck.inspectorZ}, Nav: ${zIndexCheck.navZ}`);

  // Testar hover enquanto o menu suspenso [Estudo v] está aberto diretamente sobre um nó
  console.log('\n--- Testando Simulação Interativa de Hover com Menu Aberto sobre Nó ---');
  const simResult = await page.evaluate(() => {
    // 1. Posicionar nó 0 diretamente na área onde o menu suspenso cai
    const dd = document.getElementById('studyMenuDropdown');
    const n = cy.nodes()[0];
    window.toggleStudyMenuDropdown(true);

    const ddRect = dd.getBoundingClientRect();
    n.renderedPosition({ x: ddRect.left + 50, y: ddRect.top + 50 });

    // 2. Disparar evento de hover no nó
    cy.trigger('mouseover', { target: n });
    showPortsForNode(n);

    const portsWhileOpen = document.querySelectorAll('#portOverlay .node-port').length;
    const overlayDisplayWhileOpen = window.getComputedStyle(document.getElementById('portOverlay')).display;
    const bodyHasDropdownClass = document.body.classList.contains('dropdown-open');

    // 3. Fechar menu suspenso
    window.toggleStudyMenuDropdown(false);
    const bodyHasDropdownClassAfter = document.body.classList.contains('dropdown-open');

    // 4. Hover com menu fechado
    showPortsForNode(n);
    const portsWhileClosed = document.querySelectorAll('#portOverlay .node-port').length;

    return {
      portsWhileOpen,
      overlayDisplayWhileOpen,
      bodyHasDropdownClass,
      bodyHasDropdownClassAfter,
      portsWhileClosed
    };
  });

  check('Quando o menu suspenso está aberto, body recebe classe .dropdown-open', simResult.bodyHasDropdownClass === true);
  check('Quando o menu suspenso está aberto, 0 bolinhas amarelas são renderizadas (portsCount === 0)', simResult.portsWhileOpen === 0, `Qtd: ${simResult.portsWhileOpen}`);
  check('Quando o menu suspenso está aberto, #portOverlay tem display="none"', simResult.overlayDisplayWhileOpen === 'none');
  check('Ao fechar o menu suspenso, classe .dropdown-open é removida', simResult.bodyHasDropdownClassAfter === false);
  check('Com o menu fechado, as 4 portas amarelas cardinais voltam a funcionar normalmente', simResult.portsWhileClosed === 4, `Qtd: ${simResult.portsWhileClosed}`);

  // Testar também com Menu de Ajuda (helpDropdown)
  const helpMenuTest = await page.evaluate(() => {
    const n = cy.nodes()[0];
    window.toggleHelpDropdown(true);
    showPortsForNode(n);
    const portsHelpOpen = document.querySelectorAll('#portOverlay .node-port').length;
    const bodyHelpClass = document.body.classList.contains('dropdown-open');

    window.toggleHelpDropdown(false);
    showPortsForNode(n);
    const portsHelpClosed = document.querySelectorAll('#portOverlay .node-port').length;

    return { portsHelpOpen, bodyHelpClass, portsHelpClosed };
  });

  check('Menu Ajuda aberto: 0 bolinhas amarelas e classe .dropdown-open ativa', helpMenuTest.portsHelpOpen === 0 && helpMenuTest.bodyHelpClass === true);
  check('Menu Ajuda fechado: bolinhas voltam a funcionar normalmente (4)', helpMenuTest.portsHelpClosed === 4);

  // Testar também fechamento com clique fora
  const outsideClickTest = await page.evaluate(() => {
    window.toggleStudyMenuDropdown(true);
    const wasOpen = document.body.classList.contains('dropdown-open');
    // Disparar clique no canvas ou fora
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const isOpenAfter = document.body.classList.contains('dropdown-open');
    const ddIsOpen = document.getElementById('studyMenuDropdown').classList.contains('show');
    return { wasOpen, isOpenAfter, ddIsOpen };
  });

  check('Clique fora fecha o menu suspenso e limpa a classe .dropdown-open', outsideClickTest.wasOpen === true && outsideClickTest.isOpenAfter === false && outsideClickTest.ddIsOpen === false);

  await browser.close();

  console.log('\n========================================================================');
  console.log(`=== RESULTADO FINAL: ${passed} PASSOU, ${failed} FALHOU ===`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('✔ TODAS AS CORREÇÕES VERIFICADAS COM SUCESSO (100% GREEN)');
    process.exit(0);
  }
})();
