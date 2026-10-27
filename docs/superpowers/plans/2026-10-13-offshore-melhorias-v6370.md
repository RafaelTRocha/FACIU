# Plano de Implementação: Melhorias Offshore e Correções Críticas (FACIU v6.37.0)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implementar o pacote de melhorias offshore e operacionais aprovadas pelo time de SMS, sanar os bugs do Teste do Portanto e das arestas de ação na árvore, introduzir os seletores de ambiente Onshore/Offshore e severidade potencial, atualizar os defaults regulatórios de vítimas no RIA e reposicionar a barra de ferramentas do Estudo para uma barra contextual dedicada.

**Architecture:** Evolução modular do aplicativo monolítico *Single-File Application* (Zero-Backend) `FACIU-v6.37.0.html`, mantendo conformidade com o padrão FORM-CORP-SMS-088 e ANP SGSO. A implementação divide-se em 8 tarefas atômicas: 1. Preservação mandatória e inicialização da v6.37.0; 2. Correção causal da árvore e do Portanto; 3. Destaque vermelho de pendências na Verificação; 4. Defaults de vítimas/vazamentos em '0' no RIA; 5. Seletor Onshore/Offshore e severidade potencial; 6. Barra contextual de ferramentas do Passo 2; 7. Suíte automatizada Playwright; 8. Documentação e sincronização de CONTEXT.md/CHANGELOG.md.

**Tech Stack:** HTML5, CSS Tailwind/Custom (Design tokens Brava Enterprise), JavaScript Vanilla ES2022, Cytoscape.js, Playwright, Node.js.

**Spec:** Apontamentos e aprovação do time de investigação Offshore RJ / Brava Energia (documentados no chat e na análise do Fable Method). O Item 7 (Conexão do PDF à gestão corporativa de anomalias / Padronização isolada de código de hipóteses) permanece formalmente isolado no backlog para implementação futura.

## Global Constraints
- Proibição inviolável de deletar qualquer arquivo `FACIU-*.html`.
- Preservação da versão `FACIU-v6.36.12.html` em `backups/FACIU-v6.36.12.html` (verificada no Passo Zero).
- Criar a nova versão `FACIU-v6.37.0.html` na raiz do projeto mantendo o paradigma *Single-File Application* (Zero-Backend, sem arquivos externos `.js` ou `.css`).
- Atualizar `APP_VERSION`, `<title>`, `<span class="start-version">`, badges e pills no arquivo.
- Não introduzir dependências externas via npm que exijam build/bundler; todo o código vive no arquivo HTML.
- Garantir 100% de sucesso nos testes automatizados Playwright existentes e nos novos testes da v6.37.0.

## Review Focus
- Teste do Portanto (`buildTreeThereforeChain` e `getAvailableThereforeChains`) reconhece tanto `n.kind === 'contrib'` quanto `n.kind === 'contribuinte'`, além de nós com `n.kind === 'raiz'` ou `root: true`.
- Criação de ações preventivas na árvore não herda o operador booleano `'OU'` do seletor `childGate` e não desenha setas de volta reversas.
- Ao clicar em "Preencher" na aba de Verificação (Passo 4), o campo alvo recebe anel de destaque vermelho pulsante de alta visibilidade (`.correction-target`).
- Novos estudos criados ou inicializados possuem os campos de vítimas do RIA preenchidos com `'0'` por padrão, eliminando falsas pendências.
- A Triagem oferece o seletor `Onshore / ATI / TAG` vs `Offshore`, exibindo os campos de dados marítimos/autoridades apenas no modo Offshore.
- A classificação por matriz suporta a apuração por `Severidade Potencial`, garantindo que o nível da investigação seja `MAX(Real, Potencial)`.
- A barra de ferramentas do Estudo (*Cronologia*, *Árvore*, *Raias*, *Portanto*, *Ações*) é renderizada contextualmente no corpo do Passo 2, liberando o cabeçalho superior.

---

### Task 1: Passo Zero de Preservação e Inicialização da v6.37.0

