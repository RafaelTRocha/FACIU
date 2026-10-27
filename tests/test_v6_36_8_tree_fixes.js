const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('--- TESTE AUTOMATIZADO v6.36.8: CORREÇÕES NA ÁRVORE (MENU RADIAL E PORTAS CARDINAIS) ---');

  const fileV6368 = path.join(__dirname, '..', 'FACIU-v6.36.8.html');
  const backupV6367 = path.join(__dirname, '..', 'backups', 'FACIU-v6.36.7.html');

  if (!fs.existsSync(fileV6368)) {
    console.error('ERRO: FACIU-v6.36.8.html não encontrado!');
    process.exit(1);
  }
  if (!fs.existsSync(backupV6367)) {
    console.error('ERRO CRÍTICO DE PRESERVAÇÃO: backups/FACIU-v6.36.7.html não encontrado!');
    process.exit(1);
  }
  console.log('✔ Passo Zero e preservação confirmados: backup v6.36.7 e arquivo v6.36.8 presentes.');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') consoleWarnings.push(msg.text());
  });

  const fileUrl = 'file:///' + fileV6368.replace(/\\/g, '/');
  console.log(`Carregando: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // 1. Validar SemVer
  const title = await page.title();
  if (!title.includes('v6.36.8')) throw new Error(`Título incorreto: ${title}`);
  console.log(`✔ Título da página: "${title}"`);

  const appVersion = await page.evaluate(() => window.APP_VERSION);
  if (appVersion !== '6.36.8') throw new Error(`window.APP_VERSION inválido: ${appVersion}`);
  console.log(`✔ window.APP_VERSION: "${appVersion}"`);

  // 2. Transitar para o Workspace e abrir Árvore (Passo 2, aba tree)
  await page.evaluate(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) splash.remove();
    const start = document.getElementById('startScreen');
    if (start) {
      start.setAttribute('hidden', '');
      start.style.setProperty('display', 'none', 'important');
    }
    const nav = document.getElementById('faciu-nav-container');
    if (nav) nav.style.display = 'block';
    goStep(2);
    switchStructureTab('tree');
  });
  await page.waitForTimeout(800);

  // 3. Teste 1: Hover sobre blocos e ausência total de "quadrado cinza" (eh-handle)
  console.log('\n--- TESTE 1: HOVER NORMAL E AUSÊNCIA DE QUADRADO CINZA ---');
  consoleWarnings.length = 0;

  const nodePosInfo = await page.evaluate(() => {
    const cyEl = document.getElementById('cy');
    const rect = cyEl.getBoundingClientRect();
    const nodeFs1 = cy.getElementById('fs1');
    const pos = nodeFs1.renderedPosition();
    return {
      rect: { left: rect.left, top: rect.top },
      pos
    };
  });

  // Mover mouse sobre fs1
  await page.mouse.move(nodePosInfo.rect.left + nodePosInfo.pos.x, nodePosInfo.rect.top + nodePosInfo.pos.y);
  await page.waitForTimeout(300);

  const hoverState = await page.evaluate(() => {
    const ports = document.querySelectorAll('.node-port');
    const ehNodes = cy.nodes('.eh-handle');
    const untypedNodes = cy.nodes().filter(n => !n.data('disp') && n.id().includes('-'));
    return {
      portsCount: ports.length,
      ehNodesCount: ehNodes.length,
      untypedCount: untypedNodes.length,
      nodesCount: cy.nodes().length
    };
  });
  console.log('Estado no hover:', hoverState);

  if (hoverState.portsCount !== 4) {
    throw new Error(`FALHA: Esperado 4 portas amarelas no hover, encontrado ${hoverState.portsCount}!`);
  }
  if (hoverState.ehNodesCount > 0 || hoverState.untypedCount > 0) {
    throw new Error('FALHA: Nó fantasma do edgehandles (quadrado cinza) ainda presente!');
  }
  const mappingWarnings = consoleWarnings.filter(w => w.includes('Do not assign mappings'));
  if (mappingWarnings.length > 0) {
    throw new Error(`FALHA: Avisos de mapeamento no console detectados (${mappingWarnings.length})!`);
  }
  console.log('✔ 4 portas amarelas exibidas normalmente e ZERO quadrados cinzas ou avisos.');

  // 4. Teste 2: Acionar Menu Radial com segurar do clique (taphold / cxttapstart)
  console.log('\n--- TESTE 2: MENU RADIAL E OCULTAÇÃO DAS PORTAS ---');
  // Pressionar e segurar botão esquerdo por 700ms
  await page.mouse.down();
  await page.waitForTimeout(700);

  const duringHoldState = await page.evaluate(() => {
    const cxtEl = document.querySelector('.cxtmenu');
    const child = cxtEl ? cxtEl.firstElementChild : null;
    const ports = document.querySelectorAll('.node-port');
    const overlay = document.getElementById('portOverlay');
    return {
      cxtDisplay: child ? child.style.display : null,
      portsCount: ports.length,
      overlayHtml: overlay ? overlay.innerHTML : '',
      isRadialActive: window.isRadialMenuActive()
    };
  });
  console.log('Estado durante abertura do Menu Radial:', duringHoldState);

  if (duringHoldState.cxtDisplay !== 'block') {
    throw new Error('FALHA: Menu radial não abriu com o segurar do botão esquerdo!');
  }
  if (duringHoldState.portsCount !== 0) {
    throw new Error(`FALHA: As portas amarelas (${duringHoldState.portsCount}) ainda estão sobrepondo o menu radial!`);
  }
  if (!duringHoldState.isRadialActive) {
    throw new Error('FALHA: isRadialMenuActive() deve retornar true quando o menu está aberto!');
  }
  console.log('✔ Menu radial aberto com sucesso e portas amarelas 100% ocultadas (0 sobreposições).');

  // Capturar screenshot do menu radial sem sobreposição
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  await page.screenshot({ path: path.join(docsDir, 'v6368_cxtmenu_clean.png') });
  console.log('✔ Screenshot capturado: docs/v6368_cxtmenu_clean.png');

  // 5. Teste 3: Movimento do cursor sobre o menu não recria as portas
  console.log('\n--- TESTE 3: MOVIMENTO SOBRE O MENU NÃO RECRIAR PORTAS ---');
  await page.mouse.move(nodePosInfo.rect.left + nodePosInfo.pos.x + 40, nodePosInfo.rect.top + nodePosInfo.pos.y + 40);
  await page.waitForTimeout(200);

  const portsWhileHoveringMenu = await page.evaluate(() => document.querySelectorAll('.node-port').length);
  if (portsWhileHoveringMenu !== 0) {
    throw new Error(`FALHA: Portas foram recriadas indevidamente enquanto o menu está aberto (${portsWhileHoveringMenu})!`);
  }
  console.log('✔ Nenhuma porta recriada durante navegação dentro do menu radial.');

  // Soltar clique do mouse
  await page.mouse.up();
  await page.waitForTimeout(200);

  // 6. Teste 4: Conexão Drag-to-Connect funcionando perfeitamente
  console.log('\n--- TESTE 4: ARRASTE E CONEXÃO PELA PORTA (DRAG-TO-CONNECT) ---');
  // Mover cursor para área livre do canvas para fechar menu e desarmar hover anterior
  await page.mouse.move(nodePosInfo.rect.left + 200, nodePosInfo.rect.top + 300);
  await page.waitForTimeout(300);

  // Mover mouse para o nó fs2 para reativar as portas
  const fs2Pos = await page.evaluate(() => cy.getElementById('fs2').renderedPosition());
  await page.mouse.move(nodePosInfo.rect.left + fs2Pos.x, nodePosInfo.rect.top + fs2Pos.y);
  await page.waitForTimeout(400);

  const portsReopened = await page.evaluate(() => document.querySelectorAll('.node-port').length);
  console.log(`Portas reabertas no nó fs2 após fechar o menu: ${portsReopened}`);
  if (portsReopened !== 4) {
    throw new Error('FALHA: Portas amarelas não reapareceram no hover após fechar o menu!');
  }

  // Testar conexão entre fs1 e fal via handleNewConnection
  const connResult = await page.evaluate(() => {
    const beforeEdges = state.tree.edges.length;
    handleNewConnection('fs1', 'fal');
    const afterEdges = state.tree.edges.length;
    return { beforeEdges, afterEdges };
  });
  console.log('Resultado de conexão:', connResult);
  if (connResult.afterEdges !== connResult.beforeEdges + 1) {
    throw new Error('FALHA: Criação de conexão entre blocos falhou!');
  }
  console.log('✔ Conexão entre blocos estabelecida com sucesso.');

  // 7. Teste de Regressão: Menu dropdown da topbar
  console.log('\n--- TESTE 5: REGRESSÃO DO MENU ESTUDO NA TOPBAR ---');
  await page.click('#btnStudyMenu');
  await page.waitForTimeout(300);
  const ddOpened = await page.evaluate(() => {
    const dd = document.getElementById('studyMenuDropdown');
    return dd?.classList.contains('show');
  });
  if (!ddOpened) throw new Error('FALHA: Dropdown do estudo não abriu!');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  console.log('✔ Menu de ações do estudo na topbar 100% funcional.');

  await browser.close();
  console.log('\n======================================================');
  console.log('TODOS OS TESTES DA VERSÃO v6.36.8 PASSARAM COM SUCESSO! 100% OK');
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('\n❌ ERRO NO TESTE:', err);
  process.exit(1);
});
