import React, { useState, useEffect, useRef } from 'react';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
export type MainMethodology = 'tree' | 'whys';
export type StructureTabId = 'chronology' | 'tree' | 'whys' | 'lanes' | 'actions';

export interface StepItem {
  id: number;
  label: string;
  shortLabel?: string;
  badge?: string;
}

export interface NavigationHeaderProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  currentSubTab?: StructureTabId;
  onSubTabChange?: (tabId: StructureTabId) => void;
  mainMethodology?: MainMethodology;
  syncStatus?: SyncStatus;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onSave?: () => void;
  onNewStudy?: () => void;
  onExportJson?: () => void;
  onOpenHelp?: () => void;
  onOpenGuide?: () => void;
  onGoHome?: () => void;
  version?: string;
  isSaving?: boolean;
  canSave?: boolean;
}

const STEPS: StepItem[] = [
  { id: 1, label: 'Triagem', shortLabel: 'Triagem' },
  { id: 2, label: 'Estudo', shortLabel: 'Estudo' },
  { id: 3, label: 'RIA', shortLabel: 'RIA' },
  { id: 4, label: 'Verificação', shortLabel: 'Verif.' },
  { id: 5, label: 'Emissão', shortLabel: 'Emissão' },
];

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentStep,
  onStepChange,
  currentSubTab = 'chronology',
  onSubTabChange,
  mainMethodology = 'tree',
  syncStatus = 'synced',
  isDark = false,
  onToggleTheme,
  onSave,
  onNewStudy,
  onExportJson,
  onOpenHelp,
  onOpenGuide,
  onGoHome,
  version = '6.18.0',
  isSaving = false,
  canSave = true,
}) => {
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  // Close help dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setHelpMenuOpen(false);
      }
    };
    if (helpMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [helpMenuOpen]);

  // Global Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (canSave && onSave) {
          onSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSave, onSave]);

  const subTabs: { id: StructureTabId; label: string; visible: boolean }[] = [
    { id: 'chronology', label: 'Cronologia', visible: true },
    { id: 'tree', label: 'Árvore', visible: mainMethodology === 'tree' },
    { id: 'whys', label: '5 Porquês', visible: true },
    { id: 'lanes', label: 'Raias', visible: mainMethodology === 'tree' },
    { id: 'actions', label: 'Plano de Ação', visible: true },
  ];

  const visibleSubTabs = subTabs.filter((tab) => tab.visible);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md transition-colors duration-200 dark:border-zinc-800/80 dark:bg-zinc-950/90 text-zinc-900 dark:text-zinc-100 select-none">
      {/* LINHA 1: Top Bar Compacta (44px) */}
      <div className="flex h-11 items-center justify-between px-4 sm:px-6 border-b border-zinc-100 dark:border-zinc-900/60">
        {/* Identidade e Marca */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onGoHome}
            title="Página Inicial do FACIU"
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 text-left transition-all duration-150 hover:bg-zinc-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600] dark:hover:bg-zinc-900"
          >
            {/* Logo Brava Badge / Fallback Visual */}
            <div className="flex h-6 items-center justify-center rounded-md bg-[#221C4F] px-2 text-[10px] font-black tracking-wider text-[#C6E600] shadow-sm">
              BRAVA
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                FACIU
              </span>
              <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                v{version}
              </span>
            </div>
          </button>
        </div>

        {/* Centro: Indicador de Sincronização / Status Discreto */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-zinc-200/60 bg-zinc-50/80 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <span className="relative flex h-2 w-2">
            {syncStatus === 'syncing' ? (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            ) : syncStatus === 'synced' ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#84cc16]" />
            ) : syncStatus === 'error' ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-400" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                syncStatus === 'syncing'
                  ? 'bg-amber-500'
                  : syncStatus === 'synced'
                  ? 'bg-[#84cc16]'
                  : syncStatus === 'error'
                  ? 'bg-rose-500'
                  : 'bg-zinc-400'
              }`}
            />
          </span>
          <span>
            {syncStatus === 'syncing'
              ? 'Sincronizando...'
              : syncStatus === 'synced'
              ? 'Sincronizado'
              : syncStatus === 'offline'
              ? 'Offline'
              : 'Disco Ativo'}
          </span>
        </div>

        {/* Direita: Ações Utilitárias e Botões de Ação */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Suporte & Ajuda com Dropdown */}
          <div className="relative" ref={helpMenuRef}>
            <button
              type="button"
              onClick={() => setHelpMenuOpen(!helpMenuOpen)}
              aria-expanded={helpMenuOpen}
              aria-haspopup="true"
              title="Ajuda e Documentação"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-500 transition-all hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600] active:scale-95 dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>

            {helpMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-100 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setHelpMenuOpen(false);
                    onOpenHelp?.();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  Central de Ajuda
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHelpMenuOpen(false);
                    onOpenGuide?.();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Guia do Usuário
                </button>
              </div>
            )}
          </div>

          {/* Exportar JSON */}
          <button
            type="button"
            onClick={onExportJson}
            title="Exportar Estudo (JSON)"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-500 transition-all hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600] active:scale-95 dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          {/* Alternador de Tema (Claro / Escuro) */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-500 transition-all hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600] active:scale-95 dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          >
            {isDark ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Divisor Vertical Sutil */}
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {/* Botão Novo Estudo */}
          <button
            type="button"
            onClick={onNewStudy}
            title="Iniciar novo estudo em branco"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 px-2.5 text-xs font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600] active:scale-95 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden sm:inline">Novo</span>
          </button>

          {/* Botão Salvar Primário com Alto Contraste (Estilo Linear CTA) */}
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave || isSaving}
            title="Salvar estudo agora (Ctrl+S)"
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600] active:scale-95 ${
              isSaving
                ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500'
                : 'bg-[#C6E600] text-[#1B1B29] shadow-sm hover:brightness-105 active:brightness-95'
            }`}
          >
            {isSaving ? (
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            )}
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
            <kbd className="hidden lg:inline-flex items-center rounded border border-black/15 bg-black/5 px-1 py-0.2 text-[9px] font-semibold text-zinc-800 dark:border-black/30 dark:bg-black/10">
              Ctrl+S
            </kbd>
          </button>
        </div>
      </div>

      {/* LINHA 2: Stepper Minimalista + Subguias Contextuais do Estudo (36px) */}
      <div className="flex h-9 items-center justify-between px-4 sm:px-6 overflow-x-auto no-scrollbar">
        {/* Esquerda: Stepper Linear (Passos 1 a 5) */}
        <nav aria-label="Etapas da Investigação" className="flex items-center gap-1 shrink-0">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => onStepChange(step.id)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`group relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600] ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950'
                      : isCompleted
                      ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-100/70 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-300'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                      isActive
                        ? 'bg-[#C6E600] text-[#1B1B29]'
                        : isCompleted
                        ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800/60 dark:text-zinc-500'
                    }`}
                  >
                    {step.id}
                  </span>
                  <span>{step.label}</span>
                </button>

                {/* Separador entre etapas */}
                {idx < STEPS.length - 1 && (
                  <svg className="h-3 w-3 text-zinc-300 dark:text-zinc-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Direita: Subguias de Trabalho quando no Passo 2 (Estudo) */}
        {currentStep === 2 && (
          <div className="flex items-center gap-2 pl-4 shrink-0">
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div role="tablist" aria-label="Ferramentas do Estudo" className="flex items-center gap-1">
              {visibleSubTabs.map((tab) => {
                const isSelected = currentSubTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={isSelected}
                    aria-controls={`pane-${tab.id}`}
                    type="button"
                    onClick={() => onSubTabChange?.(tab.id)}
                    className={`relative rounded-md px-2.5 py-1 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600] ${
                      isSelected
                        ? 'bg-zinc-100 text-[#221C4F] dark:bg-zinc-800 dark:text-[#C6E600]'
                        : 'text-zinc-500 hover:bg-zinc-100/60 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isSelected && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#C6E600] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavigationHeader;
