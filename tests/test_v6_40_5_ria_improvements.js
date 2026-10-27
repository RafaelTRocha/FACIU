// tests/test_v6_40_5_ria_improvements.js
// Suíte de testes automatizados para validação das melhorias do RIA FORM-CORP-SMS-088 Rev. 08 no FACIU v6.40.5

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.5: MELHORIAS NO RIA REV. 08          ===');
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
console.log('--- 1. Verificação de Governança de Versão (Passo Zero) ---');
const targetHtml = path.resolve(__dirname, '..', 'FACIU-v6.40.5.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.4.html');

check('Arquivo FACIU-v6.40.5.html ativo na raiz', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.4.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
check('Contém declaração const APP_VERSION="6.40.5"', htmlContent.includes('const APP_VERSION="6.40.5";'));
check('Contém <title> com v6.40.5', htmlContent.includes('<title>FACIU v6.40.5 |'));
check('Contém badge de versão v6.40.5 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.5</span>'));
check('Contém badge de versão v6.40.5 na start screen', htmlContent.includes('<span class="start-version">v6.40.5</span>'));

// 3. Inicialização de Ambiente JSDOM
console.log('\n--- 2. Verificação Estrutural de Estilos e Scripts no HTML ---');
const dom = new JSDOM(htmlContent);
const doc = dom.window.document;

const riaStyles = doc.getElementById('faciuRiaStyles');
check('Tag <style id="faciuRiaStyles"> presente', !!riaStyles);
check('CSS contém classes .ria-canonical-grid e .ria-canonical-card', riaStyles?.textContent.includes('.ria-canonical-grid') && riaStyles?.textContent.includes('.ria-canonical-card'));

// 4. Extração e Execução Controlada do Script faciuRiaScript
console.log('\n--- 3. Execução Controlada do faciuRiaScript ---');
const scriptTag = doc.getElementById('faciuRiaScript');
check('Tag <script id="faciuRiaScript"> encontrada no HTML', !!scriptTag);

// Preparar ambiente simulado para o script do RIA
const state = {
  triagem: { cii: 'CII-2026-088', ocorr: '2026-10-16T08:30:00' },
  chronology: [
    { dateTime: '2026-10-16T08:30:00', description: 'Início do teste de estanqueidade.' },
    { dateTime: '2026-10-16T08:45:00', description: 'Percebido gotejamento na conexão do flange.' }
  ],
  tree: { nodes: [] },
  equipe: [
    { nome: 'Carlos Silva', cargoSetor: 'Engenheiro de Operação', empresa: 'Brava Energia', funcComissao: 'Líder da Investigação' },
    { nome: 'Mariana Souza', cargoSetor: 'Técnica de Segurança', empresa: 'Brava Energia', funcComissao: 'Especialista SMS' }
  ],
  ria: null
};

const windowMock = {
  document: doc,
  state: state,
  save: () => true,
  toast: () => {},
  audit: () => {},
  faciuValidation: { refreshRia: () => {} },
  lucide: { createIcons: () => {} },
  validationResult: () => [],
  byFaixa: (faixa) => {
    if (faixa === 'hipoteses') return [{ label: 'Falha de vedação da junta', estado: 'Descartada', justificativa: 'Junta em perfeito estado' }];
    if (faixa === 'acoes') return [{ label: 'Revisar procedimento de aperto de flange', actionType: 'Preventiva', responsavel: 'Carlos Silva', prazo: '2026-11-30' }];
    if (faixa === 'raiz') return [{ label: 'Torqueamento insuficiente dos prisioneiros', classificacao: 'Procedimental' }];
    return [];
  },
  actionCauseDescription: () => 'Causa Raiz 1',
  resolveCommissionMember: (m) => m,
  fmtBRDate: (d) => String(d || ''),
  fmtBRDateTime: (dt) => [String(dt||'').split('T')[0]||'', String(dt||'').split('T')[1]||''],
  safe: (s) => String(s || ''),
  checked: (c) => c ? '[X] ' : '[ ] ',
  getChronologyByPhases: (list) => list || [],
  renderAll: () => {},
  goStep: () => {},
  URL: {
    createObjectURL: () => 'blob:mock',
    revokeObjectURL: () => {}
  }
};

// Executar o corpo do faciuRiaScript dentro do contexto do mock
const scriptContent = scriptTag.textContent;
const runRia = new Function('window', 'document', 'state', 'save', 'toast', 'audit', 'fmtBRDate', 'fmtBRDateTime', 'safe', 'checked', 'byFaixa', 'actionCauseDescription', 'resolveCommissionMember', 'getChronologyByPhases', 'renderAll', 'goStep', 'URL', `
  const APP_VERSION = '6.40.5';
  ${scriptContent}
  return {
    faciuRia: window.faciuRia,
    CANONICAL_SUBSTANCES: window.CANONICAL_SUBSTANCES,
    riaGetCanonicalSubstancesData: window.riaGetCanonicalSubstancesData,
    riaSetCanonicalSubstance: window.riaSetCanonicalSubstance,
    buildRiaCanonicalRev08Json: window.buildRiaCanonicalRev08Json,
    downloadRiaCanonicalJson: window.downloadRiaCanonicalJson,
    copyRiaCanonicalJson: window.copyRiaCanonicalJson,
    renderConsequences: window.renderConsequences,
    renderRiaModule: window.renderRiaModule,
    riaReleaseValue: window.faciuRia?.releaseValue,
    renderCanonicalSubstancesHtml: window.renderCanonicalSubstancesHtml
  };
`);

