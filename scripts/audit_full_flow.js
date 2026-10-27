const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const assert = require('assert');

console.log('================================================================');
console.log('=== AUDITORIA COMPLETA DE CÓDIGO, FLUXO E NAVEGAÇÃO - FACIU ===');
console.log('================================================================\n');

const htmlPath = path.resolve(__dirname, '../FACIU-v6.26.0.html');
const rawHtml = fs.readFileSync(htmlPath, 'utf8');

const ex1Path = path.resolve(__dirname, '../docs/exemplos/investigacao_exemplo1_arvore_de_causas.json');
const ex2Path = path.resolve(__dirname, '../docs/exemplos/investigacao_exemplo2_5porques_principal.json');
const pkgText1 = fs.readFileSync(ex1Path, 'utf8');
const pkgText2 = fs.readFileSync(ex2Path, 'utf8');
const pkgEx1 = JSON.parse(pkgText1);
const pkgEx2 = JSON.parse(pkgText2);

let consoleErrors = [];
let consoleWarnings = [];
let elementsList = [];

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on('jsdomError', (error) => {
  if (!error.message.includes('lucide') && !error.message.includes('indexedDB') && !error.message.includes('css')) {
    console.log('[JSDOM ERROR]:', error.message);
  }
});

const dom = new JSDOM(rawHtml, {
  runScripts: 'dangerously',
  virtualConsole,
  url: 'http://localhost/',
  beforeParse(window) {
    window.console.error = (...args) => {
      consoleErrors.push(args.join(' '));
    };
    window.console.warn = (...args) => {
      consoleWarnings.push(args.join(' '));
    };
    window.requestAnimationFrame = (fn) => setTimeout(fn, 0);
    window.cancelAnimationFrame = (id) => clearTimeout(id);
    window.scrollTo = () => {};
    window.Element.prototype.scrollIntoView = () => {};
    window.confirm = () => true;
    window.alert = () => {};
    window.prompt = () => '';
    window.Sortable = { create: () => ({ destroy: () => {} }) };
    window.lucide = { createIcons: () => {} };
    window.indexedDB = {
      open: () => {
        const req = { onupgradeneeded: null, onsuccess: null, onerror: null };
        setTimeout(() => {
          if (req.onsuccess) req.onsuccess({ target: { result: { transaction: () => ({ objectStore: () => ({ get: () => ({ onsuccess: null }) }) }) } } });
        }, 0);
        return req;
      }
    };
    window.jspdf = {
      jsPDF: function() {
        return {
          setFont: () => {},
          setFontSize: () => {},
          splitTextToSize: (t) => [t],
          internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
          text: () => {},
          rect: () => {},
          setFillColor: () => {},
          setTextColor: () => {}
        };
      }
    };
    window.navigator.clipboard = {
      writeText: async (text) => { window.__lastCopied = text; return Promise.resolve(); }
    };
    window.cytoscape = function(opts) {
      elementsList = [];
      const mockStyle = {
        reset: () => mockStyle,
        selector: () => mockStyle,
        style: () => mockStyle,
        update: () => {}
      };
      const mockCy = {
        _opts: opts,
        style: () => mockStyle,
        on: () => {},
        nodes: () => elementsList.filter(el => !el.data.source).map(n => ({
          id: () => n.data.id,
          data: (k) => k ? n.data[k] : n.data,
          renderedPosition: () => ({ x: 200, y: 150 }),
          position: () => ({ x: 200, y: 150 }),
          isNode: () => true,
          isEdge: () => false,
          addClass: () => {},
          removeClass: () => {},
          select: () => {},
          unselect: () => {}
        })),
        edges: () => elementsList.filter(el => el.data.source).map(e => ({
          id: () => e.data.id,
          data: (k) => k ? e.data[k] : e.data,
          source: () => ({ id: () => e.data.source }),
          target: () => ({ id: () => e.data.target }),
          isNode: () => false,
          isEdge: () => true
        })),
        elements: () => ({
          remove: () => {},
          layout: () => ({ run: () => {} })
        }),
        add: (elems) => {
          if (Array.isArray(elems)) elementsList.push(...elems);
          else elementsList.push(elems);
        },
        remove: (arg) => {
          if (typeof arg === 'string') {
            elementsList = elementsList.filter(el => el.data.id !== arg);
          }
        },
        getElementById: (id) => {
          const found = elementsList.find(el => el.data.id === id);
          if (!found) return { length: 0 };
          return {
            length: 1,
            data: (k) => k ? found.data[k] : found.data,
            renderedPosition: () => ({ x: 200, y: 150 }),
            position: () => ({ x: 200, y: 150 }),
            isNode: () => !found.data.source,
            isEdge: () => !!found.data.source
          };
        },
        fit: () => {},
        center: () => {},
        zoom: () => 1,
        pan: () => ({ x: 0, y: 0 }),
        resize: () => {},
        png: () => 'data:image/png;base64,mock',
        layout: () => ({ run: () => {} }),
        $: () => ({ select: () => {}, unselect: () => {}, addClass: () => {}, removeClass: () => {} }),
        destroy: () => {}
      };
      return mockCy;
    };
    window.cytoscape.use = () => {};
  }
});

