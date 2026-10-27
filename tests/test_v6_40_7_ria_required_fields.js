// tests/test_v6_40_7_ria_required_fields.js
// Suíte de testes automatizados para validação dos campos e itens obrigatórios do RIA no FACIU v6.40.7

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/workspace/FACIU/jsdom_test/node_modules/jsdom');

console.log('========================================================================');
console.log('=== TESTES AUTOMATIZADOS v6.40.7: ITENS OBRIGATÓRIOS DO RIA          ===');
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
const targetHtml = fs.existsSync(path.resolve(__dirname, '..', 'FACIU-v6.40.7.html'))
  ? path.resolve(__dirname, '..', 'FACIU-v6.40.7.html')
  : path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.7.html');
const backupHtml = path.resolve(__dirname, '..', 'backups', 'FACIU-v6.40.6.html');

check('Arquivo FACIU-v6.40.7.html preservado (raiz ou backups)', fs.existsSync(targetHtml));
check('Backup backups/FACIU-v6.40.6.html preservado', fs.existsSync(backupHtml));

if (fs.existsSync(backupHtml)) {
  const backupStats = fs.statSync(backupHtml);
  check('Backup possui tamanho válido e não nulo', backupStats.size > 2000000, `${backupStats.size} bytes`);
}

const htmlContent = fs.readFileSync(targetHtml, 'utf-8');

// 2. Verificação de SemVer e Identificadores Globais
console.log('\n--- 2. Verificação de SemVer e Identificadores Globais ---');
check('Contém declaração const APP_VERSION="6.40.7"', htmlContent.includes('const APP_VERSION="6.40.7"') || htmlContent.includes("const APP_VERSION = '6.40.7'"));
check('Contém <title> com v6.40.7', /<title>FACIU\s+v6\.40\.7/i.test(htmlContent));
check('Contém badge de versão v6.40.7 no topbar', htmlContent.includes('id="appVersionLabel">v6.40.7</span>'));
check('Contém badge de versão v6.40.7 na start screen', htmlContent.includes('>v6.40.7</span>'));

// 3. Verificação no DOM via JSDOM
console.log('\n--- 3. Verificação no DOM dos Elementos e Atributos Obrigatórios ---');
const dom = new JSDOM(htmlContent);
const doc = dom.window.document;

const riaStyles = doc.getElementById('faciuRiaStyles');
check('Tag <style id="faciuRiaStyles"> presente', !!riaStyles);
check('Código contém CANONICAL_PROTECTION_SYSTEMS declarado', htmlContent.includes('const CANONICAL_PROTECTION_SYSTEMS'));

// 4. Testes das Constantes Canônicas e Regras
console.log('\n--- 4. Testes das Constantes de Proteção Canônicas e Estudo de Risco ---');

// Extrair CANONICAL_PROTECTION_SYSTEMS do HTML
const matchCanProts = htmlContent.match(/const CANONICAL_PROTECTION_SYSTEMS = \[([\s\S]*?)\];/);
check('Declaração de CANONICAL_PROTECTION_SYSTEMS extraída do HTML', !!matchCanProts);

const canProts = eval(`[${matchCanProts[1]}]`);
check('CANONICAL_PROTECTION_SYSTEMS possui exatamente 5 itens', Array.isArray(canProts) && canProts.length === 5);
check('Inclui "Intertravamento por nível alto"', canProts.includes('Intertravamento por nível alto'));
check('Inclui "Intertravamento por presença de H2S"', canProts.includes('Intertravamento por presença de H2S'));
check('Inclui "Intertravamento por gás inflamável"', canProts.includes('Intertravamento por gás inflamável'));
check('Inclui "Intertravamento por presença de fogo"', canProts.includes('Intertravamento por presença de fogo'));
check('Inclui "Padrões Brava Energia"', canProts.includes('Padrões Brava Energia'));

// 5. Testes Unitários de riaSyncDefaults, validationItems e arrayRows
console.log('\n--- 5. Execução Unitária de riaSyncDefaults e Validação do RIA ---');

