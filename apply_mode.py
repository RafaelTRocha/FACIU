import re

file_path = 'FACIU-v6.8.2.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State changes
if "state.mode =" not in content and "state.mode=" not in content:
    content = content.replace("state={step:0,tree:", "state={mode:'full',step:0,tree:")

# 2. Add updateAppMode function
mode_js = """
function updateAppMode(mode) {
  state.mode = mode || 'full';
  
  const steps = document.querySelectorAll('.step');
  if (state.mode === 'standalone') {
    const s2 = document.querySelector('.step[data-step="2"]'); if(s2) s2.hidden = true;
    const s3 = document.querySelector('.step[data-step="3"]'); if(s3) s3.hidden = true;
    const s4 = document.querySelector('.step[data-step="4"]'); if(s4) s4.hidden = true;
    
    const s6 = document.querySelector('.step[data-step="6"]');
    if(s6) { s6.hidden = false; s6.querySelector('.step-num').textContent = '2'; }
    
    const s5 = document.querySelector('.step[data-step="5"]');
    if(s5) { s5.querySelector('.step-num').textContent = '3'; }
  } else {
    const s2 = document.querySelector('.step[data-step="2"]'); if(s2) s2.hidden = false;
    const s3 = document.querySelector('.step[data-step="3"]'); if(s3) s3.hidden = false;
    const s4 = document.querySelector('.step[data-step="4"]'); if(s4) s4.hidden = false;
    
    const s6 = document.querySelector('.step[data-step="6"]');
    if(s6) s6.hidden = true;
    const s5 = document.querySelector('.step[data-step="5"]');
    if(s5) { s5.querySelector('.step-num').textContent = '5'; }
  }
}
"""
if 'updateAppMode(' not in content:
    content = content.replace('function goStep(n){', mode_js + '\nfunction goStep(n){')

# 3. Add Step 6 to HTML
step_html = """<div class="step" data-step="6" onclick="goStep(6)" hidden><div class="step-num">2</div><div class="step-txt"><b>5 Porquês</b><span class="muted">Estudo independente</span></div></div>"""
if 'data-step="6"' not in content:
    content = content.replace('<div class="step" data-step="3"', step_html + '\n<div class="step" data-step="3"')

# 4. Add View 6 to HTML
view_html = """<div class="view" data-view="6" id="v_standalone_whys">
<section class="page-header">
  <h2>5 Porquês (Independente)</h2>
  <p>Estudo autônomo focado na análise de causalidade com ações e relatório próprios.</p>
</section>
<div id="standaloneWhyEditorPlaceholder" class="mt-4"></div>
</div>"""
if 'data-view="6"' not in content:
    content = content.replace('<div class="view" data-view="3"', view_html + '\n<div class="view" data-view="3"')

# 5. Modify startStandaloneFiveWhy
content = re.sub(
    r'function startStandaloneFiveWhy\(\)\{hideStartScreen\(\);goStep\(2\);switchStructureTab\(\'whys\'\);setTimeout\(\(\)=>createWhyAnalysis\(\),0\)\}',
    r'function startStandaloneFiveWhy(){updateAppMode(\'standalone\');hideStartScreen();goStep(6);setTimeout(()=>{createWhyAnalysis();},0);}',
    content
)
content = re.sub(r'function startNewInvestigation\(\)\{', r'function startNewInvestigation(){updateAppMode(\'full\');', content)
content = re.sub(r'function chooseImportFile\(\)\{', r'function chooseImportFile(){updateAppMode(\'full\');', content)

# 6. goStep hook
content = content.replace('if(n==4) renderValidation();', 'if(n==4) renderValidation();\n  if(n==6) { renderStandaloneWhys(); }')

# 7. renderStandaloneWhys function
js_logic = """
function renderStandaloneWhys() {
  const container = document.getElementById('standaloneWhyEditorPlaceholder');
  if (!container) return;
  // Transfere fisicamente a div #whyEditor para o novo container, ou garante que ela estah lah
  const editor = document.getElementById('whyEditor');
  if (editor) {
    container.appendChild(editor);
    editor.hidden = false;
  }
  
  if (!selectedWhyId) {
    const ws = state.whys || [];
    if (ws.length > 0) {
      selectedWhyId = ws[0].id;
    } else {
      createWhyAnalysis();
      return;
    }
  }
  
  const w = whyAnalysis(selectedWhyId);
  if (w && (!w.link || w.link.mode !== 'independent')) {
    w.link = {mode: 'independent', nodeId: ''};
    save();
  }
  
  renderWhyEditor();
}
"""
if 'function renderStandaloneWhys' not in content:
    content = content.replace('function switchStructureTab(t)', js_logic + '\nfunction switchStructureTab(t)')

# Write back
with open('FACIU-v6.8.2-draft.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Draft created successfully!")
