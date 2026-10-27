import os
import re

src_path = "FACIU-v6.36.10.html"
dst_path = "FACIU-v6.36.11.html"

assert os.path.exists(src_path), f"Source {src_path} not found"

with open(src_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update version strings
replacements = [
    (
        "<title>FACIU v6.36.10 | Ferramenta de Análise de Causas e Investigação Unificada</title>",
        "<title>FACIU v6.36.11 | Ferramenta de Análise de Causas e Investigação Unificada</title>"
    ),
    (
        '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d0f50d] text-[#1d1343] border border-[#bde009]/40">v<span class="appv">6.36.10</span></span>',
        '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d0f50d] text-[#1d1343] border border-[#bde009]/40">v<span class="appv">6.36.11</span></span>'
    ),
    (
        'FACIU <span class="start-version">v6.36.10</span> · Single-File App (SFA)',
        'FACIU <span class="start-version">v6.36.11</span> · Single-File App (SFA)'
    ),
    (
        '<span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/15" id="appVersionLabel">v6.36.10</span>',
        '<span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/15" id="appVersionLabel">v6.36.11</span>'
    ),
    (
        'const APP_VERSION="6.36.10";',
        'const APP_VERSION="6.36.11";'
    ),
    (
        "appVersion: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '6.36.10',",
        "appVersion: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '6.36.11',"
    ),
    (
        "/* Dropdown de Ajuda e Menus Suspensos na Linha 1 (v6.36.10 - z-index elevado) */",
        "/* Dropdown de Ajuda e Menus Suspensos na Linha 1 (v6.36.11 - z-index elevado) */"
    ),
    (
        "/* Previne sobreposição das portas sobre o menu radial de contexto e menus suspensos (v6.36.10) */",
        "/* Previne sobreposição das portas sobre o menu radial de contexto e menus suspensos (v6.36.11) */"
    )
]

for old, new in replacements:
    assert old in content, f"Target string not found: {old[:60]}..."
    content = content.replace(old, new)

# 2. Update CSS for nav-root, dropdown, cxtmenu and portOverlay
old_nav_css = """.faciu-nav-root {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;"""

new_nav_css = """.faciu-nav-root {
  position: sticky;
  top: 0;
  z-index: 10000;
  width: 100%;"""

assert old_nav_css in content, "old_nav_css not found"
content = content.replace(old_nav_css, new_nav_css, 1)

old_dropdown_css = """.faciu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  width: 190px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 4px;
  z-index: 1100;
  display: none;
}"""

new_dropdown_css = """.faciu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  width: 190px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 4px;
  z-index: 10005;
  display: none;
}"""

assert old_dropdown_css in content, "old_dropdown_css not found"
content = content.replace(old_dropdown_css, new_dropdown_css, 1)

old_overlay_css = """/* Previne sobreposição das portas sobre o menu radial de contexto e menus suspensos (v6.36.11) */
.cxtmenu {
  z-index: 9999 !important;
}
.cxtmenu > div {
  z-index: 9999 !important;
}
body:has(.faciu-dropdown.show) #portOverlay,
body:has(.cxtmenu > div[style*="display: block"]) #portOverlay,
.tree-canvas-container:has(.faciu-dropdown.show) #portOverlay,
.tree-canvas-container:has(.cxtmenu > div[style*="display: block"]) #portOverlay {
  display: none !important;
  pointer-events: none !important;
}"""

new_overlay_css = """/* Previne sobreposição das portas sobre o menu radial de contexto e menus suspensos (v6.36.11) */
.cxtmenu {
  z-index: 9000 !important;
}
.cxtmenu > div {
  z-index: 9000 !important;
}
body.dropdown-open #portOverlay,
body.dropdown-open .node-port,
body:has(.faciu-dropdown.show) #portOverlay,
body:has(.faciu-dropdown.show) .node-port,
body:has(.cxtmenu > div[style*="display: block"]) #portOverlay,
body:has(.cxtmenu > div[style*="display:block"]) #portOverlay,
.tree-canvas-container:has(.faciu-dropdown.show) #portOverlay,
.tree-canvas-container:has(.cxtmenu > div[style*="display: block"]) #portOverlay,
.tree-canvas-container:has(.cxtmenu > div[style*="display:block"]) #portOverlay {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
  opacity: 0 !important;
}"""

assert old_overlay_css in content, "old_overlay_css not found"
content = content.replace(old_overlay_css, new_overlay_css, 1)

# 3. In HTML header row 1, replace z-40 with relative z-[10001]
old_header_row1 = '<div class="bg-brava-navy border-b border-brava-border/80 sticky top-0 z-40 shadow-sm text-white">'
new_header_row1 = '<div class="bg-brava-navy border-b border-brava-border/80 sticky top-0 relative z-[10001] shadow-sm text-white">'
assert old_header_row1 in content, "old_header_row1 not found"
content = content.replace(old_header_row1, new_header_row1, 1)

# 4. Cytoscape event listeners for mouseover and mousemove
old_cy_hover = """  // Eventos para posicionamento dinâmico das Portas ("Bolinhas") no Hover (v6.22.0)
  cy.on('mouseover', 'node', function(evt) {
    if (isConnectingDrag) return;
    showPortsForNode(evt.target);
  });
  cy.on('mouseout', 'node', function(evt) {
    if (isConnectingDrag) return;
    scheduleHidePorts();
  });"""

new_cy_hover = """  // Eventos para posicionamento dinâmico das Portas ("Bolinhas") no Hover (v6.22.0, v6.36.11)
  cy.on('mouseover', 'node', function(evt) {
    if (isConnectingDrag || isAnyMenuOrDropdownActive()) {
      hidePorts();
      return;
    }
    showPortsForNode(evt.target);
  });
  cy.on('mousemove', function() {
    if (isAnyMenuOrDropdownActive()) {
      hidePorts();
    }
  });
  cy.on('mouseout', 'node', function(evt) {
    if (isConnectingDrag) return;
    scheduleHidePorts();
  });"""

assert old_cy_hover in content, "old_cy_hover not found"
content = content.replace(old_cy_hover, new_cy_hover, 1)

# 5. Dropdown state and isAnyMenuOrDropdownActive
old_any_menu = """function isAnyMenuOrDropdownActive() {
  if (isRadialMenuActive()) return true;
  if (document.querySelector('.faciu-dropdown.show')) return true;
  return false;
}"""

new_any_menu = """function updateBodyDropdownState() {
  const hasDropdown = !!document.querySelector('.faciu-dropdown.show');
  document.body.classList.toggle('dropdown-open', hasDropdown);
  if (hasDropdown && typeof hidePorts === 'function') {
    hidePorts();
  }
}
window.updateBodyDropdownState = updateBodyDropdownState;

function isAnyMenuOrDropdownActive() {
  if (isRadialMenuActive()) return true;
  if (document.querySelector('.faciu-dropdown.show')) return true;
  if (document.body.classList.contains('dropdown-open')) return true;
  return false;
}"""

assert old_any_menu in content, "old_any_menu not found"
content = content.replace(old_any_menu, new_any_menu, 1)

# 6. Dropdown toggle functions calling hidePorts and updateBodyDropdownState
old_toggle_help = """function toggleHelpDropdown(e){
  const dd = document.getElementById('helpDropdown');
  if(!dd) return;
  if(typeof hidePorts === 'function') hidePorts();
  if(typeof e === 'boolean'){
    dd.classList.toggle('show', e);
  } else {
    e?.stopPropagation?.();
    dd.classList.toggle('show');
  }
}"""

new_toggle_help = """function toggleHelpDropdown(e){
  const dd = document.getElementById('helpDropdown');
  if(!dd) return;
  if(typeof hidePorts === 'function') hidePorts();
  if(typeof e === 'boolean'){
    dd.classList.toggle('show', e);
  } else {
    e?.stopPropagation?.();
    dd.classList.toggle('show');
  }
  updateBodyDropdownState();
}"""

assert old_toggle_help in content, "old_toggle_help not found"
content = content.replace(old_toggle_help, new_toggle_help, 1)

old_toggle_start = """function toggleStartHelpDropdown(e){
  const dd = document.getElementById('startHelpDropdown');
  const btn = document.getElementById('startBtnHelpMenu');
  if(!dd) return;
  if(typeof hidePorts === 'function') hidePorts();
  if(typeof e === 'boolean'){
    dd.classList.toggle('show', e);
    if(btn) btn.setAttribute('aria-expanded', e ? 'true' : 'false');
  } else {
    e?.stopPropagation?.();
    const isShowing = dd.classList.toggle('show');
    if(btn) btn.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
  }
}"""

new_toggle_start = """function toggleStartHelpDropdown(e){
  const dd = document.getElementById('startHelpDropdown');
  const btn = document.getElementById('startBtnHelpMenu');
  if(!dd) return;
  if(typeof hidePorts === 'function') hidePorts();
  if(typeof e === 'boolean'){
    dd.classList.toggle('show', e);
    if(btn) btn.setAttribute('aria-expanded', e ? 'true' : 'false');
  } else {
    e?.stopPropagation?.();
    const isShowing = dd.classList.toggle('show');
    if(btn) btn.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
  }
  updateBodyDropdownState();
}"""

assert old_toggle_start in content, "old_toggle_start not found"
content = content.replace(old_toggle_start, new_toggle_start, 1)

old_toggle_study = """function toggleStudyMenuDropdown(e){
  const dd = document.getElementById('studyMenuDropdown');
  const btn = document.getElementById('btnStudyMenu');
  if(!dd) return;
  if(typeof hidePorts === 'function') hidePorts();
  if(typeof e === 'boolean'){
    dd.classList.toggle('show', e);
    if(btn) btn.setAttribute('aria-expanded', e ? 'true' : 'false');
  } else {
    e?.stopPropagation?.();
    const isShowing = dd.classList.toggle('show');
    if(btn) btn.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
  }
}"""

new_toggle_study = """function toggleStudyMenuDropdown(e){
  const dd = document.getElementById('studyMenuDropdown');
  const btn = document.getElementById('btnStudyMenu');
  if(!dd) return;
  if(typeof hidePorts === 'function') hidePorts();
  if(typeof e === 'boolean'){
    dd.classList.toggle('show', e);
    if(btn) btn.setAttribute('aria-expanded', e ? 'true' : 'false');
  } else {
    e?.stopPropagation?.();
    const isShowing = dd.classList.toggle('show');
    if(btn) btn.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
  }
  updateBodyDropdownState();
}"""

assert old_toggle_study in content, "old_toggle_study not found"
content = content.replace(old_toggle_study, new_toggle_study, 1)

old_doc_click = """  const studyDd = document.getElementById('studyMenuDropdown');
  const studyBtn = document.getElementById('btnStudyMenu');
  if(studyDd && studyDd.classList.contains('show') && !studyDd.contains(e.target) && !studyBtn?.contains(e.target)){
    studyDd.classList.remove('show');
    if(studyBtn) studyBtn.setAttribute('aria-expanded', 'false');
  }
});"""

new_doc_click = """  const studyDd = document.getElementById('studyMenuDropdown');
  const studyBtn = document.getElementById('btnStudyMenu');
  if(studyDd && studyDd.classList.contains('show') && !studyDd.contains(e.target) && !studyBtn?.contains(e.target)){
    studyDd.classList.remove('show');
    if(studyBtn) studyBtn.setAttribute('aria-expanded', 'false');
  }
  updateBodyDropdownState();
});"""

assert old_doc_click in content, "old_doc_click not found"
content = content.replace(old_doc_click, new_doc_click, 1)

old_folder_toggle = """  toggleMenu(event) {
    if (event) event.stopPropagation();
    const dd = document.getElementById('folderMonitorDropdown');
    if (!dd) return;
    const isShown = dd.classList.contains('show');
    document.querySelectorAll('.faciu-dropdown').forEach(d => d.classList.remove('show'));
    if (!isShown) dd.classList.add('show');
  },"""

new_folder_toggle = """  toggleMenu(event) {
    if (event) event.stopPropagation();
    if (typeof hidePorts === 'function') hidePorts();
    const dd = document.getElementById('folderMonitorDropdown');
    if (!dd) return;
    const isShown = dd.classList.contains('show');
    document.querySelectorAll('.faciu-dropdown').forEach(d => d.classList.remove('show'));
    if (!isShown) dd.classList.add('show');
    if (typeof updateBodyDropdownState === 'function') updateBodyDropdownState();
  },"""

assert old_folder_toggle in content, "old_folder_toggle not found"
content = content.replace(old_folder_toggle, new_folder_toggle, 1)

# 7. Chronology sorting: getChronologyByPhases
old_chron_sort = """state.chronology??=[];state.chronology.forEach((x,i)=>{x.id??='CHR-'+String(i+1).padStart(3,'0');x.createdAt??=i});
const CHRON_PHASE={before:'Antes',during:'Durante',after:'Depois'};
function chronologySorted(){state.chronology??=[];return [...state.chronology].sort((a,b)=>String(a.dateTime||'').localeCompare(String(b.dateTime||''))||(a.createdAt||0)-(b.createdAt||0))}"""

new_chron_sort = """state.chronology??=[];state.chronology.forEach((x,i)=>{x.id??='CHR-'+String(i+1).padStart(3,'0');x.createdAt??=i});
const CHRON_PHASE={before:'Antes',during:'Durante',after:'Depois'};
function chronologyPhaseRank(p){
  const s=String(p||'').trim().toLowerCase();
  if(s==='before'||s==='antes')return 1;
  if(s==='during'||s==='durante')return 2;
  if(s==='after'||s==='depois')return 3;
  return 4;
}
function getChronologyByPhases(list){
  const items=Array.isArray(list)?list:(state.chronology||[]);
  return [...items].sort((a,b)=>{
    const ra=chronologyPhaseRank(a.phase),rb=chronologyPhaseRank(b.phase);
    if(ra!==rb)return ra-rb;
    const dtComp=String(a.dateTime||'').localeCompare(String(b.dateTime||''));
    if(dtComp!==0)return dtComp;
    return (a.createdAt||0)-(b.createdAt||0);
  });
}
window.getChronologyByPhases=getChronologyByPhases;
function chronologySorted(){state.chronology??=[];return [...state.chronology].sort((a,b)=>String(a.dateTime||'').localeCompare(String(b.dateTime||''))||(a.createdAt||0)-(b.createdAt||0))}"""

assert old_chron_sort in content, "old_chron_sort not found"
content = content.replace(old_chron_sort, new_chron_sort, 1)

# 8. Update riaChronRows
old_ria_chron_rows = """function riaChronRows(){const items=state.chronology||[];return (items.length?items:[{}, {}, {}]).map(x=>{const dt=fmtBRDateTime(x.dateTime);return '<tr><td class="center">'+safe(dt[0])+'</td><td class="center">'+safe(dt[1])+'</td><td><div class="value">'+safe(x.description)+'</div></td></tr>'}).join('')}"""

new_ria_chron_rows = """function riaChronRows(){const items=(typeof getChronologyByPhases==='function'?getChronologyByPhases(state.chronology):(state.chronology||[]));return (items.length?items:[{}, {}, {}]).map(x=>{const dt=fmtBRDateTime(x.dateTime);return '<tr><td class="center">'+safe(dt[0])+'</td><td class="center">'+safe(dt[1])+'</td><td><div class="value">'+safe(x.description)+'</div></td></tr>'}).join('')}"""

assert old_ria_chron_rows in content, "old_ria_chron_rows not found"
content = content.replace(old_ria_chron_rows, new_ria_chron_rows, 1)

# 9. Export in window.faciuRia
old_faciu_ria_export = """ template:RIA_TEMPLATE,
 chronRows:riaChronRows,
 memberRows:riaMemberRows,"""

new_faciu_ria_export = """ template:RIA_TEMPLATE,
 chronRows:riaChronRows,
 chronByPhases:getChronologyByPhases,
 memberRows:riaMemberRows,"""

assert old_faciu_ria_export in content, "old_faciu_ria_export not found"
content = content.replace(old_faciu_ria_export, new_faciu_ria_export, 1)

# 10. Update riaModelo
old_ria_modelo = """ /* cronologia */
 const crono=(state.chronology||[]).map(x=>{
  const p=A.fmtDateTime(x.dateTime)||['',''];
  return {d:p[0]||'',h:p[1]||'',t:x.description||''};
 });"""

new_ria_modelo = """ /* cronologia (v6.36.11: organizada por fases conforme montado no início: antes, durante e depois) */
 const itemsCrono=(typeof getChronologyByPhases==='function'?getChronologyByPhases(state.chronology):(A.chronByPhases?A.chronByPhases(state.chronology):(state.chronology||[])));
 const crono=itemsCrono.map(x=>{
  const p=A.fmtDateTime(x.dateTime)||['',''];
  return {d:p[0]||'',h:p[1]||'',t:x.description||''};
 });"""

assert old_ria_modelo in content, "old_ria_modelo not found"
content = content.replace(old_ria_modelo, new_ria_modelo, 1)

with open(dst_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Sucesso! Gerado {dst_path} com {len(content)} caracteres.")
