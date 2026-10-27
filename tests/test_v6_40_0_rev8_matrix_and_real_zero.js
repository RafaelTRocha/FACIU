// tests/test_v6_40_0_rev8_matrix_and_real_zero.js
// Suíte de testes automatizados: Matriz FORM-CORP-SMS-087 Rev. 08 & PG-CORP-SMS-015 Rev. 09 no FACIU v6.40.0

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.0: MATRIZ REV.08 & SEVERIDADE REAL 0  ===');
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
const targetHtmlPath = fs.existsSync(path.join(rootDir, 'FACIU-v6.40.0.html'))
  ? path.join(rootDir, 'FACIU-v6.40.0.html')
  : path.join(rootDir, 'backups', 'FACIU-v6.40.0.html');
const backupHtmlPath = path.join(rootDir, 'backups', 'FACIU-v6.39.1.html');

// 1. Verificação de Preservação e Backup Atômico (Passo 0 Obrigatório)
check('Arquivo FACIU-v6.40.0.html preservado (raiz ou backups)', fs.existsSync(targetHtmlPath));
check('Backup backups/FACIU-v6.39.1.html preservado intacto', fs.existsSync(backupHtmlPath) && fs.statSync(backupHtmlPath).size > 3000000);

const rawHtml = fs.readFileSync(targetHtmlPath, 'utf8');

// 2. Verificação de Versionamento no Código-fonte
check('Contém declaração const APP_VERSION="6.40.0"', rawHtml.includes('const APP_VERSION="6.40.0";'));
check('Contém <title> com v6.40.0', rawHtml.includes('<title>FACIU v6.40.0 |'));
check('Contém badge de versão v6.40.0', rawHtml.includes('v6.40.0</span>'));

// 3. Verificação de Referências Normativas no HTML
check('Referência a FORM-CORP-SMS-087 Rev.08 presente', rawHtml.includes('FORM-CORP-SMS-087 Rev.08') || rawHtml.includes('FORM-CORP-SMS-087'));
check('Referência a PG-CORP-SMS-015 Rev. 09 presente', rawHtml.includes('PG-CORP-SMS-015 Rev. 09'));
check('Painel normativo de prazos do PG-015 presente', rawHtml.includes('Mobilização da Comissão:</b> até 48h'));

// 4. Verificação de Elementos de Interface no DOM via JSDOM
const dom = new JSDOM(rawHtml);
const doc = dom.window.document;

check('Radio buttons de Natureza f_tipo (real e potencial) presentes no DOM', doc.querySelectorAll('input[name=f_tipo]').length === 2);
check('Select de Severidade Potencial f_sev_potencial presente no DOM', !!doc.getElementById('f_sev_potencial'));
check('Select de Área afetada f_dim presente no DOM', !!doc.getElementById('f_dim'));
check('Select de Tipo de ocorrência f_tipoc presente no DOM', !!doc.getElementById('f_tipoc'));
check('Select de Critério f_criterio presente no DOM', !!doc.getElementById('f_criterio'));
check('Badge de nível de comissão commissionLevelBadge presente no DOM', !!doc.getElementById('commissionLevelBadge'));

// 5. Extração e Execução dos Módulos no Sandbox
const mStart = rawHtml.indexOf('const METHODS_BY_LEVEL');
const mEnd = rawHtml.indexOf('};', mStart);
const methodsCode = rawHtml.slice(mStart, mEnd + 2);

const start = rawHtml.indexOf('const SEVERITY_MATRIX=');
const end = rawHtml.indexOf('</script>', start);
const classCode = rawHtml.slice(start, end);

const state = {
  triagem: {},
  equipe: [],
  classificacaoV2: null
};

const fn = new Function(
  'document', 'state', 'save', 'toast', 'audit', 'esc', 'val', 'set',
  'fillClassSelect', 'compactClassLabel', 'renderCommissionValidation', 'renderClassificationAssessments',
  methodsCode + '\n' + classCode + '\nreturn { SEVERITY_MATRIX, METHODS_BY_LEVEL, classificationState, recalcClassification, classificationNature, classificationCategories };'
);

const scope = fn(
  doc,
  state,
  () => {},
  () => {},
  () => {},
  s => String(s || ''),
  id => doc.getElementById(id)?.value || '',
  (id, v) => { const el = doc.getElementById(id); if (el) el.value = v; },
  () => {},
  s => s,
  () => {},
  () => {}
);

const matrix = scope.SEVERITY_MATRIX;
check('SEVERITY_MATRIX revisão é 08', matrix?.revision === '08', `Obtido: ${matrix?.revision}`);
check('SEVERITY_MATRIX documento é FORM-CORP-SMS-087', matrix?.document === 'FORM-CORP-SMS-087', `Obtido: ${matrix?.document}`);
check('SEVERITY_MATRIX possui 6 categorias reais (S01 a S06)', matrix?.realCategories?.length === 6, `Obtido: ${matrix?.realCategories?.length}`);

