const fs = require('fs');
const path = require('path');
const vm = require('node:vm');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

const targetHtml = path.resolve(__dirname, '..', 'FACIU-v6.40.14.html');
const rawHtml = fs.readFileSync(targetHtml, 'utf8');

console.log('=======================================================================');
console.log('=== DIAGNÓSTICO PROFUNDO DE INTEGRIDADE E FUNÇÕES — FACIU v6.40.14  ===');
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

const dom = new JSDOM(rawHtml, { url: 'https://local.faciu.test/' });
const window = dom.window;
const document = window.document;

// In-memory Storage Mock
const storageMap = new Map();
const storageMock = {
  getItem: k => storageMap.get(k) || null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: k => storageMap.delete(k),
  clear: () => storageMap.clear(),
  get length() { return storageMap.size; }
};
Object.defineProperty(window, 'localStorage', { value: storageMock, configurable: true, writable: true });
Object.defineProperty(window, 'sessionStorage', { value: storageMock, configurable: true, writable: true });

// Canvas & other mocks
window.HTMLCanvasElement.prototype.getContext = () => ({ fillRect: () => {}, clearRect: () => {}, measureText: () => ({ width: 0 }) });
window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.lucide = { createIcons: () => {} };

const cyNodes = [
  { id: () => 'evt', data: (k) => ({ id: 'evt', kind: 'evt', label: 'Evento', desc: 'Evento topo' })[k] },
  { id: () => 'imed', data: (k) => ({ id: 'imed', kind: 'imediata', label: 'Causa Imediata', desc: 'Falha' })[k] }
];

window.cytoscape = function() {
  return {
    on: () => {},
    elements: () => ({ remove: () => {}, length: 0, jsons: () => [] }),
    add: () => {},
    layout: () => ({ run: () => {} }),
    fit: () => {},
    zoom: () => 1,
    pan: () => ({ x: 0, y: 0 }),
    nodes: () => cyNodes,
    edges: () => [],
    resize: () => {},
    center: () => {},
    style: () => ({ update: () => {} }),
    png: () => 'data:image/png;base64,',
    $: (selector) => ({
      select: () => {},
      unselect: () => {},
      length: 1,
      data: (k) => ({ id: 'evt', label: 'Evento topo', kind: 'evt' })[k],
      addClass: () => {},
      removeClass: () => {},
      position: () => ({ x: 100, y: 100 })
    })
  };
};
window.cytoscape.use = () => {};
window.Sortable = { create: () => {} };
window.html2canvas = () => Promise.resolve({ toDataURL: () => 'data:image/png;base64,' });
window.jspdf = { jsPDF: class { getNumberOfPages() { return 1; } addImage() {} save() {} text() {} } };
window.tailwind = { config: {} };
window.alert = () => {};
window.confirm = () => true;
window.prompt = () => '';

const consoleErrors = [];
const consoleWarns = [];

const customConsole = {
  log: (...args) => {},
  warn: (...args) => consoleWarns.push(args.map(String).join(' ')),
  error: (...args) => consoleErrors.push(args.map(a => a?.stack || String(a)).join(' ')),
  info: () => {},
  debug: () => {}
};

const sandbox = new Proxy(window, {
  get(target, prop) {
    if (prop === 'console') return customConsole;
    if (prop === 'window' || prop === 'global' || prop === 'globalThis') return sandbox;
    if (prop in target) {
      const val = target[prop];
      if (typeof val === 'function' && !val.prototype) return val.bind(target);
      return val;
    }
    return global[prop];
  },
  set(target, prop, value) { target[prop] = value; return true; },
  has(target, prop) { return (prop in target) || (prop in global); }
});
const vmContext = vm.createContext(sandbox);

const scriptTags = Array.from(document.querySelectorAll('script'));
const inlineScripts = scriptTags.filter(s => !s.src && s.type !== 'application/json');

inlineScripts.forEach((s, idx) => {
  if (s.textContent.trim()) {
    try {
      vm.runInContext(s.textContent, vmContext);
    } catch (err) {
      consoleErrors.push(`[Script ${idx+1} ${s.id || ''}] ` + err.stack);
    }
  }
});

// Evitar timer infinito
const origSetInterval = window.setInterval;
window.setInterval = (fn, ms) => {
  const id = origSetInterval(fn, ms);
  if (id.unref) id.unref();
  return id;
};

// Disparar DOMContentLoaded
const evt = new window.Event('DOMContentLoaded');
window.document.dispatchEvent(evt);

console.log('\n--- 1. BOOT E INTEGRIDADE ESTRUTURAL ---');
check('window.APP_VERSION é 6.40.14', window.APP_VERSION === '6.40.14', `Encontrado: ${window.APP_VERSION}`);
check('Objeto global state inicializado', !!window.state);
check('Gerenciador de Estado window.store ativo', !!window.store);
check('FaciuStudyCatalog disponível', !!window.FaciuStudyCatalog);
check('FaciuFolderMonitor disponível', !!window.FaciuFolderMonitor);
check('Inicialização sem erros de console', consoleErrors.length === 0, consoleErrors.join('; '));

console.log('\n--- 2. AUDITORIA DE HANDLERS HTML INLINE ---');
const elementsWithHandlers = document.querySelectorAll('*');
let totalHandlersChecked = 0;
const brokenHandlers = [];
const eventAttrs = ['onclick', 'onchange', 'oninput', 'onsubmit', 'onkeydown', 'onkeyup'];

