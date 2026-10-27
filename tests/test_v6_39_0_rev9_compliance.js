const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('========================================================================');
  console.log('=== TESTES AUTOMATIZADOS v6.39.0: CONFORMIDADE PG-CORP-SMS-015 REV 9 ===');
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
  const targetHtml = path.resolve('FACIU-v6.39.0.html');
  const backupHtml = path.resolve('backups/FACIU-v6.38.0.html');
  check('Arquivo FACIU-v6.39.0.html existe na raiz', fs.existsSync(targetHtml));
  check('Arquivo de backup backups/FACIU-v6.38.0.html preservado', fs.existsSync(backupHtml) && fs.statSync(backupHtml).size > 2000000);

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
  check('APP_VERSION é 6.39.0', appVersion === '6.39.0', `Obtido: ${appVersion}`);
  const title = await page.title();
  check('Title contém v6.39.0', title.includes('v6.39.0'), `Obtido: ${title}`);

  // 3. Verificação de Textos Normativos da Rev. 09 no HTML
  const content = fs.readFileSync(targetHtml, 'utf8');
  check('Contém referência a PG-CORP-SMS-015 Rev. 09', content.includes('PG-CORP-SMS-015 Rev. 09'));
  check('Contém referência a FORM-CORP-SMS-116 (Depoimento)', content.includes('FORM-CORP-SMS-116'));
  check('Contém diretrizes de prazos máximos (30, 90, 180 dias)', content.includes('180 dias') && content.includes('30 dias') && content.includes('90 dias'));
  check('Contém diretrizes para riscos psicossociais', content.includes('psicossociais'));
  check('Contém diretrizes para CSB em poços', content.includes('CSB'));

  // 4. Testar Inicialização do App e Navegação
  await page.evaluate(() => {
    if (typeof window.startScreenGoStep === 'function') {
      window.startScreenGoStep(1);
    } else if (typeof window.goStep === 'function') {
      window.goStep(1);
    }
  });
  await page.waitForTimeout(400);

  // Passo 1: Triagem e Severidade
  const step1Active = await page.evaluate(() => {
    const v = document.querySelector('.view[data-view="1"]');
    return v && (v.classList.contains('active') || !v.hidden);
  });
  check('Passo 1 (Triagem) ativado após Novo Estudo', step1Active);

  // Verificar classificação de Quase Acidente na Matriz
  const matrizRendered = await page.evaluate(() => {
    return typeof classifyEngine === 'function' && typeof SEVERITY_MATRIX !== 'undefined';
  });
  check('Motor de classificação e SEVERITY_MATRIX ativos', matrizRendered);

  // 5. Verificação de Ausência de Erros de Console
  check('Zero erros de console na inicialização', consoleErrors.length === 0, consoleErrors.join(', '));

  await browser.close();

  console.log('\n========================================================================');
  console.log(`TOTAL: ${passed + failed} | SUCESSOS: ${passed} | FALHAS: ${failed}`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
})();
