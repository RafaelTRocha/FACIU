const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('========================================================================');
  console.log('=== TESTES AUTOMATIZADOS v6.38.0: MULTI-SELEÇÃO E HIERARQUIA ESTRITA ===');
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
  const targetHtml = path.resolve('FACIU-v6.38.0.html');
  const backupHtml = path.resolve('backups/FACIU-v6.37.1.html');
  check('Arquivo FACIU-v6.38.0.html existe na raiz', fs.existsSync(targetHtml));
  check('Arquivo de backup backups/FACIU-v6.37.1.html preservado', fs.existsSync(backupHtml));

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
  check('APP_VERSION é 6.38.0', appVersion === '6.38.0', `Obtido: ${appVersion}`);
  const title = await page.title();
  check('Title contém v6.38.0', title.includes('v6.38.0'), `Obtido: ${title}`);

  // Iniciar nova investigação para ir ao estudo
  await page.click('#startBtnNew');
  await page.waitForTimeout(400);

  // Ir para Passo 2 (Árvore)
  await page.evaluate(() => {
    goStep(2);
    switchStructureTab('tree');
  });
  await page.waitForTimeout(400);

  // =========================================================================
  // TASK 1: ELIMINAÇÃO DA LIGAÇÃO LIVRE E PORTAS LATERAIS/TOPO
  // =========================================================================
  console.log('\n--- Testando Task 1: Eliminação de Ligações Livres e Restrição de Portas ---');

  const task1Result = await page.evaluate(() => {
    state.tree = {
      nodes: [
        { id: 'evt', kind: 'evt', label: 'Evento topo: Perda de Contenção' },
        { id: 'ci1', kind: 'imediata', label: 'Causa Imediata: Vazamento' },
        { id: 'h1', kind: 'hipotese', estado: 'confirmada', label: 'Hipótese 1: Corrosão' },
        { id: 'h2', kind: 'hipotese', estado: 'confirmada', label: 'Hipótese 2: Sobrecarga' },
        { id: 'a1', kind: 'acao', label: 'Ação Preventiva' }
      ],
      edges: [
        { id: 'e1', source: 'evt', target: 'ci1', gate: '', logic: '', kind: 'causal' },
        { id: 'e2', source: 'ci1', target: 'h1', gate: 'OU', logic: 'OU', kind: 'causal' },
        { id: 'e3', source: 'ci1', target: 'h2', gate: 'OU', logic: 'OU', kind: 'causal' }
      ]
    };
    cyFromState();
    relayout(true);

    // 1. Inspeciona portas criadas para um nó pai (ci1)
    const ci1Node = cy.getElementById('ci1');
    showPortsForNode(ci1Node);
    const ports = document.querySelectorAll('#portOverlay .node-port');
    const portBottom = document.querySelector('#portOverlay .node-port-bottom');
    const portCount = ports.length;

    // 2. Inspeciona portas para nó folha terminal (a1)
    const a1Node = cy.getElementById('a1');
    showPortsForNode(a1Node);
    const a1Ports = document.querySelectorAll('#portOverlay .node-port');
    const a1PortCount = a1Ports.length;

    // 3. Tenta conexão hierarquicamente inválida (ligação livre entre nós incompatíveis: ci1 -> a1)
    const edgeCountBefore = state.tree.edges.length;
    handleNewConnection('ci1', 'a1'); // imediata NÃO pode ter filho acao
    const edgeCountAfter = state.tree.edges.length;
    const invalidEdgeCreated = state.tree.edges.some(e => e.source === 'ci1' && e.target === 'a1');

    return {
      portCount,
      hasPortBottom: !!portBottom,
      a1PortCount,
      edgeCountBefore,
      edgeCountAfter,
      invalidEdgeCreated
    };
  });

  check('Nó pai possui exatamente 1 porta na base (bottom) e zero portas laterais ou de topo', task1Result.portCount === 1 && task1Result.hasPortBottom);
  check('Nó terminal (ação) não gera porta inferior pois não pode gerar filhos', task1Result.a1PortCount === 0);
  check('Conexão livre incompatível (imediata -> acao) é estritamente bloqueada sem criar aresta', 
    task1Result.edgeCountBefore === task1Result.edgeCountAfter && !task1Result.invalidEdgeCreated
  );

  // =========================================================================
  // TASK 2: BOTÃO DE ALTERNÂNCIA DE MODO SELEÇÃO NO CANVAS (TOOLBAR)
  // =========================================================================
  console.log('\n--- Testando Task 2: Botão de Modo Seleção na Toolbar ---');

  const btnSelectExists = await page.$('#btnSelectMode');
  check('Botão #btnSelectMode existe na micro-toolbar do Canvas', !!btnSelectExists);

  const toggleSelectResult = await page.evaluate(() => {
    const isModeInit = isTreeSelectMode;
    toggleTreeSelectMode(); // Ativa modo seleção
    const isModeActive = isTreeSelectMode;
    const isPanDisabled = !cy.userPanningEnabled();
    const isBoxEnabled = cy.boxSelectionEnabled();

    toggleTreeSelectMode(); // Desativa e volta para pan
    const isModeRestored = !isTreeSelectMode;
    const isPanRestored = cy.userPanningEnabled();

    return {
      isModeInit,
      isModeActive,
      isPanDisabled,
      isBoxEnabled,
      isModeRestored,
      isPanRestored
    };
  });

  check('Alternar #btnSelectMode desativa panning do canvas e ativa modo seleção retangular', 
    toggleSelectResult.isModeActive && toggleSelectResult.isPanDisabled && toggleSelectResult.isBoxEnabled
  );
  check('Alternar #btnSelectMode novamente restaura navegação padrão com pan', 
    toggleSelectResult.isModeRestored && toggleSelectResult.isPanRestored
  );

  // =========================================================================
  // TASK 3: MULTI-SELEÇÃO DE NÓS (SELEÇÃO EM BLOCO) E PAINEL DO INSPETOR
  // =========================================================================
  console.log('\n--- Testando Task 3: Multi-Seleção e Sincronização do Inspetor ---');

  const multiSelectResult = await page.evaluate(() => {
    // Simula seleção múltipla de 2 nós (h1 e h2)
    cy.$('node:selected').unselect();
    cy.$('#h1').select();
    cy.$('#h2').select();
    syncSelectedFromCy();

    const selectedCount = cy.nodes(':selected').filter('[kind != "gate_badge"]').length;
    const multiBox = document.getElementById('treeInspectorMultiBox');
    const badgeText = document.getElementById('inspectorBadge')?.textContent;
    const headerText = document.getElementById('inspectorHeaderLabel')?.textContent;
    const isMultiBoxVisible = multiBox && !multiBox.hidden;
    const multiBoxHtml = multiBox ? multiBox.innerHTML : '';

    return {
      selectedCount,
      isMultiBoxVisible,
      badgeText,
      headerText,
      hasPillH1: multiBoxHtml.includes('Corrosão'),
      hasPillH2: multiBoxHtml.includes('Sobrecarga')
    };
  });

  check('Cytoscape seleciona múltiplos nós simultaneamente', multiSelectResult.selectedCount === 2);
  check('Inspetor exibe badge de LOTE (2) e título indicando nós selecionados', 
    multiSelectResult.badgeText === 'LOTE (2)' && multiSelectResult.headerText.includes('2 blocos selecionados')
  );
  check('Caixa de Multi-Seleção (#treeInspectorMultiBox) é visível com pills dos nós selecionados', 
    multiSelectResult.isMultiBoxVisible && multiSelectResult.hasPillH1 && multiSelectResult.hasPillH2
  );

  // =========================================================================
  // TASK 4: ARRASTO EM BLOCO (SINCRONIZAÇÃO DE POSIÇÕES DE MÚLTIPLOS NÓS)
  // =========================================================================
  console.log('\n--- Testando Task 4: Sincronização de Arrasto em Bloco (Multi-Drag) ---');

  const multiDragResult = await page.evaluate(() => {
    const h1 = cy.$('#h1');
    const h2 = cy.$('#h2');
    const origH1X = h1.position('x');
    const origH2X = h2.position('x');

    // Desloca ambos os nós simulando arrasto conjunto
    h1.position({ x: origH1X + 50, y: h1.position('y') });
    h2.position({ x: origH2X + 50, y: h2.position('y') });

    // Emite dragfree em um dos nós selecionados
    h1.emit('dragfree');

    const stateH1 = state.tree.nodes.find(n => n.id === 'h1');
    const stateH2 = state.tree.nodes.find(n => n.id === 'h2');

    return {
      stateH1X: stateH1.pos.x,
      stateH2X: stateH2.pos.x,
      savedH1Correctly: stateH1.pos.x === Math.round(origH1X + 50),
      savedH2Correctly: stateH2.pos.x === Math.round(origH2X + 50)
    };
  });

  check('Arrasto em bloco salva posições sincronizadas de todos os nós selecionados no estado', 
    multiDragResult.savedH1Correctly && multiDragResult.savedH2Correctly,
    `H1: ${multiDragResult.stateH1X}, H2: ${multiDragResult.stateH2X}`
  );

  // =========================================================================
  // TASK 5: EXCLUSÃO EM LOTE DE MÚLTIPLOS NÓS (BATCH DELETE)
  // =========================================================================
  console.log('\n--- Testando Task 5: Exclusão em Lote de Múltiplos Nós ---');

  const batchDeleteResult = await page.evaluate(() => {
    // Com h1 e h2 selecionados, chama deleteSelected
    const nodesBefore = state.tree.nodes.length;
    deleteSelected();
    const nodesAfter = state.tree.nodes.length;
    const hasH1 = state.tree.nodes.some(n => n.id === 'h1');
    const hasH2 = state.tree.nodes.some(n => n.id === 'h2');
    const remainingEdges = state.tree.edges.filter(e => e.target === 'h1' || e.target === 'h2').length;

    return {
      nodesBefore,
      nodesAfter,
      deletedCount: nodesBefore - nodesAfter,
      hasH1,
      hasH2,
      remainingEdges
    };
  });

  check('deleteSelected exclui todos os nós multi-selecionados de uma vez (h1 e h2)', 
    batchDeleteResult.deletedCount === 2 && !batchDeleteResult.hasH1 && !batchDeleteResult.hasH2
  );
  check('Arestas conectadas aos nós excluídos são removidas limpas', batchDeleteResult.remainingEdges === 0);

  // =========================================================================
  // TASK 6: CONECTORES LÓGICOS [E] E [OU] E HERANÇA EM NOVOS FILHOS
  // =========================================================================
  console.log('\n--- Testando Task 6: Conectores Lógicos [E]/[OU] e Herança Hierárquica ---');

  const gateResult = await page.evaluate(async () => {
    // Configura novo cenário com pai h e filhos cc1, cc2 com conector [E]
    state.tree = {
      nodes: [
        { id: 'evt', kind: 'evt', label: 'Evento topo' },
        { id: 'ci', kind: 'imediata', label: 'Causa Imediata' },
        { id: 'h', kind: 'hipotese', estado: 'confirmada', label: 'Hipótese' },
        { id: 'cc1', kind: 'contrib', estado: 'confirmada', label: 'Causa Contribuinte 1' },
        { id: 'cc2', kind: 'contrib', estado: 'confirmada', label: 'Causa Contribuinte 2' },
        { id: 'cc_novo', kind: 'contrib', estado: 'confirmada', label: 'Novo Filho Contribuinte' }
      ],
      edges: [
        { id: 'e1', source: 'evt', target: 'ci', gate: '', logic: '' },
        { id: 'e2', source: 'ci', target: 'h', gate: '', logic: '' },
        { id: 'e3', source: 'h', target: 'cc1', gate: 'E', logic: 'E', kind: 'causal' },
        { id: 'e4', source: 'h', target: 'cc2', gate: 'E', logic: 'E', kind: 'causal' }
      ]
    };
    cyFromState();
    await new Promise(r => setTimeout(r, 400));

    const gateBadge = cy.getElementById('__gate_h');
    const badgeExists = gateBadge.length === 1;
    const badgeLabel = gateBadge.data('label');

    // Conecta novo filho compatível ao pai h (h -> cc_novo)
    handleNewConnection('h', 'cc_novo');
    await new Promise(r => setTimeout(r, 400));

    const newEdge = state.tree.edges.find(e => e.source === 'h' && e.target === 'cc_novo');
    const newEdgeLogic = newEdge ? newEdge.logic : null;

    // Alterna lógica clicando no badge
    const badgeAfterAdd = cy.getElementById('__gate_h');
    badgeAfterAdd.emit('tap');
    await new Promise(r => setTimeout(r, 400));

    const edgeLogicsAfterToggle = state.tree.edges.filter(e => e.source === 'h').map(e => e.logic);

    return {
      badgeExists,
      badgeLabel,
      newEdgeCreated: !!newEdge,
      newEdgeLogic,
      inheritedE: newEdgeLogic === 'E',
      allToggledToOU: edgeLogicsAfterToggle.every(l => l === 'OU')
    };
  });

  check('Badge único de porta lógica [E] existe posicionado no tronco do pai h', gateResult.badgeExists && gateResult.badgeLabel === 'E');
  check('Novo filho conectado ao pai herda automaticamente a lógica [E] da ramificação', gateResult.newEdgeCreated && gateResult.inheritedE);
  check('Clicar no badge altera operador de todos os ramos filhos sincronizadamente para [OU]', gateResult.allToggledToOU);

  await browser.close();

  console.log('\n========================================================================');
  console.log(`=== RESULTADO FINAL: ${passed} PASSOU, ${failed} FALHOU ===`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
})();
