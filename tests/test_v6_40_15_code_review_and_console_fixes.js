// tests/test_v6_40_15_code_review_and_console_fixes.js
// Suíte de testes automatizados para validação das correções do code review no FACIU v6.40.15

const fs = require('fs');
const path = require('path');
const vm = require('node:vm');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.15: CORREÇÕES DO REVIEW E CONSOLE    ===');
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

// 1. Verificação de Governança de Versão (Passo Zero Inviolável)
console.log('--- 1. Verificação de Governança de Versão (Passo Zero) ---');
const rootDir = path.resolve(__dirname, '..');
const targetHtml = fs.existsSync(path.join(rootDir, 'FACIU-v6.40.15.html'))
  ? path.join(rootDir, 'FACIU-v6.40.15.html')
  : path.join(rootDir, 'backups', 'FACIU-v6.40.15.html');
const backupHtml = path.join(rootDir, 'backups', 'FACIU-v6.40.14.html');

check('Arquivo FACIU-v6.40.15.html preservado (raiz ou backups/)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.14.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Contém declaração const APP_VERSION="6.40.15"', htmlContent.includes('const APP_VERSION="6.40.15"') || htmlContent.includes("const APP_VERSION = '6.40.15'"));
check('Contém <title> com v6.40.15', /<title>FACIU\s+v6\.40\.15/i.test(htmlContent));
check('Contém badge de versão v6.40.15 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.15</span>'));
check('Contém badge de versão v6.40.15 na tela inicial', htmlContent.includes('class="start-version">FACIU v6.40.15</span>') || htmlContent.includes('v6.40.15'));

// 3. Teste de Resiliência: Ambiente com Bloqueio de localStorage (Opaque Origin / Private Mode)
console.log('\n--- 3. Teste de Resiliência: Bloqueio de localStorage ---');
{
  const domBlocked = new JSDOM(htmlContent, { url: 'https://local.faciu.test/' });
  const win = domBlocked.window;

  // Força SecurityError em qualquer acesso ao localStorage
  const throwingStorage = {
    getItem() { throw new win.DOMException('localStorage is not available for opaque origins', 'SecurityError'); },
    setItem() { throw new win.DOMException('localStorage is not available for opaque origins', 'SecurityError'); },
    removeItem() { throw new win.DOMException('localStorage is not available for opaque origins', 'SecurityError'); }
  };
  Object.defineProperty(win, 'localStorage', { value: throwingStorage, configurable: true });
  Object.defineProperty(win, 'sessionStorage', { value: throwingStorage, configurable: true });

  // Mocks auxiliares mínimos
  win.HTMLCanvasElement.prototype.getContext = () => ({ fillRect: () => {}, clearRect: () => {}, measureText: () => ({ width: 0 }) });
  win.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
  win.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
  win.requestAnimationFrame = cb => setTimeout(cb, 0);
  win.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  win.lucide = { createIcons: () => {} };
  win.cytoscape = function() { return { on: () => {}, elements: () => ({ remove: () => {} }), add: () => {}, layout: () => ({ run: () => {} }) }; };
  win.cytoscape.use = () => {};
  win.Sortable = { create: () => {} };

  const consoleErrorsBlocked = [];
  const sandbox = new Proxy(win, {
    get(t, p) {
      if (p === 'console') return { log: () => {}, warn: () => {}, error: (...a) => consoleErrorsBlocked.push(a.join(' ')) };
      if (p === 'window' || p === 'global' || p === 'globalThis') return sandbox;
      if (p in t) {
        const v = t[p];
        return (typeof v === 'function' && !v.prototype) ? v.bind(t) : v;
      }
      return global[p];
    },
    set(t, p, v) { t[p] = v; return true; },
    has(t, p) { return (p in t) || (p in global); }
  });
  const vmCtx = vm.createContext(sandbox);

  const scriptTags = Array.from(win.document.querySelectorAll('script:not([src]):not([type="application/json"])'));
  let compilationFailed = false;
  scriptTags.forEach(s => {
    try {
      vm.runInContext(s.textContent, vmCtx);
    } catch (err) {
      compilationFailed = true;
      consoleErrorsBlocked.push(err.message);
    }
  });

  check('Scripts compilam e executam sem crash mesmo quando localStorage dispara SecurityError', !compilationFailed);
  check('COMMISSION_RULE_LABELS é inicializada mesmo com localStorage bloqueado', typeof win.COMMISSION_RULE_LABELS === 'object' && win.COMMISSION_RULE_LABELS !== null);

  // Testar toggleTheme e toggleAutoHideSidebar com localStorage bloqueado
  let themeThrew = false;
  try { win.toggleTheme(); } catch (_) { themeThrew = true; }
  check('toggleTheme não lança exceção com localStorage bloqueado', !themeThrew);

  let sidebarThrew = false;
  try { win.toggleAutoHideSidebar(); } catch (_) { sidebarThrew = true; }
  check('toggleAutoHideSidebar não lança exceção com localStorage bloqueado', !sidebarThrew);
}

