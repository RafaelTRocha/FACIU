// tests/test_v6_40_1_review_fixes.js
// Suíte de testes automatizados para validação dos 7 apontamentos do /code-review no FACIU v6.40.1

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.1: CORREÇÕES DO CODE REVIEW & GOVERNANÇA ===');
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
const targetHtmlPath = path.join(rootDir, 'FACIU-v6.40.1.html');
const backupHtmlPath = path.join(rootDir, 'backups', 'FACIU-v6.40.0.html');

// 1. Verificação de Preservação e Backup Atômico
check('Arquivo FACIU-v6.40.1.html ativo na raiz', fs.existsSync(targetHtmlPath));
check('Backup backups/FACIU-v6.40.0.html preservado', fs.existsSync(backupHtmlPath) && fs.statSync(backupHtmlPath).size > 3000000);

const rawHtml = fs.readFileSync(targetHtmlPath, 'utf8');

// 2. Verificação de Versionamento no Código-fonte
check('Contém declaração const APP_VERSION="6.40.1"', rawHtml.includes('const APP_VERSION="6.40.1";'));
check('Contém <title> com v6.40.1', rawHtml.includes('<title>FACIU v6.40.1 |'));
check('Contém badge de versão v6.40.1', rawHtml.includes('v6.40.1</span>'));

// 3. Verificação do DOM via JSDOM
const dom = new JSDOM(rawHtml);
const doc = dom.window.document;

// Verificação do Override Manual: opção 0 presente
const overrideSelect = doc.getElementById('classificationOverride');
check('Select #classificationOverride possui opção value="0"',
  Array.from(overrideSelect.options).some(o => o.value === '0'));

// 4. Execução das Funções do FACIU em Sandbox
const mStart = rawHtml.indexOf('const METHODS_BY_LEVEL');
const mEnd = rawHtml.indexOf('};', mStart);
const methodsCode = rawHtml.slice(mStart, mEnd + 2);

const start = rawHtml.indexOf('const SEVERITY_MATRIX=');
const end = rawHtml.indexOf('</script>', start);
const classCode = rawHtml.slice(start, end);

// Extrair set() e val() e migrarEstudo() e matchCiiToMatrix()
const setStart = rawHtml.indexOf('function set(id,v)');
const setEnd = rawHtml.indexOf('}', setStart) + 1;
const setCode = rawHtml.slice(setStart, setEnd);

const migrarStart = rawHtml.indexOf('function migrarEstudo(');
const migrarEnd = rawHtml.indexOf('async function initiateNewStudyFlow()', migrarStart);
const migrarCode = rawHtml.slice(migrarStart, migrarEnd);

const commStart = rawHtml.indexOf('function commissionLevel()');
const commEnd = rawHtml.indexOf('function commissionRequirements()', commStart);
const commCode = rawHtml.slice(commStart, commEnd);

const ciiMatchStart = rawHtml.indexOf('function matchCiiToMatrix(parsed)');
const ciiMatchEnd = rawHtml.indexOf('async function handleCiiFileSelected(', ciiMatchStart);
const ciiMatchCode = rawHtml.slice(ciiMatchStart, ciiMatchEnd);

const state = {
  triagem: {},
  equipe: [],
  classificacaoV2: null
};

const fn = new Function(
  'document', 'state', 'save', 'toast', 'audit', 'esc', 'val', 'APP_VERSION', 'renderCommissionValidation',
  methodsCode + '\n' +
  setCode + '\n' +
  commCode + '\n' +
  classCode + '\n' +
  ciiMatchCode + '\n' +
  migrarCode + '\n' +
  'return { SEVERITY_MATRIX, METHODS_BY_LEVEL, set, commissionLevel, classificationState, recalcClassification, renderClassificationAssessments, applyClassificationOverride, normalizeTriageSelection, migrarEstudo, matchCiiToMatrix };'
);

const scope = fn(
  doc,
  state,
  () => {},
  () => {},
  () => {},
  s => String(s || ''),
  id => doc.getElementById(id)?.value || '',
  '6.40.1',
  () => {}
);

// TESTE 1: set(id, v) preserva numeric 0
const inputSev = doc.getElementById('f_sev');
scope.set('f_sev', 0);
check('set("f_sev", 0) atribui "0" e não "" ao input', inputSev.value === '0', `Obtido: "${inputSev.value}"`);

// TESTE 2: renderClassificationAssessments preserva severidade 0
const cs = scope.classificationState();
cs.assessments = [{
  id: 'cls_qa01',
  nature: 'potencial',
  category: 'Quase Acidentes',
  occurrence: 'Parada emergencial de planta de processo (ESD)',
  criterionId: 'QA-01-s0',
  criterion: 'Parada total ou parcial mediante acionamento manual ou automático',
  severity: 0,
  matrixRevision: '08'
}];
scope.renderClassificationAssessments();
check('renderClassificationAssessments mantém assessment com severidade 0',
  cs.assessments.length === 1 && cs.assessments[0].severity === 0,
  `Comprimento: ${cs.assessments.length}`);