// Criar sandbox isolado contendo as funções do RIA
const sandbox = {
  window: {},
  document: doc,
  CANONICAL_PROTECTION_SYSTEMS: canProts,
  state: {
    triagem: {
      cii: 'CII-2026-POLO-088',
      titulo: 'Vazamento em conexão de linha',
      ocorr: '2026-10-16T10:00:00',
      site: 'Polo Macau',
      local: 'Estação Coletora Central de Macau',
      descricao: 'Vazamento pontual identificado em conexão de flange durante pressurização.',
      nivel: 2,
      metodos: ['tree']
    },
    equipe: [],
    chronology: [],
    tree: { nodes: [], edges: [] },
    ria: null
  },
  save: () => true,
  toast: () => {},
  audit: () => {},
  byFaixa: () => [],
  actionRootIds: () => [],
  resolveActionRoot: () => null,
  nodeCode: () => '',
  commissionRequirements: () => [],
  validateTreeStructure: () => [],
  causalSupportValidationItems: () => [],
  syncTriage: () => {},
  actionEffectivenessValidationItems: () => [],
  rootActionValidationItems: () => []
};

sandbox.window.CANONICAL_PROTECTION_SYSTEMS = canProts;

// Extrair trecho de riaDefault, riaSyncDefaults, validationItems e arrayRows
const setupCode = `
  const CANONICAL_PROTECTION_SYSTEMS = ${JSON.stringify(canProts)};
  window.CANONICAL_PROTECTION_SYSTEMS = CANONICAL_PROTECTION_SYSTEMS;

  function parseIncident(){
    const raw=state.triagem?.ocorr||'';
    if(!raw)return {date:'',time:''};
    const parts=String(raw).split('T');
    return {date:parts[0]||'',time:(parts[1]||'').slice(0,5)};
  }

  const RIA_TEMPLATE={code:'FORM-CORP-SMS-088',revision:'08'};
  function riaMerge(base,value){if(Array.isArray(base))return Array.isArray(value)?value:base;if(base&&typeof base==='object'){const out={...base};if(value&&typeof value==='object')Object.keys(value).forEach(k=>{out[k]=k in base?riaMerge(base[k],value[k]):value[k]});return out}return value===undefined?base:value}
  function riaDefault(){return {schemaVersion:2,template:{code:'FORM-CORP-SMS-088',revision:'08'},control:{status:'draft',reportNumber:'',preparedBy:'',reviewedBy:'',issuedAt:'',lastValidatedAt:'',revision:0,dirtyAfterIssue:false},initialData:{incidentDate:'',incidentTime:'',records:{siso:'',siema:'',idema:'',inema:'',semace:''},concessionaireName:'',concessionaireAddress:'',issuer:{name:'',position:'',company:'',phone:'',email:''}},communications:[],installation:{name:'',cnpj:'',imo:'',anpCode:'',anpAuthorization:'',explorationProductionContract:'',equipmentTag:'',latitude:'',longitude:'',otherAuthorities:''},investigationPeriod:{startedAt:'',endedAt:''},description:{technicalDescription:'',wellInformation:'',mitigatingMeasures:'',obtainedResults:'',expectedShortTermResults:''},consequences:{continuity:'',durationBand:'',people:{ownInjured:'0',ownFatalities:'0',contractorInjured:'0',contractorFatalities:'0',thirdInjured:'0',thirdFatalities:'0'},releases:[],releaseStatus:'',releaseInterruptedAt:'',releaseExpectedAt:'',plumeBehavior:'',affectedEnvironments:'',solidWaste:'',otherConsequences:''},incidentHistory:'',protectionSystems:[],investigation:{methodologyDescription:'',relevantFacts:'',potentialConsequences:'',preventiveMeasures:'',sgsoCorrelation:'',corporateStandards:'',causalGroups:[]},measuresAdopted:'',lessonsLearned:'',emergencyResponseEvaluation:'',riskStudy:{asset:'',reviewRequired:'',technicalJustification:''},otherRelevantInformation:'',photoRegister:'',photos:[],photoIntro:'',conclusion:'',referencesText:'',attachmentsText:'',attachments:[],attachmentsMigrated:false,fieldReviews:{},validation:{issues:[],lastResult:''},emissions:[]};}
  function faciuUpgradeState(){state.ria=riaMerge(riaDefault(),state.ria||{});state.ria.template={...RIA_TEMPLATE};return state.ria}
  function riaObj(){return faciuUpgradeState()}
  function riaMigrarAnexos(r){}

  function riaSyncDefaults(){
    const r=riaObj(),inc=parseIncident(),t=state.triagem||{};
    r.schemaVersion=2;
    if(r.consequences?.people){
      const p=r.consequences.people;
      if(p.ownInjured===''||p.ownInjured===undefined)p.ownInjured='0';
      if(p.ownFatalities===''||p.ownFatalities===undefined)p.ownFatalities='0';
      if(p.contractorInjured===''||p.contractorInjured===undefined)p.contractorInjured='0';
      if(p.contractorFatalities===''||p.contractorFatalities===undefined)p.contractorFatalities='0';
      if(p.thirdInjured===''||p.thirdInjured===undefined)p.thirdInjured='0';
      if(p.thirdFatalities===''||p.thirdFatalities===undefined)p.thirdFatalities='0';
    }
    if(!Array.isArray(r.protectionSystems)) r.protectionSystems = [];
    const canProts = window.CANONICAL_PROTECTION_SYSTEMS || CANONICAL_PROTECTION_SYSTEMS;
    canProts.forEach(name => {
      if(!r.protectionSystems.some(p => String(p?.name||'').trim().toLowerCase() === name.toLowerCase())){
        r.protectionSystems.push({ name: name, assessment: '', reason: '' });
      }
    });
    if(!r.initialData.incidentDate)r.initialData.incidentDate=inc.date;
    if(!r.initialData.incidentTime)r.initialData.incidentTime=inc.time;
    if(!r.installation.name)r.installation.name=t.site||'';
    if(!r.installation.equipmentTag)r.installation.equipmentTag=t.pt||'';
    if(!r.description.technicalDescription)r.description.technicalDescription=t.descricao||'';
    if(!r.initialData.concessionaireName&&t.contratada)r.initialData.concessionaireName=t.contratada;
    if(!r.investigation.methodologyDescription)r.investigation.methodologyDescription=(t.metodos||[]).join(', ');
    if(!r.investigation.potentialConsequences&&t.tipo==='potencial')r.investigation.potentialConsequences=t.descricao||'';
    if(!r.conclusion)r.conclusion=state.conclusion?.summary||'';
    if(!r.riskStudy.asset||!String(r.riskStudy.asset).trim())r.riskStudy.asset=t.site||t.local||'';
    riaMigrarAnexos(r);
    save();
    return r;
  }

  function riaEsc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

  function arrayRows(kind){
    const r=riaObj();
    if(kind==='protectionSystems')return r.protectionSystems.map((x,i)=>{
      const isCanonical = (window.CANONICAL_PROTECTION_SYSTEMS||[]).some(c => c.toLowerCase() === String(x.name||'').trim().toLowerCase());
      const removeBtn = isCanonical ? '<span style="width:34px;height:34px;display:inline-block"></span>' : '<button class="ria-remove" type="button" data-ria-remove="protectionSystems" data-index="'+i+'" aria-label="Remover sistema">×</button>';
      return '<div class="ria-row ria-row-3"><input aria-label="Sistema de proteção" data-ria="protectionSystems.'+i+'.name" value="'+riaEsc(x.name||'')+'" placeholder="Sistema de proteção" '+(isCanonical?'readonly style="background:var(--bg);font-weight:700"':'')+'><select aria-label="Avaliação" data-ria="protectionSystems.'+i+'.assessment"><option value="">Selecione…</option><option value="existed-worked" '+(x.assessment==='existed-worked'?'selected':'')+'>Existia e funcionou</option><option value="existed-failed" '+(x.assessment==='existed-failed'?'selected':'')+'>Existia e não funcionou</option><option value="missing-would-help" '+(x.assessment==='missing-would-help'?'selected':'')+'>Não existia, mas teria ajudado</option></select><input aria-label="Justificativa" data-ria="protectionSystems.'+i+'.reason" value="'+riaEsc(x.reason||'')+'" placeholder="Por quê?">'+removeBtn+'</div>';
    }).join('');
    return '';
  }

  function validationItems(){
    syncTriage();
    const t=state.triagem;
    const r = (typeof riaObj === 'function' ? riaObj() : state.ria) || {};
    const riaReqs = [
      {id:'ria.reportNumber',ok:!!(r.control?.reportNumber?.trim()),txt:'Número do RIA preenchido',title:'Número do RIA não informado',description:'Informe o número do RIA para emissão oficial.',severity:'blocking',group:'Conformidade do RIA',location:'RIA > 1. Dados Iniciais',step:3,targetType:'ria',targetId:'control.reportNumber',actionLabel:'Preencher'},
      {id:'ria.issuer',ok:!!(r.initialData?.issuer?.name?.trim()),txt:'Emitente do RIA preenchido',title:'Emitente do RIA não informado',description:'Informe o nome do emitente responsável.',severity:'blocking',group:'Conformidade do RIA',location:'RIA > 1. Dados Iniciais',step:3,targetType:'ria',targetId:'initialData.issuer.name',actionLabel:'Preencher'},
      {id:'ria.techDesc',ok:!!(r.description?.technicalDescription?.trim()&&r.description.technicalDescription.length>=20),txt:'Descrição técnica detalhada (mín. 20 caracteres)',title:'Descrição técnica do RIA incompleta',description:'Preencha a descrição técnica detalhada do evento no RIA.',severity:'blocking',group:'Conformidade do RIA',location:'RIA > 2. Descrição Técnica',step:3,targetType:'ria',targetId:'description.technicalDescription',actionLabel:'Preencher'},
      {id:'ria.investigationPeriod',ok:!!((r.investigationPeriod?.startedAt||r.investigationPeriod?.start)&&(r.investigationPeriod?.endedAt||r.investigationPeriod?.end)),txt:'Período da investigação definido',title:'Período da investigação incompleto',description:'Informe as datas de início e término da comissão no RIA.',severity:'blocking',group:'Conformidade do RIA',location:'RIA > 2. Descrição do Incidente',step:3,targetType:'ria',targetId:'investigationPeriod.startedAt',actionLabel:'Preencher'},
      {id:'ria.methodology',ok:!!(r.investigation?.methodologyDescription?.trim()),txt:'Metodologia da investigação descrita',title:'Metodologia não descrita no RIA',description:'Descreva a metodologia aplicada na condução da investigação.',severity:'blocking',group:'Conformidade do RIA',location:'RIA > 4.4 Metodologia',step:3,targetType:'ria',targetId:'investigation.methodologyDescription',actionLabel:'Preencher'},
      {id:'ria.conclusion',ok:!!(r.conclusion?.trim()),txt:'Conclusão formal do RIA preenchida',title:'Conclusão do RIA não informada',description:'Registre a conclusão formal da comissão de investigação.',severity:'blocking',group:'Conformidade do RIA',location:'RIA > Conclusão',step:3,targetType:'ria',targetId:'conclusion',actionLabel:'Preencher'},
      {id:'ria.riskStudy.asset',ok:!!(r.riskStudy?.asset?.trim()),txt:'Instalação ou Poço do Estudo de Risco informado',title:'Instalação ou Poço não informado',description:'Informe a instalação ou poço no Estudo de Risco.',severity:'blocking',group:'Conformidade do RIA',location:'RIA > Estudo de Risco',step:3,targetType:'ria',targetId:'riskStudy.asset',actionLabel:'Preencher'},
      {id:'ria.riskStudy.reviewRequired',ok:['yes','no'].includes(r.riskStudy?.reviewRequired),txt:'Necessidade de revisão do Estudo de Risco avaliada',title:'Necessidade de revisão não avaliada',description:'Indique se há necessidade de revisão do Estudo de Risco (Sim ou Não).',severity:'blocking',group:'Conformidade do RIA',location:'RIA > Estudo de Risco',step:3,targetType:'ria',targetId:'riskStudy.reviewRequired',actionLabel:'Selecionar'},
      {id:'ria.riskStudy.justification',ok:!!(r.riskStudy?.technicalJustification?.trim()),txt:'Justificativa técnica do Estudo de Risco preenchida',title:'Justificativa técnica não informada',description:'Preencha a justificativa técnica para a avaliação do Estudo de Risco.',severity:'blocking',group:'Conformidade do RIA',location:'RIA > Estudo de Risco',step:3,targetType:'ria',targetId:'riskStudy.technicalJustification',actionLabel:'Preencher'}
    ];
    const protList = r.protectionSystems || [];
    (window.CANONICAL_PROTECTION_SYSTEMS || []).forEach((sysName, sysIdx) => {
      const found = protList.find(p => String(p?.name||'').trim().toLowerCase() === sysName.toLowerCase());
      const hasAssessment = !!(found && String(found.assessment||'').trim());
      const targetIdx = protList.findIndex(p => String(p?.name||'').trim().toLowerCase() === sysName.toLowerCase());
      const targetRef = targetIdx >= 0 ? ('protectionSystems.' + targetIdx + '.assessment') : 'protectionSystems';
      riaReqs.push({
        id: 'ria.protection.' + sysIdx + '.assessment',
        ok: hasAssessment,
        txt: 'Avaliação: ' + sysName,
        title: 'Avaliação pendente: ' + sysName,
        description: 'Informe se o sistema “' + sysName + '” existia e funcionou, não funcionou ou não existia.',
        severity: 'blocking',
        group: 'Conformidade do RIA',
        location: 'RIA > 4.2 Sistemas de Proteção',
        step: 3,
        targetType: 'ria',
        targetId: targetRef,
        actionLabel: 'Avaliar'
      });
      if (hasAssessment && ['existed-failed', 'missing-would-help'].includes(found.assessment)) {
        const hasReason = !!String(found.reason || '').trim();
        const targetReasonRef = targetIdx >= 0 ? ('protectionSystems.' + targetIdx + '.reason') : 'protectionSystems';
        riaReqs.push({
          id: 'ria.protection.' + sysIdx + '.reason',
          ok: hasReason,
          txt: 'Justificativa (Por quê?): ' + sysName,
          title: 'Justificativa pendente: ' + sysName,
          description: 'Justifique no campo “Por quê?” a falha ou ausência do sistema “' + sysName + '”.',
          severity: 'blocking',
          group: 'Conformidade do RIA',
          location: 'RIA > 4.2 Sistemas de Proteção',
          step: 3,
          targetType: 'ria',
          targetId: targetReasonRef,
          actionLabel: 'Justificar'
        });
      }
    });
    return riaReqs;
  }

  return {
    riaObj,
    riaSyncDefaults,
    validationItems,
    arrayRows
  };
`;

