const fs = require('fs');
const path = require('path');

const targetHtml = '/workspace/FACIU/FACIU-v6.40.0.html';
const rulesJsonPath = '/workspace/FACIU/regras_classificacao_incidentes_FORM-CORP-SMS-087_rev08_v3.json';

const rulesData = JSON.parse(fs.readFileSync(rulesJsonPath, 'utf8'));

// 1. Construir SEVERITY_MATRIX da Rev. 08
const realCategories = rulesData.secoes_matriz_severidade.map(secao => {
  const occs = rulesData.matriz_severidade
    .filter(s => s.secao_id === secao.id)
    .map(s => {
      const criteria = [];
      const sevs = s.severidades || {};
      for (const [lvl, cInfo] of Object.entries(sevs)) {
        const severityNum = parseInt(lvl, 10);
        const textParts = (cInfo.criterios || []).map(c => c.titulo || c.descricao || '').filter(Boolean);
        let fullText = textParts.join('\n• ');
        if (fullText && !fullText.startsWith('•')) fullText = '• ' + fullText;

        if (s.id === 'SEV-03') {
          fullText += '\n[Nota PD-01]: Gás inflamável é sempre enquadrado como vazamento de gás (Quase Acidente Real 0), nunca como descarga.';
        }
        if (s.id === 'SEV-06' && lvl === '1') {
          fullText += '\n[Nota PD-10]: Tancagem contida em bacia = perda de contenção primária (Quase Acidente Real 0); descarga a partir de tancagem requer contato direto com solo/corpo hídrico.';
        }
        if (s.id === 'SEV-04' || s.id === 'SEV-05' || s.id === 'SEV-06') {
          if (lvl === '3') {
            fullText += '\n[Nota PD-02]: Solo natural, mangues e rios constituem áreas ecologicamente sensíveis (descarga ≥ 8 m³ = Nível 3 Grave).';
          }
        }
        if (s.pontos_a_decidir_relacionados && s.pontos_a_decidir_relacionados.includes('PD-03')) {
          fullText += '\n[Nota Limítrofe PD-03]: Em valores exatamente no limite entre faixas, alinhar enquadramento com o SMS Corporativo.';
        }

        criteria.push({
          id: s.id + '-s' + lvl,
          severity: severityNum,
          text: fullText
        });
      }

      return {
        id: s.id,
        label: s.tipo_ocorrencia + (s.definicao_do_tipo ? ' - ' + s.definicao_do_tipo : ''),
        criteria: criteria
      };
    });

  return {
    id: secao.id,
    label: secao.nome,
    occurrences: occs
  };
});

const potentialOccurrences = rulesData.quase_acidentes.itens.map(q => {
  let fullText = q.descricao || '';
  if (q.enumeracao && q.enumeracao.length > 0) {
    fullText += '\n' + q.enumeracao.map(e => e.marcador + ') ' + e.texto).join('\n');
  }

  if (q.id === 'QA-03') {
    fullText += '\n[Nota PD-01]: Vazamento de gás inflamável é classificado estritamente como Quase Acidente (Severidade Real 0).';
  }
  if (q.id === 'QA-02' || q.id === 'QA-05') {
    fullText += '\n[Nota PD-05/PD-10]: Produto restrito à contenção secundária (bacia, dique) = Quase Acidente (Severidade Real 0).';
  }

  return {
    id: q.id,
    label: q.tipo_ocorrencia,
    criteria: [
      {
        id: q.id + '-s0',
        severity: 0,
        text: fullText
      }
    ]
  };
});

const newSeverityMatrix = {
  document: 'FORM-CORP-SMS-087',
  revision: '08',
  standardProcedure: 'PG-CORP-SMS-015 Rev.09',
  realCategories: realCategories,
  potentialOccurrences: potentialOccurrences
};

const matrixJsonStr = JSON.stringify(newSeverityMatrix);

let html = fs.readFileSync(targetHtml, 'utf8');

// 2. Substituir SEVERITY_MATRIX no HTML
const start = html.indexOf('const SEVERITY_MATRIX=');
let depth = 0;
let jsonStart = html.indexOf('{', start);
let jsonEnd = -1;
for (let i = jsonStart; i < html.length; i++) {
  if (html[i] === '{') depth++;
  else if (html[i] === '}') {
    depth--;
    if (depth === 0) {
      jsonEnd = i + 1;
      break;
    }
  }
}

if (start === -1 || jsonEnd === -1) {
  console.error('Falha ao localizar SEVERITY_MATRIX no HTML');
  process.exit(1);
}

html = html.slice(0, jsonStart) + matrixJsonStr + html.slice(jsonEnd);
console.log('✓ SEVERITY_MATRIX substituída com sucesso pela Rev. 08');

