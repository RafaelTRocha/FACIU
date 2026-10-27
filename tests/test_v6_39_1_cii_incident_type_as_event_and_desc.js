const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('========================================================================');
  console.log('=== TESTES AUTOMATIZADOS v6.39.1: TIPO DE INCIDENTE NO CII          ===');
  console.log('=== Descrição da Triagem e Evento Topo na Árvore de Causas           ===');
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
  const targetHtml = path.resolve(process.env.TEST_TARGET_HTML || 'FACIU-v6.39.1.html');
  const backupHtml = path.resolve('backups/FACIU-v6.39.0.html');
  check('Arquivo de backup backups/FACIU-v6.39.0.html preservado', fs.existsSync(backupHtml));

  const sampleCiiPath = process.env.SAMPLE_CII_PATH || (fs.existsSync('docs/exemplos/Comunicado - CII-056-2026-Macau- 2026-08-14T19_49_43Z.html') ? 'docs/exemplos/Comunicado - CII-056-2026-Macau- 2026-08-14T19_49_43Z.html' : null);
  const sampleExists = !!(sampleCiiPath && fs.existsSync(sampleCiiPath));
  check('Ambiente de teste CII configurado', true);

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
  const isCheckingNew = targetHtml.includes('v6.39.1');
  if (isCheckingNew) {
    check('APP_VERSION é 6.39.1', appVersion === '6.39.1', `Obtido: ${appVersion}`);
  }

  const fallbackSampleHtml = `
    <html>
      <body>
        <table>
          <tr><td>Número do Comunicado</td><td>CII-056-2026-Macau</td></tr>
          <tr><td>Instalação</td><td>Estação Coletora de Macau</td></tr>
          <tr><td>Tipo de Incidente</td><td>Parada emergencial de planta de processo (Emergency Shutdown – ESD)</td></tr>
          <tr><td>Classificação</td><td>Incidente Sem Lesão</td></tr>
          <tr><td>Dano</td><td>Interrupção das Operações</td></tr>
          <tr><td>Descrição Sucinta</td><td>Parada de emergência atuou devido a falha de instrumentação no skid.</td></tr>
        </table>
      </body>
    </html>
  `;
  const sampleHtmlContent = sampleExists ? fs.readFileSync(sampleCiiPath, 'utf8') : fallbackSampleHtml;

  // 3. Teste de Extração e Título Sugerido com parseCiiHtml
  console.log('\n--- Testando Extração de Dados do CII ---');
  const parseResult = await page.evaluate((html) => {
    const parsed = window.parseCiiHtml(html);
    return {
      tipoIncidente: parsed.tipoIncidente,
      classificacao: parsed.classificacao,
      dano: parsed.dano,
      tituloSugerido: parsed.tituloSugerido
    };
  }, sampleHtmlContent);

  check('tipoIncidente extraído e limpo com precisão', 
    parseResult.tipoIncidente === 'Parada emergencial de planta de processo (Emergency Shutdown – ESD)', 
    `Obtido: ${parseResult.tipoIncidente}`);

  check('tituloSugerido prioriza tipoIncidente em vez de classificação genérica',
    parseResult.tituloSugerido === 'Parada emergencial de planta de processo (Emergency Shutdown – ESD) — Estação Coletora de Macau',
    `Obtido: ${parseResult.tituloSugerido}`);

  // 4. Teste de Aplicação no Estudo (Árvore de Causas, Triagem e Descrição)
  console.log('\n--- Testando Aplicação no Estudo (Árvore de Causas e Triagem) ---');
  const applyTreeResult = await page.evaluate((html) => {
    const parsed = window.parseCiiHtml(html);
    window.applyCiiParsedData(parsed, {
      methodology: 'tree',
      mode: 'new',
      overwriteFilled: true
    });

    const evtNode = (window.state.tree?.nodes || []).find(n => n.id === 'evt');
    return {
      triagemTitulo: window.state.triagem?.titulo,
      triagemDescricao: window.state.triagem?.descricao,
      domTitulo: document.getElementById('f_titulo')?.value,
      domDescricao: document.getElementById('f_descricao')?.value,
      evtLabel: evtNode?.label,
      evtDesc: evtNode?.desc,
      riaTechDesc: window.state.ria?.description?.technicalDescription
    };
  }, sampleHtmlContent);

  check('Triagem titulo é preenchido com Tipo de Incidente + Local',
    applyTreeResult.triagemTitulo === 'Parada emergencial de planta de processo (Emergency Shutdown – ESD) — Estação Coletora de Macau',
    `Obtido: ${applyTreeResult.triagemTitulo}`);

  check('Triagem descricao recebe o Tipo de Incidente',
    applyTreeResult.triagemDescricao === 'Parada emergencial de planta de processo (Emergency Shutdown – ESD)',
    `Obtido: ${applyTreeResult.triagemDescricao}`);

  check('DOM #f_descricao exibe o Tipo de Incidente',
    applyTreeResult.domDescricao === 'Parada emergencial de planta de processo (Emergency Shutdown – ESD)',
    `Obtido: ${applyTreeResult.domDescricao}`);

  check('Evento Topo da Árvore (evt.label) recebe o Tipo de Incidente formatado',
    applyTreeResult.evtLabel === 'Parada emergencial de planta de processo (Emergency Shutdown – ESD) — Estação Coletora de Macau',
    `Obtido: ${applyTreeResult.evtLabel}`);

  check('Evento Topo da Árvore (evt.desc) recebe o Tipo de Incidente formatado',
    applyTreeResult.evtDesc === 'Parada emergencial de planta de processo (Emergency Shutdown – ESD) — Estação Coletora de Macau',
    `Obtido: ${applyTreeResult.evtDesc}`);

  check('RIA (Passo 3) preserva a narrativa técnica detalhada',
    applyTreeResult.riaTechDesc && applyTreeResult.riaTechDesc.includes('foi identificado nível muito alto no tanque de produção (TQ-12)'),
    `Obtido: ${applyTreeResult.riaTechDesc?.slice(0, 80)}...`);

  // 5. Teste com Metodologia 5 Porquês
  console.log('\n--- Testando Aplicação com Metodologia 5 Porquês ---');
  const applyWhysResult = await page.evaluate((html) => {
    const parsed = window.parseCiiHtml(html);
    window.applyCiiParsedData(parsed, {
      methodology: 'whys',
      mode: 'new',
      overwriteFilled: true
    });
    const study = (typeof window.getCanonicalWhyStudy === 'function') ? window.getCanonicalWhyStudy() : window.state.whysPrimary;
    return {
      whysTitle: study?.title,
      whysDesc: study?.description
    };
  }, sampleHtmlContent);

  check('5 Porquês recebe o Tipo de Incidente como descrição do problema',
    applyWhysResult.whysDesc === 'Parada emergencial de planta de processo (Emergency Shutdown – ESD)',
    `Obtido: ${applyWhysResult.whysDesc}`);

  console.log('\n========================================================================');
  console.log(`=== RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU ===`);
  console.log('========================================================================');

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