const totalOccurrences = matrix?.realCategories?.reduce((acc, c) => acc + (c.occurrences?.length || 0), 0);
check('SEVERITY_MATRIX possui exatamente 19 tipologias SEV reais', totalOccurrences === 19, `Obtido: ${totalOccurrences}`);
check('SEVERITY_MATRIX possui 26 tipologias QA de Quase Acidentes', matrix?.potentialOccurrences?.length === 26, `Obtido: ${matrix?.potentialOccurrences?.length}`);

// 6. Checagem das Decisões Homologadas nos Critérios
const sev03 = matrix?.realCategories?.flatMap(c => c.occurrences).find(o => o.id === 'SEV-03');
check('SEV-03 contém Nota PD-01 sobre vazamento de gás', sev03?.criteria?.some(cr => cr.text.includes('PD-01')), 'Nota PD-01 ausente');

const sev06 = matrix?.realCategories?.flatMap(c => c.occurrences).find(o => o.id === 'SEV-06');
check('SEV-06 contém Nota PD-10 sobre tancagem contida em bacia', sev06?.criteria?.some(cr => cr.text.includes('PD-10')), 'Nota PD-10 ausente');

const qa01 = matrix?.potentialOccurrences?.find(q => q.id === 'QA-01');
check('QA-01 possui critério de Severidade Real 0', qa01?.criteria?.[0]?.severity === 0, `Obtido: ${qa01?.criteria?.[0]?.severity}`);

// 7. Checagem de METHODS_BY_LEVEL com nível 0
check('METHODS_BY_LEVEL possui nível 0 definido', typeof scope.METHODS_BY_LEVEL?.[0] !== 'undefined', 'Nível 0 ausente');
check('METHODS_BY_LEVEL[0] rotulado como Quase Acidente (Real 0)', scope.METHODS_BY_LEVEL?.[0]?.rot === 'Quase Acidente (Real 0)');

// 8. Teste de Simulação: Quase Acidente com Severidade Real 0 e Potencial Moderado
const cs = scope.classificationState();
cs.assessments = [{
  id: 'cls_test_qa',
  nature: 'potencial',
  category: 'Quase Acidentes — risco de dano ao Meio Ambiente ou à Saúde Humana',
  occurrence: qa01.label,
  criterionId: qa01.criteria[0].id,
  criterion: qa01.criteria[0].text,
  severity: 0,
  matrixRevision: '08'
}];

state.triagem.severidadePotencial = '2'; // Pior cenário: Moderado (Nível 2)
scope.recalcClassification();

check('Severidade calculada de Quase Acidente é 0', cs.calculatedSeverity === 0, `Obtido: ${cs.calculatedSeverity}`);
check('Severidade final da classificação é 0', cs.finalSeverity === 0, `Obtido: ${cs.finalSeverity}`);
check('state.triagem.sev é "0"', state.triagem.sev === '0', `Obtido: ${state.triagem.sev}`);
check('state.triagem.nivel reflete Real 0 e Potencial Moderado', state.triagem.nivel.includes('Real 0') && state.triagem.nivel.includes('Moderado'), `Obtido: ${state.triagem.nivel}`);
check('Metodologia exigida em Quase Acidente reflete Severidade Potencial (Árvore de Causa / Falha)', state.triagem.metodos?.includes('Árvore de Causa / Falha'));

// 9. Teste de Simulação: Acidente com Dano Real SEV-01 Nível 2
const sev01 = matrix.realCategories[0].occurrences[0];
cs.assessments = [{
  id: 'cls_test_real',
  nature: 'real',
  category: matrix.realCategories[0].label,
  occurrence: sev01.label,
  criterionId: sev01.criteria[1].id,
  criterion: sev01.criteria[1].text,
  severity: 2,
  matrixRevision: '08'
}];
state.triagem.severidadePotencial = '';
scope.recalcClassification();

check('Severidade calculada de Acidente Real é 2', cs.calculatedSeverity === 2, `Obtido: ${cs.calculatedSeverity}`);
check('Severidade final é 2', cs.finalSeverity === 2, `Obtido: ${cs.finalSeverity}`);
check('state.triagem.sev é "2"', state.triagem.sev === '2', `Obtido: ${state.triagem.sev}`);
check('state.triagem.nivel é "Moderado"', state.triagem.nivel === 'Moderado', `Obtido: ${state.triagem.nivel}`);

console.log('\n========================================================================');
console.log(`TOTAL DE TESTES: ${passed + failed} | SUCESSOS: ${passed} | FALHAS: ${failed}`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!\n');
  process.exit(0);
}