check('classificationCount exibe "1"', doc.getElementById('classificationCount').textContent === '1');

// TESTE 3: migrarEstudo preserva severidade 0 em cs.assessments e em triagem.sev
const studyToMigrate = {
  triagem: { sev: '0', nivel: 'Quase Acidente (Severidade Real 0)' },
  classificacaoV2: {
    matrixRevision: '08',
    assessments: [{
      id: 'cls_test',
      criterionId: 'QA-01-s0',
      occurrence: 'Parada emergencial',
      severity: 0
    }],
    calculatedSeverity: 0,
    reviewedSeverity: null,
    finalSeverity: 0
  }
};
const migrated = scope.migrarEstudo(studyToMigrate);
check('migrarEstudo preserva assessments com severidade 0',
  migrated.classificacaoV2.assessments.length === 1 && migrated.classificacaoV2.assessments[0].severity === 0);
check('migrarEstudo preserva finalSeverity 0', migrated.classificacaoV2.finalSeverity === 0);

// TESTE 4: Regra PG-015 Rev.09 - Maior Severidade (Real vs Potencial)
// Caso A: Real 1 (Leve), Potencial 3 (Grave) -> Comissão Nível 3, Metodologia de Nível 3 (RCA / Árvore)
state.classificacaoV2 = {
  matrixRevision: '08',
  assessments: [{
    id: 'cls_real_1',
    nature: 'real',
    category: 'Dano à Saúde Humana',
    occurrence: 'Lesão',
    criterionId: 'SEV-01-s1',
    criterion: 'Caso de primeiros socorros',
    severity: 1
  }],
  calculatedSeverity: 1,
  reviewedSeverity: null,
  finalSeverity: 1,
  overrideReason: ''
};
state.triagem = {
  sev: '1',
  severidadePotencial: '3'
};
scope.recalcClassification();
check('recalcClassification aplica métodos de Nível 3 quando Potencial é 3 (Grave)',
  state.triagem.metodos.includes('Árvore de Causa / Falha') && !state.triagem.metodos.includes('5 Porquês'),
  `Métodos obtidos: ${JSON.stringify(state.triagem.metodos)}`);
check('commissionLevel retorna nível 3 quando Real é 1 e Potencial é 3',
  scope.commissionLevel() === 3,
  `Nível obtido: ${scope.commissionLevel()}`);

// TESTE 5: Override Manual para Nível 0
doc.getElementById('classificationOverride').value = '0';
doc.getElementById('classificationOverrideReason').value = 'Comissão concluiu que não houve dano real (Quase Acidente)';
scope.applyClassificationOverride();
const currentCs = scope.classificationState();
check('applyClassificationOverride aceita e persiste reviewedSeverity 0', currentCs.reviewedSeverity === 0, `Obtido: ${currentCs.reviewedSeverity}`);
check('finalSeverity atualizado para 0 com override', currentCs.finalSeverity === 0, `Obtido: ${currentCs.finalSeverity}`);

// TESTE 6: Migração de IDs da Rev. 07 para a Rev. 08 via normalizeTriageSelection
state.triagem = {
  tipo: 'real',
  dim: 'cat11',       // Rev 07 -> deve virar S02
  tipoc: 'm07-r12',   // Rev 07 -> deve virar SEV-03
  criterio: 'm07-r12-s2', // Rev 07 -> deve virar SEV-03-s2
  classificacaoSchema: 2
};
scope.normalizeTriageSelection();
check('normalizeTriageSelection migra dim cat11 para S02', state.triagem.dim === 'S02', `Obtido: ${state.triagem.dim}`);
check('normalizeTriageSelection migra tipoc m07-r12 para SEV-03', state.triagem.tipoc === 'SEV-03', `Obtido: ${state.triagem.tipoc}`);
check('normalizeTriageSelection migra criterio m07-r12-s2 para SEV-03-s2', state.triagem.criterio === 'SEV-03-s2', `Obtido: ${state.triagem.criterio}`);
check('normalizeTriageSelection promove classificacaoSchema para 3', state.triagem.classificacaoSchema === 3, `Obtido: ${state.triagem.classificacaoSchema}`);

// TESTE 7: matchCiiToMatrix com Severidade Real 0 (Quase Acidente / ESD)
const ciiParsedSample = {
  tipoIncidente: 'Parada emergencial de planta de processo (Emergency Shutdown – ESD)',
  dano: 'Interrupção das Operações',
  severidadeRealNum: 0,
  severidadePotencialNum: 2
};
const ciiMatch = scope.matchCiiToMatrix(ciiParsedSample);
check('matchCiiToMatrix mapeia evento de ESD com severidade real 0 para QA-01',
  ciiMatch && ciiMatch.occId === 'QA-01' && ciiMatch.severity === 0,
  `Obtido: ${JSON.stringify(ciiMatch)}`);

console.log('\n========================================================================');
console.log(`TOTAL DE TESTES: ${passed + failed} | SUCESSOS: ${passed} | FALHAS: ${failed}`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
}
