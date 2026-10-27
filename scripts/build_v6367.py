import re

with open('FACIU-v6.36.6.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. SemVer increment: 6.36.6 -> 6.36.7
count_semver = text.count('6.36.6')
text = text.replace('6.36.6', '6.36.7')
print(f"SemVer atualizado em {count_semver} ocorrencias para 6.36.7!")

# 2. Add custom CSS for study actions dropdown right before </style><style id="faciuValidationV650Styles">
dropdown_css = """
  /* Menu Unificado de Ações do Estudo (v6.36.7) */
  .study-actions-dropdown {
    width: 280px !important;
    padding: 6px !important;
    border-radius: 12px !important;
    box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }
  html[data-theme="dark"] .study-actions-dropdown,
  html.dark .study-actions-dropdown {
    background: #16132b !important;
    border-color: #332373 !important;
    box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.6) !important;
  }
  .study-actions-dropdown .faciu-dropdown-item {
    padding: 7px 10px !important;
    border-radius: 8px !important;
  }
  .study-actions-dropdown .faciu-dropdown-item:hover {
    background: rgba(255, 255, 255, 0.08) !important;
  }
  html:not(.dark):not([data-theme="dark"]) .study-actions-dropdown .faciu-dropdown-item:hover {
    background: rgba(29, 19, 67, 0.06) !important;
  }
"""

style_anchor = '</style><style id="faciuValidationV650Styles">'
if style_anchor in text:
    text = text.replace(style_anchor, dropdown_css + '\n' + style_anchor, 1)
    print("CSS da study-actions-dropdown inserido com sucesso!")
else:
    print("AVISO: style_anchor nao encontrado!")

# 3. Replace the 5 individual buttons with the single dropdown button
old_buttons_block = """        <!-- Botão Novo Estudo -->
        <button type="button" onclick="newStudy()" class="h-8 flex items-center gap-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all active:scale-95 cursor-pointer" title="Iniciar novo estudo em branco">
          <i data-lucide="file-plus" class="w-3.5 h-3.5 text-brava-yellow"></i>
          <span class="hidden sm:inline">Novo</span>
        </button>

        <!-- Botão Abrir Estudo (Ctrl+O) -->
        <button type="button" onclick="openStudyFile()" class="h-8 flex items-center gap-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all active:scale-95 cursor-pointer" title="Abrir estudo do computador ou disco (Ctrl+O)">
          <i data-lucide="folder-open" class="w-3.5 h-3.5 text-sky-300"></i>
          <span class="hidden sm:inline">Abrir</span>
        </button>

        <!-- Salvar Estudo (Ctrl+S) -->
        <button type="button" onclick="saveStudy(true)" class="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-brava-lime hover:bg-brava-yellow text-slate-950 font-bold text-xs shadow-glow-lime transition-all active:scale-95 border border-lime-400/60 cursor-pointer" title="Salvar alterações no arquivo ou navegador (Ctrl+S)">
          <i data-lucide="save" class="w-3.5 h-3.5 text-slate-950"></i>
          <span>Salvar</span>
          <kbd class="hidden md:inline-block px-1 py-0.2 rounded bg-black/15 text-[9px] font-mono font-bold tracking-tight text-slate-900 border border-black/10">Ctrl+S</kbd>
        </button>

        <!-- Salvar Como... (Ctrl+Shift+S) -->
        <button type="button" id="startBtnSaveAs" onclick="saveStudyAs()" class="h-8 flex items-center gap-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all active:scale-95 cursor-pointer" title="Salvar como nova cópia independente em disco (Ctrl+Shift+S)">
          <i data-lucide="copy" class="w-3.5 h-3.5 text-lime-300"></i>
          <span class="hidden md:inline">Salvar Como...</span>
        </button>

        <div class="h-4 w-px bg-white/20 hidden sm:block"></div>

        <!-- Fechar Estudo (Ctrl+Shift+W) -->
        <button type="button" id="btnTopCloseStudy" onclick="closeStudy()" class="h-8 flex items-center gap-1 px-2.5 rounded-lg bg-white/10 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-white/20 hover:border-rose-500/40 transition-all active:scale-95 cursor-pointer" title="Fechar o estudo ativo e retornar à Tela Inicial (Ctrl+Shift+W)">
          <i data-lucide="folder-x" class="w-3.5 h-3.5 text-rose-300"></i>
          <span class="hidden md:inline">Fechar</span>
        </button>"""

new_study_menu = """        <!-- Menu Unificado de Ações do Estudo (Lista Suspensa) -->
        <div class="relative inline-block" id="studyMenuWrapper">
          <button type="button" id="btnStudyMenu" onclick="toggleStudyMenuDropdown(event)" class="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all active:scale-95 cursor-pointer shadow-sm" title="Ações do Estudo (Novo, Abrir, Salvar, Fechar)" aria-haspopup="true" aria-expanded="false">
            <i data-lucide="folder-kanban" class="w-3.5 h-3.5 text-[#d0f50d]"></i>
            <span>Estudo</span>
            <i data-lucide="chevron-down" class="w-3 h-3 text-slate-300 ml-0.5"></i>
          </button>
          <div class="faciu-dropdown study-actions-dropdown" id="studyMenuDropdown" style="width: 280px; right: 0;">
            <div class="px-3 py-2 border-b border-[var(--line)]">
              <div class="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Investigação Ativa</div>
              <div class="text-xs font-semibold truncate text-[var(--text)] mt-0.5" id="studyMenuStudyTitle">Ações do Arquivo</div>
            </div>

            <div class="p-1">
              <!-- Novo Estudo -->
              <button class="faciu-dropdown-item group justify-between" id="btnTopNewStudy" onclick="newStudy(); toggleStudyMenuDropdown(false);" type="button" title="Iniciar novo estudo em branco">
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded flex items-center justify-center bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20">
                    <i class="w-3.5 h-3.5" data-lucide="file-plus"></i>
                  </div>
                  <div>
                    <div class="font-bold text-xs text-[var(--text)] leading-tight">Novo Estudo</div>
                    <div class="text-[10px] text-[var(--muted)] font-normal leading-tight">Em branco do zero</div>
                  </div>
                </div>
              </button>

              <!-- Abrir Estudo (Ctrl+O) -->
              <button class="faciu-dropdown-item group justify-between" id="btnTopOpenStudy" onclick="openStudyFile(); toggleStudyMenuDropdown(false);" type="button" title="Abrir estudo salvo (Ctrl+O)">
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded flex items-center justify-center bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20">
                    <i class="w-3.5 h-3.5" data-lucide="folder-open"></i>
                  </div>
                  <div>
                    <div class="font-bold text-xs text-[var(--text)] leading-tight">Abrir Estudo...</div>
                    <div class="text-[10px] text-[var(--muted)] font-normal leading-tight">Carregar arquivo .json</div>
                  </div>
                </div>
                <kbd class="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[9px] font-mono text-[var(--muted)] border border-black/5 dark:border-white/10">Ctrl+O</kbd>
              </button>

              <div class="my-1 border-t border-[var(--line)] opacity-60"></div>

              <!-- Salvar Estudo (Ctrl+S) -->
              <button class="faciu-dropdown-item group justify-between bg-lime-500/5 hover:bg-lime-500/15" id="btnTopSaveStudy" onclick="saveStudy(true); toggleStudyMenuDropdown(false);" type="button" title="Salvar alterações no arquivo ou navegador (Ctrl+S)">
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded flex items-center justify-center bg-lime-500/20 text-[#1d1343] dark:text-[#d0f50d] group-hover:bg-lime-500/30 font-bold">
                    <i class="w-3.5 h-3.5 text-lime-600 dark:text-[#d0f50d]" data-lucide="save"></i>
                  </div>
                  <div>
                    <div class="font-bold text-xs text-[var(--text)] leading-tight flex items-center gap-1.5">
                      <span>Salvar</span>
                      <span class="inline-block w-1.5 h-1.5 rounded-full bg-lime-500"></span>
                    </div>
                    <div class="text-[10px] text-[var(--muted)] font-normal leading-tight">Gravar alterações</div>
                  </div>
                </div>
                <kbd class="px-1.5 py-0.5 rounded bg-lime-500/20 text-[9px] font-mono font-bold text-lime-700 dark:text-lime-300 border border-lime-500/30">Ctrl+S</kbd>
              </button>

              <!-- Salvar Como... (Ctrl+Shift+S) -->
              <button class="faciu-dropdown-item group justify-between" id="startBtnSaveAs" onclick="saveStudyAs(); toggleStudyMenuDropdown(false);" type="button" title="Salvar como nova cópia independente em disco (Ctrl+Shift+S)">
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded flex items-center justify-center bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                    <i class="w-3.5 h-3.5" data-lucide="copy"></i>
                  </div>
                  <div>
                    <div class="font-bold text-xs text-[var(--text)] leading-tight">Salvar Como...</div>
                    <div class="text-[10px] text-[var(--muted)] font-normal leading-tight">Nova cópia em disco</div>
                  </div>
                </div>
                <kbd class="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[9px] font-mono text-[var(--muted)] border border-black/5 dark:border-white/10">Ctrl+⇧+S</kbd>
              </button>

              <div class="my-1 border-t border-[var(--line)] opacity-60"></div>

              <!-- Fechar Estudo (Ctrl+Shift+W) -->
              <button class="faciu-dropdown-item group justify-between hover:bg-rose-500/10" id="btnTopCloseStudy" onclick="closeStudy(); toggleStudyMenuDropdown(false);" type="button" title="Fechar o estudo ativo e retornar à Tela Inicial (Ctrl+Shift+W)">
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded flex items-center justify-center bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20">
                    <i class="w-3.5 h-3.5" data-lucide="folder-x"></i>
                  </div>
                  <div>
                    <div class="font-bold text-xs text-rose-600 dark:text-rose-400 leading-tight">Fechar Estudo</div>
                    <div class="text-[10px] text-[var(--muted)] font-normal leading-tight">Retornar à Tela Inicial</div>
                  </div>
                </div>
                <kbd class="px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] font-mono text-rose-500/80 border border-rose-500/20">Ctrl+⇧+W</kbd>
              </button>
            </div>
          </div>
        </div>"""

if old_buttons_block in text:
    text = text.replace(old_buttons_block, new_study_menu, 1)
    print("Botões substituídos com sucesso pelo menu dropdown #studyMenuWrapper!")
else:
    print("AVISO: old_buttons_block nao encontrado!")

# 4. Insert toggleStudyMenuDropdown and update click listener
old_dropdown_handlers = """function toggleStartHelpDropdown(e){
  const dd = document.getElementById('startHelpDropdown');
  const btn = document.getElementById('startBtnHelpMenu');
  if(!dd) return;
  if(typeof e === 'boolean'){
    dd.classList.toggle('show', e);
    if(btn) btn.setAttribute('aria-expanded', e ? 'true' : 'false');
  } else {
    e?.stopPropagation?.();
    const isShowing = dd.classList.toggle('show');
    if(btn) btn.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
  }
}
window.toggleStartHelpDropdown = toggleStartHelpDropdown;
document.addEventListener('click', (e)=>{
  const dd = document.getElementById('helpDropdown');
  const btn = document.getElementById('btnHelpMenu');
  if(dd && dd.classList.contains('show') && !dd.contains(e.target) && !btn?.contains(e.target)){
    dd.classList.remove('show');
  }
  const startDd = document.getElementById('startHelpDropdown');
  const startBtn = document.getElementById('startBtnHelpMenu');
  if(startDd && startDd.classList.contains('show') && !startDd.contains(e.target) && !startBtn?.contains(e.target)){
    startDd.classList.remove('show');
    if(startBtn) startBtn.setAttribute('aria-expanded', 'false');
  }
  const folderDd = document.getElementById('folderMonitorDropdown');
  const folderBtn = document.getElementById('btnDiskSync');
  if(folderDd && folderDd.classList.contains('show') && !folderDd.contains(e.target) && !folderBtn?.contains(e.target)){
    folderDd.classList.remove('show');
  }
});"""

new_dropdown_handlers = """function toggleStartHelpDropdown(e){
  const dd = document.getElementById('startHelpDropdown');
  const btn = document.getElementById('startBtnHelpMenu');
  if(!dd) return;
  if(typeof e === 'boolean'){
    dd.classList.toggle('show', e);
    if(btn) btn.setAttribute('aria-expanded', e ? 'true' : 'false');
  } else {
    e?.stopPropagation?.();
    const isShowing = dd.classList.toggle('show');
    if(btn) btn.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
  }
}
window.toggleStartHelpDropdown = toggleStartHelpDropdown;

function toggleStudyMenuDropdown(e){
  const dd = document.getElementById('studyMenuDropdown');
  const btn = document.getElementById('btnStudyMenu');
  if(!dd) return;
  if(typeof e === 'boolean'){
    dd.classList.toggle('show', e);
    if(btn) btn.setAttribute('aria-expanded', e ? 'true' : 'false');
  } else {
    e?.stopPropagation?.();
    const isShowing = dd.classList.toggle('show');
    if(btn) btn.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
  }
}
window.toggleStudyMenuDropdown = toggleStudyMenuDropdown;

document.addEventListener('click', (e)=>{
  const dd = document.getElementById('helpDropdown');
  const btn = document.getElementById('btnHelpMenu');
  if(dd && dd.classList.contains('show') && !dd.contains(e.target) && !btn?.contains(e.target)){
    dd.classList.remove('show');
  }
  const startDd = document.getElementById('startHelpDropdown');
  const startBtn = document.getElementById('startBtnHelpMenu');
  if(startDd && startDd.classList.contains('show') && !startDd.contains(e.target) && !startBtn?.contains(e.target)){
    startDd.classList.remove('show');
    if(startBtn) startBtn.setAttribute('aria-expanded', 'false');
  }
  const folderDd = document.getElementById('folderMonitorDropdown');
  const folderBtn = document.getElementById('btnDiskSync');
  if(folderDd && folderDd.classList.contains('show') && !folderDd.contains(e.target) && !folderBtn?.contains(e.target)){
    folderDd.classList.remove('show');
  }
  const studyDd = document.getElementById('studyMenuDropdown');
  const studyBtn = document.getElementById('btnStudyMenu');
  if(studyDd && studyDd.classList.contains('show') && !studyDd.contains(e.target) && !studyBtn?.contains(e.target)){
    studyDd.classList.remove('show');
    if(studyBtn) studyBtn.setAttribute('aria-expanded', 'false');
  }
});"""

if old_dropdown_handlers in text:
    text = text.replace(old_dropdown_handlers, new_dropdown_handlers, 1)
    print("Manipulador toggleStudyMenuDropdown e listener de clique registrados com sucesso!")
else:
    print("AVISO: old_dropdown_handlers nao encontrado!")

# 5. Update updateTopBarActiveStudy() to synchronize studyMenuStudyTitle
old_update_fn = """  const idA = document.getElementById('topbarStudyId');
  const titleA = document.getElementById('topbarStudyTitle');
  if (idA) idA.textContent = cii;
  if (titleA) titleA.textContent = `• ${titulo}`;"""

new_update_fn = """  const idA = document.getElementById('topbarStudyId');
  const titleA = document.getElementById('topbarStudyTitle');
  if (idA) idA.textContent = cii;
  if (titleA) titleA.textContent = `• ${titulo}`;
  const studyMenuTitle = document.getElementById('studyMenuStudyTitle');
  if (studyMenuTitle) studyMenuTitle.textContent = t.titulo ? `${cii !== 'Sem CII' ? cii + ' · ' : ''}${titulo}` : 'Ações do Arquivo';"""

if old_update_fn in text:
    text = text.replace(old_update_fn, new_update_fn, 1)
    print("updateTopBarActiveStudy sincronizado com studyMenuStudyTitle com sucesso!")
else:
    print("AVISO: old_update_fn nao encontrado!")

with open('FACIU-v6.36.7.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("FACIU-v6.36.7.html gerado com sucesso!")