const riaScope = runRia(
  windowMock,
  doc,
  state,
  windowMock.save,
  windowMock.toast,
  windowMock.audit,
  windowMock.fmtBRDate,
  windowMock.fmtBRDateTime,
  windowMock.safe,
  windowMock.checked,
  windowMock.byFaixa,
  windowMock.actionCauseDescription,
  windowMock.resolveCommissionMember,
  windowMock.getChronologyByPhases,
  windowMock.renderAll,
  windowMock.goStep,
  windowMock.URL
);

check('Módulo faciuRia instanciado com sucesso', !!riaScope.faciuRia);
check('Lista CANONICAL_SUBSTANCES possui 6 substâncias normativas', riaScope.CANONICAL_SUBSTANCES.length === 6);
check('CANONICAL_SUBSTANCES inclui Petróleo bruto e Fluido de perfuração', riaScope.CANONICAL_SUBSTANCES.includes('Petróleo bruto') && riaScope.CANONICAL_SUBSTANCES.includes('Fluido de perfuração'));

// 5. Testes da UI e Manipulação de Substâncias Canônicas
console.log('\n--- 4. Testes de Manipulação de Substâncias Canônicas ---');
const subDataInicial = riaScope.riaGetCanonicalSubstancesData();
check('Todos os 6 itens canônicos + Outro estão mapeados', Object.keys(subDataInicial).length === 7);
check('Petróleo bruto inicialmente desmarcado', subDataInicial['Petróleo bruto'].checked === false);

// Ativar Petróleo bruto
riaScope.riaSetCanonicalSubstance('Petróleo bruto', true, '18.4');
check('Petróleo bruto registrado no estado com quantidade 18.4', riaScope.riaReleaseValue('Petróleo bruto') === '18.4');

// Ativar Água oleosa
riaScope.riaSetCanonicalSubstance('Água oleosa', true, '50.0');
check('Água oleosa registrada com quantidade 50.0', riaScope.riaReleaseValue('Água oleosa') === '50.0');

// Ativar Outro
riaScope.riaSetCanonicalSubstance('Outro', true, '2.1', 'Solvente desengraxante');
const outroCadastrado = (state.ria.consequences.releases || []).find(r => r.substance === 'Solvente desengraxante');
check('Substância Outro registrada como "Solvente desengraxante" com vol 2.1', !!outroCadastrado && String(outroCadastrado.quantity) === '2.1');

// Testar geração do HTML da grade canônica
const gridHtml = riaScope.renderCanonicalSubstancesHtml();
check('HTML da grade contém card com Petróleo bruto marcado', gridHtml.includes('data-ria-subst="Petróleo bruto"') && gridHtml.includes('checked'));
check('HTML da grade contém valor de 18.4 no input de volume', gridHtml.includes('value="18.4"'));
check('HTML da grade contém especificação "Solvente desengraxante"', gridHtml.includes('value="Solvente desengraxante"'));

// Desmarcar Água oleosa
riaScope.riaSetCanonicalSubstance('Água oleosa', false, '');
check('Água oleosa desmarcada foi removida do array de releases', riaScope.riaReleaseValue('Água oleosa') === '');

// 6. Testes do Construtor de JSON Canônico do FORM-CORP-SMS-088 Rev. 08
console.log('\n--- 5. Testes do Construtor do JSON Canônico (FORM-CORP-SMS-088 Rev. 08) ---');
check('Função buildRiaCanonicalRev08Json está disponível', typeof riaScope.buildRiaCanonicalRev08Json === 'function');

// Definir campos de teste no estado do RIA
state.ria.control.reportNumber = 'RIA-2026-POLO-088';
state.ria.initialData.records.siso = 'SISO-778899';
state.ria.initialData.records.siema = 'SIEMA-1234';
state.ria.consequences.continuity = 'partial';
state.ria.consequences.durationBand = 'under-24h';
state.ria.consequences.people.ownInjured = '0';
state.ria.consequences.people.ownFatalities = '0';
state.ria.consequences.people.contractorInjured = '1';
state.ria.consequences.people.contractorFatalities = '0';
state.ria.riskStudy.asset = 'Estação Coletora Central';
state.ria.riskStudy.reviewRequired = 'yes';
state.ria.riskStudy.technicalJustification = 'Revisão da análise preliminar de perigos (APP) do sistema de flange.';
state.ria.conclusion = 'A comissão conclui que a causa imediata foi a deficiência de torque nos prisioneiros.';

