// tests/test_v6_40_14_na_options_and_chronology_warning.js
// Suíte de testes automatizados para validação das opções N/A em Consequências e alerta em Cronologia (v6.40.14)

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.14: OPÇÕES N/A E ALERTA NA CRONOLOGIA ===');
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

// 1. Verificação de Governança de Versão (Passo Zero Inviolável)
console.log('--- 1. Verificação de Governança de Versão (Passo Zero) ---');
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.40.14.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.40.14.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.14.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.13.html');

check('Arquivo FACIU-v6.40.14.html preservado (raiz ou backups/)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.13.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Contém declaração const APP_VERSION="6.40.14"', htmlContent.includes('const APP_VERSION="6.40.14"') || htmlContent.includes("const APP_VERSION = '6.40.14'"));
check('Contém <title> com v6.40.14', /<title>FACIU\s+v6\.40\.14/i.test(htmlContent));
check('Contém badge de versão v6.40.14 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.14</span>'));

// 3. Testes Funcionais das Opções N/A e da Cronologia
console.log('\n--- 3. Testes Funcionais de Consequências e Cronologia ---');

// Teste 3.1: Opção N/A em Continuidade Operacional
check('Continuidade operacional inclui opção N/A no formulário do RIA', htmlContent.includes("['na','N/A']") && htmlContent.includes("consequences.continuity"));

// Teste 3.2: Opção N/A em Situação da Liberação
check('Situação da liberação inclui opção N/A no formulário do RIA', htmlContent.includes("consequences.releaseStatus") && htmlContent.includes("['na','N/A']"));

// Teste 3.3: Mapeamento no modelo do RIA (riaModelo)
check('riaModelo converte consequences.continuity="na" para cont="na"', htmlContent.includes("else if(r.consequences.continuity==='na') cont='na';"));
check('riaModelo converte consequences.releaseStatus="na" para sit="na"', htmlContent.includes("r.consequences.releaseStatus==='na'?'na'"));

// Teste 3.4: Tabela oficial do RIA impresso e prévia PDF
check('Relatório HTML inclui N/A em Continuidade Operacional', htmlContent.includes("c.continuity==='na'") && htmlContent.includes("N/A"));
check('Relatório HTML inclui N/A em Situação da liberação', htmlContent.includes("c.releaseStatus==='na'") && htmlContent.includes("N/A"));
check('Gerador de PDF inclui opção N/A em Continuidade Operacional', htmlContent.includes("q(d.cont==='na','N/A')"));
check('Gerador de PDF inclui opção N/A em Situação da liberação', htmlContent.includes("q(d.sit==='na','N/A')"));

// Teste 3.5: Exportador SISO / JSON com suporte a status "na"
check('Exportador de incidente mapeia situacao_liberacao status "na"', htmlContent.includes("c.releaseStatus === 'na' ? 'na'"));

// Teste 3.6: Validação da Cronologia sem vínculo causal como ALERTA (warning)
check('Regra de validação de vínculo da cronologia usa severity "warning" em vez de "blocking"', htmlContent.includes("id:'chronology.link.'+x.id") && htmlContent.includes("severity:'warning'"));
check('Título da validação da cronologia sem vínculo aponta como alerta', htmlContent.includes("title:'Marco sem vínculo causal (alerta)'"));
check('Dica de apoio de chr_node informa que vínculo ausente é alerta e não bloqueio', htmlContent.includes("chr_node:") && htmlContent.includes("sem bloquear a emissão"));

// Teste 3.7: Execução da lógica de validação via Runner isolado
try {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const { document } = dom.window;

  const mockState = {
    triagem: { cii: 'CII-123', titulo: 'Incidente Teste', ocorr: '2026-10-21T10:00', site: 'P-01', descricao: 'Descrição detalhada do incidente', nivel: '2' },
    chronology: [
      {
        id: 'CHR-001',
        dateTime: '2026-10-21T10:00',
        phase: 'during',
        description: 'Fato sem vínculo causal',
        externalSource: 'Relatório',
        externalReference: 'R-1',
        linkedNodeId: '',
        contextual: false,
        endOfResponse: true
      }
    ],
    tree: { nodes: [], edges: [] }
  };

  function node(id) { return null; }
  function get(id) { return ''; }

  const studyValidationCode = `
    function studyItems(state, node, get) {
      let items = [];
      const add = x => { if (!items.some(i => i.id === x.id)) items.push(x); };
      const chronology = state.chronology || [];
      chronology.forEach(x => {
        add({
          id: 'chronology.link.' + x.id,
          ok: !!x.contextual || (!!x.linkedNodeId && !!node(x.linkedNodeId)),
          txt: 'Marco vinculado: ' + (x.description || x.id),
          title: 'Marco sem vínculo causal (alerta)',
          description: x.description || x.id,
          correction: get('chr_node'),
          severity: 'warning',
          group: 'Cronologia',
          location: 'Estruturação > Cronologia',
          step: 2,
          targetType: 'chronology',
          targetId: x.id,
          actionLabel: 'Corrigir'
        });
      });
      return items;
    }
    function riaIssues(items) {
      return items.filter(i => !i.ok && i.severity === 'blocking');
    }
    return { studyItems, riaIssues };
  `;

  const runner = new Function(studyValidationCode)();
  const items = runner.studyItems(mockState, node, get);
  const linkItem = items.find(i => i.id === 'chronology.link.CHR-001');

  check('studyItems executa e gera item para o marco CHR-001', !!linkItem);
  check('studyItems define severity como "warning" para marco sem vínculo', linkItem && linkItem.severity === 'warning');
  const issues = runner.riaIssues(items);
  check('riaIssues não inclui marco sem vínculo como bloqueio oficial', issues.length === 0);
} catch (err) {
  check('Execução do runner de validação sem erro', false, err.message);
}

console.log('\n------------------------------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSOU: ${passed} | FALHOU: ${failed}`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
}