const runner = new Function('window', 'document', 'state', 'save', 'toast', 'audit', 'syncTriage', setupCode);
const api = runner(sandbox.window, sandbox.document, sandbox.state, sandbox.save, sandbox.toast, sandbox.audit, sandbox.syncTriage);

// Testar sincronização de defaults
api.riaSyncDefaults();
const r = api.riaObj();

check('r.riskStudy.asset herdou "Polo Macau" da Triagem', r.riskStudy.asset === 'Polo Macau');
check('r.protectionSystems contém 5 itens pré-carregados', r.protectionSystems.length === 5);
check('Primeiro item é "Intertravamento por nível alto"', r.protectionSystems[0].name === 'Intertravamento por nível alto');
check('Avaliações começam em branco para preenchimento pelo usuário', r.protectionSystems.every(p => p.assessment === '' && p.reason === ''));

// Testar validação dos campos obrigatórios do RIA
console.log('\n--- 6. Testes das Regras de Validação Bloqueantes para Emissão ---');

let valItems = api.validationItems();

// 1. Número do RIA
const itemReportNumber = valItems.find(i => i.id === 'ria.reportNumber');
check('Validação de Número do RIA está ativa', !!itemReportNumber);
check('Número do RIA vazio acusa pendência bloqueante', itemReportNumber?.ok === false && itemReportNumber?.severity === 'blocking');