const jsonRev08 = riaScope.buildRiaCanonicalRev08Json();
check('Objeto JSON gerado com sucesso', typeof jsonRev08 === 'object' && jsonRev08 !== null);

// Validação dos Metadados
check('formulario.codigo === FORM-CORP-SMS-088', jsonRev08.formulario?.codigo === 'FORM-CORP-SMS-088');
check('formulario.revisao === 08', jsonRev08.formulario?.revisao === '08');
check('formulario.empresa === Brava Energia', jsonRev08.formulario?.empresa === 'Brava Energia');

// Validação da Seção 1
check('dados_iniciais.numero_ria === RIA-2026-POLO-088', jsonRev08.dados_iniciais?.numero_ria === 'RIA-2026-POLO-088');
check('dados_iniciais.registro_siso === SISO-778899', jsonRev08.dados_iniciais?.registro_siso === 'SISO-778899');
check('dados_iniciais.registro_siema === SIEMA-1234', jsonRev08.dados_iniciais?.registro_siema === 'SIEMA-1234');

// Validação da Seção 2 (Descrição e Cronologia)
check('descricao_incidente.cronologia possui 2 eventos', jsonRev08.descricao_incidente?.cronologia?.length === 2);
check('descricao_incidente.cronologia possui campos data, hora e descricao', !!jsonRev08.descricao_incidente?.cronologia[0]?.data && !!jsonRev08.descricao_incidente?.cronologia[0]?.descricao);

// Validação da Seção 3 (Consequências e Substâncias Canônicas)
check('consequencias.continuidade_operacional.situacao === parada_parcial', jsonRev08.consequencias?.continuidade_operacional?.situacao === 'parada_parcial');
check('consequencias.continuidade_operacional.duracao === menos_24h', jsonRev08.consequencias?.continuidade_operacional?.duracao === 'menos_24h');
check('consequencias.feridos.empregados_contratados === 1', jsonRev08.consequencias?.feridos?.empregados_contratados === 1);
check('consequencias.feridos.empregados_proprios === 0', jsonRev08.consequencias?.feridos?.empregados_proprios === 0);
check('substancia_liberada.petroleo_bruto marcado com volume 18.4', jsonRev08.consequencias?.substancia_liberada?.petroleo_bruto?.marcado === true && jsonRev08.consequencias?.substancia_liberada?.petroleo_bruto?.volume_m3 === 18.4);
check('substancia_liberada.agua_oleosa desmarcada com volume null', jsonRev08.consequencias?.substancia_liberada?.agua_oleosa?.marcado === false && jsonRev08.consequencias?.substancia_liberada?.agua_oleosa?.volume_m3 === null);
check('substancia_liberada.outro marcado com descrição "Solvente desengraxante" e vol 2.1', jsonRev08.consequencias?.substancia_liberada?.outro?.marcado === true && jsonRev08.consequencias?.substancia_liberada?.outro?.descricao === 'Solvente desengraxante' && jsonRev08.consequencias?.substancia_liberada?.outro?.volume_m3 === 2.1);

// Validação da Seção 4 (Investigação e Recomendações)
check('investigacao.comissao possui 2 membros', jsonRev08.investigacao?.comissao?.length === 2);
check('investigacao.hipoteses possui 1 hipótese descartada', jsonRev08.investigacao?.metodologia?.hipoteses?.length === 1);
check('investigacao.fatores_causais possui causas correlacionadas', Array.isArray(jsonRev08.investigacao?.fatores_causais));
check('investigacao.recomendacoes possui ação preventiva mapeada', jsonRev08.investigacao?.recomendacoes[0]?.tipo_acao?.includes('preventiva'));

// Validação da Seção 6 (Estudo de Risco)
check('estudo_risco.necessita_revisao === true (booleano)', jsonRev08.estudo_risco?.necessita_revisao === true);
check('estudo_risco.instalacao_ou_poco === Estação Coletora Central', jsonRev08.estudo_risco?.instalacao_ou_poco === 'Estação Coletora Central');

// Validação das Demais Seções
check('conclusao preenchida', jsonRev08.conclusao?.includes('deficiência de torque'));
check('assinaturas geradas a partir da equipe da comissão', jsonRev08.assinaturas?.length === 2);

// 7. Verificação de Regressão: Stacking Context Barra 1 > Barra 2
console.log('\n--- 6. Verificação de Regressão: Stacking Context e Z-Index ---');
const barra1 = doc.querySelector('.bg-brava-navy.sticky');
const barra2 = doc.getElementById('faciu-nav-row2');
check('Barra 1 possui z-index 30 (z-30)', barra1?.classList.contains('z-30'));
check('Barra 2 possui z-index 20 (z-20)', barra2?.classList.contains('z-20'));

console.log('\n========================================================================');
console.log(`=== RESUMO DA SUÍTE DE TESTES: ${passed} PASSOU | ${failed} FALHOU ===`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
