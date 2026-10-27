const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const reviewDir = path.resolve('.impeccable/review');
if (!fs.existsSync(reviewDir)) {
  fs.mkdirSync(reviewDir, { recursive: true });
}

const exemploData = JSON.parse(fs.readFileSync('docs/exemplos/investigacao_exemplo1_arvore_de_causas.json', 'utf-8'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const faciuPath = 'file:///' + path.resolve('FACIU-v6.35.5.html').replace(/\\/g, '/');

  // --- DESKTOP (1440x900) ---
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Coletar logs de console e erros
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  await page.goto(faciuPath);
  await page.waitForTimeout(600);

  // 1. Desktop Start Light
  await page.screenshot({ path: path.join(reviewDir, 'desktop.png') });
  await page.screenshot({ path: path.join(reviewDir, 'desktop-start-light.png') });

  // 2. Desktop Start Dark
  await page.evaluate(() => window.toggleTheme());
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-dark.png') });
  await page.screenshot({ path: path.join(reviewDir, 'desktop-start-dark.png') });
  await page.evaluate(() => window.toggleTheme()); // Retorna para light
  await page.waitForTimeout(300);

  // Entrar no app com dados de exemplo carregados
  await page.evaluate((data) => {
    window.hideStartScreen();
    window.state = Object.assign({}, window.state, data);
    if (typeof window.applyLoadedState === 'function') {
      window.applyLoadedState();
    } else {
      if (typeof window.renderAll === 'function') window.renderAll();
      if (typeof window.save === 'function') window.save();
    }
  }, exemploData);
  await page.waitForTimeout(500);

  // 3. Step 1 (Triagem) Light & Dark
  await page.evaluate(() => window.goStep(1));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step1-triagem.png') });

  await page.evaluate(() => window.toggleTheme());
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step1-dark.png') });
  await page.evaluate(() => window.toggleTheme());
  await page.waitForTimeout(300);

  // 4. Step 2 (Estudo) - Árvore de Causas Light & Dark
  await page.evaluate(() => {
    window.goStep(2);
    if (typeof window.switchStructureTab === 'function') {
      window.switchStructureTab('tree');
    }
    if (window.cy && typeof window.cy.fit === 'function') {
      window.cy.resize();
      window.cy.fit();
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step2-tree-loaded.png') });

  // Step 2 Árvore Dark
  await page.evaluate(() => {
    window.toggleTheme();
    if (window.cy && typeof window.cy.fit === 'function') {
      window.cy.resize();
      window.cy.fit();
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step2-tree-dark.png') });
  await page.evaluate(() => window.toggleTheme());
  await page.waitForTimeout(300);

  // 5. Step 2 - Cronologia
  await page.evaluate(() => {
    if (typeof window.switchStructureTab === 'function') window.switchStructureTab('chronology');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step2-cronologia.png') });

  // 6. Step 2 - 5 Porquês
  await page.evaluate(() => {
    if (typeof window.switchStructureTab === 'function') window.switchStructureTab('whys');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step2-5w.png') });

  // 7. Step 2 - Ações
  await page.evaluate(() => {
    if (typeof window.switchStructureTab === 'function') window.switchStructureTab('actions');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step2-actions.png') });

  // 8. Step 3 (RIA)
  await page.evaluate(() => window.goStep(3));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step3-ria.png') });

  // 9. Step 4 (Verificação) Light & Dark
  await page.evaluate(() => window.goStep(4));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step4-verificacao.png') });

  await page.evaluate(() => window.toggleTheme());
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step4-verificacao-dark.png') });
  await page.evaluate(() => window.toggleTheme());
  await page.waitForTimeout(300);

  // 10. Step 5 (Emissão)
  await page.evaluate(() => window.goStep(5));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(reviewDir, 'desktop-step5-emissao.png') });

  await page.close();
  await browser.close();

  if (consoleErrors.length > 0) {
    console.warn('Console errors detected during screenshot capture:', consoleErrors);
  } else {
    console.log('Screenshots re-captured successfully with ZERO console errors!');
  }
})();