elementsWithHandlers.forEach(el => {
  eventAttrs.forEach(attr => {
    const val = el.getAttribute(attr);
    if (val) {
      totalHandlersChecked++;
      try {
        new Function('event', val);
      } catch (err) {
        brokenHandlers.push({ el: el.tagName + (el.id ? '#' + el.id : ''), attr, error: err.message });
      }
    }
  });
});
check(`Todos os handlers inline (${totalHandlersChecked} inspecionados) são sintaticamente válidos`, brokenHandlers.length === 0, JSON.stringify(brokenHandlers));

console.log('\n--- 3. TELA INICIAL E CATÁLOGO DE ESTUDOS ---');
check('Catálogo: container de estudos presente', !!document.getElementById('studiesListContainer'));
check('Catálogo: search-input presente', !!document.getElementById('search-input'));
if (window.FaciuStudyCatalog) {
  window.FaciuStudyCatalog.setTab('folder');
  check('Catálogo: alternância para aba folder', window.FaciuStudyCatalog.currentTab === 'folder');
  window.FaciuStudyCatalog.setTab('recent');
  check('Catálogo: alternância para aba recent', window.FaciuStudyCatalog.currentTab === 'recent');
  window.FaciuStudyCatalog.setTab('all');
  check('Catálogo: alternância para aba all', window.FaciuStudyCatalog.currentTab === 'all');
  window.FaciuStudyCatalog.filter('Teste');
  check('Catálogo: filtro de busca', window.FaciuStudyCatalog.searchQuery === 'Teste');
  window.FaciuStudyCatalog.clearSearch();
  check('Catálogo: limpeza de busca', window.FaciuStudyCatalog.searchQuery === '');
}

console.log('\n--- 4. NAVEGAÇÃO ENTRE OS 5 PASSOS DO ESTUDO ---');
for (let s = 1; s <= 5; s++) {
  try {
    window.goStep(s);
    const activeView = document.querySelector(`.view[data-view="${s}"]`);
    const isActive = activeView && activeView.dataset.active === 'true';
    check(`Navegação funcional para o Passo ${s} (goStep)`, isActive && window.state.step === s);
  } catch (err) {
    check(`Navegação funcional para o Passo ${s} (goStep)`, false, err.message);
  }
}

console.log('\n--- 5. TESTE FUNCIONAL: PASSO 1 (TRIAGEM E COMISSÃO) ---');
window.goStep(1);
const titleInput = document.getElementById('f_titulo');
const descInput = document.getElementById('f_descricao');
if (titleInput && descInput) {
  titleInput.value = 'Incidente Teste Automatizado TDD';
  titleInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  descInput.value = 'Descrição técnica do incidente ocorrido na unidade offshore com quebra de contenção primária.';
  descInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  check('Atualização reativa do título da Triagem no state', window.state?.triagem?.titulo === 'Incidente Teste Automatizado TDD');
}

const initialMembers = window.state.equipe ? window.state.equipe.length : 0;
document.getElementById('m_nome').value = 'Engenheiro Chefe SMS';
document.getElementById('m_func').value = 'Coordenador da investigação';
document.getElementById('m_cargo').value = 'Coordenador SMS';
document.getElementById('m_empresa').value = 'Brava Energia';
window.addMember();
const finalMembers = window.state.equipe ? window.state.equipe.length : 0;
check('Adição de integrante na Comissão de Investigação', finalMembers > initialMembers);

console.log('\n--- 6. TESTE FUNCIONAL: PASSO 2 (ESTUDO E CRONOLOGIA) ---');
window.goStep(2);
window.switchStructureTab('chronology');
const initialEvents = (window.state.chronology || []).length;
document.getElementById('chr_datetime').value = '2026-10-07T10:00';
document.getElementById('chr_phase').value = 'before';
document.getElementById('chr_description').value = 'Inspeção de rotina prévia à manobra operacional';
if (typeof window.saveChronologyEvent === 'function') {
  window.saveChronologyEvent();
}
const finalEvents = (window.state.chronology || []).length;
check('Cronologia: inserção de evento (saveChronologyEvent)', finalEvents > initialEvents);

window.switchStructureTab('whys');
check('5 Porquês: estudo canônico presente', !!window.getCanonicalWhyStudy());
window.saveWhyAnalysis();
check('5 Porquês: saveWhyAnalysis executada com sucesso', true);

window.switchStructureTab('lanes');
check('Raias: container de raias presente no DOM', !!(document.getElementById('raiasContainer') || document.getElementById('raias')));

console.log('\n--- 7. TESTE FUNCIONAL: PASSO 3 (RIA FORM-088 REV. 08) ---');
window.goStep(3);
check('RIA: modelo exportado com sucesso', !!window.riaModelo());
check('RIA: zeroRiaCasualties funciona sem erro', (() => { window.zeroRiaCasualties(); return true; })());

console.log('\n--- 8. TESTE FUNCIONAL: PASSO 4 E 5 (VERIFICAÇÃO E EMISSÃO) ---');
window.goStep(4);
const issues = window.riaIssues();
check('Validação de pendências riaIssues() executada', Array.isArray(issues));

window.goStep(5);
const emissionArea = document.getElementById('emissionContentArea');
check('Emissão: área de conteúdo populada no Passo 5', emissionArea && emissionArea.innerHTML.length > 50);

console.log('\n-----------------------------------------------------------------------');
console.log(`TOTAL: ${totalChecks} | PASSOU: ${passedChecks} | FALHOU: ${failedChecks}`);
console.log('=======================================================================\n');

if (failedChecks > 0) {
  process.exit(1);
}
process.exit(0);
