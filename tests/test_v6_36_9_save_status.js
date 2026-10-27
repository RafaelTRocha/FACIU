const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('--- INICIANDO TESTES DE STATUS DE SALVAMENTO (FACIU v6.36.9) ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const targetFile = 'FACIU-v6.36.9.html';
  await page.goto('file:///' + path.resolve(targetFile).replace(/\\/g, '/'));
  await page.waitForTimeout(1000);

  // Entrar no workspace de estudo
  await page.evaluate(() => {
    document.getElementById('splashScreen')?.remove();
    const st = document.getElementById('startScreen');
    if (st) { st.hidden = true; st.style.display = 'none'; }
    const nav = document.getElementById('faciu-nav-container');
    if (nav) nav.style.display = 'block';
  });
  await page.waitForTimeout(500);

  let passedAll = true;

  // Teste 1: Mock de File System e Salvamento Manual com Arquivo Vinculado
  const t1 = await page.evaluate(async () => {
    let fileContent = '{}';
    FaciuFolderMonitor.fileHandle = {
      name: 'investigacao_teste_v6369.json',
      kind: 'file',
      queryPermission: async () => 'granted',
      requestPermission: async () => 'granted',
      getFile: async () => ({
        name: 'investigacao_teste_v6369.json',
        size: fileContent.length,
        lastModified: Date.now(),
        text: async () => fileContent
      }),
      createWritable: async () => ({
        write: async (chunk) => { fileContent = chunk; },
        close: async () => {}
      })
    };
    FaciuFolderMonitor.fileName = 'investigacao_teste_v6369.json';
    FaciuFolderMonitor.updateUI();

    // Executa salvamento manual (ex: botão Salvar ou Ctrl+S)
    await saveStudy(false);

    const txt = document.getElementById('syncStatusText')?.textContent;
    const dot = document.getElementById('syncStatusDot')?.className;
    const isSaving = FaciuFolderMonitor.isSaving;

    return {
      txt,
      dot,
      isSaving,
      passed: txt === 'Sincronizado' && !isSaving && dot.includes('bg-emerald-400')
    };
  });

  console.log('1. Salvamento Manual com Arquivo Vinculado:', t1.passed ? 'PASSOU' : 'FALHOU', `(Status: "${t1.txt}", isSaving: ${t1.isSaving})`);
  if (!t1.passed) passedAll = false;

  // Teste 2: Estabilidade após expiração de qualquer timer (2000ms)
  await page.waitForTimeout(2000);
  const t2 = await page.evaluate(() => {
    const txt = document.getElementById('syncStatusText')?.textContent;
    return {
      txt,
      passed: txt === 'Sincronizado'
    };
  });
  console.log('2. Estabilidade de Status após 2.0s:', t2.passed ? 'PASSOU' : 'FALHOU', `(Status: "${t2.txt}")`);
  if (!t2.passed) passedAll = false;

  // Teste 3: Auto-Save contínuo com transição "Salvando..." -> "Sincronizado"
  const t3Immediate = await page.evaluate(() => {
    state.triagem.titulo = 'Incidente Teste Automatizado v6.36.9';
    store.persist();
    const txt = document.getElementById('syncStatusText')?.textContent;
    return { txt, passed: txt === 'Salvando...' };
  });
  console.log('3a. Auto-save imediato (persistência):', t3Immediate.passed ? 'PASSOU' : 'FALHOU', `(Status: "${t3Immediate.txt}")`);
  if (!t3Immediate.passed) passedAll = false;

  // Aguarda 2.0s para o auto-save de 1.5s gravar em disco e transicionar para Sincronizado
  await page.waitForTimeout(2000);
  const t3Completed = await page.evaluate(() => {
    const txt = document.getElementById('syncStatusText')?.textContent;
    const isSaving = FaciuFolderMonitor.isSaving;
    return {
      txt,
      isSaving,
      passed: txt === 'Sincronizado' && !isSaving
    };
  });
  console.log('3b. Auto-save concluído após gravação:', t3Completed.passed ? 'PASSOU' : 'FALHOU', `(Status: "${t3Completed.txt}", isSaving: ${t3Completed.isSaving})`);
  if (!t3Completed.passed) passedAll = false;

  // Teste 4: Salvamento sem arquivo local (apenas navegador / IndexedDB)
  const t4 = await page.evaluate(async () => {
    // Desvincula arquivo e limpa handle no IndexedDB
    FaciuFolderMonitor.fileHandle = null;
    FaciuFolderMonitor.fileName = '';
    await faciuDB.delete('file_handle', 'handles').catch(() => {});
    await faciuDB.delete('file_name', 'handles').catch(() => {});

    // Simula cancelamento do showSaveFilePicker (usuário prefere salvar apenas localmente)
    window.showSaveFilePicker = async () => {
      const err = new Error('The user aborted a request.');
      err.name = 'AbortError';
      throw err;
    };

    await saveStudy(false);

    const txt = document.getElementById('syncStatusText')?.textContent;
    const dot = document.getElementById('syncStatusDot')?.className;
    return {
      txt,
      dot,
      passed: txt === 'Salvo no Navegador' && dot.includes('bg-emerald-400')
    };
  });
  console.log('4. Salvamento apenas no Navegador (sem arquivo JSON):', t4.passed ? 'PASSOU' : 'FALHOU', `(Status: "${t4.txt}")`);
  if (!t4.passed) passedAll = false;

  // Teste 5: Alterações Pendentes com arquivo vinculado
  const t5 = await page.evaluate(() => {
    // Re-vincula arquivo
    let fileContent = '{}';
    FaciuFolderMonitor.fileHandle = {
      name: 'investigacao_teste_v6369.json',
      kind: 'file',
      queryPermission: async () => 'granted',
      requestPermission: async () => 'granted',
      getFile: async () => ({
        name: 'investigacao_teste_v6369.json',
        size: fileContent.length,
        lastModified: Date.now(),
        text: async () => fileContent
      }),
      createWritable: async () => ({
        write: async (chunk) => { fileContent = chunk; },
        close: async () => {}
      })
    };
    FaciuFolderMonitor.fileName = 'investigacao_teste_v6369.json';
    store.hasUnsavedChanges = true;
    updateSyncStatus();

    const txt = document.getElementById('syncStatusText')?.textContent;
    const dot = document.getElementById('syncStatusDot')?.className;
    return {
      txt,
      dot,
      passed: txt === 'Alterações Pendentes' && dot.includes('bg-amber-400')
    };
  });
  console.log('5. Alterações Pendentes sinalizadas em âmbar:', t5.passed ? 'PASSOU' : 'FALHOU', `(Status: "${t5.txt}")`);
  if (!t5.passed) passedAll = false;

  // Teste 6: Acionamento via Atalho Ctrl+S
  await page.keyboard.press('Control+s');
  await page.waitForTimeout(500);
  const t6 = await page.evaluate(() => {
    const txt = document.getElementById('syncStatusText')?.textContent;
    const dot = document.getElementById('syncStatusDot')?.className;
    const isSaving = FaciuFolderMonitor.isSaving;
    return {
      txt,
      dot,
      isSaving,
      passed: txt === 'Sincronizado' && !isSaving && dot.includes('bg-emerald-400')
    };
  });
  console.log('6. Salvamento disparado via atalho Ctrl+S:', t6.passed ? 'PASSOU' : 'FALHOU', `(Status: "${t6.txt}", isSaving: ${t6.isSaving})`);
  if (!t6.passed) passedAll = false;

  // Captura screenshot do cabeçalho com o status confirmado
  const topbar = page.locator('#faciu-nav-container');
  if (await topbar.isVisible()) {
    await topbar.screenshot({ path: 'tests/screenshot_v6369_saved_confirmed.png' });
    console.log('7. Screenshot do cabeçalho salvo em tests/screenshot_v6369_saved_confirmed.png');
  }

  await browser.close();

  if (passedAll) {
    console.log('\n--- TODOS OS TESTES PASSARAM COM SUCESSO (100% GREEN) ---');
    process.exit(0);
  } else {
    console.error('\n--- TESTES FALHARAM ---');
    process.exit(1);
  }
})();
