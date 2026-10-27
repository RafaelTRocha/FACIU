import React, { useState } from 'react';

export type NodeKind =
  | 'evt'
  | 'imediata'
  | 'gate'
  | 'hipotese'
  | 'falha'
  | 'fatores'
  | 'fator_sub'
  | 'contrib'
  | 'raiz'
  | 'acao';

export type NodeState = 'Em análise' | 'Confirmada' | 'Descartada' | '';

export interface TreeNode {
  id: string;
  label: string;
  desc?: string;
  kind: NodeKind;
  estado?: NodeState;
  status?: string;
  code?: string;
  whyCount?: number;
}

export interface TreeFloatingInspectorProps {
  selectedNode: TreeNode | null;
  onUpdateNode?: (id: string, updates: Partial<TreeNode>) => void;
  onAddChild?: (parentId: string, kind: NodeKind, gate: 'E' | 'OU') => void;
  onAddSibling?: (siblingId: string) => void;
  onCreateWhy?: (nodeId: string) => void;
  onToggleRoot?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onResetTree?: () => void;
  onFitZoom?: () => void;
  onRelayout?: () => void;
  onExportPng?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: (minimized: boolean) => void;
  isDark?: boolean;
}

// Inline Lucide SVG Icons (Zero Emoji Doctrine)
const ChevronUpIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const TrashIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const PlusIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const GitForkIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
    <path d="M12 12v3" />
  </svg>
);

const HelpCircleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const TargetIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const RotateCcwIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const ZoomInIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const DownloadIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const LayoutIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const KIND_CONFIG: Record<NodeKind, { label: string; code: string; bg: string; text: string; border: string }> = {
  evt: { label: 'Evento Topo', code: 'ET', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-700' },
  imediata: { label: 'Causa Imediata', code: 'CI', bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' },
  gate: { label: 'Porta Lógica', code: 'OU', bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-300 dark:border-zinc-700' },
  hipotese: { label: 'Hipótese', code: 'H', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-700' },
  falha: { label: 'Falha de Projeto', code: 'FP', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-700' },
  fatores: { label: 'Fatores Humanos', code: 'FH', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-700' },
  fator_sub: { label: 'Sub-fator', code: 'FS', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-700' },
  contrib: { label: 'Causa Contribuinte', code: 'CC', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700' },
  raiz: { label: 'Causa-Raiz', code: 'CR', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700' },
  acao: { label: 'Ação', code: 'A', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
};

export const TreeFloatingInspector: React.FC<TreeFloatingInspectorProps> = ({
  selectedNode,
  onUpdateNode,
  onAddChild,
  onAddSibling,
  onCreateWhy,
  onToggleRoot,
  onDeleteNode,
  onResetTree,
  onFitZoom,
  onRelayout,
  onExportPng,
  isMinimized: controlledMinimized,
  onToggleMinimize,
}) => {
  const [internalMinimized, setInternalMinimized] = useState(false);
  const [childKind, setChildKind] = useState<NodeKind>('hipotese');
  const [childGate, setChildGate] = useState<'E' | 'OU'>('OU');

  const isMin = controlledMinimized !== undefined ? controlledMinimized : internalMinimized;

  const handleToggleMin = () => {
    const next = !isMin;
    if (onToggleMinimize) onToggleMinimize(next);
    else setInternalMinimized(next);
  };

  const kindInfo = selectedNode ? (KIND_CONFIG[selectedNode.kind] || KIND_CONFIG.hipotese) : KIND_CONFIG.hipotese;
  const sigla = selectedNode?.code || (selectedNode ? `[${kindInfo.code}]` : '');

  return (
    <>
      {/* Micro-toolbar flutuante superior direita (Canvas Controls) */}
      <aside
        aria-label="Controles do Canvas"
        className="absolute top-4 right-4 z-20 flex items-center gap-1 p-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg shadow-sm"
      >
        <button
          type="button"
          onClick={onFitZoom}
          title="Ajustar visualização (Zoom Fit)"
          aria-label="Ajustar visualização"
          className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600]"
        >
          <ZoomInIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRelayout}
          title="Reorganizar nós hierarquicamente"
          aria-label="Reorganizar nós"
          className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600]"
        >
          <LayoutIcon className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 my-auto" />
        <button
          type="button"
          onClick={onExportPng}
          title="Exportar imagem PNG"
          aria-label="Exportar imagem PNG"
          className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600]"
        >
          <DownloadIcon className="w-4 h-4" />
        </button>
      </aside>

      {/* Editor Flutuante Superior Esquerdo */}
      <aside
        id="treeFloatingInspector"
        aria-label="Painel de Edição do Bloco Causal"
        className={`absolute top-4 left-4 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl shadow-lg transition-all duration-200 ease-out select-none ${
          isMin ? 'w-auto max-w-xs' : 'w-80'
        }`}
      >
        {/* Cabeçalho do Card / Pílula */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/70">
          <div className="flex items-center gap-2 min-w-0">
            {selectedNode ? (
              <>
                <span
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded border ${kindInfo.bg} ${kindInfo.text} ${kindInfo.border}`}
                >
                  {sigla}
                </span>
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {selectedNode.label || 'Sem título'}
                </span>
              </>
            ) : (
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Nenhum bloco selecionado
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {selectedNode && !isMin && (
              <button
                type="button"
                onClick={() => onDeleteNode && onDeleteNode(selectedNode.id)}
                title="Excluir este bloco"
                aria-label="Excluir bloco"
                className="p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              id="btnToggleMinimize"
              type="button"
              onClick={handleToggleMin}
              title={isMin ? 'Expandir painel do bloco' : 'Minimizar em pílula compacta'}
              aria-label={isMin ? 'Expandir painel' : 'Minimizar painel'}
              className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600]"
            >
              {isMin ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Corpo do Painel (Ocultado quando minimizado) */}
        {!isMin && (
          <div className="p-3 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto text-xs">
            {selectedNode ? (
              <>
                {/* Título do Bloco (Até 70 chars) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    <label htmlFor="inspector-label" className="tracking-wide uppercase">Título do Bloco</label>
                    <span>{(selectedNode.label || '').length}/70</span>
                  </div>
                  <input
                    id="inspector-label"
                    type="text"
                    maxLength={70}
                    value={selectedNode.label || ''}
                    onChange={(e) => onUpdateNode && onUpdateNode(selectedNode.id, { label: e.target.value })}
                    placeholder="Descrição concisa da causa/hipótese..."
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-md text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#C6E600] focus:border-[#C6E600] transition-colors"
                  />
                </div>

                {/* Descrição Detalhada */}
                <div className="space-y-1">
                  <label htmlFor="inspector-desc" className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
                    Evidência / Detalhamento
                  </label>
                  <textarea
                    id="inspector-desc"
                    rows={2}
                    value={selectedNode.desc || ''}
                    onChange={(e) => onUpdateNode && onUpdateNode(selectedNode.id, { desc: e.target.value })}
                    placeholder="Fatos observados, registros, condições..."
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-md text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#C6E600] focus:border-[#C6E600] transition-colors resize-none"
                  />
                </div>

                {/* Status / Validação Causal */}
                <div className="space-y-1">
                  <label htmlFor="inspector-estado" className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
                    Estado Causal
                  </label>
                  <select
                    id="inspector-estado"
                    value={selectedNode.estado || 'Em análise'}
                    onChange={(e) => onUpdateNode && onUpdateNode(selectedNode.id, { estado: e.target.value as NodeState })}
                    className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-md text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#C6E600] focus:border-[#C6E600] transition-colors"
                  >
                    <option value="Em análise">◌ Em análise</option>
                    <option value="Confirmada">✓ Confirmada</option>
                    <option value="Descartada">✕ Descartada</option>
                  </select>
                </div>

                {/* Adição de Ramificação */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <span className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
                    Adicionar Ramificação
                  </span>

                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={childKind}
                      onChange={(e) => setChildKind(e.target.value as NodeKind)}
                      className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded text-[11px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#C6E600]"
                    >
                      <option value="hipotese">Hipótese</option>
                      <option value="falha">Falha Projeto</option>
                      <option value="fatores">Fator Humano</option>
                      <option value="contrib">Causa Contrib.</option>
                      <option value="raiz">Causa-Raiz</option>
                      <option value="acao">Ação</option>
                    </select>

                    <select
                      value={childGate}
                      onChange={(e) => setChildGate(e.target.value as 'E' | 'OU')}
                      className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded text-[11px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#C6E600]"
                    >
                      <option value="OU">Porta OU</option>
                      <option value="E">Porta E</option>
                    </select>
                  </div>

                  {/* Grid de Botões de Ação */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onAddChild && onAddChild(selectedNode.id, childKind, childGate)}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md font-medium text-[11px] hover:bg-zinc-800 dark:hover:bg-white active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600]"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Filho</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAddSibling && onAddSibling(selectedNode.id)}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-md font-medium text-[11px] hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E600]"
                    >
                      <GitForkIcon className="w-3.5 h-3.5" />
                      <span>Irmão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCreateWhy && onCreateWhy(selectedNode.id)}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-md font-medium text-[11px] hover:bg-sky-100 dark:hover:bg-sky-900/60 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      <HelpCircleIcon className="w-3.5 h-3.5" />
                      <span>5 Porquês</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleRoot && onToggleRoot(selectedNode.id)}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md font-medium text-[11px] hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <TargetIcon className="w-3.5 h-3.5" />
                      <span>Causa-Raiz</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                  Selecione um bloco no diagrama para editar propriedades e ramificações.
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Dica: Dê duplo clique em qualquer bloco para abrir o modal completo.
                </p>
              </div>
            )}

            {/* Rodapé com Ação Secundária */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={onResetTree}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 rounded px-1"
              >
                <RotateCcwIcon className="w-3 h-3" />
                <span>Restaurar modelo</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default TreeFloatingInspector;
