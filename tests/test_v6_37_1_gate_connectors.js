const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('========================================================================');
  console.log('=== TESTES AUTOMATIZADOS v6.37.1: CONECTORES LÓGICOS UNIFICADOS (FTA) ===');
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
  const targetHtml = path.resolve('FACIU-v6.37.1.html');
  const backupHtml = path.resolve('backups/FACIU-v6.37.0.html');
  check('Arquivo FACIU-v6.37.1.html existe na raiz', fs.existsSync(targetHtml));
  check('Arquivo de backup backups/FACIU-v6.37.0.html preservado', fs.existsSync(backupHtml));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('dialog', d => d.accept());

  await page.goto('file:///' + targetHtml.replace(/\\/g, '/'));
  await page.waitForTimeout(600);

  // 2. Verificação de Versão
  const appVersion = await page.evaluate(() => window.APP_VERSION);
  check('APP_VERSION é 6.37.1', appVersion === '6.37.1', `Obtido: ${appVersion}`);
  const title = await page.title();
  check('Title contém v6.37.1', title.includes('v6.37.1'), `Obtido: ${title}`);

  // Iniciar nova investigação para ir ao estudo
  await page.click('#startBtnNew');
  await page.waitForTimeout(400);

  // =========================================================================
  // TASK 1: CENÁRIO DA IMAGEM 1 - PAI COM 5 FILHOS E CONECTOR [OU] ÚNICO
  // =========================================================================
  console.log('\n--- Testando Cenário 1: Pai com 5 Filhos e Conector [OU] Único ---');

  const scenario1Result = await page.evaluate(async () => {
    goStep(2);
    switchStructureTab('tree');

    state.tree = {
      nodes: [
        { id: 'evt', kind: 'evt', label: 'Evento topo: Perda de Contenção' },
        { id: 'cr1', kind: 'raiz', root: true, label: 'Causa-Raiz: Falha no Procedimento' },
        { id: 'a1', kind: 'acao', label: '[A1] Ação 1' },
        { id: 'a2', kind: 'acao', label: '[A2] Ação 2' },
        { id: 'a3', kind: 'acao', label: '[A3] Ação 3' },
        { id: 'a4', kind: 'acao', label: '[A4] Ação 4' },
        { id: 'a5', kind: 'acao', label: '[A5] Ação 5' }
      ],
      edges: [
        { id: 'e0', source: 'evt', target: 'cr1', gate: '', logic: '' },
        { id: 'ea1', source: 'cr1', target: 'a1', gate: 'OU', logic: 'OU' },
        { id: 'ea2', source: 'cr1', target: 'a2', gate: 'OU', logic: 'OU' },
        { id: 'ea3', source: 'cr1', target: 'a3', gate: 'OU', logic: 'OU' },
        { id: 'ea4', source: 'cr1', target: 'a4', gate: 'OU', logic: 'OU' },
        { id: 'ea5', source: 'cr1', target: 'a5', gate: 'OU', logic: 'OU' }
      ]
    };

    cyFromState();
    relayout(true);
    await new Promise(r => setTimeout(r, 600));

    const pNode = cy.getElementById('cr1');
    const pPos = pNode.position();
    const gateBadge = cy.getElementById('__gate_cr1');
    const allBadges = cy.nodes('[kind="gate_badge"]');
    const edgeLabels = cy.edges().map(e => e.style('label')).filter(l => l !== '');

    return {
      pPos,
      badgeCount: allBadges.length,
      hasCr1Badge: gateBadge.length === 1,
      badgeLabel: gateBadge.data('label'),
      badgeGateType: gateBadge.data('gateType'),
      badgePos: gateBadge.position(),
      nonEmptyEdgeLabelsCount: edgeLabels.length,
      edgeLabels
    };
  });

  check('Existe exatamente 1 badge de porta lógica para o nó pai cr1', scenario1Result.hasCr1Badge && scenario1Result.badgeCount === 1);
  check('O rótulo do badge é OU', scenario1Result.badgeLabel === 'OU');
  check('O badge está posicionado verticalmente abaixo do pai e centralizado no eixo X', 
    scenario1Result.badgePos.x === scenario1Result.pPos.x && scenario1Result.badgePos.y > scenario1Result.pPos.y,
    `Pai: (${scenario1Result.pPos.x}, ${scenario1Result.pPos.y}), Badge: (${scenario1Result.badgePos.x}, ${scenario1Result.badgePos.y})`
  );
  check('Nenhuma das 5 arestas filhas possui rótulo OU redundante nas linhas', scenario1Result.nonEmptyEdgeLabelsCount === 0);

  // =========================================================================
  // TASK 2: CENÁRIO DAS IMAGENS 2 E 3 - PAI COM 2 FILHOS E CONECTOR [E] ÚNICO (PONTO VERMELHO)
  // =========================================================================
  console.log('\n--- Testando Cenário 2: Pai CC4 com Filhos CC5/CC6 e Conector [E] Único ---');

  const scenario2Result = await page.evaluate(async () => {
    state.tree = {
      nodes: [
        { id: 'evt', kind: 'evt', label: 'Evento topo' },
        { id: 'imed', kind: 'imediata', label: 'Causa Imediata' },
        { id: 'cc4', kind: 'hipotese', estado: 'confirmada', label: '[CC4] Execução operacional' },
        { id: 'cc5', kind: 'contrib', estado: 'confirmada', label: '[CC5] Ausência de interrupção' },
        { id: 'cc6', kind: 'contrib', estado: 'confirmada', label: '[CC6] Monitoramento insuficiente' }
      ],
      edges: [
        { id: 'e1', source: 'evt', target: 'imed', gate: '', logic: '' },
        { id: 'e2', source: 'imed', target: 'cc4', gate: '', logic: '' },
        { id: 'e3', source: 'cc4', target: 'cc5', gate: 'E', logic: 'E' },
        { id: 'e4', source: 'cc4', target: 'cc6', gate: 'E', logic: 'E' }
      ]
    };

    cyFromState();
    relayout(true);
    await new Promise(r => setTimeout(r, 600));

    const cc4Node = cy.getElementById('cc4');
    const cc4Pos = cc4Node.position();
    const gateBadge = cy.getElementById('__gate_cc4');
    const allBadges = cy.nodes('[kind="gate_badge"]');
    const edgeLabels = cy.edges().map(e => e.style('label')).filter(l => l !== '');

    return {
      cc4Pos,
      badgeCount: allBadges.length,
      hasBadge: gateBadge.length === 1,
      badgeLabel: gateBadge.data('label'),
      badgeGateType: gateBadge.data('gateType'),
      badgePos: gateBadge.position(),
      nonEmptyEdgeLabelsCount: edgeLabels.length,
      bg: gateBadge.style('background-color')
    };
  });

  check('Existe exatamente 1 badge de porta lógica para o nó pai CC4', scenario2Result.hasBadge && scenario2Result.badgeCount === 1);
  check('O rótulo do badge é E', scenario2Result.badgeLabel === 'E');
  check('O badge CC4 está posicionado centralizado no tronco de saída (ponto vermelho)',
    scenario2Result.badgePos.x === scenario2Result.cc4Pos.x && scenario2Result.badgePos.y > scenario2Result.cc4Pos.y,
    `CC4: (${scenario2Result.cc4Pos.x}, ${scenario2Result.cc4Pos.y}), Badge: (${scenario2Result.badgePos.x}, ${scenario2Result.badgePos.y})`
  );
  check('Arestas de CC5 e CC6 não duplicam o rótulo E', scenario2Result.nonEmptyEdgeLabelsCount === 0);

  // =========================================================================
  // TASK 3: INTERATIVIDADE DO CONECTOR - CLIQUE PARA ALTERNAR ENTRE OU E E
  // =========================================================================
  console.log('\n--- Testando Task 3: Clique no Badge para Alternar Operador (E <-> OU) ---');

  const toggleResult = await page.evaluate(async () => {
    const badge = cy.getElementById('__gate_cc4');
    // Simula tap no badge
    badge.emit('tap');
    await new Promise(r => setTimeout(r, 300));

    const afterFirstTapBadge = cy.getElementById('__gate_cc4');
    const edgesFirstTap = state.tree.edges.filter(e => e.source === 'cc4').map(e => e.logic);

    // Tap novamente para alternar de volta
    afterFirstTapBadge.emit('tap');
    await new Promise(r => setTimeout(r, 300));

    const afterSecondTapBadge = cy.getElementById('__gate_cc4');
    const edgesSecondTap = state.tree.edges.filter(e => e.source === 'cc4').map(e => e.logic);

    return {
      firstTapLogic: afterFirstTapBadge.data('label'),
      edgesFirstTap,
      secondTapLogic: afterSecondTapBadge.data('label'),
      edgesSecondTap
    };
  });

  check('Primeiro clique no badge [E] alterna logicamente para [OU]', toggleResult.firstTapLogic === 'OU');
  check('Todas as arestas causais filhas foram atualizadas para OU', toggleResult.edgesFirstTap.every(l => l === 'OU'));
  check('Segundo clique no badge [OU] alterna de volta para [E]', toggleResult.secondTapLogic === 'E');
  check('Todas as arestas causais filhas foram atualizadas de volta para E', toggleResult.edgesSecondTap.every(l => l === 'E'));

  // =========================================================================
  // TASK 4: SINCRONIZAÇÃO AO ARRASTAR O NÓ PAI (DRAG / POSITION TRACKING)
  // =========================================================================
  console.log('\n--- Testando Task 4: Sincronização da Posição do Badge ao Arrastar Nó Pai ---');

  const dragResult = await page.evaluate(async () => {
    const cc4Node = cy.getElementById('cc4');
    const origBadgePos = { ...cy.getElementById('__gate_cc4').position() };

    // Move o nó pai para nova coordenada
    cc4Node.position({ x: cc4Node.position('x') + 80, y: cc4Node.position('y') + 50 });
    // Emite evento position
    cc4Node.emit('position');

    const newCc4Pos = cc4Node.position();
    const newBadgePos = cy.getElementById('__gate_cc4').position();

    return {
      origBadgePos,
      newCc4Pos,
      newBadgePos,
      syncedX: newBadgePos.x === newCc4Pos.x,
      syncedY: newBadgePos.y > newCc4Pos.y
    };
  });

  check('Ao mover o nó pai, o badge acompanha horizontalmente e verticalmente', dragResult.syncedX && dragResult.syncedY);

  // =========================================================================
  // TASK 5: ATUALIZAÇÃO VIA setSelectedEdgeLogic UNIFICA TODA A RAMIFICAÇÃO
  // =========================================================================
  console.log('\n--- Testando Task 5: setSelectedEdgeLogic Unifica Todas as Arestas Irmãs ---');

  const barResult = await page.evaluate(async () => {
    selectedEdgeId = 'e3'; // aresta cc4 -> cc5
    setSelectedEdgeLogic('OU');
    await new Promise(r => setTimeout(r, 300));

    const e3 = state.tree.edges.find(e => e.id === 'e3');
    const e4 = state.tree.edges.find(e => e.id === 'e4');
    const badge = cy.getElementById('__gate_cc4');

    return {
      e3Logic: e3.logic,
      e4Logic: e4.logic,
      badgeLabel: badge.data('label')
    };
  });

  check('setSelectedEdgeLogic atualiza aresta selecionada e todas as arestas irmãs para OU', 
    barResult.e3Logic === 'OU' && barResult.e4Logic === 'OU' && barResult.badgeLabel === 'OU'
  );

  // =========================================================================
  // TASK 6: INTEGRIDADE DO MODELO DE DADOS state.tree (ZERO POLUIÇÃO)
  // =========================================================================
  console.log('\n--- Testando Task 6: Integridade do Modelo de Dados ---');

  const stateIntegrityResult = await page.evaluate(() => {
    // Valida que state.tree.nodes NÃO contém nenhum nó gate_badge
    const rogueNodes = state.tree.nodes.filter(n => n.kind === 'gate_badge' || n.id.startsWith('__gate_'));
    return {
      rogueNodeCount: rogueNodes.length
    };
  });

  check('state.tree.nodes permanece estritamente semântico (zero poluição com nós visuais)', stateIntegrityResult.rogueNodeCount === 0);

  await browser.close();

  console.log('\n========================================================================');
  console.log(`=== RESULTADO FINAL: ${passed} PASSOU, ${failed} FALHOU ===`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
})();