const win = dom.window;
const doc = win.document;

async function runAudit() {
  const report = {
    checksPassed: 0,
    checksFailed: 0,
    findings: []
  };

  async function testCheck(name, fn) {
    try {
      await fn();
      report.checksPassed++;
      console.log(`  [PASS] ${name}`);
    } catch (e) {
      report.checksFailed++;
      report.findings.push({ name, error: e.message, stack: e.stack });
      console.error(`  [FAIL] ${name}: ${e.message}`);
    }
  }

  console.log('--- 1. Verificação de Versão e Inicialização Global ---');
  await testCheck('SemVer e metadados v6.26.0', () => {
    const appVer = win.eval('APP_VERSION');
    assert.strictEqual(appVer, '6.26.0', 'APP_VERSION deve ser 6.26.0');
    assert(doc.title.includes('v6.26.0'), 'Título deve conter v6.26.0');
    const startVer = doc.querySelector('.start-version');
    assert(startVer && startVer.textContent.includes('v6.26.0'), 'Elemento .start-version deve exibir v6.26.0');
  });

  await testCheck('Variáveis de estado e funções essenciais', () => {
    assert(win.eval('typeof state') !== 'undefined', 'state deve estar definido');
    assert(win.eval('typeof goStep') === 'function', 'goStep deve ser função');
    assert(win.eval('typeof switchStructureTab') === 'function', 'switchStructureTab deve ser função');
    assert(win.eval('typeof setMainMethodology') === 'function', 'setMainMethodology deve ser função');
    assert(win.eval('typeof validationItems') === 'function', 'validationItems deve ser função');
    assert(win.eval('typeof buildWhyThereforeChain') === 'function', 'buildWhyThereforeChain deve ser função');
    assert(win.eval('typeof buildTreeThereforeChain') === 'function', 'buildTreeThereforeChain deve ser função');
    assert(win.eval('typeof actionCauseDescription') === 'function', 'actionCauseDescription deve ser função');
  });

  console.log('\n--- 2. Teste de Navegação entre os 5 Passos Canônicos (Stepper) ---');
  for (let s = 1; s <= 5; s++) {
    await testCheck(`Navegação para o Passo ${s} (data-view="${s}")`, () => {
      win.eval(`goStep(${s})`);
      const currentStep = win.eval('state.step');
      assert.strictEqual(currentStep, s, `state.step deve ser ${s}`);
      const activeStepEl = doc.querySelector(`.step[data-step="${s}"]`);
      if (activeStepEl) {
        assert.strictEqual(activeStepEl.dataset.active, 'true', `Step ${s} deve ter data-active="true"`);
      }
      const activeView = doc.querySelector(`.view[data-view="${s}"]`);
      assert(activeView, `View do passo ${s} deve existir`);
      assert.strictEqual(activeView.dataset.active, 'true', `View do passo ${s} deve ter data-active="true"`);
    });
  }

  console.log('\n--- 3. Teste de Subguias do Passo 2 (Estudo) ---');
  win.eval('goStep(2)');
  const subtabs = ['chronology', 'tree', 'whys', 'lanes', 'therefore', 'actions'];
  for (const tab of subtabs) {
    await testCheck(`Ativação da subguia "${tab}" no Passo 2`, () => {
      win.eval(`switchStructureTab('${tab}')`);
      const activeTab = win.eval('activeStructureTab');
      assert.strictEqual(activeTab, tab, `activeStructureTab deve ser "${tab}"`);
      const pane = doc.querySelector(`[data-structure-pane="${tab}"]`);
      assert(pane, `Pane data-structure-pane="${tab}" deve existir`);
      assert.strictEqual(pane.hidden, false, `Pane "${tab}" deve estar visível (hidden === false)`);
    });
  }

  console.log('\n--- 4. Teste de Alternância de Metodologia Principal (tree vs whys) ---');
  await testCheck('Alternar para Metodologia "whys" (5 Porquês Principal)', () => {
    win.eval("setMainMethodology('whys')");
    const m = win.eval('state.mainMethodology');
    assert.strictEqual(m, 'whys', 'mainMethodology deve ser "whys"');
    const whysPri = win.eval('state.whysPrimary');
    assert(whysPri !== null, 'whysPrimary deve estar inicializado');
  });

  await testCheck('Alternar para Metodologia "tree" (Árvore de Causas)', () => {
    win.eval("setMainMethodology('tree')");
    const m = win.eval('state.mainMethodology');
    assert.strictEqual(m, 'tree', 'mainMethodology deve ser "tree"');
  });

  console.log('\n--- 5. Teste de Importação e Conformidade do Exemplo 1 (Árvore de Causas) ---');
  await testCheck('Importação e validação de 0 pendências para Exemplo 1', async () => {
    await win.eval(`prepareJsonImport({ target: { files: [new File([${JSON.stringify(pkgText1)}], 'investigacao_exemplo1_arvore_de_causas.json', { type: 'application/json' })] } })`);
    win.eval("applyPendingImport('edit')");

    const errs = win.eval(`validateImportPackage(${JSON.stringify(pkgEx1)})`);
    assert.strictEqual(errs.length, 0, `Pacote Exemplo 1 deve ter 0 erros de schema (encontrados: ${errs.join('; ')})`);

    // Validação global do estudo
    const vItems = win.eval('validationItems()');
    const pendings = vItems.filter(item => !item.ok);
    assert.strictEqual(pendings.length, 0, `Exemplo 1 deve ter 0 pendências na validação (encontradas: ${pendings.map(p => p.label).join(', ')})`);
  });

  console.log('\n--- 6. Teste de Importação e Conformidade do Exemplo 2 (5 Porquês Principal) ---');
  await testCheck('Importação e validação de 0 pendências para Exemplo 2', async () => {
    await win.eval(`prepareJsonImport({ target: { files: [new File([${JSON.stringify(pkgText2)}], 'investigacao_exemplo2_5porques_principal.json', { type: 'application/json' })] } })`);
    win.eval("applyPendingImport('edit')");

    const errs = win.eval(`validateImportPackage(${JSON.stringify(pkgEx2)})`);
    assert.strictEqual(errs.length, 0, `Pacote Exemplo 2 deve ter 0 erros de schema (encontrados: ${errs.join('; ')})`);

    // Validação global do estudo
    const vItems = win.eval('validationItems()');
    const pendings = vItems.filter(item => !item.ok);
    assert.strictEqual(pendings.length, 0, `Exemplo 2 deve ter 0 pendências na validação (encontradas: ${pendings.map(p => p.label).join(', ')})`);
  });

  console.log('\n--- 7. Teste de Lógica e Modal do "Teste do Portanto" (v6.23.0) ---');
  await testCheck('Geração de cadeia do Portanto no 5 Porquês (Exemplo 2)', () => {
    const whyChain = win.eval(`buildWhyThereforeChain(state.whysPrimary)`);
    assert(Array.isArray(whyChain), 'buildWhyThereforeChain deve retornar um array');
    assert(whyChain.length >= 10, 'A cadeia deve ter elos de causa, passos e conectores (encontrados: ' + whyChain.length + ')');
    assert.strictEqual(whyChain[0].type, 'cause', 'Primeiro item deve ser a causa-raiz');
    assert.strictEqual(whyChain[1].type, 'connector', 'Segundo item deve ser o conector PORTANTO...');
    assert.strictEqual(whyChain[whyChain.length - 1].type, 'target', 'Último item deve ser o problema observado');
  });

  await testCheck('Abertura e Cópia de Narrativa na Modal do Portanto (5P)', () => {
    win.eval(`
      openThereforeModal('whys');
    `);
    const modal = doc.getElementById('modalThereforeTest');
    assert(modal && !modal.hidden, 'Modal #modalThereforeTest deve estar visível');

    win.eval('copyThereforeNarrative()');
    assert(win.__lastCopied && win.__lastCopied.includes('LEITURA REVERSA DE CAUSALIDADE'), 'Narrativa copiada deve conter cabeçalho');

    win.eval('closeThereforeModal()');
    assert(modal.hidden, 'Modal #modalThereforeTest deve estar oculta após fechar');
  });

  await testCheck('Geração de cadeia do Portanto na Árvore de Causas (Exemplo 1)', async () => {
    await win.eval(`prepareJsonImport({ target: { files: [new File([${JSON.stringify(pkgText1)}], 'investigacao_exemplo1_arvore_de_causas.json', { type: 'application/json' })] } })`);
    win.eval("applyPendingImport('edit')");

    const treeChain = win.eval("buildTreeThereforeChain('cr1')");
    assert(Array.isArray(treeChain), 'buildTreeThereforeChain deve retornar array');
    assert(treeChain.length >= 9, 'Cadeia deve cobrir cr1 -> cc1 -> hip -> imed -> evt (encontrados: ' + treeChain.length + ')');
    assert.strictEqual(treeChain[0].id, 'cr1');
    assert.strictEqual(treeChain[0].type, 'cause');
    assert.strictEqual(treeChain[1].type, 'connector');
  });

  console.log('\n--- 8. Teste de Redirecionamento da Barra de Correção (Passo 4 -> Passo X -> Retorno) ---');
  await testCheck('Redirecionamento ao clicar em pendência de validação', () => {
    win.eval(`
      const fTitulo = document.getElementById('f_titulo');
      if (fTitulo) fTitulo.value = '';
      onTriage();
      goStep(4);
    `);

    const items = win.eval('validationItems()');
    const broken = items.find(i => !i.ok);
    assert(broken, 'Deve haver um item pendente para teste');

    win.eval(`editValidationItem('${broken.id}')`);
    const currentStep = win.eval('state.step');
    assert.strictEqual(currentStep, broken.step, `Deve navegar para o passo ${broken.step}`);

    const bar = doc.getElementById('correctionBar');
    if (bar) {
      assert(!bar.hidden, 'Barra de correção deve estar visível');
      win.eval('returnToVerification()');
      const stepAfter = win.eval('state.step');
      assert.strictEqual(stepAfter, 4, 'Deve retornar ao Passo 4 (Verificação)');
      assert(bar.hidden, 'Barra de correção deve estar oculta após retorno');
    }
  });

  console.log('\n--- 9. Teste da Tabela 4.7 do RIA (Nomes de Causas vs Códigos CR) ---');
  await testCheck('Renderização e dados da Tabela 4.7', async () => {
    await win.eval(`prepareJsonImport({ target: { files: [new File([${JSON.stringify(pkgText1)}], 'investigacao_exemplo1_arvore_de_causas.json', { type: 'application/json' })] } })`);
    win.eval("applyPendingImport('edit')");

    const action = win.eval("state.tree.nodes.find(n => n.kind === 'acao')");
    assert(action, 'Deve existir pelo menos uma ação no Exemplo 1');
    const causeDesc = win.eval(`actionCauseDescription(state.tree.nodes.find(n => n.kind === 'acao'), false)`);
    assert(causeDesc && causeDesc.length > 0 && causeDesc !== '—', 'Descrição da causa não deve ser vazia nem apenas travessão');
    assert(!causeDesc.startsWith('CR1') && !causeDesc.startsWith('CR2'), 'Não deve exibir apenas código CR sintético');
  });

  console.log('\n================================================================');
  console.log(`=== RESULTADO FINAL DA AUDITORIA: ${report.checksPassed} PASS | ${report.checksFailed} FAIL ===`);
  console.log('================================================================\n');

  if (consoleErrors.length > 0) {
    console.log('Console Errors encontrados:');
    consoleErrors.forEach(err => console.log('  [Console Error]:', err));
  }
}

runAudit();