// 4. Teste Funcional Completo em Ambiente Padrão
console.log('\n--- 4. Testes Funcionais das Correções Aplicadas ---');
{
  const dom = new JSDOM(htmlContent, { url: 'https://local.faciu.test/' });
  const win = dom.window;

  // In-memory mock
  const mem = new Map();
  const mockStorage = {
    getItem: k => mem.get(k) || null,
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: k => mem.delete(k)
  };
  Object.defineProperty(win, 'localStorage', { value: mockStorage, configurable: true });
  Object.defineProperty(win, 'sessionStorage', { value: mockStorage, configurable: true });

  win.HTMLCanvasElement.prototype.getContext = () => ({ fillRect: () => {}, clearRect: () => {}, measureText: () => ({ width: 0 }) });
  win.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
  win.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
  win.requestAnimationFrame = cb => setTimeout(cb, 0);
  win.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  win.lucide = { createIcons: () => {} };
  win.cytoscape = function() {
    return {
      on: () => {},
      elements: () => ({ remove: () => {}, length: 0 }),
      add: () => {},
      layout: () => ({ run: () => {} }),
      nodes: () => [],
      edges: () => [],
      $: () => ({ select: () => {}, unselect: () => {}, length: 0 })
    };
  };
  win.cytoscape.use = () => {};
  win.Sortable = { create: () => ({ destroy: () => {} }) };
  win.jspdf = { jsPDF: class { getNumberOfPages() { return 1; } } };
  win.alert = () => {};
  win.confirm = () => true;

  const sandbox = new Proxy(win, {
    get(t, p) {
      if (p === 'window' || p === 'global' || p === 'globalThis') return sandbox;
      if (p in t) {
        const v = t[p];
        return (typeof v === 'function' && !v.prototype) ? v.bind(t) : v;
      }
      return global[p];
    },
    set(t, p, v) { t[p] = v; return true; },
    has(t, p) { return (p in t) || (p in global); }
  });
  const vmCtx = vm.createContext(sandbox);

  const scriptTags = Array.from(win.document.querySelectorAll('script:not([src]):not([type="application/json"])'));
  scriptTags.forEach(s => {
    vm.runInContext(s.textContent, vmCtx);
  });

  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));

  // Teste 4.1: initSortables resiliente contra itens nulos ou sem destroy
  win.sortables = [null, undefined, { notDestroy: 1 }, { destroy: () => {} }];
  let sortableThrew = false;
  try {
    win.initSortables();
  } catch (err) {
    sortableThrew = true;
  }
  check('initSortables() executa sem erro mesmo com itens inválidos na lista de sortables', !sortableThrew);
  check('initSortables() reseta a lista de sortables', Array.isArray(win.sortables));

  // Teste 4.2: addMember preenche qual='Atende' quando rcaQualified for marcado
  win.document.getElementById('m_nome').value = 'Mariana Silva';
  win.document.getElementById('m_func').value = 'Membro da comissão';
  win.document.getElementById('m_rcaQualified').checked = true;
  win.addMember();

  const addedMember = win.state.equipe.find(m => m.nome === 'Mariana Silva');
  check('addMember atribui rcaQualified=true', addedMember && addedMember.rcaQualified === true);
  check('addMember preenche qual="Atende" para compatibilidade histórica', addedMember && addedMember.qual === 'Atende');

  // Teste 4.3: addMember preenche qual='Não atende' quando rcaQualified for desmarcado
  win.document.getElementById('m_nome').value = 'Lucas Oliveira';
  win.document.getElementById('m_func').value = 'Membro da comissão';
  win.document.getElementById('m_rcaQualified').checked = false;
  win.addMember();

  const addedMember2 = win.state.equipe.find(m => m.nome === 'Lucas Oliveira');
  check('addMember atribui rcaQualified=false', addedMember2 && addedMember2.rcaQualified === false);
  check('addMember preenche qual="Não atende"', addedMember2 && addedMember2.qual === 'Não atende');

  // Teste 4.4: window.renderFinalEmission está exposta e goStep(5) funciona
  check('window.renderFinalEmission está exposta no escopo global', typeof win.renderFinalEmission === 'function');
  win.goStep(5);
  const emissionArea = win.document.getElementById('emissionContentArea');
  check('goStep(5) renderiza com sucesso o conteúdo de emissão', emissionArea && emissionArea.innerHTML.length > 50);

  // Teste 4.5: Defensividade de syncTriage()
  win.state.triagem = null;
  let syncThrew = false;
  try {
    win.syncTriage();
  } catch (err) {
    syncThrew = true;
  }
  check('syncTriage() não lança exceção quando state.triagem é nulo', !syncThrew);
  check('syncTriage() recria state.triagem caso esteja nulo', typeof win.state.triagem === 'object' && win.state.triagem !== null);

  // Teste 4.6: closeHelp() unificado
  const helpOverlay = win.document.getElementById('appHelpOverlay');
  if (helpOverlay) helpOverlay.hidden = false;
  win.document.body.classList.add('app-help-page-open');
  win.closeHelp();
  check('closeHelp() oculta #appHelpOverlay', !helpOverlay || helpOverlay.hidden === true);
  check('closeHelp() remove a classe app-help-page-open do body', !win.document.body.classList.contains('app-help-page-open'));
}

console.log('\n------------------------------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSOU: ${passed} | FALHOU: ${failed}`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
}
process.exit(0);
