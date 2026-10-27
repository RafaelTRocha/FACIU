# FACIU - Ferramenta de Análise de Causas e Investigação Unificada

> Aplicação *Single-File* (SFA / Zero-Backend) para investigação e análise de acidentes e incidentes industriais no padrão corporativo da **Brava Energia**, convergindo metodologias de Árvore de Causas e 5 Porquês na emissão oficial do **RIA (FORM-CORP-SMS-088 Rev. 08)**.

**Versão Atual:** `v6.40.6`  
**Arquivo de Produção:** [`FACIU-v6.40.6.html`](FACIU-v6.40.6.html)  
**Documento Normativo:** [`docs/PLANO_DE_MANUTENCAO.md`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/docs/PLANO_DE_MANUTENCAO.md)  

---

## Principais Recursos

### 0. Gestão de Arquivos, Tela Inicial e Barra Superior (v6.35.0 - v6.36.7)
- **Menu Unificado de Ações do Estudo (v6.36.7)**: Fileira de 5 botões dispersos substituída por um botão único corporativo `[ 📁 Estudo ▾ ]` com lista suspensa (dropdown de 280px), agrupando *Novo*, *Abrir... (Ctrl+O)*, *Salvar (Ctrl+S)*, *Salvar Como... (Ctrl+Shift+S)* e *Fechar (Ctrl+Shift+W)* com atalhos de teclado e alto contraste.
- **Barra Superior Sólida & Alternador de Tema (v6.36.6)**: Topbar da Tela Inicial preenchida e 100% opaca no topo (`#100a26` claro / `#0b071a` escuro) sem transparência no scroll, botão de alternância de tema no cabeçalho e rodapé escuro integrado.
- **Central de Ajuda Redesenhada e Temas Coerentes (v6.36.5)**: Modal de ajuda com design system corporativo Linear-app, cabeçalho unificado com altura mínima de 54px, navegação segmentada central em pílula (Brava Lima `#d0f50d`), atalho `Esc` visível e suporte pleno a Modo Claro e Modo Escuro (fundo `#0b071a` de alto contraste, eliminando ofuscamento).
- **Salvamento Direto no Arquivo Aberto (`saveStudy` - v6.36.3)**: Ao salvar com `Ctrl+S`, o estudo atualiza diretamente o arquivo `.json` aberto via File System Access API, sem prompts de diálogo redundantes. Para gerar novas cópias, use "Salvar Como..." (`Ctrl+Shift+S`).
- **Ciclo de Fechamento Limpo & Prevenção de Fantasmas (`closeStudy` - v6.36.4)**: Ao clicar em "Fechar Estudo", todos os temporizadores assíncronos (`idbTimeout`, `saveTimer`, `riaRevalTimer`, `invalPendente`) são atômica e preventivamente purgados, o DOM é higienizado e as chaves ativas do `IndexedDB` são expurgadas, impedindo ressuscitação involuntária de dados.
- **Catálogo Inteligente de Estudos (`FaciuStudyCatalog`)**: Listagem unificada de investigações salvas no navegador (`IndexedDB`/`localStorage`) e arquivos `.json` da pasta conectada no computador, com abas "Todos", "Pasta Local" e "Navegador".
- **Busca em Tempo Real**: Campo de pesquisa com debounce para filtragem instantânea por CII, título, ativo, líder ou data.
- **Gerenciador de Pasta de Trabalho (Workspace Manager)**: Modal dedicado (`#modalWorkspaceManager`) para gerenciar pasta conectada via W3C File System Access API e carregar qualquer estudo com 1 clique.
- **Status em Tempo Real (`#syncStatusPill`)**: Indicador de sincronização inteligente na barra superior com 6 estados funcionais (`Não Salvo em Arquivo`, `Salvando...`, `Sincronizado`, `Alterações Pendentes`, `Modo Consulta`, `Erro ao Salvar`).

### 1. Cabeçalho e Stepper Inteligente com Identidade Brava Energia
- Navegação otimizada em ~80px de altura vertical com identidade visual Brava (`#0E1D3C` Navy + `#C6E600` Lima).
- Stepper horizontal inteligente com 5 passos canônicos (1. Triagem, 2. Estudo, 3. RIA, 4. Verificação, 5. Emissão) e indicadores reativos de integridade (✓ Completo, ! Pendências recomendadas, ✕ Bloqueios impeditivos).
- Acessibilidade plena por teclado com teclas de seta (`ArrowRight` / `ArrowLeft`) e atalhos globais.
- Subguias integradas de estudo (Cronologia, 5 Porquês, Árvore de Causas, Raias, Teste do Portanto, Plano de Ação) ativadas contextualmente no Passo 2.
- Suporte completo a tema claro e escuro, sem emojis (ícones Lucide/SVG em `currentColor`).

