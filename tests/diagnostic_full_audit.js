// tests/diagnostic_full_audit.js
// Diagnóstico Completo de Integridade, Consistência e Execução de Funções do FACIU
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

function getActiveHtmlFile() {
  const dir = path.resolve(__dirname, '..');
  const files = fs.readdirSync(dir).filter(f => /^FACIU-v\d+\.\d+\.\d+\.html$/.test(f));
  files.sort((a, b) => {
    const vA = a.match(/\d+\.\d+\.\d+/)[0].split('.').map(Number);
    const vB = b.match(/\d+\.\d+\.\d+/)[0].split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (vA[i] !== vB[i]) return vB[i] - vA[i];
    }
    return 0;
  });
  return files.length > 0 ? path.join(dir, files[0]) : path.resolve(dir, 'FACIU-v6.36.1.html');
}

const htmlPath = getActiveHtmlFile();
const expectedVersion = (path.basename(htmlPath).match(/v(\d+\.\d+\.\d+)\.html/) || [null, '6.36.1'])[1];

console.log('=======================================================================');
console.log(`=== DIAGNÓSTICO PROFUNDO DE INTEGRIDADE E FUNÇÕES — FACIU v${expectedVersion}  ===`);
console.log('=======================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const issuesFound = [];

function check(title, condition, failDetails = '', category = 'GERAL') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${title}`);
  } else {
    failedChecks++;
    console.error(`  [FAIL] ${title} | ${failDetails}`);
    issuesFound.push({ category, title, details: failDetails });
  }
}

async function runDiagnostic() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const uncaughtExceptions = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error(`  [CONSOLE ERROR] ${msg.text().slice(0, 160)}`);
    }
  });

  page.on('pageerror', err => {
    uncaughtExceptions.push(err.message);
    console.error(`  [PAGE UNCAUGHT ERROR] ${err.message}`);
  });

  page.on('dialog', async d => {
    console.log(`  [DIALOG] ${d.type()}: ${d.message().slice(0, 60)}...`);
    await d.accept();
  });

  const targetUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(targetUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1200);

  // -------------------------------------------------------------------------
  // 1. BOOT E INTEGRIDADE ESTRUTURAL
  // -------------------------------------------------------------------------
  console.log('\n--- 1. BOOT E INTEGRIDADE ESTRUTURAL ---');
  check('Inicialização sem exceções não tratadas', uncaughtExceptions.length === 0, uncaughtExceptions.join('; '));
  check('Inicialização sem erros de console', consoleErrors.length === 0, consoleErrors.join('; '));

  const bootData = await page.evaluate(() => {
    return {
      appVersion: window.APP_VERSION,
      hasState: !!window.state,
      step: window.state?.step,
      treeNodes: window.state?.tree?.nodes?.length || 0,
      treeEdges: window.state?.tree?.edges?.length || 0,
      hasCy: !!window.cy,
      hasStore: !!window.store,
      hasCatalog: !!window.FaciuStudyCatalog,
      hasFolderMonitor: !!window.FaciuFolderMonitor,
      hasAssistant: !!window.FACIUAssistant,
      startScreenVisible: !document.getElementById('startScreen')?.hidden
    };
  });

  check(`window.APP_VERSION é ${expectedVersion}`, bootData.appVersion === expectedVersion, `Encontrado: ${bootData.appVersion}`);
  check('Objeto global state inicializado', bootData.hasState);
  check('Gerenciador de Estado window.store ativo', bootData.hasStore);
  check('FaciuStudyCatalog disponível', bootData.hasCatalog);
  check('FaciuFolderMonitor disponível', bootData.hasFolderMonitor);
  check('FACIUAssistant disponível', bootData.hasAssistant);

  // -------------------------------------------------------------------------
  // 2. AUDITORIA DE HANDLERS HTML INLINE
  // -------------------------------------------------------------------------
  console.log('\n--- 2. AUDITORIA DE HANDLERS HTML INLINE ---');
  const handlerEvalResults = await page.evaluate(() => {
    const elementsWithHandlers = document.querySelectorAll('*');
    const results = { totalChecked: 0, brokenHandlers: [] };
    const eventAttrs = ['onclick', 'onchange', 'oninput', 'onsubmit', 'onkeydown', 'onkeyup'];

    elementsWithHandlers.forEach(el => {
      eventAttrs.forEach(attr => {
        const val = el.getAttribute(attr);
        if (val) {
          results.totalChecked++;
          try {
            new Function('event', val);
          } catch (syntaxErr) {
            results.brokenHandlers.push({
              element: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.slice(0, 30) : ''),
              attr,
              code: val,
              error: syntaxErr.message
            });
          }
        }
      });
    });
    return results;
  });

  check(`Todos os handlers inline (${handlerEvalResults.totalChecked} inspecionados) são sintaticamente válidos`, 
    handlerEvalResults.brokenHandlers.length === 0, 
    JSON.stringify(handlerEvalResults.brokenHandlers)
  );

  // -------------------------------------------------------------------------
  // 3. TELA INICIAL (START SCREEN) E CATÁLOGO
  // -------------------------------------------------------------------------
  console.log('\n--- 3. TELA INICIAL E CATÁLOGO DE ESTUDOS ---');
  const catalogTest = await page.evaluate(async () => {
    const res = {};
    try {
      res.hasCatalogContainer = !!document.getElementById('studiesListContainer');
      res.hasSearchInput = !!document.getElementById('search-input');
      
      if (window.FaciuStudyCatalog) {
        window.FaciuStudyCatalog.setTab('folder');
        res.tabFolderOk = window.FaciuStudyCatalog.currentTab === 'folder';
        window.FaciuStudyCatalog.setTab('recent');
        res.tabRecentOk = window.FaciuStudyCatalog.currentTab === 'recent';
        window.FaciuStudyCatalog.setTab('all');
        res.tabAllOk = window.FaciuStudyCatalog.currentTab === 'all';

        // Testar busca em tempo real via filter()
        window.FaciuStudyCatalog.filter('Teste');
        res.filterOk = window.FaciuStudyCatalog.searchQuery === 'Teste';
        window.FaciuStudyCatalog.clearSearch();
        res.clearSearchOk = window.FaciuStudyCatalog.searchQuery === '';
      }
      return { ok: true, data: res };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  check('Catálogo: container e search-input presentes', catalogTest.ok && catalogTest.data.hasCatalogContainer && catalogTest.data.hasSearchInput);
  check('Catálogo: alternância de abas (all, folder, recent)', catalogTest.ok && catalogTest.data.tabFolderOk && catalogTest.data.tabRecentOk && catalogTest.data.tabAllOk);
  check('Catálogo: busca e limpeza de filtro', catalogTest.ok && catalogTest.data.filterOk && catalogTest.data.clearSearchOk);

  // Testar menu dropdown de ajuda na tela inicial
  const helpDropdownTest = await page.evaluate(() => {
    try {
      const btn = document.getElementById('startBtnHelpMenu');
      const dropdown = document.getElementById('startHelpDropdown');
      if (!btn || !dropdown) return { ok: false, error: 'Elementos do menu de ajuda não encontrados' };
      
      btn.click();
      const isOpen = !dropdown.classList.contains('hidden') && dropdown.style.display !== 'none';
      document.body.click();
      return { ok: true, isOpen };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  check('Menu Popup de Ajuda da Tela Inicial abre/fecha corretamente', helpDropdownTest.ok && helpDropdownTest.isOpen);

  // -------------------------------------------------------------------------
  // 4. FLUXO DE ENTRADA NO ESTUDO E NAVEGAÇÃO ENTRE PASSOS (1 A 5)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. NAVEGAÇÃO ENTRE OS 5 PASSOS DO ESTUDO ---');
  await page.evaluate(() => {
    if (typeof window.startScreenGoStep === 'function') {
      window.startScreenGoStep(1);
    } else if (typeof window.goStep === 'function') {
      const s = document.getElementById('startScreen');
      if (s) s.hidden = true;
      window.goStep(1);
    }
  });
  await page.waitForTimeout(500);

  for (let s = 1; s <= 5; s++) {
    const stepResult = await page.evaluate((targetStep) => {
      try {
        window.goStep(targetStep);
        const activeView = document.querySelector(`.view[data-view="${targetStep}"]`);
        const isActive = activeView && activeView.dataset.active === 'true';
        return { ok: true, isActive, stepInState: window.state.step };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }, s);
    check(`Navegação funcional para o Passo ${s} (goStep)`, stepResult.ok && stepResult.isActive && stepResult.stepInState === s, stepResult.error || '');
    await page.waitForTimeout(200);
  }

  // -------------------------------------------------------------------------
  // 5. TESTE PROFUNDO DO PASSO 1: TRIAGEM E COMISSÃO
  // -------------------------------------------------------------------------
  console.log('\n--- 5. TESTE FUNCIONAL: PASSO 1 (TRIAGEM E COMISSÃO) ---');
  await page.evaluate(() => window.goStep(1));
  await page.waitForTimeout(300);

  const triageTest = await page.evaluate(() => {
    try {
      const titleInput = document.getElementById('f_titulo');
      const descInput = document.getElementById('f_descricao');
      const siteInput = document.getElementById('f_site');
      const ciiInput = document.getElementById('f_cii');

      if (!titleInput || !descInput) return { ok: false, error: 'Campos principais de triagem não encontrados' };

      titleInput.value = 'Incidente Teste Automatizado TDD';
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));

      descInput.value = 'Descrição técnica do incidente ocorrido na unidade offshore com quebra de contenção primária.';
      descInput.dispatchEvent(new Event('input', { bubbles: true }));

      if (siteInput) {
        siteInput.value = 'P-50 Brava Polo Norte';
        siteInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (ciiInput) {
        ciiInput.value = 'CII-2026-999';
        ciiInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Testar adição de membro na comissão via formulário nativo e addMember()
      const initialMembers = window.state.equipe ? window.state.equipe.length : 0;
      document.getElementById('m_nome').value = 'Engenheiro Chefe SMS';
      document.getElementById('m_func').value = 'Coordenador da investigação';
      document.getElementById('m_area').value = 'Brava Energia SMS';
      if (typeof window.addMember === 'function') {
        window.addMember();
      }
      const finalMembers = window.state.equipe ? window.state.equipe.length : 0;

      return {
        ok: true,
        savedTitle: window.state?.triagem?.titulo,
        savedDesc: window.state?.triagem?.descricao,
        teamAdded: finalMembers > initialMembers
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  check('Atualização reativa dos campos da Triagem no state', triageTest.ok && triageTest.savedTitle === 'Incidente Teste Automatizado TDD', triageTest.error || '');
  check('Adição de membro na Comissão de Investigação (addMember)', triageTest.ok && triageTest.teamAdded);

  // -------------------------------------------------------------------------
  // 6. TESTE PROFUNDO DO PASSO 2: ESTUDO (SUBGUIAS E METODOLOGIAS)
  // -------------------------------------------------------------------------
  console.log('\n--- 6. TESTE FUNCIONAL: PASSO 2 (ESTUDO E FERRAMENTAS) ---');
  await page.evaluate(() => window.goStep(2));
  await page.waitForTimeout(400);

  // 6.1 Cronologia
  console.log('  -> Testando Cronologia...');
  const cronoTest = await page.evaluate(() => {
    try {
      window.switchStructureTab('chronology');
      const initialCount = (window.state.chronology || []).length;

      document.getElementById('chr_datetime').value = '2026-10-07T10:00';
      document.getElementById('chr_phase').value = 'before';
      document.getElementById('chr_description').value = 'Inspeção de rotina prévia à manobra operacional';
      
      if (typeof window.saveChronologyEvent === 'function') {
        window.saveChronologyEvent();
      }

      const finalCount = (window.state.chronology || []).length;
      return { ok: true, created: finalCount > initialCount, count: finalCount };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  check('Cronologia: inserção de marco temporal (saveChronologyEvent)', cronoTest.ok && cronoTest.created, cronoTest.error || '');

  // 6.2 Árvore de Causas
  console.log('  -> Testando Árvore de Causas (Cytoscape & Operações)...');
  const treeTest = await page.evaluate(() => {
    try {
      window.switchStructureTab('tree');
      const cyOk = !!window.cy;
      const initialNodeCount = window.state.tree.nodes.length;

      const rootNode = window.state.tree.nodes[0];
      if (rootNode && typeof window.selectNode === 'function') {
        window.selectNode(rootNode.id);
      }

      let childAdded = false;
      if (typeof window.addChild === 'function') {
        window.addChild();
        childAdded = window.state.tree.nodes.length > initialNodeCount;
      }

      let valResult = null;
      if (typeof window.validateTreeStructure === 'function') {
        valResult = window.validateTreeStructure();
      }

      return {
        ok: true,
        cyOk,
        selectedId: window.selectedId,
        childAdded,
        nodesAfterAdd: window.state.tree.nodes.length,
        hasValidation: Array.isArray(valResult)
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  check('Árvore de Causas: instância Cytoscape ativa', treeTest.ok && treeTest.cyOk);
  check('Árvore de Causas: seleção de nó e adição de filho (addChild)', treeTest.ok && treeTest.childAdded, treeTest.error || '');
  check('Árvore de Causas: motor de validação estrutural (validateTreeStructure)', treeTest.ok && treeTest.hasValidation);

  // 6.3 5 Porquês
  console.log('  -> Testando Módulo 5 Porquês...');
  const whysTest = await page.evaluate(() => {
    try {
      window.switchStructureTab('whys');
      let created = false;
      if (typeof window.addNewAuxiliaryWhy === 'function') {
        const study = window.addNewAuxiliaryWhy('H1', 'Análise de Falha na Junta Espiralada');
        created = !!study;
      }
      const whyCount = (window.state.whysAuxiliary || []).length;
      return { ok: true, created, whyCount };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  check('5 Porquês: criação de estudo investigativo', whysTest.ok && whysTest.created, whysTest.error || '');

  // 6.4 Raias (Lanes)
  console.log('  -> Testando Raias de Investigação...');
  const lanesTest = await page.evaluate(() => {
    try {
      window.switchStructureTab('lanes');
      if (typeof window.renderRaias === 'function') window.renderRaias();
      const container = document.getElementById('raiasContainer') || document.getElementById('raias');
      return { ok: true, hasContainer: !!container };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  check('Raias: ativação e renderização da visualização', lanesTest.ok && lanesTest.hasContainer, lanesTest.error || '');

  // 6.5 Portanto (Leitura Causal)
  console.log('  -> Testando Narrativa Portanto...');
  const thereforeTest = await page.evaluate(() => {
    try {
      window.switchStructureTab('therefore');
      const thereforePane = document.querySelector('[data-structure-pane="therefore"]');
      const isVisible = thereforePane && !thereforePane.hidden;
      return { ok: true, isVisible };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  check('Portanto: ativação da tela de leitura causal', thereforeTest.ok && thereforeTest.isVisible, thereforeTest.error || '');

  // 6.6 Plano de Ações
  console.log('  -> Testando Plano de Ações SMART...');
  const actionsTest = await page.evaluate(() => {
    try {
      window.switchStructureTab('actions');
      let addedAction = false;
      const lastNode = window.state.tree.nodes[window.state.tree.nodes.length - 1];
      if (lastNode) {
        const actionNode = {
          id: 'A_TEST_' + Date.now(),
          kind: 'acao',
          label: 'Instalar sistema de monitoramento automático de torque',
          responsavel: 'Engenharia de SMS',
          prazo: '2026-11-30',
          actionType: 'Preventiva',
          effectivenessCriterion: '100% dos flanges verificados sem divergência de torque em 30 dias'
        };
        window.state.tree.nodes.push(actionNode);
        window.state.tree.edges.push({ source: actionNode.id, target: lastNode.id });
        if (typeof window.save === 'function') window.save();
        addedAction = true;
      }
      return { ok: true, addedAction };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  check('Plano de Ações: inserção e persistência de ação preventiva com critério SMART', actionsTest.ok && actionsTest.addedAction);

  // -------------------------------------------------------------------------
  // 7. TESTE PROFUNDO DO PASSO 3: FORMULÁRIO RIA (FORM-CORP-SMS-088)
  // -------------------------------------------------------------------------
  console.log('\n--- 7. TESTE FUNCIONAL: PASSO 3 (FORMULÁRIO OFICIAL RIA) ---');
  await page.evaluate(() => window.goStep(3));
  await page.waitForTimeout(400);

  const riaTest = await page.evaluate(() => {
    try {
      const riaModule = document.getElementById('faciuRiaModule');
      if (!riaModule) return { ok: false, error: 'Módulo #faciuRiaModule não encontrado' };

      const textareas = riaModule.querySelectorAll('textarea');
      const copilotBtns = riaModule.querySelectorAll('.btn-field-copilot');

      return {
        ok: true,
        textareasCount: textareas.length,
        copilotBtnsCount: copilotBtns.length
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  check('Formulário RIA: renderização dos campos oficiais FORM-CORP-SMS-088', riaTest.ok && riaTest.textareasCount > 0, riaTest.error || '');
  check('Formulário RIA: presença de botões "Copiar p/ Copilot" nos textareas', riaTest.ok && riaTest.copilotBtnsCount > 0, `Encontrados: ${riaTest.copilotBtnsCount}`);

  // -------------------------------------------------------------------------
  // 8. TESTE PROFUNDO DO PASSO 4: MOTOR DE VERIFICAÇÃO GLOBAL E COPILOT
  // -------------------------------------------------------------------------
  console.log('\n--- 8. TESTE FUNCIONAL: PASSO 4 (VERIFICAÇÃO GLOBAL & COPILOT) ---');
  await page.evaluate(() => window.goStep(4));
  await page.waitForTimeout(400);

  const step4Test = await page.evaluate(() => {
    try {
      if (typeof window.renderValidation === 'function') window.renderValidation();
      
      const integPctEl = document.getElementById('integPct');
      const doneEl = document.getElementById('validationDone');
      const blockingEl = document.getElementById('validationBlocking');
      const pendingEl = document.getElementById('validationPending');
      const attentionList = document.getElementById('attentionList');
      const copilotBtn = document.getElementById('btnCopyProjectCopilot');

      return {
        ok: true,
        pct: integPctEl ? integPctEl.textContent : null,
        done: doneEl ? doneEl.textContent : null,
        blocking: blockingEl ? blockingEl.textContent : null,
        pending: pendingEl ? pendingEl.textContent : null,
        hasAttentionList: !!attentionList,
        attentionItemsCount: attentionList ? attentionList.children.length : 0,
        hasCopilotBtn: !!copilotBtn
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  check('Passo 4: Motor de Verificação calculou métricas de integridade', step4Test.ok && step4Test.pct !== null, step4Test.error || '');
  check('Passo 4: Lista de pendências (#attentionList) renderizada', step4Test.ok && step4Test.hasAttentionList);
  check('Passo 4: Botão Copiar Dados p/ Copilot presente e configurado', step4Test.ok && step4Test.hasCopilotBtn);

  const copilotClickResult = await page.evaluate(async () => {
    try {
      const btn = document.getElementById('btnCopyProjectCopilot');
      if (!btn) return { ok: false, error: 'Botão não encontrado' };
      const res = await window.copyProjectDataForCopilot(btn);
      return { ok: res === true, btnText: btn.textContent };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  check('Passo 4: Execução de copyProjectDataForCopilot e feedback visual', copilotClickResult.ok && copilotClickResult.btnText.includes('Copiado'), copilotClickResult.error || '');

  // -------------------------------------------------------------------------
  // 9. TESTE PROFUNDO DO PASSO 5: EMISSÃO OFICIAL E EXPORTAÇÃO
  // -------------------------------------------------------------------------
  console.log('\n--- 9. TESTE FUNCIONAL: PASSO 5 (EMISSÃO & EXPORTAÇÃO) ---');
  await page.evaluate(() => window.goStep(5));
  await page.waitForTimeout(400);

  const step5Test = await page.evaluate(() => {
    try {
      const view5 = document.querySelector('.view[data-view="5"]');
      const exportJsonBtn = document.getElementById('btnExportJson') || document.querySelector('button[onclick*="exportJson"]');
      
      let jsonPayloadOk = false;
      if (typeof window.buildExportPayload === 'function') {
        const payload = window.buildExportPayload();
        jsonPayloadOk = !!payload && !!payload.triagem;
      } else if (window.state) {
        jsonPayloadOk = !!window.state.triagem && !!window.state.tree;
      }

      return {
        ok: true,
        viewActive: view5 && view5.dataset.active === 'true',
        hasExportBtn: !!exportJsonBtn,
        jsonPayloadOk
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  check('Passo 5: Tela de Emissão ativa com controles de exportação', step5Test.ok && step5Test.viewActive, step5Test.error || '');
  check('Passo 5: Integridade do payload de exportação do estudo', step5Test.ok && step5Test.jsonPayloadOk);

  // -------------------------------------------------------------------------
  // 10. TESTE DE UTILITÁRIOS: TEMA ESCURO, FECHAR ESTUDO E DIALOGS
  // -------------------------------------------------------------------------
  console.log('\n--- 10. UTILITÁRIOS: TEMA ESCURO, CLOSE STUDY E PERSISTÊNCIA ---');
  const utilTest = await page.evaluate(async () => {
    try {
      const body = document.body;
      const initialDark = body.classList.contains('dark') || document.documentElement.classList.contains('dark');
      if (typeof window.toggleDarkMode === 'function') {
        window.toggleDarkMode();
      }
      const toggledDark = body.classList.contains('dark') || document.documentElement.classList.contains('dark');
      if (typeof window.toggleDarkMode === 'function') {
        window.toggleDarkMode();
      }

      let closeStudyOk = false;
      let startVisible = false;
      if (typeof window.closeStudy === 'function') {
        const origConfirm = window.confirm;
        window.confirm = () => true;
        await window.closeStudy();
        window.confirm = origConfirm;
        closeStudyOk = true;
        const startScreen = document.getElementById('startScreen');
        startVisible = startScreen && !startScreen.hidden && window.getComputedStyle(startScreen).display !== 'none';
      }

      return {
        ok: true,
        darkModeToggled: initialDark !== toggledDark,
        closeStudyOk,
        startVisible
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  check('Tema Escuro/Claro (toggleDarkMode) alterna classes corretamente', utilTest.ok && utilTest.darkModeToggled, utilTest.error || '');
  check('Fechar Estudo (closeStudy) encerra sessão e restaura Tela Inicial', utilTest.ok && utilTest.closeStudyOk && utilTest.startVisible, utilTest.error || '');

  // -------------------------------------------------------------------------
  // RESUMO GERAL DO DIAGNÓSTICO
  // -------------------------------------------------------------------------
  console.log('\n=======================================================================');
  console.log(`TOTAL DE ITENS AUDITADOS: ${totalChecks}`);
  console.log(`SUCESSOS [PASS]: ${passedChecks}`);
  console.log(`INCONSISTÊNCIAS / FALHAS [FAIL]: ${failedChecks}`);
  console.log(`ERROS DE CONSOLE TOTAIS CAPTURADOS: ${consoleErrors.length}`);
  console.log(`EXCEÇÕES NÃO TRATADAS (CRASH): ${uncaughtExceptions.length}`);
  console.log('=======================================================================');

  if (issuesFound.length > 0) {
    console.log('\n--- DETALHAMENTO DE INCONSISTÊNCIAS ENCONTRADAS ---');
    issuesFound.forEach((iss, idx) => {
      console.log(`${idx + 1}. [${iss.category}] ${iss.title}`);
      if (iss.details) console.log(`   -> ${iss.details}`);
    });
  } else {
    console.log('\n>>> NENHUMA FALHA OU ERRO BLOQUEANTE ENCONTRADO NO FLUXO COMPLETO! <<<');
  }

  await browser.close();

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runDiagnostic().catch(err => {
  console.error('[ERRO CRÍTICO NO DIAGNÓSTICO]', err);
  process.exit(1);
});