**Files:**
- Backup verificado: `backups/FACIU-v6.36.12.html`
- Create: `FACIU-v6.37.0.html` (cópia idêntica de `FACIU-v6.36.12.html`)

**Interfaces:**
- Consumes: `FACIU-v6.36.12.html`
- Produces: `FACIU-v6.37.0.html` com versionamento atualizado (`APP_VERSION = '6.37.0'`)

- [x] **Step 1: Confirmar integridade do backup `backups/FACIU-v6.36.12.html`**
  Garantir que a cópia idêntica de 3.056.538 bytes existe na pasta de backups.

- [x] **Step 2: Criar `FACIU-v6.37.0.html` a partir de `FACIU-v6.36.12.html`**
  Copiar o arquivo integralmente para a nova versão na raiz.

- [x] **Step 3: Atualizar strings de versão no novo arquivo**
  - `const APP_VERSION = '6.37.0';`
  - `<title>FACIU v6.37.0 — Ferramenta de Análise de Causas e Investigação Unificada</title>`
  - `<span class="start-version">v6.37.0</span>`
  - Badges de versão no cabeçalho e rodapé da aplicação.

- [x] **Step 4: Verificar integridade sintática da nova versão**
  Executar teste de sintaxe rápida via Node.js para garantir que o arquivo abre sem erros.

---

### Task 2: Correção do Motor Causal (Teste do Portanto & Arestas da Ação)

**Files:**
- Modify: `FACIU-v6.37.0.html` (seções Cytoscape, `addChild`, `buildTreeThereforeChain` e `getAvailableThereforeChains`)

**Interfaces:**
- Consumes: `state.tree.nodes`, `state.tree.edges`
- Produces: Cadeias causais completas no Teste do Portanto e arestas limpas sem `OU` para ações

- [x] **Step 1: Corrigir filtro de causas no `getAvailableThereforeChains()`**
  Atualizar a busca de causas contribuintes para aceitar `n.kind === 'contrib' || n.kind === 'contribuinte'`:
  ```javascript
  const contribNodes = treeNodes.filter(n => (n.kind === 'contrib' || n.kind === 'contribuinte') && n.estado !== 'Descartada');
  const rootNodes = treeNodes.filter(n => (n.kind === 'raiz' || n.root || n.isRoot) && n.estado !== 'Descartada');
  ```

- [x] **Step 2: Aprimorar `buildTreeThereforeChain()` para suporte defensivo de direção de arestas**
  Garantir que a busca de pai suba corretamente pelos nós (`target === curr.id || source === curr.id`) respeitando arestas causais até o Evento Topo (`evt`).

- [x] **Step 3: Sanitizar criação de arestas para Ações em `addChild()` e `createActionForRoot()`**
  Ao adicionar nó de `kind === 'acao'`:
  - Forçar `gate: ''` e `logic: ''`. Ações preventivas nunca herdam valor do seletor `childGate`.
  - No Cytoscape (`styleCy`): adicionar seletor defensivo `{selector:'edge[target = "n_acao"], edge[source = "n_acao"]', style:{'label':''}}` garantindo ausência de tags `OU` ou `E` em arestas conectadas a ações.

- [x] **Step 4: Ajustar geometria de curva para arestas de Ações**
  Garantir que conexões de Causa-Raiz para Ação Preventiva não façam volta reversa (`taxi-direction`), permitindo roteamento suave e limpo.

---

### Task 3: Destaque Vermelho Pulsante nas Pendências da Verificação

**Files:**
- Modify: `FACIU-v6.37.0.html` (CSS de `.correction-target` e lógica de `editValidationItem`)

**Interfaces:**
- Consumes: Disparo do botão "Preencher" / "Editar" na aba Verificação (Passo 4)
- Produces: Efeito visual imediato com anel vermelho pulsante no campo pendente