### 2. Assistente de Inteligência Artificial & Integração Corporativa (v6.26.0 - v6.36.0)
- **Prompting Estruturado para o Microsoft Copilot Corporativo (v6.36.0)**: Botão de ação rápida "Copiar p/ Copilot" nos 24 campos de texto do RIA e na barra de Verificação (Passo 4), permitindo exportar o contexto do estudo para a IA oficial da Brava Energia.
- **3 Modos Especializados de Auditoria**:
  1. *Inconsistências & Coerência*: Varredura lógica entre fatos da Cronologia, nós da Árvore, passos dos 5 Porquês e texto técnico do RIA.
  2. *Barreiras & Ações SMART*: Avaliação das barreiras de segurança e critérios SMART nas ações (Tabela 4.7).
  3. *Parecer de Liberação RIA*: Minuta do Parecer Técnico Conclusivo da Comissão de Investigação para homologação gerencial.
- **Inferência Direta Client-Side (Zero-Backend)**: Suporte a APIs de IA compatíveis com o padrão OpenAI (Google Gemini, Groq, OpenRouter) e Chrome Built-in AI (`window.ai`).

### 3. Motor de Verificação Global Compacto e Foco em Exceções (Passo 4)
- **Barra de KPI Compacta**: Percentual de integridade (`#integPct`), barra linear de progresso, status resumido e pills de contagem (`✓ Atendidos`, `✕ Bloqueios`, `⚠ Pendências`).
- **Macro-Indicadores Modulares**: 5 mini-cards interativos (`Triagem`, `Árvore de Causas`, `5 Porquês`, `Plano de Ações`, `Conformidade RIA`) com navegação direta às pendências.
- **Checklist de Conformidade Colapsável**: Critérios já atendidos agrupados por padrão, liberando a primeira dobra visual.

### 4. Árvore de Causas Interativa & Conexões Magnéticas
- **Portas Cardinais no Hover**: 4 portas cardinais (`.node-port`, 15×15px, `#C6E600`) com área de toque de 44×44px (WCAG).
- **Arraste e Conexão em Tempo Real (Drag-to-Connect)**: Linha curva Bézier SVG dinâmica com snapping magnético (+20px).
- **Operadores Lógicos Diretos na Linha (`OU` e `E`)**: Badges textuais de alto contraste no centro da aresta: `OU` em Índigo e `E` em Esmeralda.
- **Biblioteca Flutuante de Elementos (Stencil Dock)**: Barra vertical rápida com chips de toda a taxonomia oficial (ET, CI, H, CC, CR, A, F, FSO, G, R).

### 5. Recurso Analítico "Teste do Portanto" (Therefore Test - v6.36.2)
- Leitura reversa de causalidade para 5 Porquês e Árvore de Causas no Passo 2 (Estudo).
- **Alto Contraste e Acessibilidade (v6.36.2)**: Tipografia branca nítida (`#F8FAFC`, razão > 16:1) e cartões temáticos por nível causal (Causa-Raiz em verde esmeralda, Contribuinte em âmbar, Hipótese em violeta, Imediata em magenta).

### 6. Emissão Oficial do Relatório RIA (FORM-CORP-SMS-088 Rev. 08)
- Emissão completa do relatório no padrão corporativo da Brava Energia, integrando todas as análises para apresentação formal e auditorias.

---

## Estrutura do Repositório

```text
├── FACIU-v6.36.12.html       # Monolito principal em produção (SFA ativo)
├── backups/                  # Histórico preservado e inviolável de todas as versões anteriores
├── docs/
│   ├── PLANO_DE_MANUTENCAO.md# Documento normativo de governança, SemVer e testes
│   ├── adr/                  # Architecture Decision Records (ADRs 0001 a 0005)
│   ├── agentes/              # Documentação de diretrizes e issue tracker
│   └── exemplos/             # Investigações completas de teste e validação (.json)
├── tests/                    # Suíte de testes automatizados ponta a ponta
│   ├── diagnostic_full_audit.js         # Auditoria profunda (38 testes, 100% dos fluxos)
│   ├── test_v6_36_5_help_redesign.js    # Validação do redesign da ajuda e temas (24 testes)
│   ├── test_v6_36_6_ui_fixes.js         # Validação da barra superior sólida e tema
│   └── test_v6_36_7_study_menu.js       # Validação do menu dropdown de ações do estudo
├── scripts/                  # Utilitários permanentes de backup e automação
│   ├── make_backup.py        # Rotina de backup do Passo Zero
│   ├── bump_version.py       # Script de incremento SemVer
│   └── organize_workspace.py # Verificador e organizador da raiz
├── CONTEXT.md                # Contexto de negócio e regras da Brava Energia
├── CHANGELOG.md              # Histórico de versões e alterações detalhadas
├── AGENTS.md                 # Diretrizes para agentes de IA
└── package.json              # Configurações de dependências de teste e scripts npm
```

---

## Execução e Testes

Por ser uma aplicação *Zero-Backend*, o FACIU roda diretamente no navegador:
1. Dê um duplo clique em [`FACIU-v6.36.12.html`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/FACIU-v6.36.12.html) para abrir em qualquer navegador Chromium (Chrome, Edge, Brave, etc.).
2. Para testar com dados de exemplo prontos, importe qualquer arquivo JSON da pasta `docs/exemplos/`.

### Executando Testes Automatizados via Node.js

```bash
# Executa a auditoria completa ponta a ponta (38 testes de integridade, 0 erros)
npm test

# Executa os testes de ciclo de vida, persistência e encerramento de estudo (30 testes)
npm run test:lifecycle

# Executa ambas as suítes completas em sequência
npm run test:all
```
