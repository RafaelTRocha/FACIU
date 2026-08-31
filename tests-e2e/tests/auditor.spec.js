const { test, expect } = require('@playwright/test');

test.describe('FACIU - Auditor IA', () => {
    test('Deve renderizar o painel e simular uma auditoria com window.ai mockado', async ({ page }) => {
        // Aceita qualquer dialog
        page.on('dialog', dialog => dialog.accept());
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        page.on('pageerror', error => console.log(`PAGE ERROR: ${error.message}`));
        
        // Intercepta e esconde o start screen
        await page.addInitScript(() => {
            window.localStorage.setItem('faciu_auto_hide_sidebar', 'true');
            window.hideStartScreen = () => {
                const s = document.getElementById('startScreen');
                if(s) s.remove();
            };
            // Mock do window.ai para o teste
            window.ai = {
                languageModel: {
                    async capabilities() {
                        return { available: 'readily' }; // Simula suporte ativo
                    },
                    async create(options) {
                        return {
                            async prompt(text) {
                                // Simula delay de resposta
                                await new Promise(r => setTimeout(r, 500));
                                return "1. [MOCK] A linha do tempo não bate com a árvore de causa.\n2. [MOCK] Faltam ações corretivas.";
                            }
                        };
                    }
                }
            };
        });

        await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/../FACIU-v6.7.8.html');

        // Pula o start screen
        // Pula o start screen clicando no botão "Nova investigação"
        await page.evaluate(() => {
            if(window.startNewInvestigation) window.startNewInvestigation();
        });
        
        // Clica na aba 3 
        await page.locator('.step').nth(2).click();
        
        await page.waitForTimeout(500); // Aguarda animação de transição

        // Expande o painel do auditor IA
        const auditorPanel = page.locator('.ai-auditor-panel');
        await auditorPanel.locator('summary').click();

        // Clica em Iniciar Auditoria
        const startBtn = auditorPanel.locator('button', { hasText: 'Iniciar Auditoria' });
        await startBtn.click();

        // Aguarda os resultados
        const results = auditorPanel.locator('#aiAuditorResults');
        await expect(results).toBeVisible({ timeout: 2000 });
        await expect(results).toContainText('[MOCK] A linha do tempo não bate');

        // Verifica o estado do botão voltar
        await expect(auditorPanel.locator('#aiAuditorStatus')).toContainText('Refazer Auditoria');
    });
});