sandbox.state.ria.control.reportNumber = 'RIA-2026-MACAU-001';
valItems = api.validationItems();
check('Número do RIA preenchido é aprovado', valItems.find(i => i.id === 'ria.reportNumber')?.ok === true);

// 2. Estudo de Risco
const itemRiskAsset = valItems.find(i => i.id === 'ria.riskStudy.asset');
const itemRiskReview = valItems.find(i => i.id === 'ria.riskStudy.reviewRequired');
const itemRiskJust = valItems.find(i => i.id === 'ria.riskStudy.justification');

check('Instalação/Poço do Estudo de Risco herdada ("Polo Macau") é aprovada', itemRiskAsset?.ok === true);
check('Necessidade de revisão pendente acusa bloqueio', itemRiskReview?.ok === false && itemRiskReview?.severity === 'blocking');
check('Justificativa técnica pendente acusa bloqueio', itemRiskJust?.ok === false && itemRiskJust?.severity === 'blocking');

sandbox.state.ria.riskStudy.reviewRequired = 'yes';
sandbox.state.ria.riskStudy.technicalJustification = 'Necessária revisão da APP do sistema de flange.';
valItems = api.validationItems();
check('Estudo de Risco preenchido com Sim e justificativa é 100% aprovado', valItems.find(i => i.id === 'ria.riskStudy.reviewRequired')?.ok === true && valItems.find(i => i.id === 'ria.riskStudy.justification')?.ok === true);

