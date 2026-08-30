const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('FACIU-v6.7.8.html - Auditoria de QA e UX', () => {
  let fileUrl;

  test.beforeAll(async () => {
    // Calcula o caminho absoluto do arquivo html na raiz do projeto
    const htmlPath = path.resolve(__dirname, '../../FACIU-v6.7.8.html');
    fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  });

  test('Deve carregar sem erros de console e permitir interação com a árvore', async ({ page }) => {
    const errors = [];
    
    // Captura qualquer erro lançado no console ou na página
    page.on('pageerror', exception => {
      errors.push(`Page Error: ${exception.message}`);
    });
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`Console Error: ${msg.text()}`);
      }
    });

    page.on('dialog', dialog => dialog.accept());

    await page.goto(fileUrl);
    
    // Ignora a tela de início e começa uma nova investigação (ou simplesmente esconde a tela)
    await page.evaluate(async () => {
        window.enableDiskSync = async () => {}; // Mock file picker
        if(window.startNewInvestigation) await window.startNewInvestigation();
        else if (window.hideStartScreen) window.hideStartScreen();
    });
    
    // 1. Vai para a etapa de "Estruturação" (Passo 2)
    await page.locator('.step').nth(1).click();

    // Muda para a aba "Árvore de Causa"
    await page.evaluate(() => {
        if(window.switchStructureTab) window.switchStructureTab('tree');
    });
    
    // Espera a UI carregar o Canvas do Cytoscape
    await page.waitForSelector('#cy', { state: 'visible' });
    // Dá um tempo para os botões do Cytoscape carregarem
    await page.waitForTimeout(1000);

    // 2. Interação de Ocultar/Mostrar Editor
    const toggleBtn = page.locator('#autoHideToggleBtn');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click(); // Muda para Automático
      await page.waitForTimeout(500); // Aguarda visualização
      await toggleBtn.click(); // Muda para Fixo novamente
      await page.waitForTimeout(500);
    }

    // 3. Adicionar Nó na Árvore
    // Selecionar o nó raiz (geralmente tem texto Falha de projeto, mas no cytoscape não conseguimos clicar por DOM facilmente)
    // O Cytoscape renderiza tudo no canvas. Vamos disparar o clique central no canvas.
    const cyBoundingBox = await page.locator('#cy').boundingBox();
    if (cyBoundingBox) {
       // Clicar no centro do canvas (aproximadamente onde está a raiz)
       await page.mouse.click(cyBoundingBox.x + cyBoundingBox.width / 2, cyBoundingBox.y + cyBoundingBox.height / 3);
    }
    await page.waitForTimeout(500); // Visualizar seleção
    
    // Testa duplo clique para abrir o modal
    if (cyBoundingBox) {
        await page.mouse.dblclick(cyBoundingBox.x + cyBoundingBox.width / 2, cyBoundingBox.y + cyBoundingBox.height / 3);
    }
    
    // Verifica se o modal se abriu
    const modal = page.locator('#nodeModal');
    if (await modal.isVisible()) {
        await page.locator('#nodeModal-title').fill('Teste de QA via Playwright');
        await page.locator('#btn-save-modal').click();
    }
    await page.waitForTimeout(1000);

    // Clicar no fundo vazio para testar ocultação da sidebar e tirar a seleção
    if (cyBoundingBox) {
        await page.mouse.click(cyBoundingBox.x + 20, cyBoundingBox.y + 20);
    }
    await page.waitForTimeout(1000);

    // Validação final de erros
    if (errors.length > 0) {
      console.log('--- ERROS DE CONSOLE ENCONTRADOS ---');
      errors.forEach(err => console.log(err));
    }
    
    // O teste passa se nenhum erro grave quebrar a aplicação (a menos que a gente force fail)
    // Vamos garantir que não haja erros listados
    expect(errors.length, `Foram encontrados ${errors.length} erros no console`).toBe(0);
  });
});
