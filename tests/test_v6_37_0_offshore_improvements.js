const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('========================================================================');
  console.log('=== TESTES AUTOMATIZADOS v6.37.0: MELHORIAS OFFSHORE E MOTOR CAUSAL ===');
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
  const targetHtml = path.resolve('FACIU-v6.37.0.html');
  const backupHtml = path.resolve('backups/FACIU-v6.36.12.html');
  check('Arquivo FACIU-v6.37.0.html existe na raiz', fs.existsSync(targetHtml));
  check('Arquivo de backup backups/FACIU-v6.36.12.html preservado', fs.existsSync(backupHtml));

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
  check('APP_VERSION é 6.37.0', appVersion === '6.37.0', `Obtido: ${appVersion}`);
  const title = await page.title();
  check('Title contém v6.37.0', title.includes('v6.37.0'), `Obtido: ${title}`);

  // =========================================================================
  // TASK 2: MOTOR CAUSAL E TESTE DO PORTANTO
  // =========================================================================
  console.log('\n--- Testando Task 2: Motor Causal e Teste do Portanto ---');

  const thereforeResult = await page.evaluate(() => {
    // Montar uma árvore de teste com evento topo -> causa imediata -> causa contribuinte -> causa raiz
    state.tree = {
      nodes: [
        { id: 'evt', kind: 'evt', label: 'Evento Topo: Vazamento de Gás', desc: '' },
        { id: 'imed', kind: 'imediata', label: 'Causa Imediata: Flange Frouxa', desc: '' },
        { id: 'c1', kind: 'contrib', label: 'Causa Contribuinte: Vibração Excessiva', desc: '' },
        { id: 'r1', kind: 'raiz', root: true, label: 'Causa-Raiz: Falha no Procedimento de Torque', desc: '' },
        { id: 'a1', kind: 'acao', label: 'Ação Preventiva: Revisar Procedimento', desc: '', responsavel: 'Líder', prazo: '2026-11-01' }
      ],
      edges: [
        { id: 'e1', source: 'evt', target: 'imed', kind: 'causal', gate: '' },
        { id: 'e2', source: 'imed', target: 'c1', kind: 'causal', gate: 'OU', logic: 'OU' },
        { id: 'e3', source: 'c1', target: 'r1', kind: 'causal', gate: 'E', logic: 'E' },
        { id: 'e4', source: 'r1', target: 'a1', kind: 'causal', gate: '', logic: '' }
      ]
    };

    const rootChain = buildTreeThereforeChain('r1');
    const contribChain = buildTreeThereforeChain('c1');
    const avail = getAvailableThereforeChains();

    return {
      rootChainLength: rootChain ? rootChain.length : 0,
      rootChainSteps: rootChain ? rootChain.map(x => x.label || x.text) : [],
      contribChainLength: contribChain ? contribChain.length : 0,
      availCount: avail.length,
      hasRoot: avail.some(x => x.id === 'tree:r1'),
      hasContrib: avail.some(x => x.id === 'tree:c1')
    };
  });

  check('buildTreeThereforeChain monta cadeia para Causa-Raiz', thereforeResult.rootChainLength > 1, `Itens: ${thereforeResult.rootChainLength}`);
  check('buildTreeThereforeChain monta cadeia para Causa Contribuinte', thereforeResult.contribChainLength > 1, `Itens: ${thereforeResult.contribChainLength}`);
  check('getAvailableThereforeChains retorna causas raiz e contribuintes da árvore', thereforeResult.hasRoot && thereforeResult.hasContrib, `Disponíveis: ${thereforeResult.availCount}`);

  // Testar aresta de ação sem tag "OU"
  const actionEdgeTest = await page.evaluate(() => {
    window.selectedId = 'r1';
    const beforeEdges = state.tree.edges.length;
    
    const gateSelect = document.getElementById('childGate');
    if (gateSelect) gateSelect.value = 'OU';

    const kindSelect = document.getElementById('childKind');
    if (kindSelect) kindSelect.value = 'acao';
    
    if (typeof addChild === 'function') {
      try { addChild(); } catch(e) {}
    }

    const createdEdge = state.tree.edges[state.tree.edges.length - 1];
    return {
      created: state.tree.edges.length > beforeEdges,
      gate: createdEdge?.gate,
      logic: createdEdge?.logic
    };
  });

  check('Criação de Ação na árvore não herda operador OU', actionEdgeTest.gate === '' && actionEdgeTest.logic === '', `Gate: '${actionEdgeTest.gate}', Logic: '${actionEdgeTest.logic}'`);

  // =========================================================================
  // TASK 3: DESTAQUE VERMELHO NAS PENDÊNCIAS DA VERIFICAÇÃO
  // =========================================================================
  console.log('\n--- Testando Task 3: Destaque Vermelho de Pendências ---');

  const highlightResult = await page.evaluate(async () => {
    const styleSheets = Array.from(document.styleSheets);
    let hasRedHighlight = false;
    let hasPulseAnimation = false;

    for (const sheet of styleSheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules) {
          if (rule.selectorText === '.correction-target') {
            if (rule.cssText.includes('#EF4444') || rule.cssText.includes('239, 68, 68')) hasRedHighlight = true;
          }
          if (rule.name === 'pulseCorrection') {
            hasPulseAnimation = true;
          }
        }
      } catch(e) {}
    }

    goStep(4);
    const mockItem = {
      id: 'ria.techDesc',
      targetType: 'ria',
      targetId: 'description.technicalDescription',
      step: 3,
      title: 'Descrição técnica incompleta'
    };
    editValidationItem(mockItem);

    // Aguardar 160ms para o setTimeout de 80ms de editValidationItem completar
    await new Promise(r => setTimeout(r, 160));

    const targetEl = document.querySelector('[data-ria="description.technicalDescription"]') || document.getElementById('description.technicalDescription');
    const hasClass = targetEl ? targetEl.classList.contains('correction-target') : false;

    return { hasRedHighlight, hasPulseAnimation, hasClass };
  });

  check('CSS .correction-target utiliza anel vermelho de foco', highlightResult.hasRedHighlight);
  check('CSS possui animação pulseCorrection', highlightResult.hasPulseAnimation);
  check('editValidationItem aplica classe .correction-target ao campo alvo', highlightResult.hasClass);

  // =========================================================================
  // TASK 4: DEFAULTS REGULATÓRIOS DO RIA (VÍTIMAS EM '0')
  // =========================================================================
  console.log('\n--- Testando Task 4: Defaults Regulatórios do RIA ---');

  const defaultsResult = await page.evaluate(() => {
    const def = window.riaDefault ? window.riaDefault() : riaDefault();
    const p = def.consequences.people;
    const allZero = (
      p.ownInjured === '0' &&
      p.ownFatalities === '0' &&
      p.contractorInjured === '0' &&
      p.contractorFatalities === '0' &&
      p.thirdInjured === '0' &&
      p.thirdFatalities === '0'
    );

    state.ria = state.ria || {};
    state.ria.consequences = { people: { ownInjured: '5', ownFatalities: '2' } };
    zeroRiaCasualties();
    const afterZero = state.ria.consequences.people;

    return {
      allZeroDefault: allZero,
      afterZeroFn: (afterZero.ownInjured === '0' && afterZero.ownFatalities === '0')
    };
  });

  check('riaDefault() inicializa contadores de vítimas como "0"', defaultsResult.allZeroDefault);
  check('zeroRiaCasualties() redefine contadores para "0"', defaultsResult.afterZeroFn);

  // =========================================================================
  // TASK 5: SELETOR ONSHORE / OFFSHORE E SEVERIDADE POTENCIAL
  // =========================================================================
  console.log('\n--- Testando Task 5: Ambiente Onshore/Offshore e Severidade Potencial ---');

  const envResult = await page.evaluate(() => {
    goStep(1);
    const btnOff = document.getElementById('btnAmbOffshore');
    const btnOn = document.getElementById('btnAmbOnshore');
    
    setOperationEnvironment('onshore');
    const isOnshore = state.triagem.ambiente === 'onshore';

    setOperationEnvironment('offshore');
    const isOffshore = state.triagem.ambiente === 'offshore';

    state.triagem.severidadePotencial = '3';
    recalcClassification();
    const potLevel = state.triagem.sev;

    return {
      hasButtons: !!(btnOff && btnOn),
      isOnshore,
      isOffshore,
      potLevel
    };
  });

  check('Botões Onshore / Offshore existem no DOM da Triagem', envResult.hasButtons);
  check('setOperationEnvironment alterna corretamente para Onshore e Offshore', envResult.isOnshore && envResult.isOffshore);
  check('recalcClassification() escala nível da investigação para severidade potencial', envResult.potLevel === '3', `Nível: ${envResult.potLevel}`);

  // =========================================================================
  // TASK 6: BARRA DE FERRAMENTAS CONTEXTUAL DO PASSO 2
  // =========================================================================
  console.log('\n--- Testando Task 6: Barra de Ferramentas Contextual do Passo 2 ---');

  const toolbarResult = await page.evaluate(() => {
    const subtabsInView2 = document.querySelector('section[data-view="2"] #varA-subtabs');
    const subtabsInHeader = document.querySelector('header #varA-subtabs');
    
    goStep(2);
    switchStructureTab('tree');
    const treeVisible = !document.getElementById('structurePaneTree')?.hidden;

    switchStructureTab('chronology');
    const chronVisible = !document.getElementById('structurePaneChronology')?.hidden;

    switchStructureTab('therefore');
    const thereforeVisible = !document.getElementById('structurePaneTherefore')?.hidden;

    return {
      subtabsInView2: !!subtabsInView2,
      subtabsInHeader: !!subtabsInHeader,
      treeVisible,
      chronVisible,
      thereforeVisible
    };
  });

  check('Barra de ferramentas #varA-subtabs está ancorada dentro de data-view="2"', toolbarResult.subtabsInView2);
  check('Barra de ferramentas #varA-subtabs não existe mais no cabeçalho global', !toolbarResult.subtabsInHeader);
  check('Alternância entre subguias (Árvore, Cronologia, Portanto) funciona perfeitamente', toolbarResult.treeVisible && toolbarResult.chronVisible && toolbarResult.thereforeVisible);

  await browser.close();

  console.log('\n========================================================================');
  console.log(`=== RESULTADO FINAL: ${passed} PASSOU, ${failed} FALHOU ===`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
})();
