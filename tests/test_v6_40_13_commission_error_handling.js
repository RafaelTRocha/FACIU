// tests/test_v6_40_13_commission_error_handling.js
// Suíte de testes automatizados para validação de tratativas de erros, exceções e regras na comissão (v6.40.13)

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.13: TRATATIVAS DE ERROS NA COMISSÃO   ===');
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
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.40.13.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.40.13.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.13.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.12.html');

check('Arquivo FACIU-v6.40.13.html preservado (raiz ou backups/)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.12.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Contém declaração const APP_VERSION="6.40.13"', htmlContent.includes('const APP_VERSION="6.40.13"') || htmlContent.includes("const APP_VERSION = '6.40.13'"));
check('Contém <title> com v6.40.13', /<title>FACIU\s+v6\.40\.13/i.test(htmlContent));
check('Contém badge de versão v6.40.13 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.13</span>'));

// 3. Testes Funcionais das Tratativas e Regras de Negócio via JSDOM
console.log('\n--- 3. Testes Funcionais das Tratativas de Erros e Exceções ---');
try {
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  // Extrair o escopo da comissão
  const commStart = htmlContent.indexOf('function val(id)');
  const commEnd = htmlContent.indexOf('function delMember', commStart);
  const commCode = htmlContent.slice(commStart, commEnd);

  let toastMessage = '';
  function toast(msg) {
    toastMessage = msg;
  }
  function audit() {}

  const mockState = {
    triagem: { sev: '', severidadePotencial: '2' },
    equipe: [],
    classificacaoV2: { finalSeverity: null },
    commissionExceptions: {}
  };

  const store = {
    addEquipeMember(m) {
      mockState.equipe.push(m);
    }
  };

  const METHODS_BY_LEVEL = {
    1: { rot: 'Leve' },
    2: { rot: 'Moderado' },
    3: { rot: 'Grave' }
  };

  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const runner = new Function(
    'state', 'store', 'document', 'METHODS_BY_LEVEL', 'esc', 'toast', 'audit', 'resolveCommissionMember', 'lucide',
    commCode + '\nreturn { renderCommissionValidation, openCommissionFormFor, toggleCommissionForm, commissionRequirements, commissionLevel, addMember, syncCommissionRoleFlags, resetCommissionForm };'
  );

  function resolveCommissionMember(m) {
    return {
      nome: m.nome,
      funcComissao: m.papelComissao || m.func || 'Membro da comissão',
      cargoSetor: m.cargoSetor || m.cargo || '',
      empresa: m.empresa || 'Brava Energia'
    };
  }

  const lucide = { createIcons: () => {} };

  const scope = runner(mockState, store, document, METHODS_BY_LEVEL, esc, toast, audit, resolveCommissionMember, lucide);

  // Teste 1: Prevenção de falso positivo de Quase Acidente com finalSeverity = null
  console.log('\n- Testando regra de Quase Acidente:');
  mockState.classificacaoV2.finalSeverity = null;
  mockState.triagem.sev = '';
  scope.renderCommissionValidation();
  const badgeTextNull = document.getElementById('commissionLevelBadge').textContent;
  check('Incidente sem classificação (finalSeverity=null) NÃO é marcado como Quase Acidente', !badgeTextNull.includes('Quase Acidente'), badgeTextNull);

  mockState.classificacaoV2.finalSeverity = 0;
  scope.renderCommissionValidation();
  const badgeTextZero = document.getElementById('commissionLevelBadge').textContent;
  check('Incidente com severidade real zero (finalSeverity=0) É marcado como Quase Acidente', badgeTextZero.includes('Quase Acidente'), badgeTextZero);

  // Teste 2: Tags já atendidas NÃO devem ser clicáveis
  console.log('\n- Testando interatividade de tags atendidas vs pendentes:');
  mockState.equipe = [
    { nome: 'Carlos Gerente', func: 'Gestor da investigação', investigationManager: true, areaRepresentative: false, contractorRepresentative: false, cipaRepresentative: false, technicalKnowledge: false, rcaQualified: false, commissionCoordinator: false }
  ];
  scope.renderCommissionValidation();
  const pendingHost = document.getElementById('commissionPendingList');
  const tags = Array.from(pendingHost.children);
  const managerTag = tags.find(t => t.textContent.includes('Gestor'));
  const coordTag = tags.find(t => t.textContent.includes('Coordenador'));

  check('Tag de Gestor está atendida e NÃO possui handler onclick', managerTag && managerTag.onclick === null);
  check('Tag de Coordenador está pendente e POSSUI handler onclick', coordTag && typeof coordTag.onclick === 'function');
  check('Tag de Coordenador é elemento button interativo', coordTag && coordTag.tagName.toLowerCase() === 'button');
  check('Tooltip da tag inclui referência normativa [Item 6.4, Tabela 1, pág. 22]', coordTag && coordTag.title.includes('Item 6.4, Tabela 1, pág. 22'));

  // Teste 3: Tratativa para Representante de Contratada sem empresa
  console.log('\n- Testando tratativa de Representante de Contratada:');
  scope.resetCommissionForm(false);
  document.getElementById('m_nome').value = 'João Terceiro';
  document.getElementById('m_contractorRep').checked = true;
  document.getElementById('m_empresa').value = 'Brava Energia';
  toastMessage = '';
  const initialCount = mockState.equipe.length;
  scope.addMember();
  check('Bloqueia inclusão de contratada com empresa "Brava Energia"', mockState.equipe.length === initialCount);
  check('Exibe toast orientando informar a empresa contratada', toastMessage.includes('informe o nome da empresa contratada'));

  // Corrigindo para empresa terceirizada válida:
  document.getElementById('m_empresa').value = 'Subsea 7';
  scope.addMember();
  check('Permite inclusão quando empresa contratada específica é informada', mockState.equipe.length === initialCount + 1);

  // Teste 4: Impedir falso positivo de Coordenador por função livre (ex: "Coordenador de Operações")
  console.log('\n- Testando função livre contendo termo "Coordenador":');
  scope.resetCommissionForm(false);
  document.getElementById('m_nome').value = 'Marcos Operacional';
  document.getElementById('m_func').value = '__outro';
  document.getElementById('m_funcOutro').value = 'Coordenador de Operações';
  document.getElementById('m_coordinator').checked = false;
  scope.addMember();
  const addedMember = mockState.equipe[mockState.equipe.length - 1];
  check('Função livre "Coordenador de Operações" NÃO é marcada como Coordenador da Comissão', addedMember.commissionCoordinator === false);

  // Teste 5: Duplicidade de Gestor rejeitada com indicação de quem é o titular
  console.log('\n- Testando rejeição de duplicidade de Gestor:');
  scope.resetCommissionForm(false);
  document.getElementById('m_nome').value = 'Outro Gestor';
  document.getElementById('m_func').value = 'Gestor da investigação';
  document.getElementById('m_manager').checked = true;
  toastMessage = '';
  const countBeforeDup = mockState.equipe.length;
  scope.addMember();
  check('Rejeita segundo gestor na comissão', mockState.equipe.length === countBeforeDup);
  check('Toast informa nome do gestor já existente (Carlos Gerente)', toastMessage.includes('Carlos Gerente'));

  // Teste 6: Sincronização bidirecional de papéis (syncCommissionRoleFlags)
  console.log('\n- Testando sincronização bidirecional de flags de papel:');
  document.getElementById('m_func').value = 'Gestor da investigação';
  scope.syncCommissionRoleFlags();
  check('m_manager marcado ao selecionar Gestor', document.getElementById('m_manager').checked === true);

  document.getElementById('m_func').value = 'Membro da comissão';
  scope.syncCommissionRoleFlags();
  check('m_manager desmarcado ao trocar de volta para Membro', document.getElementById('m_manager').checked === false);

  // Teste 7: Preservação de campos digitados ao clicar em tag
  console.log('\n- Testando preservação de texto digitado ao clicar em tag:');
  document.getElementById('m_nome').value = 'Fernanda Especialista';
  document.getElementById('m_cargo').value = 'Engenheira Química';
  scope.openCommissionFormFor('technical');
  check('Nome digitado é preservado ao alternar tag', document.getElementById('m_nome').value === 'Fernanda Especialista');
  check('Cargo digitado é preservado ao alternar tag', document.getElementById('m_cargo').value === 'Engenheira Química');
  check('Flag técnica ativada pela tag', document.getElementById('m_technical').checked === true);

  // Teste 8: Restauração de placeholders ao fechar formulário
  console.log('\n- Testando restauração de placeholders:');
  scope.openCommissionFormFor('contractor');
  check('Placeholder de empresa alterado para contratada', document.getElementById('m_empresa').placeholder === 'Nome da empresa contratada');
  scope.toggleCommissionForm(false);
  check('Placeholder de empresa restaurado para padrão', document.getElementById('m_empresa').placeholder === 'Empresa representada');
  check('Placeholder de cargo restaurado para padrão', document.getElementById('m_cargo').placeholder === 'Ex: Operação, Manutenção');

} catch (err) {
  check('Execução do teste de tratativas de erro e regras', false, err.message + '\n' + err.stack);
}

console.log('\n------------------------------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSOU: ${passed} | FALHOU: ${failed}`);
console.log('========================================================================');

if (failed > 0) {
  process.exit(1);
}
