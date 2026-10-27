import os
import re

src_path = "FACIU-v6.36.8.html"
dst_path = "FACIU-v6.36.9.html"

assert os.path.exists(src_path), f"Source {src_path} not found"

with open(src_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update version strings
replacements = [
    (
        "<title>FACIU v6.36.8 | Ferramenta de Análise de Causas e Investigação Unificada</title>",
        "<title>FACIU v6.36.9 | Ferramenta de Análise de Causas e Investigação Unificada</title>"
    ),
    (
        'v<span class="appv">6.36.8</span>',
        'v<span class="appv">6.36.9</span>'
    ),
    (
        'FACIU <span class="start-version">v6.36.8</span>',
        'FACIU <span class="start-version">v6.36.9</span>'
    ),
    (
        '<span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/15" id="appVersionLabel">v6.36.8</span>',
        '<span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/15" id="appVersionLabel">v6.36.9</span>'
    ),
    (
        'const APP_VERSION="6.36.8";',
        'const APP_VERSION="6.36.9";'
    ),
    (
        "appVersion: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '6.36.8'",
        "appVersion: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '6.36.9'"
    )
]

for old, new in replacements:
    assert old in content, f"Target string not found: {old[:50]}..."
    content = content.replace(old, new)

# 2. Update store.persist()
old_persist = """    // 1. Persistência Contínua via IndexedDB
    clearTimeout(this.idbTimeout);
    this.idbTimeout = setTimeout(() => {
      faciuDB.put('active_study', this.state).then(() => {
        if (typeof updateSyncStatus === 'function') {
          updateSyncStatus();
        }
      }).catch(e => {
        console.error('[FACIU] Falha ao salvar no IndexedDB.', e);
        if (typeof updateSyncStatus === 'function') {
          updateSyncStatus('error');
        }
      });
    }, 300);

    // 2. Persistência Contínua via File System Access API (Monitor de Pasta & Arquivo)
    if (typeof FaciuFolderMonitor !== 'undefined' && FaciuFolderMonitor.fileHandle) {
      FaciuFolderMonitor.notifyStateChange(this.state);
    } else {
      if (typeof updateSyncStatus === 'function') {
        updateSyncStatus();
      }
    }"""

new_persist = """    // 1. Persistência Contínua via IndexedDB
    clearTimeout(this.idbTimeout);
    this.idbTimeout = setTimeout(() => {
      faciuDB.put('active_study', this.state).then(() => {
        // Se não houver arquivo em disco vinculado, atualiza status da gravação no IndexedDB
        if (typeof FaciuFolderMonitor === 'undefined' || !FaciuFolderMonitor.fileHandle) {
          if (typeof updateSyncStatus === 'function') {
            updateSyncStatus();
          }
        }
      }).catch(e => {
        console.error('[FACIU] Falha ao salvar no IndexedDB.', e);
        if (typeof updateSyncStatus === 'function') {
          updateSyncStatus('error');
        }
      });
    }, 300);

    // 2. Persistência Contínua via File System Access API (Monitor de Pasta & Arquivo)
    if (typeof FaciuFolderMonitor !== 'undefined' && FaciuFolderMonitor.fileHandle) {
      FaciuFolderMonitor.notifyStateChange(this.state);
    }"""

assert old_persist in content, "old_persist not found"
content = content.replace(old_persist, new_persist, 1)

# 3. Update updateSyncStatus()
old_sync_status = """function updateSyncStatus(explicitStatus) {
  const pill = document.getElementById('syncStatusPill');
  const dot = document.getElementById('syncStatusDot');
  const txt = document.getElementById('syncStatusText');
  if (!pill || !dot || !txt) return;

  const isConsultation = typeof appReadOnly !== 'undefined' && appReadOnly;
  const hasFile = typeof FaciuFolderMonitor !== 'undefined' && !!FaciuFolderMonitor.fileHandle;
  const fileName = (typeof FaciuFolderMonitor !== 'undefined' && FaciuFolderMonitor.fileName) || '';
  const isSaving = (typeof FaciuFolderMonitor !== 'undefined' && FaciuFolderMonitor.isSaving) || explicitStatus === 'syncing';
  const hasUnsaved = (window.store && window.store.hasUnsavedChanges) || (!hasFile);

  // 1. Modo Consulta (somente leitura)
  if (isConsultation) {
    pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-xs font-semibold text-purple-300 transition-all cursor-pointer';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-purple-400';
    txt.textContent = 'Modo Consulta';
    pill.title = 'Investigação aberta em modo somente leitura para consulta.';
    return;
  }

  // 2. Erro de gravação explícito
  if (explicitStatus === 'error') {
    pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-xs font-semibold text-red-300 transition-all cursor-pointer';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse';
    txt.textContent = 'Erro ao Salvar';
    pill.title = 'Falha ao gravar no arquivo de disco. Clique para tentar salvar ou escolher nova pasta.';
    return;
  }

  // 3. Em processo de gravação (Salvando...)
  if (isSaving) {
    pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/40 text-xs font-semibold text-sky-300 transition-all cursor-pointer';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse';
    txt.textContent = 'Salvando...';
    pill.title = 'Gravando alterações no arquivo de disco...';
    return;
  }

  // 4. Sem arquivo em disco vinculado (Novo Projeto / Estudo Não Salvo em Arquivo)
  if (!hasFile) {
    pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-xs font-semibold text-amber-300 transition-all cursor-pointer';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-amber-400 status-pulse';
    txt.textContent = 'Não Salvo em Arquivo';
    pill.title = 'Este estudo ainda não foi salvo em um arquivo JSON no seu disco. Clique para Salvar (Ctrl+S).';
    return;
  }

  // 5. Com arquivo em disco vinculado, mas com alterações pendentes
  if (hasUnsaved && explicitStatus !== 'synced') {
    pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-xs font-semibold text-amber-300 transition-all cursor-pointer';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-amber-400 status-pulse';
    txt.textContent = 'Alterações Pendentes';
    pill.title = `Existem alterações pendentes de gravação no arquivo "${fileName}". Clique para salvar agora (Ctrl+S).`;
    return;
  }

  // 6. Com arquivo vinculado e 100% sincronizado
  pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-all cursor-pointer';
  dot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse';
  txt.textContent = 'Sincronizado';
  pill.title = `Sincronizado com o arquivo local: "${fileName}". Clique para gerenciar pasta de trabalho.`;
}"""

new_sync_status = """function updateSyncStatus(explicitStatus) {
  const pill = document.getElementById('syncStatusPill');
  const dot = document.getElementById('syncStatusDot');
  const txt = document.getElementById('syncStatusText');
  if (!pill || !dot || !txt) return;

  const isConsultation = typeof appReadOnly !== 'undefined' && appReadOnly;
  const hasFile = typeof FaciuFolderMonitor !== 'undefined' && !!FaciuFolderMonitor.fileHandle;
  const fileName = (typeof FaciuFolderMonitor !== 'undefined' && FaciuFolderMonitor.fileName) || '';
  const isSaving = (explicitStatus !== 'synced' && explicitStatus !== 'saved_browser') &&
                   ((typeof FaciuFolderMonitor !== 'undefined' && FaciuFolderMonitor.isSaving) || explicitStatus === 'syncing');
  const hasUnsaved = !!(window.store && window.store.hasUnsavedChanges);

  // 1. Modo Consulta (somente leitura)
  if (isConsultation) {
    pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-xs font-semibold text-purple-300 transition-all cursor-pointer';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-purple-400';
    txt.textContent = 'Modo Consulta';
    pill.title = 'Investigação aberta em modo somente leitura para consulta.';
    return;
  }

  // 2. Erro de gravação explícito
  if (explicitStatus === 'error') {
    pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-xs font-semibold text-red-300 transition-all cursor-pointer';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse';
    txt.textContent = 'Erro ao Salvar';
    pill.title = 'Falha ao gravar no arquivo de disco. Clique para tentar salvar ou escolher nova pasta.';
    return;
  }

  // 3. Em processo de gravação (Salvando...)
  if (isSaving) {
    pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/40 text-xs font-semibold text-sky-300 transition-all cursor-pointer';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse';
    txt.textContent = 'Salvando...';
    pill.title = 'Gravando alterações no arquivo de disco...';
    return;
  }

  // 4. Sem arquivo em disco vinculado (Novo Projeto / Estudo no Navegador)
  if (!hasFile) {
    if (explicitStatus === 'synced' || explicitStatus === 'saved_browser' || !hasUnsaved) {
      pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-all cursor-pointer';
      dot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse';
      txt.textContent = 'Salvo no Navegador';
      pill.title = 'Estudo salvo com segurança no armazenamento local deste navegador. Clique para salvar em arquivo JSON (Ctrl+S).';
      return;
    }
    pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-xs font-semibold text-amber-300 transition-all cursor-pointer';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-amber-400 status-pulse';
    txt.textContent = 'Não Salvo em Arquivo';
    pill.title = 'Este estudo ainda não foi salvo em um arquivo JSON no seu disco. Clique para Salvar (Ctrl+S).';
    return;
  }

  // 5. Com arquivo em disco vinculado, mas com alterações pendentes
  if (hasUnsaved && explicitStatus !== 'synced') {
    pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-xs font-semibold text-amber-300 transition-all cursor-pointer';
    dot.className = 'w-1.5 h-1.5 rounded-full bg-amber-400 status-pulse';
    txt.textContent = 'Alterações Pendentes';
    pill.title = `Existem alterações pendentes de gravação no arquivo "${fileName}". Clique para salvar agora (Ctrl+S).`;
    return;
  }

  // 6. Com arquivo vinculado e 100% sincronizado
  pill.className = 'h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-all cursor-pointer';
  dot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse';
  txt.textContent = 'Sincronizado';
  pill.title = `Sincronizado com o arquivo local: "${fileName}". Clique para gerenciar pasta de trabalho.`;
}"""

assert old_sync_status in content, "old_sync_status not found"
content = content.replace(old_sync_status, new_sync_status, 1)

# 4. Update FaciuFolderMonitor.saveToDisk()
old_save_to_disk = """  async saveToDisk(stateData) {
    if (!this.fileHandle) return false;
    this.isSaving = true;
    if (typeof updateSyncStatus === 'function') updateSyncStatus('syncing');
    try {
      const hasPerm = await this.verifyPermission(this.fileHandle, true);
      if (!hasPerm) {
        console.warn('[FACIU Monitor] Permissão de escrita pendente no arquivo:', this.fileName);
        if (typeof updateSyncStatus === 'function') updateSyncStatus('error');
        if (typeof toast === 'function') toast('Permissão de gravação pendente no arquivo local.');
        return false;
      }
      const dataToSave = stateData || state;
      const pkg = typeof buildInvestigationPackage === 'function'
        ? buildInvestigationPackage(dataToSave)
        : {
            fileType: typeof JSON_FILE_TYPE !== 'undefined' ? JSON_FILE_TYPE : 'brava-investigacao-causas',
            schemaVersion: typeof JSON_SCHEMA_VERSION !== 'undefined' ? JSON_SCHEMA_VERSION : '1.1',
            appVersion: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '6.36.9',
            exportedAt: new Date().toISOString(),
            study: JSON.parse(JSON.stringify(dataToSave))
          };
      const jsonText = JSON.stringify(pkg, null, 2);
      const writable = await this.fileHandle.createWritable();
      await writable.write(jsonText);
      await writable.close();

      const file = await this.fileHandle.getFile();
      this.lastModified = file.lastModified;
      this.lastHash = await this.computeHash(jsonText);

      if (window.store) {
        window.store.hasUnsavedChanges = false;
      }
      this.updateUI();
      if (typeof updateSyncStatus === 'function') updateSyncStatus('synced');
      if (window.__FACIU_DEBUG__) console.log(`[FACIU Monitor] Salvo no disco com sucesso: ${this.fileName}`);
      return true;
    } catch (err) {
      console.error('[FACIU Monitor] Erro ao gravar no disco:', err);
      if (typeof updateSyncStatus === 'function') updateSyncStatus('error');
      if (typeof toast === 'function') toast(`Erro ao gravar no arquivo em disco: ${err.message || 'Falha de I/O'}`);
      return false;
    } finally {
      this.isSaving = false;
    }
  },"""

new_save_to_disk = """  async saveToDisk(stateData) {
    if (!this.fileHandle) return false;
    clearTimeout(this.saveTimer);
    this.isSaving = true;
    if (typeof updateSyncStatus === 'function') updateSyncStatus('syncing');
    try {
      const hasPerm = await this.verifyPermission(this.fileHandle, true);
      if (!hasPerm) {
        console.warn('[FACIU Monitor] Permissão de escrita pendente no arquivo:', this.fileName);
        this.isSaving = false;
        if (typeof updateSyncStatus === 'function') updateSyncStatus('error');
        if (typeof toast === 'function') toast('Permissão de gravação pendente no arquivo local.');
        return false;
      }
      const dataToSave = stateData || state;
      const pkg = typeof buildInvestigationPackage === 'function'
        ? buildInvestigationPackage(dataToSave)
        : {
            fileType: typeof JSON_FILE_TYPE !== 'undefined' ? JSON_FILE_TYPE : 'brava-investigacao-causas',
            schemaVersion: typeof JSON_SCHEMA_VERSION !== 'undefined' ? JSON_SCHEMA_VERSION : '1.1',
            appVersion: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '6.36.9',
            exportedAt: new Date().toISOString(),
            study: JSON.parse(JSON.stringify(dataToSave))
          };
      const jsonText = JSON.stringify(pkg, null, 2);
      const writable = await this.fileHandle.createWritable();
      await writable.write(jsonText);
      await writable.close();

      const file = await this.fileHandle.getFile();
      this.lastModified = file.lastModified;
      this.lastHash = await this.computeHash(jsonText);

      if (window.store) {
        window.store.hasUnsavedChanges = false;
      }
      this.isSaving = false;
      this.updateUI();
      if (typeof updateSyncStatus === 'function') updateSyncStatus('synced');
      if (window.__FACIU_DEBUG__) console.log(`[FACIU Monitor] Salvo no disco com sucesso: ${this.fileName}`);
      return true;
    } catch (err) {
      console.error('[FACIU Monitor] Erro ao gravar no disco:', err);
      this.isSaving = false;
      if (typeof updateSyncStatus === 'function') updateSyncStatus('error');
      if (typeof toast === 'function') toast(`Erro ao gravar no arquivo em disco: ${err.message || 'Falha de I/O'}`);
      return false;
    } finally {
      this.isSaving = false;
    }
  },"""

assert old_save_to_disk in content, "old_save_to_disk not found"
content = content.replace(old_save_to_disk, new_save_to_disk, 1)

# 5. Update saveStudy()
old_save_study_disk = """    if (FaciuFolderMonitor.fileHandle) {
      const ok = await FaciuFolderMonitor.saveToDisk(state);
      if (showToast) {
        if (ok) toast(`Salvo no arquivo: ${FaciuFolderMonitor.fileName}`);
        else toast('Estudo salvo no navegador (pendente permissão no arquivo de disco).');
      }
      if (typeof FaciuStudyCatalog !== 'undefined') {
        FaciuStudyCatalog.recordCurrentStudy(state, FaciuFolderMonitor.fileName);
      }
      return;
    }"""

new_save_study_disk = """    if (FaciuFolderMonitor.fileHandle) {
      const ok = await FaciuFolderMonitor.saveToDisk(state);
      if (showToast) {
        if (ok) toast(`Salvo no arquivo: ${FaciuFolderMonitor.fileName}`);
        else toast('Estudo salvo no navegador (pendente permissão no arquivo de disco).');
      }
      if (ok && window.store) window.store.hasUnsavedChanges = false;
      if (typeof updateSyncStatus === 'function') updateSyncStatus(ok ? 'synced' : 'error');
      if (typeof FaciuStudyCatalog !== 'undefined') {
        FaciuStudyCatalog.recordCurrentStudy(state, FaciuFolderMonitor.fileName);
      }
      return;
    }"""

assert old_save_study_disk in content, "old_save_study_disk not found"
content = content.replace(old_save_study_disk, new_save_study_disk, 1)

old_abort = "if (err.name === 'AbortError') return;"
new_abort = """if (err.name === 'AbortError') {
        if (window.store) window.store.hasUnsavedChanges = false;
        if (typeof updateSyncStatus === 'function') updateSyncStatus('saved_browser');
        return;
      }"""
assert old_abort in content, "old_abort not found"
content = content.replace(old_abort, new_abort, 1)

old_save_study_browser = """  if (typeof FaciuStudyCatalog !== 'undefined') {
    FaciuStudyCatalog.recordCurrentStudy(state);
  }
  if (typeof updateSyncStatus === 'function') updateSyncStatus();
  if (showToast) toast('Estudo salvo neste navegador (não vinculado a arquivo JSON).');"""

new_save_study_browser = """  if (window.store) window.store.hasUnsavedChanges = false;
  if (typeof FaciuStudyCatalog !== 'undefined') {
    FaciuStudyCatalog.recordCurrentStudy(state);
  }
  if (typeof updateSyncStatus === 'function') updateSyncStatus('saved_browser');
  if (showToast) toast('Estudo salvo neste navegador (não vinculado a arquivo JSON).');"""

assert old_save_study_browser in content, "old_save_study_browser not found"
content = content.replace(old_save_study_browser, new_save_study_browser, 1)

with open(dst_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Generated {dst_path} successfully. Total bytes: {len(content)}")
