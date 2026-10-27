const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('========================================================================');
  console.log('=== TESTES AUTOMATIZADOS v6.36.10: APONTAMENTOS DE TESTES PRÁTICOS ===');
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
  const targetHtml = path.resolve('FACIU-v6.36.10.html');
  const backupHtml = path.resolve('backups/FACIU-v6.36.9.html');
  check('Arquivo FACIU-v6.36.10.html existe na raiz', fs.existsSync(targetHtml));
  check('Arquivo de backup backups/FACIU-v6.36.9.html preservado', fs.existsSync(backupHtml));

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
  check('APP_VERSION é 6.36.10', appVersion === '6.36.10', `Obtido: ${appVersion}`);

  // Carregar Estudo real do apontamento da Shirlley
  const shirlleyJsonPath = 'C:/Users/rtair/.gemini/antigravity-ide/brain/beef1a90-7743-4eee-a4c7-27140295d308/scratch/investigacao-ria-cii-056-2026--macau-2026-10-08.json';
  const studyJson = JSON.parse(fs.readFileSync(shirlleyJsonPath, 'utf8'));

  await page.evaluate((pkg) => {
    const imported = window.normalizeImportedStudy(pkg.study);
    window.store.state = imported;
    window.state = imported;
    state = imported;
    window.renderAll();
  }, studyJson);

  // ========================================================
  // TESTE ISSUE 1: Falso erro de verificação nas datas do RIA
  // ========================================================
  console.log('\n--- Testando Issue 1: Datas do RIA e Verificação ---');
  const issue1 = await page.evaluate(() => {
    const vItem = window.validationItems().find(x => x.id === 'ria.investigationPeriod');
    const riaIssues = typeof window.riaIssues === 'function' ? window.riaIssues() : [];
    const dateBlocking = riaIssues.find(x => x.id === 'ria.investigationPeriod');
    return { vItem, dateBlocking };
  });

  check('Item ria.investigationPeriod está OK (sem falso erro de verificação)', issue1.vItem?.ok === true);
  check('Localização do item aponta para RIA > 2. Descrição do Incidente', issue1.vItem?.location === 'RIA > 2. Descrição do Incidente');
  check('TargetId do item aponta para investigationPeriod.startedAt', issue1.vItem?.targetId === 'investigationPeriod.startedAt');
  check('Não existe bloqueio pendente para período da investigação em riaIssues()', !issue1.dateBlocking);

  // Testar navegação de correção quando datas estiverem vazias
  const navTest = await page.evaluate(async () => {
    // Esvazia as datas para testar o clique de preencher
    window.state.ria.investigationPeriod = { startedAt: '', endedAt: '' };
    window.goStep(4);
    const item = window.validationItems().find(x => x.id === 'ria.investigationPeriod');
    window.editValidationItem(item.id);
    await new Promise(r => setTimeout(r, 300));
    const activeSection = document.querySelector('section.ria-section.active')?.dataset.riaSection;
    const activeDataRia = document.activeElement?.getAttribute('data-ria');
    return { currentStep: window.state.step, activeSection, activeDataRia };
  });

  check('Navegação leva para o Passo 3 (RIA)', navTest.currentStep === 3);
  check('Navegação ativa a aba 2. Descrição do incidente (activeSection=description)', navTest.activeSection === 'description');
  check('Navegação foca o input data-ria="investigationPeriod.startedAt"', navTest.activeDataRia === 'investigationPeriod.startedAt');

  // Restaura dados para testes seguintes
  await page.evaluate((pkg) => {
    const imported = window.normalizeImportedStudy(pkg.study);
    window.store.state = imported;
    window.state = imported;
    state = imported;
    window.renderAll();
  }, studyJson);

  // ========================================================
  // TESTE ISSUE 2: Colunas da Comissão de Investigação (Tabela 4.3)
  // ========================================================
  console.log('\n--- Testando Issue 2: Colunas da Comissão na Tabela 4.3 e Triagem ---');
  const issue2 = await page.evaluate(() => {
    const memberRows = window.faciuRia?.memberRows();
    const tempDiv = document.createElement('tbody');
    tempDiv.innerHTML = memberRows;
    const rows = [...tempDiv.querySelectorAll('tr')].map(tr => {
      const cols = [...tr.querySelectorAll('td')].map(td => td.textContent.trim());
      return { funcao: cols[0], nome: cols[1], cargo: cols[2], empresa: cols[3] };
    });
    return { rows };
  });

  check('Tabela 4.3 possui 7 integrantes renderizados', issue2.rows.length === 7);

  // Linha 1: Alan Leite (Gestor)
  const alan = issue2.rows.find(r => r.nome === 'Alan Leite');
  check('Alan Leite tem Função na Comissão = "Gestor da investigação"', alan?.funcao === 'Gestor da investigação');
  check('Alan Leite tem Cargo = "Gerente do Polo"', alan?.cargo === 'Gerente do Polo');
  check('Alan Leite tem Empresa = "Brava Energia"', alan?.empresa === 'Brava Energia');

  // Linha 2: Antonio Filho (Coordenador)
  const antonio = issue2.rows.find(r => r.nome === 'Antonio Filho');
  check('Antonio Filho tem Função na Comissão = "Coordenador da investigação"', antonio?.funcao === 'Coordenador da investigação');
  check('Antonio Filho tem Cargo = "Coordenador (a) de Operações"', antonio?.cargo === 'Coordenador (a) de Operações');
  check('Antonio Filho tem Empresa = "Brava Energia"', antonio?.empresa === 'Brava Energia');

  // Demais membros: Thom Nora, Shirlly Melo, etc.
  const thom = issue2.rows.find(r => r.nome === 'Thom Nora');
  check('Thom Nora tem Função na Comissão = "Membro da comissão"', thom?.funcao === 'Membro da comissão');
  check('Thom Nora tem Cargo / Setor = "Operação"', thom?.cargo === 'Operação');
  check('Thom Nora tem Empresa = "Brava Energia"', thom?.empresa === 'Brava Energia');

  const shirlly = issue2.rows.find(r => r.nome === 'Shirlly Melo');
  check('Shirlly Melo tem Função na Comissão = "Membro da comissão"', shirlly?.funcao === 'Membro da comissão');
  check('Shirlly Melo tem Cargo / Setor = "Técnico de Segurança"', shirlly?.cargo === 'Técnico de Segurança');
  check('Shirlly Melo tem Empresa = "Brava Energia"', shirlly?.empresa === 'Brava Energia');

  // Testar adição de novo integrante com os campos separados
  const formAddTest = await page.evaluate(() => {
    window.goStep(1);
    document.getElementById('m_nome').value = 'Mariana Oliveira';
    document.getElementById('m_func').value = 'Membro da comissão';
    document.getElementById('m_cargo').value = 'Engenharia de Poços';
    document.getElementById('m_empresa').value = 'Contratada Subsea';
    window.addMember();
    const last = window.state.equipe[window.state.equipe.length - 1];
    const resolved = window.resolveCommissionMember(last);
    return resolved;
  });

  check('Novo integrante cadastrado com Função = "Membro da comissão"', formAddTest.funcComissao === 'Membro da comissão');
  check('Novo integrante cadastrado com Cargo = "Engenharia de Poços"', formAddTest.cargoSetor === 'Engenharia de Poços');
  check('Novo integrante cadastrado com Empresa = "Contratada Subsea"', formAddTest.empresa === 'Contratada Subsea');

  // ========================================================
  // TESTE ISSUE 3: Menu Suspenso vs Elementos da Árvore & Bolinhas
  // ========================================================
  console.log('\n--- Testando Issue 3: Menu Suspenso na Árvore e Bolinhas Amarelas ---');
  await page.evaluate(() => window.goStep(2));
  await page.waitForTimeout(400);

  const treeTest = await page.evaluate(() => {
    const navRoot = document.querySelector('.faciu-nav-root');
    const studyDropdown = document.querySelector('#studyMenuDropdown');
    const portOverlay = document.getElementById('portOverlay');

    const navZ = parseInt(window.getComputedStyle(navRoot).zIndex, 10);
    const dropZ = parseInt(window.getComputedStyle(studyDropdown).zIndex, 10);
    const overlayZ = parseInt(window.getComputedStyle(portOverlay).zIndex, 10);

    // 1. Abrir o menu suspenso [Estudo v]
    window.toggleStudyMenuDropdown(true);

    // Tentar acionar hover no nó da árvore enquanto o menu está aberto
    const n = cy.nodes()[0];
    showPortsForNode(n);

    const portsWhileOpen = document.querySelectorAll('#portOverlay .node-port').length;
    const overlayDisplayWhileOpen = window.getComputedStyle(portOverlay).display;

    // 2. Fechar o menu suspenso
    window.toggleStudyMenuDropdown(false);

    // Acionar hover com menu fechado
    showPortsForNode(n);
    const portsWhileClosed = document.querySelectorAll('#portOverlay .node-port').length;
    const nodePortZ = parseInt(window.getComputedStyle(document.querySelector('.node-port')).zIndex, 10);

    return {
      navZ,
      dropZ,
      overlayZ,
      nodePortZ,
      portsWhileOpen,
      overlayDisplayWhileOpen,
      portsWhileClosed
    };
  });

  check('Header (.faciu-nav-root) possui z-index elevado (>= 1000)', treeTest.navZ >= 1000, `Obtido: ${treeTest.navZ}`);
  check('Menu suspenso (.faciu-dropdown) possui z-index superior ao header (>= 1100)', treeTest.dropZ >= 1100, `Obtido: ${treeTest.dropZ}`);
  check('Bolinhas amarelas (.node-port) possuem z-index inferior ao menu (26 < 1100)', treeTest.nodePortZ < treeTest.dropZ, `Port: ${treeTest.nodePortZ}, Drop: ${treeTest.dropZ}`);
  check('NENHUMA bolinha amarela é renderizada enquanto o menu suspenso estiver aberto', treeTest.portsWhileOpen === 0, `Qtd: ${treeTest.portsWhileOpen}`);
  check('#portOverlay tem display="none" enquanto menu suspenso estiver aberto', treeTest.overlayDisplayWhileOpen === 'none');
  check('Bolinhas amarelas funcionam normalmente quando menu suspenso está fechado', treeTest.portsWhileClosed === 4, `Qtd: ${treeTest.portsWhileClosed}`);

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