- [x] **Step 1: Atualizar estilo CSS de `.correction-target`**
  Substituir o halo na cor lima por um anel de foco vermelho corporativo de alta visibilidade:
  ```css
  .correction-target {
    border-color: #EF4444 !important;
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.35) !important;
    background-color: rgba(254, 242, 242, 0.5) !important;
    animation: pulseCorrection 1.8s infinite ease-in-out;
  }
  html[data-theme="dark"] .correction-target {
    border-color: #F87171 !important;
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.45) !important;
    background-color: rgba(69, 10, 10, 0.3) !important;
  }
  @keyframes pulseCorrection {
    0%, 100% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.35); }
    50% { box-shadow: 0 0 0 7px rgba(239, 68, 68, 0.6); }
  }
  ```

- [x] **Step 2: Assegurar aplicação da classe em todos os alvos em `editValidationItem()`**
  Garantir que campos da Triagem, formulário RIA e nós da Árvore recebam a classe `.correction-target` e tenham foco ativado com rolagem suave ao centro da tela (`scrollIntoView({behavior:'smooth', block:'center'})`).

- [x] **Step 3: Adicionar indicador visual de obrigatoriedade nos campos chave**
  Incluir indicador visual sutil (borda sutil e asterisco vermelho) nos campos obrigatórios para orientar o preenchimento preventivo sem bloquear a navegação.

---

### Task 4: Defaults Regulatórios do RIA (Vítimas e Vazamentos em '0')

**Files:**
- Modify: `FACIU-v6.37.0.html` (`riaDefault`, `riaSyncDefaults` e interface da Seção 3 do RIA)

**Interfaces:**
- Consumes: Inicialização de novos estudos e template do formulário RIA
- Produces: Campos de pessoas feridas, fatalidades e vazamentos inicializados em `'0'`

- [x] **Step 1: Atualizar defaults em `riaDefault()`**
  Configurar valores numéricos padrão como `'0'` em vez de string vazia `''`:
  ```javascript
  people: {
    ownInjured: '0',
    ownFatalities: '0',
    contractorInjured: '0',
    contractorFatalities: '0',
    thirdInjured: '0',
    thirdFatalities: '0'
  }
  ```

- [x] **Step 2: Proteger migração e importação em `riaSyncDefaults()`**
  Ao abrir ou sincronizar estudos novos, garantir que campos não informados de vítimas recebam `'0'`, preservando números reais já preenchidos pelo usuário.

- [x] **Step 3: Adicionar botão rápido de zeramento na Seção 3 do RIA**
  Inserir botão de ação rápida: `[✓ Sem Vítimas (Zerar Contadores)]` que preenche instantaneamente os 6 campos com `'0'` sob confirmação visual de toast.

---

### Task 5: Domínio SMS: Seletor Onshore / Offshore e Severidade Potencial

**Files:**
- Modify: `FACIU-v6.37.0.html` (Formulário da Triagem, Matriz de Risco e visualização do RIA)

**Interfaces:**
- Consumes: `state.triagem.ambiente`, `state.triagem.potencial`, matriz de severidade
- Produces: Adaptação contextual do estudo para instalações terrestres ou marítimas e cálculo de severidade por potencial

- [x] **Step 1: Criar seletor Onshore / Offshore no Passo 1 (Triagem)**
  Adicionar grupo de seleção tátil com botões estilizados:
  - `[ 🏭 Onshore / ATI / TAG ]` (`state.triagem.ambiente = 'onshore'`)
  - `[ 🌊 Offshore ]` (`state.triagem.ambiente = 'offshore'`)
  Persistir o estado em `state.triagem.ambiente` (default: `'offshore'`).

- [x] **Step 2: Condicionar campos específicos marítimos no RIA**
  Quando `ambiente === 'offshore'`, exibir com destaque os campos de IMO, POB, coordenadas geográficas e autoridade marítima. Quando `onshore`, recolher esses campos em accordion secundário para evitar poluição visual.

- [x] **Step 3: Suporte ao cálculo por Severidade Potencial na Matriz**
  Na seção de classificação da Triagem, permitir selecionar se o enquadramento do evento é por `Severidade Real` ou `Severidade Potencial`. O nível da investigação e as exigências da comissão assumem `MAX(Nivel_Real, Nivel_Potencial)`.

