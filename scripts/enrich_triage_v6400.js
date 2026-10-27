const fs = require('fs');

const targetHtml = '/workspace/FACIU/FACIU-v6.40.0.html';
let html = fs.readFileSync(targetHtml, 'utf8');

// 1. Inserir seletores de Natureza (Real / Quase Acidente) e Severidade Potencial no card de classificação
const targetClassCard = `<p class="text-[12.5px] muted mb-3">Selecione o enquadramento oficial e registre uma ou mais consequências.</p><div class="classification-warning" hidden="" id="classificationLegacyWarning"></div><label class="lbl" for="f_dim">Área afetada</label>`;

const replacementClassCard = `<p class="text-[12.5px] muted mb-3">Selecione o enquadramento oficial conforme FORM-CORP-SMS-087 Rev. 08 e registre uma ou mais consequências.</p>
<div class="classification-warning" hidden="" id="classificationLegacyWarning"></div>
<div class="flex items-center gap-4 mb-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
  <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Natureza do Evento:</span>
  <label class="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
    <input type="radio" name="f_tipo" value="real" checked onchange="classificationNatureChanged()"> Acidente com Dano Real (Níveis 1 a 3)
  </label>
  <label class="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-amber-700 dark:text-amber-400">
    <input type="radio" name="f_tipo" value="potencial" onchange="classificationNatureChanged()"> Quase Acidente / Perda de Barreira (Severidade Real 0)
  </label>
</div>
<div class="mb-3 p-2.5 bg-amber-50/70 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/50" id="boxSeveridadePotencial">
  <div class="flex items-center justify-between gap-2 mb-1">
    <label class="lbl m-0 font-semibold text-amber-900 dark:text-amber-300" for="f_sev_potencial">Severidade Potencial (Pior Cenário Crível — PG-015 Rev. 09)</label>
    <span class="text-[11px] text-amber-700 dark:text-amber-400">Define rigor da investigação em Quase Acidentes</span>
  </div>
  <select class="inp" id="f_sev_potencial" onchange="onSeveridadePotencialChanged()">
    <option value="">Selecione o potencial crível...</option>
    <option value="1">Nível 1 — Leve (5 Porquês / Árvore de Causa)</option>
    <option value="2">Nível 2 — Moderado (Árvore de Causa / Falha)</option>
    <option value="3">Nível 3 — Grave (Árvore de Causa / Falha + Alerta 72h)</option>
  </select>
</div>
<label class="lbl" for="f_dim">Área afetada</label>`;

if (html.includes(targetClassCard)) {
  html = html.replace(targetClassCard, replacementClassCard);
  console.log('[OK] Painel de Natureza e Severidade Potencial inserido na Triagem.');
} else {
  console.warn('[AVISO] targetClassCard não encontrado diretamente.');
}

// 2. Adicionar função onSeveridadePotencialChanged e sincronização de f_sev_potencial no JS
const syncTriageTarget = `put('regpor','f_regpor'); put('contratada','f_contratada'); put('descricao','f_descricao');`;
const syncTriageReplace = `put('regpor','f_regpor'); put('contratada','f_contratada'); put('descricao','f_descricao');
  put('severidadePotencial', 'f_sev_potencial');`;

if (html.includes(syncTriageTarget) && !html.includes("put('severidadePotencial'")) {
  html = html.replace(syncTriageTarget, syncTriageReplace);
  console.log('[OK] syncTriage atualizado com severidadePotencial.');
}

const hydrateTriageTarget = `set('f_pt',t.pt);set('f_regpor',t.regpor);set('f_contratada',t.contratada);set('f_descricao',t.descricao);`;
const hydrateTriageReplace = `set('f_pt',t.pt);set('f_regpor',t.regpor);set('f_contratada',t.contratada);set('f_descricao',t.descricao);
  set('f_sev_potencial', t.severidadePotencial || '');`;

if (html.includes(hydrateTriageTarget) && !html.includes("set('f_sev_potencial'")) {
  html = html.replace(hydrateTriageTarget, hydrateTriageReplace);
  console.log('[OK] hydrateTriage atualizado com f_sev_potencial.');
}

// 3. Adicionar onSeveridadePotencialChanged global
const helperFnTarget = `function classificationNatureChanged(){syncTriage();fillClassSelect('f_dim',classificationCategories(),'Selecione a área');classificationCategoryChanged();save();}`;
const helperFnReplace = `function classificationNatureChanged(){
  syncTriage();
  fillClassSelect('f_dim',classificationCategories(),'Selecione a área');
  classificationCategoryChanged();
  save();
}
function onSeveridadePotencialChanged(){
  state.triagem.severidadePotencial = val('f_sev_potencial');
  recalcClassification();
  save();
  renderClassificationAssessments();
}`;

if (html.includes(helperFnTarget)) {
  html = html.replace(helperFnTarget, helperFnReplace);
  console.log('[OK] onSeveridadePotencialChanged inserida no JS.');
}

// 4. Inserir Painel de Mandatos Normativos do PG-CORP-SMS-015 Rev. 09 na Comissão
const commissionHeadTarget = `<div class="commission-head"><div><div class="flex items-center gap-2"><i class="w-5 h-5" data-lucide="users" style="color:var(--text-brand2)"></i><h2 class="text-lg font-bold" style="color:var(--text-brand)">Comissão de investigação</h2></div><div class="standard-ref">PG-CORP-SMS-015 Rev. 09 (23/09/2026) · item 6.4 · Tabela 1 · págs. 22–23</div></div><span class="chip" id="commissionLevelBadge">Nível não definido</span></div>`;

const commissionHeadReplace = `<div class="commission-head"><div><div class="flex items-center gap-2"><i class="w-5 h-5" data-lucide="users" style="color:var(--text-brand2)"></i><h2 class="text-lg font-bold" style="color:var(--text-brand)">Comissão de investigação</h2></div><div class="standard-ref">PG-CORP-SMS-015 Rev. 09 (23/09/2026) · item 6.4 · Tabela 1 · págs. 22–23</div></div><span class="chip" id="commissionLevelBadge">Nível não definido</span></div>
<div class="mb-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/40 text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300">
  <div class="font-bold text-blue-950 dark:text-blue-300 mb-1 flex items-center gap-1.5"><i class="w-4 h-4 text-blue-600" data-lucide="info"></i> Prazos e Mandatos Normativos (PG-CORP-SMS-015 Rev. 09)</div>
  <div class="grid sm:grid-cols-3 gap-2 mt-1">
    <div><b>Mobilização da Comissão:</b> até 48h da ocorrência; início em até 24h da instalação.</div>
    <div><b>Conclusão do Relatório RIA:</b> 30 dias (Leve / Moderado); 45 dias (Grave ou Quase Acidente Grave).</div>
    <div><b>Prazos Ações Corretivas:</b> Grave: máx 30d; Moderado: máx 90d; Leve: máx 180d; CSB/Risco Crítico: IMEDIATO.</div>
  </div>
</div>`;

if (html.includes(commissionHeadTarget)) {
  html = html.replace(commissionHeadTarget, commissionHeadReplace);
  console.log('[OK] Painel de Prazos Normativos inserido na Comissão.');
}

fs.writeFileSync(targetHtml, html, 'utf8');
console.log('[CONCLUÍDO] HTML enriquecido com sucesso.');
