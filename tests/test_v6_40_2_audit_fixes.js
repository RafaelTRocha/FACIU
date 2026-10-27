// tests/test_v6_40_2_audit_fixes.js
// Suíte de testes automatizados para validação da Auditoria Normativa FORM-087 / PG-015 no FACIU v6.40.2

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.2: CORREÇÕES DA AUDITORIA NORMATIVA   ===');
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

const rootDir = path.resolve(__dirname, '..');
const targetHtmlPath = path.join(rootDir, 'FACIU-v6.40.2.html');
const backupHtmlPath = path.join(rootDir, 'backups', 'FACIU-v6.40.1.html');

// 1. Verificação de Preservação e Backup Atômico
check('Arquivo FACIU-v6.40.2.html ativo na raiz', fs.existsSync(targetHtmlPath));
check('Backup backups/FACIU-v6.40.1.html preservado', fs.existsSync(backupHtmlPath) && fs.statSync(backupHtmlPath).size > 3000000);

const rawHtml = fs.readFileSync(targetHtmlPath, 'utf8');

// 2. Verificação de Versionamento no Código-fonte
check('Contém declaração const APP_VERSION="6.40.2"', rawHtml.includes('const APP_VERSION="6.40.2";'));
check('Contém <title> com v6.40.2', rawHtml.includes('<title>FACIU v6.40.2 |'));
check('Contém badge de versão v6.40.2', rawHtml.includes('v6.40.2</span>'));

// 3. Verificação do DOM via JSDOM
const dom = new JSDOM(rawHtml);
const doc = dom.window.document;

// Verificação do Alerta Preliminar FORM-CORP-SMS-089 no select de severidade
const potSelect = doc.getElementById('f_sev_potencial');
check('Option de Nível 3 faz menção expressa ao FORM-CORP-SMS-089',
  Array.from(potSelect.options).some(o => o.value === '3' && o.textContent.includes('FORM-CORP-SMS-089')));

// Verificação do painel de mandatos normativos
check('Painel normativo cita FORM-CORP-SMS-089 e FORM-CORP-SMS-090',
  rawHtml.includes('FORM-CORP-SMS-089') && rawHtml.includes('FORM-CORP-SMS-090'));

// 4. Verificação de SEVERITY_MATRIX: SEV-03-s3 contém Nota PD-02
const sIdx = rawHtml.indexOf('const SEVERITY_MATRIX=');
const endScriptIdx = rawHtml.indexOf('</script>', sIdx);
const matrixScript = rawHtml.slice(sIdx, endScriptIdx);
const matrix = new Function(matrixScript + '; return SEVERITY_MATRIX;')();

const sev03 = matrix.realCategories.flatMap(c => c.occurrences).find(o => o.id === 'SEV-03');
const sev03s3 = sev03 && sev03.criteria.find(c => c.id === 'SEV-03-s3');
check('SEV-03-s3 contém Nota PD-02 sobre área ecologicamente sensível',
  sev03s3 && sev03s3.text.includes('PD-02') && sev03s3.text.includes('≥ 8 m³ = Nível 3'));

// 5. Verificação da Comissão Tabela 1 PG-015
const commStart = rawHtml.indexOf('const COMMISSION_RULE_LABELS');
const commEnd = rawHtml.indexOf('function delMember', commStart);
const commCode = rawHtml.slice(commStart, commEnd);

const mockState = {
  triagem: { sev: '1', severidadePotencial: '1' },
  equipe: [],
  classificacaoV2: { finalSeverity: 1 },
  commissionExceptions: {}
};

const commFn = new Function('state', commCode + '\nreturn { commissionRequirements, commissionLevel };');
const { commissionRequirements } = commFn(mockState);

// Teste Nível 2: Gestor é Gerente de Operações (ou Gerente do Polo)
mockState.triagem.sev = '2';
mockState.triagem.severidadePotencial = '2';
mockState.classificacaoV2.finalSeverity = 2;
const reqsL2 = commissionRequirements();
const mgrL2 = reqsL2.find(r => r.id === 'manager');
check('Nível 2 exige Gerente de Operações (ou Gerente do Polo)',
  mgrL2 && mgrL2.detail.includes('Gerente de Operações'));

// Teste Nível 3: Coordenador é Gerente de QSSO ou Coord Sr
mockState.triagem.sev = '3';
mockState.triagem.severidadePotencial = '3';
mockState.classificacaoV2.finalSeverity = 3;
const reqsL3 = commissionRequirements();
const coordL3 = reqsL3.find(r => r.id === 'coordinator');
check('Nível 3 exige Gerente de QSSO ou Coordenador Sr. onshore/offshore',
  coordL3 && coordL3.detail.includes('Gerente de QSSO'));

// 6. Verificação do validador de prazo regulamentar de ações
const actStart = rawHtml.indexOf('function actionEffectivenessValidationItems()');
const actEnd = rawHtml.indexOf('function validationItems()', actStart);
const actCode = rawHtml.slice(actStart, actEnd);

const testTreeState = {
  triagem: { ocorr: '2026-10-01', sev: '3', severidadePotencial: '3' },
  classificacaoV2: { finalSeverity: 3 },
  tree: {
    nodes: [
      { id: 'act1', kind: 'acao', label: 'Ação rápida', responsavel: 'Operador', prazo: '2026-10-20', status: 'Pendente' },
      { id: 'act2', kind: 'acao', label: 'Ação tardia', responsavel: 'Operador', prazo: '2026-12-01', status: 'Pendente' }
    ]
  }
};

const actFn = new Function('state', 'byFaixa', 'resolveActionRoot', actCode + '\nreturn actionEffectivenessValidationItems;');
const validateActions = actFn(
  testTreeState,
  () => testTreeState.tree.nodes,
  () => ({ id: 'r1', label: 'Raiz' })
);

const actionValidationResults = validateActions();
const act1Limit = actionValidationResults.find(r => r.id === 'action.deadline-limit.act1');
const act2Limit = actionValidationResults.find(r => r.id === 'action.deadline-limit.act2');

check('Ação dentro do prazo de 30 dias não gera pendência de limite', !act1Limit);
check('Ação acima de 30 dias (Nível 3) gera pendência normativa (warning)',
  act2Limit && act2Limit.ok === false && act2Limit.severity === 'warning');

console.log('\n========================================================================');
console.log(`TOTAL DE TESTES: ${passed + failed} | SUCESSOS: ${passed} | FALHAS: ${failed}`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
}