---

### Task 6: Ergonomia da Barra de Ferramentas do Estudo (Passo 2)

**Files:**
- Modify: `FACIU-v6.37.0.html` (Estrutura HTML do Passo 2 e rotinas de navegação `goStep` e `switchStructureTab`)

**Interfaces:**
- Consumes: Navegação do Passo 2 - Estudo
- Produces: Barra de ferramentas contextual limpa ancorada logo acima da área de trabalho

- [x] **Step 1: Desacoplar `#varA-subtabs` do cabeçalho superior global**
  Remover os botões de ferramentas (*Cronologia*, *Árvore*, *Raias*, *Portanto*, *Ações*) da Linha 2 da barra superior fixa.

- [x] **Step 2: Inserir a Barra de Ferramentas Contextual do Estudo (`#studyContextualToolbar`)**
  Posicionar a barra no topo da área do Passo 2 (`data-view="2"`), diretamente acima das visualizações de conteúdo:
  - Design compacto (altura 36px, fundo sutil com borda inferior, estilo Linear-App).
  - Botões táteis com ícones Lucide para: *Cronologia*, *Árvore de Causas*, *Raias*, *Teste do Portanto*, *Plano de Ações* (e *5 Porquês* quando ativo).
  - Indicador visual claro da ferramenta em uso com badge contrastante.

- [x] **Step 3: Atualizar lógica de sincronização em `switchStructureTab()` e `goStep(2)`**
  Garantir que a alternância entre ferramentas atualize visualmente a nova barra contextual e preserve a renderização das telas filhas sem quebrar o canvas Cytoscape.

---

### Task 7: Suíte de Testes Automatizados E2E (Playwright)

**Files:**
- Create: `tests/test_v6_37_0_offshore_improvements.js`

**Interfaces:**
- Consumes: `FACIU-v6.37.0.html`
- Produces: Relatório automatizado de validação de todos os novos requisitos

- [x] **Step 1: Criar arquivo de teste Playwright**
  Elaborar testes cobrindo:
  1. Boot da versão `6.37.0` sem erros no console.
  2. Execução do Teste do Portanto na árvore carregando causas contribuintes e causas-raiz.
  3. Adição de ação preventiva na árvore confirmando ausência de tags `OU` e curvas invertidas.
  4. Clique no botão de preenchimento na Verificação e checagem do anel vermelho `.correction-target`.
  5. Criação de novo estudo e conferência dos contadores de vítimas iniciando com `'0'`.
  6. Alternância do seletor Onshore/Offshore na Triagem.
  7. Navegação entre ferramentas na nova barra contextual do Passo 2.

- [x] **Step 2: Executar a suíte de testes e assegurar 100% de aprovação**
  Rodar o teste no terminal e corrigir qualquer discrepância até aprovação verde.

- [x] **Step 3: Rodar suítes de regressão**
  Executar testes críticos pré-existentes (`test_v6_36_11_chronology_and_menu.js`, `test_v6_36_9_save_status.js`) garantindo zero regressões.

---

### Task 8: Documentação e Higiene do Repositório

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `CONTEXT.md`
- Modify: `README.md`

**Interfaces:**
- Produces: Documentação técnica sincronizada com a versão v6.37.0

- [x] **Step 1: Atualizar `CHANGELOG.md`**
  Adicionar bloco de notas de versão da `[6.37.0] - 2026-10-13` detalhando as correções causais, melhorias offshore e nova ergonomia de navegação.

- [x] **Step 2: Atualizar `CONTEXT.md`**
  Registrar a nova arquitetura da barra contextual do Passo 2, os seletores Onshore/Offshore e a regra de severidade potencial.

- [x] **Step 3: Atualizar `README.md`**
  Atualizar o indicador de versão ativa para `v6.37.0`.

- [x] **Step 4: Limpeza de artefatos temporários**
  Remover scripts temporários da pasta scratch e verificar que a raiz do projeto permanece limpa.