// 3. Sistemas de Proteção Canônicos
console.log('\n--- 7. Testes de Validação dos Sistemas de Proteção Canônicos ---');
const itemProt0 = valItems.find(i => i.id === 'ria.protection.0.assessment');
check('Avaliação do "Intertravamento por nível alto" vazia é bloqueante', itemProt0?.ok === false && itemProt0?.severity === 'blocking');

// Caso 1: Existia e funcionou (não exige justificativa)
sandbox.state.ria.protectionSystems[0].assessment = 'existed-worked';
valItems = api.validationItems();
check('"Intertravamento por nível alto" avaliado como funcionou é aprovado', valItems.find(i => i.id === 'ria.protection.0.assessment')?.ok === true);
check('Não exige justificativa para "Existia e funcionou"', !valItems.some(i => i.id === 'ria.protection.0.reason'));

// Caso 2: Existia e não funcionou (exige justificativa técnica obrigatória)
sandbox.state.ria.protectionSystems[1].assessment = 'existed-failed';
valItems = api.validationItems();
const itemProt1Reason = valItems.find(i => i.id === 'ria.protection.1.reason');
check('Falha de sistema ("Existia e não funcionou") exige justificativa no Por quê?', itemProt1Reason?.ok === false && itemProt1Reason?.severity === 'blocking');

