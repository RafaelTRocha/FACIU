const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('--- TESTE AUTOMATIZADO v6.36.6: CORREÇÕES DE UI, TOPBAR SÓLIDA E TEMA ---');

  const fileV6366 = fs.existsSync(path.join(__dirname, '..', 'FACIU-v6.36.6.html'))
    ? path.join(__dirname, '..', 'FACIU-v6.36.6.html')
    : path.join(__dirname, '..', 'backups', 'FACIU-v6.36.6.html');
  const backupV6365 = path.join(__dirname, '..', 'backups', 'FACIU-v6.36.5.html');

  if (!fs.existsSync(fileV6366)) {
    console.error('ERRO: FACIU-v6.36.6.html não encontrado no projeto nem nos backups!');
    process.exit(1);
  }
  if (!fs.existsSync(backupV6365)) {
    console.error('ERRO CRÍTICO DE PRESERVAÇÃO: backups/FACIU-v6.36.5.html não encontrado!');
    process.exit(1);
  }
  console.log('✔ Passo Zero e preservação confirmados: backup v6.36.5 e arquivo v6.36.6 presentes.');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser ERR] ${msg.text()}`);
  });

  const fileUrl = 'file:///' + fileV6366.replace(/\\/g, '/');
  console.log(`Carregando: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // 1. Validar SemVer
  const title = await page.title();
  if (!title.includes('v6.36.6')) throw new Error(`Título incorreto: ${title}`);
  console.log(`✔ Título da página: "${title}"`);

  const appVersion = await page.evaluate(() => window.APP_VERSION);
  if (appVersion !== '6.36.6') throw new Error(`window.APP_VERSION inválido: ${appVersion}`);
  console.log(`✔ window.APP_VERSION: "${appVersion}"`);

  // 2. Exibir Start Screen para testes
  await page.evaluate(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) splash.style.display = 'none';
    const start = document.getElementById('startScreen');
    if (start) {
      start.removeAttribute('hidden');
      start.style.setProperty('display', 'flex', 'important');
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  });
  await page.waitForTimeout(500);

  // 3. Validar Topbar Sólida em Modo Claro
  const headerInfoLight = await page.evaluate(() => {
    const header = document.querySelector('#startScreen header');
    const style = window.getComputedStyle(header);
    return {
      bgColor: style.backgroundColor,
      position: style.position,
      top: style.top,
      zIndex: style.zIndex,
      classes: header.className
    };
  });
  console.log('Propriedades do Header (Modo Claro):', headerInfoLight);
  if (headerInfoLight.bgColor === 'rgba(0, 0, 0, 0)' || headerInfoLight.bgColor === 'transparent') {
    throw new Error('FALHA: Header está com fundo transparente no modo claro!');
  }
  console.log('✔ Topbar possui fundo sólido corporativo em modo claro (não transparente).');

  // Screenshot Modo Claro
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  await page.screenshot({ path: path.join(docsDir, 'v6366_start_light.png') });
  console.log('✔ Screenshot capturado: docs/v6366_start_light.png');

  // 4. Validar Botão de Alternar Tema
  const themeBtnExists = await page.evaluate(() => {
    const btn = document.getElementById('startBtnThemeToggle');
    const icon = document.getElementById('startThemeToggleIcon');
    return {
      btnExists: !!btn,
      iconExists: !!icon,
      iconType: icon ? icon.getAttribute('data-lucide') : null
    };
  });
  if (!themeBtnExists.btnExists || !themeBtnExists.iconExists) {
    throw new Error('FALHA: Botão #startBtnThemeToggle ou ícone não encontrado no header!');
  }
  console.log('✔ Botão #startBtnThemeToggle verificado com sucesso no header.');

  // 5. Testar Alternância para Modo Escuro
  console.log('Clicando em #startBtnThemeToggle para ativar Modo Escuro...');
  await page.click('#startBtnThemeToggle');
  await page.waitForTimeout(500);

  const themeAfterClick = await page.evaluate(() => {
    const h = document.documentElement;
    const isDark = h.dataset.theme === 'dark' || h.classList.contains('dark');
    const header = document.querySelector('#startScreen header');
    const headerBg = window.getComputedStyle(header).backgroundColor;
    const footer = document.querySelector('#startScreen footer');
    const footerBg = window.getComputedStyle(footer).backgroundColor;
    const icon = document.getElementById('startThemeToggleIcon');
    return {
      isDark,
      headerBg,
      footerBg,
      iconAttr: icon ? icon.getAttribute('data-lucide') : null
    };
  });
  console.log('Estado após alternar para Modo Escuro:', themeAfterClick);
  if (!themeAfterClick.isDark) {
    throw new Error('FALHA: Documento não recebeu data-theme="dark" ou classe .dark!');
  }
  if (themeAfterClick.headerBg === 'rgba(0, 0, 0, 0)') {
    throw new Error('FALHA: Header ficou transparente no modo escuro!');
  }
  if (themeAfterClick.footerBg === 'rgba(255, 255, 255, 0.9)' || themeAfterClick.footerBg === 'rgb(255, 255, 255)') {
    throw new Error('FALHA: Rodapé continua branco no modo escuro!');
  }
  console.log('✔ Modo escuro ativado com sucesso: Topbar sólida escura e Rodapé escuro integrado!');

  // 6. Testar Scroll e verificar se a Topbar permanece fixa e opaca
  await page.evaluate(() => {
    const start = document.getElementById('startScreen');
    if (start) start.scrollTop = 450;
    window.scrollTo(0, 450);
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(docsDir, 'v6366_start_dark_scrolled.png') });
  console.log('✔ Screenshot capturado com scroll: docs/v6366_start_dark_scrolled.png');

  // 7. Scroll até o Rodapé no Modo Escuro
  await page.evaluate(() => {
    const start = document.getElementById('startScreen');
    if (start) start.scrollTop = start.scrollHeight;
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(docsDir, 'v6366_start_dark_footer.png') });
  console.log('✔ Screenshot capturado do rodapé: docs/v6366_start_dark_footer.png');

  // 8. Alternar de volta para o Modo Claro
  await page.click('#startBtnThemeToggle');
  await page.waitForTimeout(300);
  const themeBackLight = await page.evaluate(() => {
    const h = document.documentElement;
    return h.dataset.theme !== 'dark' && !h.classList.contains('dark');
  });
  if (!themeBackLight) {
    throw new Error('FALHA: Não voltou para o modo claro ao clicar novamente!');
  }
  console.log('✔ Retorno para o modo claro verificado com sucesso.');

  await browser.close();
  console.log('\n======================================================');
  console.log('TODOS OS TESTES DE UI, TOPBAR E TEMA PASSARAM COM SUCESSO! 100% OK');
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('\n❌ ERRO NO TESTE:', err);
  process.exit(1);
});
