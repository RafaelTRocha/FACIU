const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('--- TESTE AUTOMATIZADO v6.36.7: MENU UNIFICADO DE AÇÕES DO ESTUDO (DROPDOWN) ---');

  const fileV6367 = path.join(__dirname, '..', 'FACIU-v6.36.7.html');
  const backupV6366 = path.join(__dirname, '..', 'backups', 'FACIU-v6.36.6.html');

  if (!fs.existsSync(fileV6367)) {
    console.error('ERRO: FACIU-v6.36.7.html não encontrado!');
    process.exit(1);
  }
  if (!fs.existsSync(backupV6366)) {
    console.error('ERRO CRÍTICO DE PRESERVAÇÃO: backups/FACIU-v6.36.6.html não encontrado!');
    process.exit(1);
  }
  console.log('✔ Passo Zero e preservação confirmados: backup v6.36.6 e arquivo v6.36.7 presentes.');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser ERR] ${msg.text()}`);
  });

  const fileUrl = 'file:///' + fileV6367.replace(/\\/g, '/');
  console.log(`Carregando: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // 1. Validar SemVer
  const title = await page.title();
  if (!title.includes('v6.36.7')) throw new Error(`Título incorreto: ${title}`);
  console.log(`✔ Título da página: "${title}"`);

  const appVersion = await page.evaluate(() => window.APP_VERSION);
  if (appVersion !== '6.36.7') throw new Error(`window.APP_VERSION inválido: ${appVersion}`);
  console.log(`✔ window.APP_VERSION: "${appVersion}"`);

  // 2. Transitar para o Workspace (fechar splash/startScreen para testar a barra do estudo)
  await page.evaluate(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) splash.style.display = 'none';
    const start = document.getElementById('startScreen');
    if (start) {
      start.setAttribute('hidden', '');
      start.style.setProperty('display', 'none', 'important');
    }
    const nav = document.getElementById('faciu-nav-container');
    if (nav) nav.style.display = 'block';
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  });
  await page.waitForTimeout(500);

  // 3. Verificar se o botão #btnStudyMenu existe e está visível
  const menuBtnInfo = await page.evaluate(() => {
    const btn = document.getElementById('btnStudyMenu');
    const dd = document.getElementById('studyMenuDropdown');
    return {
      btnExists: !!btn,
      btnText: btn?.innerText?.trim(),
      ddExists: !!dd,
      isShown: dd?.classList.contains('show')
    };
  });
  console.log('Botão e Dropdown inicial:', menuBtnInfo);
  if (!menuBtnInfo.btnExists || !menuBtnInfo.ddExists) {
    throw new Error('FALHA: #btnStudyMenu ou #studyMenuDropdown não encontrado!');
  }
  if (menuBtnInfo.isShown) {
    throw new Error('FALHA: Dropdown já iniciou aberto indevidamente!');
  }
  console.log('✔ Botão #btnStudyMenu verificado e dropdown inicia fechado.');

  // Capturar screenshot da barra fechada
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  await page.screenshot({ path: path.join(docsDir, 'v6367_study_menu_closed.png') });
  console.log('✔ Screenshot capturado: docs/v6367_study_menu_closed.png');

  // 4. Clicar no botão #btnStudyMenu para abrir a lista suspensa
  console.log('Clicando em #btnStudyMenu para abrir a lista suspensa...');
  await page.click('#btnStudyMenu');
  await page.waitForTimeout(400);

  const ddOpened = await page.evaluate(() => {
    const dd = document.getElementById('studyMenuDropdown');
    const btn = document.getElementById('btnStudyMenu');
    const items = Array.from(dd?.querySelectorAll('.faciu-dropdown-item') || []).map(b => ({
      id: b.id,
      text: b.innerText.trim().replace(/\s+/g, ' ')
    }));
    return {
      isShown: dd?.classList.contains('show'),
      ariaExpanded: btn?.getAttribute('aria-expanded'),
      itemsCount: items.length,
      items
    };
  });
  console.log('Estado do dropdown aberto (Modo Claro):', ddOpened);
  if (!ddOpened.isShown) throw new Error('FALHA: Dropdown não recebeu a classe .show ao ser clicado!');
  if (ddOpened.ariaExpanded !== 'true') throw new Error('FALHA: aria-expanded não foi atualizado para true!');
  if (ddOpened.itemsCount !== 5) throw new Error(`FALHA: Esperado 5 itens no menu, encontrado ${ddOpened.itemsCount}!`);
  console.log('✔ Dropdown aberto com sucesso e contém todos os 5 itens de ação.');

  await page.screenshot({ path: path.join(docsDir, 'v6367_study_menu_open_light.png') });
  console.log('✔ Screenshot capturado: docs/v6367_study_menu_open_light.png');

  // 5. Testar fechar com tecla Escape
  console.log('Pressionando Escape para fechar dropdown...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const ddClosedEsc = await page.evaluate(() => {
    const dd = document.getElementById('studyMenuDropdown');
    return !dd?.classList.contains('show');
  });
  if (!ddClosedEsc) throw new Error('FALHA: Tecla Escape não fechou o dropdown!');
  console.log('✔ Tecla Escape fechou o dropdown com sucesso.');

  // 6. Testar no Modo Escuro
  console.log('Ativando Modo Escuro e reabrindo o dropdown...');
  await page.evaluate(() => {
    if (typeof toggleDarkMode === 'function') toggleDarkMode();
  });
  await page.waitForTimeout(300);

  await page.click('#btnStudyMenu');
  await page.waitForTimeout(400);

  const ddOpenedDark = await page.evaluate(() => {
    const dd = document.getElementById('studyMenuDropdown');
    const style = window.getComputedStyle(dd);
    return {
      isShown: dd?.classList.contains('show'),
      bgColor: style.backgroundColor,
      color: style.color
    };
  });
  console.log('Estado do dropdown aberto (Modo Escuro):', ddOpenedDark);
  if (!ddOpenedDark.isShown) throw new Error('FALHA: Dropdown não abriu no modo escuro!');

  await page.screenshot({ path: path.join(docsDir, 'v6367_study_menu_open_dark.png') });
  console.log('✔ Screenshot capturado: docs/v6367_study_menu_open_dark.png');

  // 7. Testar clique fora fecha o dropdown
  console.log('Clicando fora do dropdown no body...');
  await page.click('#stepperNav');
  await page.waitForTimeout(300);
  const ddClosedOutside = await page.evaluate(() => {
    const dd = document.getElementById('studyMenuDropdown');
    return !dd?.classList.contains('show');
  });
  if (!ddClosedOutside) throw new Error('FALHA: Clique fora não fechou o dropdown!');
  console.log('✔ Clique fora fechou o dropdown com sucesso.');

  await browser.close();
  console.log('\n======================================================');
  console.log('TODOS OS TESTES DO MENU SUSPENSO PASSARAM COM SUCESSO! 100% OK');
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('\n❌ ERRO NO TESTE:', err);
  process.exit(1);
});