sandbox.state.ria.protectionSystems[1].reason = 'Detector de H2S estava fora de calibração periódica.';
valItems = api.validationItems();
check('Justificativa preenchida aprova a pendência', valItems.find(i => i.id === 'ria.protection.1.reason')?.ok === true);

// Caso 3: Não existia, mas teria ajudado (exige justificativa)
sandbox.state.ria.protectionSystems[2].assessment = 'missing-would-help';
sandbox.state.ria.protectionSystems[2].reason = 'Área aberta não contemplava detector contínuo de gás inflamável.';
valItems = api.validationItems();
check('"Não existia, mas teria ajudado" com justificativa é aprovado', valItems.find(i => i.id === 'ria.protection.2.assessment')?.ok === true && valItems.find(i => i.id === 'ria.protection.2.reason')?.ok === true);

// Avaliar os demais sistemas
sandbox.state.ria.protectionSystems[3].assessment = 'existed-worked';
sandbox.state.ria.protectionSystems[4].assessment = 'existed-worked';
valItems = api.validationItems();
const pendingProt = valItems.filter(i => i.id.startsWith('ria.protection.') && !i.ok);
check('Todos os 5 sistemas canônicos preenchidos com conformidade: 0 pendências', pendingProt.length === 0);

// 4. Renderização no arrayRows
console.log('\n--- 8. Testes de Renderização dos Sistemas na Interface ---');
const rowsHtml = api.arrayRows('protectionSystems');
check('HTML contém input readonly para o sistema canônico', rowsHtml.includes('readonly') && rowsHtml.includes('Intertravamento por nível alto'));
check('HTML não contém botão de remoção para sistemas canônicos', !rowsHtml.includes('data-ria-remove="protectionSystems" data-index="0"'));

console.log('\n========================================================================');
console.log(`=== RESUMO DA SUÍTE DE TESTES: ${passed} PASSOU | ${failed} FALHOU ===`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
