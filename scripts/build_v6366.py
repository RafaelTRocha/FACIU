import re

with open('FACIU-v6.36.5.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update SemVer points from 6.36.5 to 6.36.6
count_semver = text.count('6.36.5')
text = text.replace('6.36.5', '6.36.6')
print(f"SemVer atualizado em {count_semver} ocorrencias para 6.36.6!")

# 2. Add the Start Screen & Theme CSS block right before </style><style id="faciuValidationV650Styles">
start_screen_css = """
  /* =========================================================================
     START SCREEN, SOLID TOPBAR & THEME COHERENCE TOKENS (v6.36.6)
     ========================================================================= */
  .snap-x { scroll-snap-type: x mandatory; }
  .snap-start { scroll-snap-align: start; }

  /* Barra superior solida corporativa (sem transparencia) */
  .gradient-brava {
    background: linear-gradient(135deg, #100a26 0%, #1d1343 50%, #261b57 100%) !important;
    background-color: #100a26 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: 0 4px 20px -2px rgba(16, 10, 38, 0.35);
  }
  html[data-theme="dark"] .gradient-brava,
  html.dark .gradient-brava {
    background: linear-gradient(135deg, #0b071a 0%, #16132b 55%, #1d1343 100%) !important;
    background-color: #0b071a !important;
    border-bottom: 1px solid #332373 !important;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.6);
  }

  .gradient-hero {
    background: radial-gradient(circle at 90% 10%, rgba(208, 245, 13, 0.15) 0%, transparent 60%),
                linear-gradient(135deg, #100a26 0%, #1d1343 60%, #261b57 100%);
  }

  #startScreen.start-screen {
    padding: 0 !important;
    background: #F4F5FA !important;
    overflow-y: auto !important;
  }
  html[data-theme="dark"] #startScreen.start-screen,
  html.dark #startScreen.start-screen {
    background: #0b071a !important;
    color: #f8fafc !important;
  }
  #startScreen[hidden],
  #startScreen.start-screen[hidden],
  .start-screen[hidden] {
    display: none !important;
  }
  #modal-tip-detail.hidden,
  #modal-tip-detail[hidden] {
    display: none !important;
  }

  /* Catalogo e Empty State no Tema Escuro */
  html[data-theme="dark"] #study-catalog-panel,
  html.dark #study-catalog-panel {
    background-color: #16132b !important;
    border-color: #332373 !important;
    color: #f8fafc !important;
  }
  html[data-theme="dark"] #study-catalog-panel h3,
  html.dark #study-catalog-panel h3 {
    color: #f8fafc !important;
  }
  html[data-theme="dark"] #study-catalog-panel .border-b,
  html.dark #study-catalog-panel .border-b {
    border-color: #332373 !important;
  }
  html[data-theme="dark"] #study-catalog-panel .bg-slate-100,
  html.dark #study-catalog-panel .bg-slate-100 {
    background-color: #100a26 !important;
    border-color: #332373 !important;
  }
  html[data-theme="dark"] #study-catalog-panel .bg-slate-50,
  html.dark #study-catalog-panel .bg-slate-50 {
    background-color: #100a26 !important;
    border-color: #332373 !important;
  }
  html[data-theme="dark"] #study-catalog-panel .bg-purple-50,
  html.dark #study-catalog-panel .bg-purple-50 {
    background-color: #1d1343 !important;
    color: #d0f50d !important;
  }
  html[data-theme="dark"] #study-catalog-panel h4,
  html.dark #study-catalog-panel h4 {
    color: #f8fafc !important;
  }
  html[data-theme="dark"] #study-catalog-panel p,
  html.dark #study-catalog-panel p {
    color: #94a3b8 !important;
  }
  html[data-theme="dark"] #study-catalog-panel button#tab-studies-all[style*="1d1343"],
  html.dark #study-catalog-panel button#tab-studies-all {
    color: #fff !important;
  }

  /* Rodape da Tela Inicial no Tema Escuro */
  #startScreen footer {
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }
  html[data-theme="dark"] #startScreen footer,
  html.dark #startScreen footer {
    background-color: #100a26 !important;
    border-top-color: #332373 !important;
    color: #94a3b8 !important;
  }
  html[data-theme="dark"] #startScreen footer strong,
  html.dark #startScreen footer strong {
    color: #f8fafc !important;
  }
  html[data-theme="dark"] #startScreen footer .text-\\[\\#1B1B29\\],
  html.dark #startScreen footer .text-\\[\\#1B1B29\\] {
    color: #e2e8f0 !important;
  }
  html[data-theme="dark"] #startScreen footer .start-version-pill,
  html.dark #startScreen footer .start-version-pill {
    background-color: #1d1343 !important;
    border-color: #332373 !important;
    color: #d0f50d !important;
  }
  .start-version-pill {
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }
"""

target_style_anchor = '</style><style id="faciuValidationV650Styles">'
if target_style_anchor in text:
    text = text.replace(target_style_anchor, start_screen_css + '\n' + target_style_anchor, 1)
    print("Estilos da Start Screen e Topbar solida inseridos com sucesso!")
else:
    print("AVISO: Ancora target_style_anchor nao encontrada!")

# 3. Add start-version-pill class to footer version badge
old_footer_pill = 'class="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#1d1343] bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200"'
new_footer_pill = 'class="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#1d1343] bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200 start-version-pill"'
if old_footer_pill in text:
    text = text.replace(old_footer_pill, new_footer_pill, 1)
    print("Classe start-version-pill adicionada ao rodape com sucesso!")
else:
    print("AVISO: old_footer_pill nao encontrado!")

# 4. Insert Theme Toggle button in #startScreen header
old_config_btn = '<button type="button" id="startBtnConfig"'
theme_toggle_btn = """<button type="button" id="startBtnThemeToggle" onclick="toggleDarkMode()" title="Alternar Modo Escuro / Claro" class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer" aria-label="Alternar tema">
          <i data-lucide="moon" class="w-3.5 h-3.5 text-[#d0f50d] theme-toggle-icon" id="startThemeToggleIcon"></i>
          <span class="hidden sm:inline" id="startThemeToggleLabel">Tema</span>
        </button>

        <button type="button" id="startBtnConfig\""""

if old_config_btn in text:
    text = text.replace(old_config_btn, theme_toggle_btn, 1)
    print("Botao de alternar tema inserido no cabecalho da Start Screen com sucesso!")
else:
    print("AVISO: old_config_btn nao encontrado!")

# 5. Enhance toggleTheme() to update both theme toggle icons dynamically
old_toggle_theme = """function toggleTheme(){ const h=document.documentElement; h.dataset.theme=h.dataset.theme==='dark'?'':'dark'; h.classList.toggle('dark', h.dataset.theme==='dark'); localStorage.setItem('brava_theme',h.dataset.theme); if(cy) styleCy(); if(typeof selectedId!=='undefined'&&selectedId){ selectNode(selectedId); } else if(typeof selectNode==='function'){ selectNode(null); } if(typeof toast==='function') toast(h.dataset.theme==='dark' ? 'Modo Escuro Ativado' : 'Modo Claro Ativado'); }"""

new_toggle_theme = """function updateThemeIcons(){
  const isDark = document.documentElement.dataset.theme === 'dark' || document.documentElement.classList.contains('dark');
  const iconName = isDark ? 'sun' : 'moon';
  const labelText = 'Tema';
  const titleText = isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro';

  ['startThemeToggleIcon', 'themeToggleIcon'].forEach(id => {
    const el = document.getElementById(id);
    if(el) {
      el.setAttribute('data-lucide', iconName);
      const btn = el.closest('button');
      if(btn) {
        btn.setAttribute('title', titleText);
        btn.setAttribute('aria-label', titleText);
      }
    }
  });
  if(window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}
window.updateThemeIcons = updateThemeIcons;

function toggleTheme(){
  const h = document.documentElement;
  const isDark = h.dataset.theme === 'dark';
  h.dataset.theme = isDark ? '' : 'dark';
  h.classList.toggle('dark', h.dataset.theme === 'dark');
  localStorage.setItem('brava_theme', h.dataset.theme);
  updateThemeIcons();
  if(typeof cy !== 'undefined' && cy) styleCy();
  if(typeof selectedId !== 'undefined' && selectedId){ selectNode(selectedId); } else if(typeof selectNode === 'function'){ selectNode(null); }
  if(typeof toast === 'function') toast(h.dataset.theme === 'dark' ? 'Modo Escuro Ativado' : 'Modo Claro Ativado');
}"""

if old_toggle_theme in text:
    text = text.replace(old_toggle_theme, new_toggle_theme, 1)
    print("Funcao toggleTheme() aprimorada com updateThemeIcons() com sucesso!")
else:
    print("AVISO: old_toggle_theme exato nao encontrado, tentando substituicao flexivel...")
    # fallback regex
    text = re.sub(r'function toggleTheme\(\)\s*\{[^}]*toast\([^}]*\}\s*\}', new_toggle_theme, text, count=1)
    print("Substituicao regex de toggleTheme realizada!")

# 6. Ensure updateThemeIcons() is called on DOMContentLoaded
init_anchor = "updateTopBarActiveStudy();"
if init_anchor in text:
    text = text.replace(init_anchor, "updateTopBarActiveStudy(); updateThemeIcons();", 1)
    print("Chamada a updateThemeIcons() no boot adicionada com sucesso!")

with open('FACIU-v6.36.6.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("FACIU-v6.36.6.html gerado com sucesso!")