// 3. Atualizar METHODS_BY_LEVEL
const oldMethods = `const METHODS_BY_LEVEL={
  1:{rot:'Leve',    metodos:['5 Porquês','Mapa de causa-raiz (ABS)','Árvore de Causa / Falha']},
  2:{rot:'Moderado',metodos:['Mapa de causa-raiz (ABS)','Árvore de Causa / Falha']},
  3:{rot:'Grave',   metodos:['Mapa de causa-raiz (ABS)','Árvore de Causa / Falha']}
};`;

const newMethods = `const METHODS_BY_LEVEL={
  0:{rot:'Quase Acidente (Real 0)', metodos:['5 Porquês','Árvore de Causa / Falha']},
  1:{rot:'Leve',    metodos:['5 Porquês','Mapa de causa-raiz (ABS)','Árvore de Causa / Falha']},
  2:{rot:'Moderado',metodos:['Mapa de causa-raiz (ABS)','Árvore de Causa / Falha']},
  3:{rot:'Grave',   metodos:['Mapa de causa-raiz (ABS)','Árvore de Causa / Falha']}
};`;

if (html.includes(oldMethods)) {
  html = html.replace(oldMethods, newMethods);
  console.log('✓ METHODS_BY_LEVEL atualizado com nível 0');
} else {
  console.warn('Aviso: METHODS_BY_LEVEL antigo não bateu exatamente.');
}

// 4. Atualizar comissao e regras de quase acidente em commissionLevel
const oldCommissionLevel = `function commissionLevel(){return Number(state.classificacaoV2?.finalSeverity||state.triagem?.sev)||0}`;
const newCommissionLevel = `function commissionLevel(){
  const cs = state.classificacaoV2;
  const finalSev = (cs && cs.finalSeverity !== null && cs.finalSeverity !== undefined)
    ? Number(cs.finalSeverity)
    : (state.triagem?.sev !== '' && state.triagem?.sev !== undefined ? Number(state.triagem.sev) : null);
  const potSev = Number(state.triagem?.severidadePotencial) || 0;
  if (finalSev === 0) {
    return potSev > 0 ? potSev : 1;
  }
  return (finalSev !== null ? finalSev : (potSev || 0));
}`;

if (html.includes(oldCommissionLevel)) {
  html = html.replace(oldCommissionLevel, newCommissionLevel);
  console.log('✓ commissionLevel atualizado para avaliar Severidade Potencial em Quase Acidentes');
}

// 5. Atualizar recalcClassification
const recalcIdxStart = html.indexOf('function recalcClassification(){const cs=classificationState();');
if (recalcIdxStart !== -1) {
  const markEnd = "Object.assign(state.triagem,{nivel:'',sev:'',metodos:[]});}}";
  const recalcIdxEnd = html.indexOf(markEnd, recalcIdxStart) + markEnd.length;

  const newRecalcFull = `function recalcClassification(){
  const cs = classificationState();
  if (Array.isArray(cs.assessments)) {
    cs.assessments = cs.assessments.filter(x => x && x.criterionId && x.occurrence && x.occurrence !== 'undefined' && x.severity !== undefined && x.severity !== null);
  }
  cs.calculatedSeverity = cs.assessments.length ? Math.max(...cs.assessments.map(x => Number(x.severity))) : null;
  const potSev = state.triagem?.severidadePotencial ? Number(state.triagem.severidadePotencial) : null;
  let baseCalculated = cs.calculatedSeverity;
  if (baseCalculated === null && potSev !== null) {
    baseCalculated = potSev;
  }
  cs.finalSeverity = (cs.reviewedSeverity !== null && cs.reviewedSeverity !== undefined && cs.overrideReason.trim()) ? Number(cs.reviewedSeverity) : baseCalculated;
  if (cs.finalSeverity !== null && cs.finalSeverity !== undefined) {
    const i = METHODS_BY_LEVEL[cs.finalSeverity] || METHODS_BY_LEVEL[1];
    const effectiveMethods = (cs.finalSeverity === 0 && potSev && METHODS_BY_LEVEL[potSev]) ? METHODS_BY_LEVEL[potSev].metodos : i.metodos;
    const rotuloNivel = cs.finalSeverity === 0
      ? (potSev ? 'Quase Acidente (Real 0 | Potencial ' + (['','Leve','Moderado','Grave'][potSev]||potSev) + ')' : 'Quase Acidente (Severidade Real 0)')
      : i.rot;
    Object.assign(state.triagem, {
      sev: String(cs.finalSeverity),
      nivel: rotuloNivel,
      metodos: effectiveMethods
    });
  } else if (!cs.legacy) {
    Object.assign(state.triagem, { nivel: '', sev: '', metodos: [] });
  }
}`;

  html = html.slice(0, recalcIdxStart) + newRecalcFull + html.slice(recalcIdxEnd);
  console.log('✓ recalcClassification atualizado com suporte cirúrgico a Severidade Real 0');
}

// 6. Atualizar classificationOccurrenceChanged para rótulos de critério com severidade 0
const oldOccChanged = `fillClassSelect('f_criterio',(selOcc()?.criteria||[]).map(x=>({id:x.id,label:'Nível '+x.severity+' — '+['','Leve','Moderado','Grave'][x.severity]+' · '+x.text,shortLabel:'Nível '+x.severity+' — '+['','Leve','Moderado','Grave'][x.severity]+' · '+compactClassLabel(x.text,76)})),'Selecione o critério');`;

const newOccChanged = `fillClassSelect('f_criterio',(selOcc()?.criteria||[]).map(x=>{
  const sevL = x.severity === 0 ? 'Severidade Real 0 (Quase Acidente)' : 'Nível ' + x.severity + ' — ' + (['','Leve','Moderado','Grave'][x.severity]||'');
  return {
    id: x.id,
    label: sevL + ' · ' + x.text,
    shortLabel: sevL + ' · ' + compactClassLabel(x.text, 76)
  };
}),'Selecione o critério');`;

if (html.includes(oldOccChanged)) {
  html = html.replace(oldOccChanged, newOccChanged);
  console.log('✓ classificationOccurrenceChanged atualizado para exibir Real 0');
}

// 7. Atualizar classifyEngine
const oldClassifyBox = `box.innerHTML='<b>Nível '+c.severity+' — '+esc(info.rot)+'</b><div class=\"text-[12px] mt-2\">'+esc(c.text)+'</div><div class=\"text-[11px] muted mt-2\">'+esc(c.id)+' · Matriz Rev.07</div>';`;
const newClassifyBox = `const rotExib = c.severity === 0 ? 'Severidade Real 0 (Quase Acidente)' : 'Nível ' + c.severity + ' — ' + esc(info.rot);
box.innerHTML='<b>' + rotExib + '</b><div class=\"text-[12px] mt-2\">' + esc(c.text) + '</div><div class=\"text-[11px] muted mt-2\">' + esc(c.id) + ' · Matriz FORM-CORP-SMS-087 Rev.08 (PG-015 Rev.09)</div>';`;

if (html.includes(oldClassifyBox)) {
  html = html.replace(oldClassifyBox, newClassifyBox);
  console.log('✓ classifyEngine atualizado com novo rodapé da Rev.08');
}

// 8. Atualizar addClassificationAssessment para matrixRevision: '08'
html = html.replaceAll("matrixRevision:'07'", "matrixRevision:'08'");
html = html.replaceAll('Matriz Rev.07', 'Matriz FORM-CORP-SMS-087 Rev.08');

// 9. Atualizar renderCommissionValidation badge
const oldBadgeLine = `document.getElementById('commissionLevelBadge').textContent=level?'Nível '+level+' — '+(METHODS_BY_LEVEL[level]?.rot||''):'Nível não definido';`;
const newBadgeLine = `const isQA = Number(state.classificacaoV2?.finalSeverity) === 0 || state.triagem?.sev === '0';
const potLvl = Number(state.triagem?.severidadePotencial) || 0;
document.getElementById('commissionLevelBadge').textContent = isQA
  ? 'Quase Acidente (Real 0 | Comissão Nível ' + (potLvl || 1) + ')'
  : (level ? 'Nível ' + level + ' — ' + (METHODS_BY_LEVEL[level]?.rot || '') : 'Nível não definido');`;

if (html.includes(oldBadgeLine)) {
  html = html.replace(oldBadgeLine, newBadgeLine);
  console.log('✓ renderCommissionValidation atualizado com badge dinâmico de Quase Acidente');
}

// 10. Atualizar renderClassificationAssessments
const oldAssessSum = `sm.textContent=cs.finalSeverity?'Resultado final: Nível '+cs.finalSeverity+' — '+METHODS_BY_LEVEL[cs.finalSeverity].rot:'Resultado final ainda não calculado.';`;
const newAssessSum = `const hasFinal = cs.finalSeverity !== null && cs.finalSeverity !== undefined;
const rRot = hasFinal ? (METHODS_BY_LEVEL[cs.finalSeverity]?.rot || '') : '';
sm.textContent = hasFinal
  ? ('Resultado final: ' + (cs.finalSeverity === 0 ? 'Severidade Real 0 (Quase Acidente)' : 'Nível ' + cs.finalSeverity + ' — ' + rRot))
  : 'Resultado final ainda não calculado.';`;

if (html.includes(oldAssessSum)) {
  html = html.replace(oldAssessSum, newAssessSum);
  console.log('✓ renderClassificationAssessments atualizado com sumário correto');
}

fs.writeFileSync(targetHtml, html, 'utf8');
console.log('[SUCESSO] Todas as atualizações foram gravadas em:', targetHtml);
