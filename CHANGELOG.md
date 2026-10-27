# Changelog - FACIU

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [6.41.3] - 2026-10-21

### Modificado (Equivalência Rigorosa de Bloqueio na Transmissão à Nuvem Corporativa)
- **Bloqueio Obrigatório da Transmissão à Nuvem por Pendências no Estudo**:
  - Alinhada a função `sendRiaToWebhook('envio')` para adotar a mesma trava estrita de bloqueio do botão "Emitir RIA oficial (PDF)".
  - Eliminado o diálogo permissivo que oferecia envio como minuta quando existiam bloqueios. Agora, qualquer tentativa de transmissão oficial de um estudo com pendências bloqueantes é **sumariamente impedida**.
  - O sistema aciona automaticamente a função `showIssues('ria-official')`, direcionando o usuário para o Passo 4 (Verificação) e alertando sobre a quantidade exata de pendências que devem ser saneadas antes de qualquer transmissão.
  - Atualizado o tooltip do botão `#btnSendRiaWebhookFinal` no Passo 5 para indicar claramente o bloqueio ativo enquanto o estudo contiver pendências.
- **Governança & Testes**:
  - Promovido atomicamente para `v6.41.3` via `bun scripts/bump_version.js patch` com backup integral de `backups/FACIU-v6.41.2.html`.
  - Criada a suíte `tests/test_v6_41_3_webhook_blocking_equality.js` com 16 asserções automatizadas cobrindo 100% dos fluxos de bloqueio e autorização.

## [6.41.2] - 2026-10-21

### Corrigido (Presença Permanente do Botão "Emitir RIA oficial (PDF)" na Guia de Emissão)
- **Restauração Permanente do Botão de Emissão Oficial no Passo 5**:
  - Corrigido o fluxo condicional de `renderFinalEmission`: o botão **"Emitir RIA oficial (PDF)"** (`#btnEmitRiaOfficial`) passa a ser **sempre exibido** na tela de Emissão Oficial (Passo 5), mesmo quando o estudo apresentar pendências bloqueantes.
  - Ao ser acionado em um estudo com pendências, ele direciona ativamente o usuário para a lista de itens pendentes no Passo 4 (Verificação) através de `showIssues('ria-official')`, com indicação precisa do quantitativo de bloqueios.
  - Quando o estudo estiver 100% validado, o botão realiza a emissão oficial com registro e geração do PDF homologado.
  - Os botões "Visualizar Minuta na Tela", "Baixar Minuta (PDF)" e "Transmitir para Nuvem Corporativa" continuam coexistindo harmoniosamente no Passo 5.
- **Exportação Global de `window.issue`**:
  - A função `issue(mode)` foi exposta formalmente em `window.issue`, garantindo robustez e execução consistente por qualquer elemento da interface.
- **Governança & Testes**:
  - Promovido atomicamente para `v6.41.2` via `bun scripts/bump_version.js patch` com backup integral de `backups/FACIU-v6.41.1.html`.
  - Criada a suíte de testes `tests/test_v6_41_2_step5_buttons_always_visible.js` com 22 asserções funcionais aprovadas com 100% de sucesso.

## [6.41.1] - 2026-10-21

### Modificado (Exclusividade de Ações na Guia de Emissão e Humanização da Linguagem)
- **Remoção de Ações Críticas da Guia do RIA (Passo 3)**:
  - Os botões "Emitir RIA oficial" e "Enviar via Webhook" foram completamente removidos da barra de ações da tela de Preparação do RIA (`.ria-actions`).
  - A guia do RIA passa a exibir exclusivamente ações voltadas à conferência e prévia: `Exportar JSON`, `Copiar JSON`, `Visualizar minuta` e `Baixar minuta`.
  - Ajustada a função `decorateRia()` para não transformar `data-ria-action="print"` em "Emitir RIA oficial" nem injetar botões redundantes na guia de preparação.
- **Exclusividade das Ações Finais na Guia de Emissão (Passo 5)**:
  - A tela de encerramento (`renderFinalEmission`) concentra com exclusividade os botões oficiais:
    - **"Emitir RIA oficial (PDF)"** (disponível quando o estudo não possui pendências bloqueantes).
    - **"Transmitir para Nuvem Corporativa"** (`#btnSendRiaWebhookFinal`), transmitindo os dados canônicos e o documento HTML renderizado.
- **Humanização dos Termos Operacionais (Eliminação do jargão técnico "Webhook")**:
  - Aba de configurações atualizada de `Integrações / Webhook` para **`Integração com a Nuvem`** (`#tabBtnCfgWebhook`).
  - Badges de status atualizados para **`Nuvem: Pendente`** e **`Nuvem: Transmitido em DD/MM/AAAA às HH:mm`**.
  - Rótulos de campos atualizados para **"Endereço de Conexão com a Nuvem (Endpoint Corporativo)"** e **"Chave de Acesso / Token de Segurança"**.
  - Ações no modal humanizadas para **"Testar Conectividade"**, **"Consultar Status na Nuvem"** e **"Salvar Parâmetros"**.
  - Mensagens de diálogo e toasts atualizados com vocabulário corporativo de transmissão em nuvem.
- **Governança & Testes**:
  - Promovido atomicamente para `v6.41.1` via `bun scripts/bump_version.js patch` com backup integral de `backups/FACIU-v6.41.0.html`.
  - Criada a suíte `tests/test_v6_41_1_emission_exclusivity_and_humanized_terms.js` com 21 asserções funcionais (100% de aprovação).

## [6.41.0] - 2026-10-21

### Adicionado (Comissão com E-mail Obrigatório, ID do RIA via CII e Integração Webhook Completa)
- **E-mail Corporativo Obrigatório na Comissão de Investigação**:
  - Campo `E-mail corporativo *` (`#m_email`) adicionado ao formulário de inclusão de integrante (`#commissionFormPanel`).
  - Validação estrita na função `addMember()`: impede cadastro sem e-mail ou com formato inválido, exibindo feedback e destaque visual no campo.
  - O e-mail é persistido no objeto do membro (`member.email`) e gravado no JSON canônico (`dados_canonicos.investigacao.comissao[].email`).
  - **Isolamento de Privacidade no RIA FORM-CORP-SMS-088**: O e-mail permanece estritamente restrito aos dados eletrônicos e não é exibido na tabela oficial de impressão/PDF (`riaMemberRows` e `commissionSummary`), preservando a conformidade com o layout normativo.
- **Geração e Sincronização Automática do ID do RIA pelo CII**:
  - Implementada a função `generateRiaIdFromCii()`, convertendo automaticamente identificadores do tipo `CII-080-2026-MACAU` para o padrão `RIA-CII-080-2026-MACAU`.
  - Tratamento de idempotência: previne duplicações de prefixo caso o usuário já tenha inserido `RIA-`.
  - Sincronização reativa em tempo real durante a triagem (`syncTriage()` / `onTriage()`) e na importação de arquivo `.html` do CII.
  - Adicionado botão de ação rápida "Gerar via CII" (`syncRiaIdFromCii(true)`) na seção de Dados Iniciais do módulo RIA.
- **Transmissão Automatizada via Webhook com Envelopes de Ação**:
  - Função `buildWebhookPayload(tipoRequisicao)` gerando o pacote com identificação, timestamp, dados canônicos e documento HTML standalone completo.
  - Suporte a 3 tipos de requisição:
    - `'teste'`: verificação e ping de conectividade.
    - `'envio'`: transmissão do estudo finalizado com HTML e JSON estruturado.
    - `'consulta'`: consulta de status e resposta do endpoint.
  - Função `buildRiaStandaloneHtml()` compilando as páginas do RIA com folha de estilos CSS completa e autocontida para visualização em sistemas externos.
- **Central de Configurações de Webhook e Rastreabilidade Local**:
  - Adicionada a aba `Integrações / Webhook` (`#tabBtnCfgWebhook`) na Central de Configurações (`#aiConfigModal`).
  - Campos para URL do endpoint e token/header de autorização com persistência em `localStorage`.
  - Botão "Testar Conexão (Ping)" com medição de latência em milissegundos e exibição de resposta HTTP.
  - Botão de envio oficial no cabeçalho do RIA (`#btnSendRiaWebhook`) e na tela de encerramento (`#btnSendRiaWebhookFinal`).
  - **Rastreabilidade de Envio**: Ao transmitir com sucesso, registra `state.webhookDelivery` com data formatada, URL e status HTTP, atualizando o badge visual `#riaWebhookStatusBadge` para `🟢 Webhook: Enviado` (com data e ID do RIA).
- **Governança & Testes**:
  - Promovido atomicamente para `v6.41.0` via `bun scripts/bump_version.js minor` com backup integral em `backups/FACIU-v6.40.16.html`.
  - Criada a suíte `tests/test_v6_41_0_webhook_and_commission.js` com 40 asserções automatizadas cobrindo 100% dos requisitos.

## [6.40.15] - 2026-10-21

### Corrigido (Resiliência de Runtime, Eliminação de Erros de Console e Integridade de Escopo)
- **Proteção Total de `localStorage` contra `SecurityError` (Opaque Origins)**:
  - Encapsuladas todas as leituras e gravações de `localStorage` em blocos defensivos `try/catch` no tema (`brava_theme`), inspetor da árvore (`faciu_tree_inspector_minimized`), visibilidade da barra lateral (`faciu_auto_hide_sidebar`) e módulo de ajuda integrada.
  - Elimina a quebra catastrófica de runtime em origens restritas (`file://`, iframes corporativos e navegação anônima), prevenindo a falha em cascata `Cannot access 'COMMISSION_RULE_LABELS' before initialization`.
- **Resiliência em `initSortables()`**:
  - Implementada verificação defensiva de nulidade e checagem de método (`typeof s.destroy === 'function'`) com `try/catch` ao limpar instâncias do Sortable.
  - Previne a exceção `TypeError: undefined is not an object (evaluating 's.destroy')` ao alternar para a aba de Raias no Passo 2.
- **Compatibilidade Histórica do Campo de Qualificação da Comissão (`qual`)**:
  - Alinhada a função `addMember()` para preencher `qual = 'Atende'` ou `'Não atende'` com base no checkbox semântico `#m_rcaQualified`, restaurando a compatibilidade retrospectiva com estudos legados sem depender do input órfão `#m_qual`.
- **Interoperabilidade Global de `renderFinalEmission`**:
  - Exposta a função `renderFinalEmission` explicitamente em `window.renderFinalEmission` e sincronizado `window.goStep` no gerador do RIA, assegurando renderização correta do painel de emissão (Passo 5).
- **Defensividade em `syncTriage()`**:
  - Adicionada guard-clause `state.triagem = state.triagem || {}` prevenindo falhas de atribuição caso o estado seja lido antes da inicialização completa.
- **Unificação de Fechamento da Central de Ajuda**:
  - A função `closeHelp()` agora gerencia o fechamento unificado tanto do modal legado quanto do overlay `#appHelpOverlay` ativo, limpando a classe `app-help-page-open`.
- **Governança & Testes**:
  - Promovido atomicamente para `v6.40.15` via `bun scripts/bump_version.js patch` com backup integral de `backups/FACIU-v6.40.14.html`.
  - Criada a suíte `tests/test_v6_40_15_code_review_and_console_fixes.js` com 23 asserções funcionais (100% de aprovação).

## [6.40.14] - 2026-10-21

### Aprimorado (Opções N/A em Consequências e Desobrigação Causal na Cronologia)
- **Desobrigação de Vínculo Causal na Cronologia**:
  - A validação de fatos da cronologia sem nó causal associado (`linkedNodeId`) e sem marco contextual (`contextual`) foi alterada de bloqueante (`severity: 'blocking'`) para alerta/recomendação (`severity: 'warning'`).
  - Fatos informativos ou operacionais na cronologia agora podem ser registrados livremente sem exigir artificialmente um nó causal ou bloquear a emissão oficial do RIA.
  - Atualizada a dica de orientação do campo `chr_node` esclarecendo o comportamento de alerta não bloqueante.
- **Opção N/A em Continuidade Operacional**:
  - Incluída a opção `N/A` (`['na','N/A']`) no campo "Continuidade operacional" (seção 3 do RIA - Consequências), atendendo aos casos de eventos com danos restritos à saúde humana onde a métrica operacional não se aplica.
  - Mapeado no modelo do relatório oficial (`cont = 'na'`), impresso na tabela do RIA HTML e no gerador vetorial de PDF com peso de severidade zero.
- **Opção N/A em Situação da Liberação**:
  - Incluída a opção `N/A` (`['na','N/A']`) no campo "Situação" do bloco de Situação da liberação (seção 3 do RIA).
  - Mantidas as datas de interrupção e previsão como opcionais e compatíveis tanto no modelo, quanto no RIA oficial e exportador de dados.
- **Governança & Testes**:
  - Promovido atomicamente para `v6.40.14` via `bun scripts/bump_version.js patch` com backup integral de `backups/FACIU-v6.40.13.html`.
  - Criada a suíte `tests/test_v6_40_14_na_options_and_chronology_warning.js` com 21 asserções funcionais (100% de aprovação).

## [6.40.13] - 2026-10-19

### Corrigido (Tratativas de Erros, Exceções e Consistência de Regras na Comissão)
- **Correção da Regra de Quase Acidente**:
  - Eliminado o falso positivo onde estudos sem classificação (`finalSeverity = null`) eram rotulados como Quase Acidente devido à coerção `Number(null) === 0`. Agora valida explicitamente se a severidade real foi calculada.
- **Interatividade Segura de Tags da Comissão**:
  - Tags de requisitos já atendidos (`is-met`) deixam de ser clicáveis (`cursor-default`), prevenindo aberturas acidentais de formulário pré-configurado fadadas a rejeição por duplicidade.
  - Tags com pendência agora utilizam elementos semânticos `<button type="button">`, garantindo navegabilidade nativa por teclado e leitores de tela.
  - Restaurada a referência normativa (`r.ref`, ex: `[Item 6.4, Tabela 1, pág. 22]`) no atributo `title` do tooltip.
- **Tratativa para Representante de Contratada**:
  - Validação estrita impedindo que representantes de empresas terceiras sejam gravados com empresa vazia ou sob fallback "Brava Energia". O formulário agora emite alerta explicativo e foca diretamente no campo da empresa.
- **Prevenção de Falsos Coordenadores e Gestores**:
  - Substituída a regex permissiva `/Coordenador/` por igualdade estrita de papel na comissão, impedindo que cargos livres (ex: "Coordenador de Operações") sejam classificados indevidamente como Coordenador da Comissão.
  - Alerta de duplicidade de Gestor e Coordenador aprimorado com o nome do titular já declarado.
- **UX e Gerenciamento de Estado do Formulário**:
  - Centralizado o reset do formulário em `resetCommissionForm()`, garantindo restauração consistente de placeholders e checkboxes tanto ao salvar quanto ao cancelar/fechar.
  - Ao alternar entre tags de requisitos pendentes, nome e cargo digitados pelo usuário são preservados.
  - Sincronização bidirecional em `syncCommissionRoleFlags`: desmarcar Gestor no dropdown desmarca automaticamente o checkbox `#m_manager`.
  - Corrigido conflito de temporizadores no foco, garantindo animação de rolagem suave sem interrupção.
- **Governança & Testes**:
  - Promovido atomicamente para `v6.40.13` via `bun scripts/bump_version.js patch` com backup de `backups/FACIU-v6.40.12.html`.
  - Criada suíte `tests/test_v6_40_13_commission_error_handling.js` com 26 asserções (100% aprovada).

## [6.40.12] - 2026-10-16

### Aprimorado (Abertura com Pré-Preenchimento Inteligente ao Clicar nas Tags da Comissão)
- **Pré-Preenchimento Automático por Requisito Selecionado**:
  - Implementada a função `openCommissionFormFor(reqId)`, acionada ao clicar em qualquer tag de requisito da comissão (`.commission-tag`).
  - O formulário "Novo integrante" abre automaticamente com a rolagem suave direcionada e os campos pré-configurados para a função clicada:
    - **Tag Gestor**: Seleciona automaticamente `"Gestor da investigação"` no campo Função, marca o checkbox de Gestor e sugere o cargo esperado para o nível do evento no placeholder (ex.: Supervisor para Nível 1, Gerente de Polo/Operações para Nível 2, Gerente Executivo para Nível 3).
    - **Tag Coordenador**: Seleciona automaticamente `"Coordenador da investigação"` e marca o checkbox correspondente.
    - **Tag Repr. Área**: Marca o checkbox de representação da área do incidente.
    - **Tag Conhec. Técnico**: Marca o checkbox de conhecimento da atividade/processo.
    - **Tag Qualificação RCA**: Marca o checkbox de qualificação técnica em causa-raiz.
    - **Tag CIPA/CIPLAT**: Marca o checkbox de CIPA/CIPLAT.
    - **Tag Contratada**: Marca o checkbox de empresa contratada e limpa o campo empresa com placeholder convidando à digitação da contratada.
  - Foco de teclado direcionado automaticamente para o campo `#m_nome`.
- **Governança & Preservação**:
  - Promovido atomicamente para `v6.40.12` via `bun scripts/bump_version.js patch` com backup de `backups/FACIU-v6.40.11.html`.
  - Criada suíte de testes `tests/test_v6_40_12_commission_tag_prefill.js` com 19 asserções (100% aprovada).

## [6.40.11] - 2026-10-16

### Aprimorado (Tags de Requisitos da Comissão — Eliminação de Redundância & Anti-AI Slop)
- **Eliminação Total da Redundância e Duplicação Visual na Comissão de Investigação**:
  - **Tags Diretas de Status Operacional (`.commission-tags-grid` / `.commission-tag`)**: Substituído o bloco de cards empilhados repetidos por uma grade compacta de 8 tags de status instantâneas e escaneáveis (`[✕ Gestor: Pendente]`, `[✕ Coordenador: Pendente]`, `[✕ Mínimo: 0 de 3]`, etc.).
  - **Eliminação de Vícios de AI Slop**:
    - Removida a cascata de 7 botões idênticos "Corrigir" que abriam o mesmo formulário; agora as próprias tags com pendência possuem clique direto (`cursor: pointer`) para acionar o formulário de integrantes.
    - Removida a repetição cega da referência normativa ("Item 6.4, Tabela 1, pág. 22" repetida 16 vezes).
    - Removida a duplicação onde os requisitos eram listados duas vezes inteiras na mesma tela (uma lista de pendências acima e outra lista completa de requisitos logo abaixo).
  - **Tabela Técnica de Consulta Opcional**: A lista de requisitos detalhada agora reside sob `<details>` colapsado como uma tabela técnica limpa de 4 colunas (`Requisito | Exigência Normativa | Referência | Status`) para auditoria sob demanda.
- **Governança & Preservação**:
  - Promovido atomicamente para `v6.40.11` via `bun scripts/bump_version.js patch` com backup íntegro de `backups/FACIU-v6.40.10.html` preservado.
  - Criada suíte de testes `tests/test_v6_40_11_commission_tags_anti_slop.js` com 19 asserções (100% aprovada).

## [6.40.10] - 2026-10-16

### Aprimorado (Minimalismo Técnico Suíço & Precisão Visual Industrial - Anti-AI Slop)
- **Implementação do Minimalismo Técnico Suíço sem Alteração de Elementos, Itens ou Posições**:
  - **Tipografia Técnica e Numerais Tabulares**: Ativação global de `font-variant-numeric: tabular-nums` e `font-feature-settings: "tnum" 1` para contadores, KPIs, códigos de nós, tabelas de risco e steps operacionais, eliminando oscilações visuais de números.
  - **Eliminação de Vícios de SaaS Genérico (Anti-AI Slop)**:
    - Removidas sombras difusas infladas em cartões, raias, KPIs e modais em favor de divisores de 1px nítidos com alto contraste funcional (`border: 1px solid var(--line)`).
    - Substituídos raios de borda inflados (`10px`, `12px`, `14px` e `999px` estilo pílula) por escala de precisão modular técnica: `--radius-sm: 2px` e `--radius-md: 4px`.
    - Badges de status operacionais (`.field-status`, `.why-status`, `.commission-tags`, chips) transformadas em etiquetas instrumentais retangulares com cantos de precisão (`2px`).
    - Step numbers convertidos em crachás industriais de identificação quadrada (`var(--radius-sm)`).
  - **Superfícies Sólidas e Puristas**:
    - Substituídos gradientes decorativos na barra de marca e barras de navegação por azul-marinho técnico sólido (`var(--navy)`).
    - Estados de foco e seleção refinados com realce cirúrgico de alto contraste sem espalhamento de blur.
  - **Preservação Contratual Total**:
    - 100% dos elementos HTML, identificadores (`#cy`, `#stepperNav`, `#raias`, `#nodeModal`, `#modalThereforeTest`, `#faciuRiaModule`), fluxos e posições de layout preservados.
- **Governança & Preservação**:
  - Promovido atomicamente para `v6.40.10` via `bun scripts/bump_version.js patch` com backup íntegro de `backups/FACIU-v6.40.9.html` preservado.
  - Criada suíte de testes `tests/test_v6_40_10_swiss_technical_minimalism.js` com 27 asserções (100% aprovada; 92 testes automatizados passando no total).

## [6.40.9] - 2026-10-16

### Aprimorado (Cartões de Nós Causal Estruturados com Barra Superior, Cabeçalho e Tipografia Alinhada - Padrão CAD/Miro)
- **Estrutura de Cartão Profissional para Nós da Árvore de Causas (Fiel à Referência Visual)**:
  - Implementado gerador dinâmico de SVG vetorial (`generateNodeSvg`) embutido via data URI de alta performance em cada nó do Cytoscape.
  - **Barra de Destaque Superior (Top Accent Stripe)**: Faixa colorida superior de 3.5px com cantos arredondados perfeitamente recortados via `<clipPath>`, refletindo a cor técnica do tipo de bloco (ex.: Navy para Evento Topo, Teal para Falha de Projeto, Azul Royal para Fatores Humanos, Esmeralda para Causa-Raiz).
  - **Linha de Cabeçalho Estruturada**:
    - *Esquerda*: Código do nó com preenchimento em dois dígitos (`[ET-01]`, `[CI-01]`, `[FP-01]`, `[FH-01]`, `[FS-01]`, etc.) em tipografia tabular monoespacada negrito e cor correspondente à categoria.
    - *Direita*: Rótulo do tipo de bloco em caixa alta sóbrio (`EVENTO TOPO`, `FALHA DE PROJETO`, `FATORES HUMANOS`, `CAUSA-RAIZ`, etc.) alinhado à direita em cinza neutro (`#64748B`).
  - **Corpo do Cartão (Texto / Evidência)**:
    - Texto principal alinhado à esquerda com tipografia em peso 700 (negrito), entrelinha de 15px e quebra de linha inteligente por palavras em até 3 linhas (`<tspan>`).
  - **Rodapé e Indicadores de Estado Integrados**:
    - Marcadores de estado (`✓ Confirmada`, `◌ Em análise`, `✕ Descartada`) e contador `5P × N` inseridos discretamente no rodapé do cartão sem poluir o canvas.
  - **Dimensões e Proporções Calibradas**:
    - Largura adaptativa suave entre 210px e 270px e altura dinâmica entre 66px e 88px, garantindo respiração e eliminando caixas deformadas.
  - **Compatibilidade com Modo Claro e Escuro**:
    - Cartões brancos com borda `#CBD5E1` no modo claro e superfície sólida `#1E293B` com borda `#334155` no modo escuro, com atualização em tempo real ao alternar o tema.
- **Governança & Preservação**:
  - Promovido atomicamente para `v6.40.9` com backup de `backups/FACIU-v6.40.8.html` preservado.
  - Criada suíte de testes `tests/test_v6_40_9_svg_card_nodes.js` com 18 asserções (100% aprovada; 83 testes no total da suíte completa).

## [6.40.8] - 2026-10-16

### Aprimorado (Visual Profissional e Minimalismo Técnico na Árvore de Causas - Anti-AI Slop)
- **Eliminação do "AI Visual Slop" e Realces Neon no Canvas Causal**:
  - Removido o brilho fluorescente/neon `#d0f50d` de seleção e hover nos blocos (`node:selected`, `node.target-hover`, `edge:selected`).
  - Implementado sistema de seleção e foco técnico de alta precisão em azul cobalto industrial (`#2563EB`) com overlay sóbrio de 12% de opacidade e borda de 2.5px.
  - Portas interativas de arraste (`.node-port`) e linhas de arraste (`.drag-line`) convertidas de verde-limão e roxo genérico para azul técnico de engenharia (`#2563EB`) com anel de contraste branco e foco suave.
- **Paleta Industrial de Alta Legibilidade (KIND e KIND_DARK)**:
  - Preservado 100% do posicionamento relativo e lógica hierárquica dos nós causais (sem alteração de layout).
  - *Evento Topo (ET)*: Navy escuro de comando (`#1E293B`, texto branco `#FFFFFF`, borda `#0F172A`).
  - *Causa Imediata (CI)*: Superfície nítida de alto contraste (`#FFFFFF`, texto grafite `#0F172A`, borda `#94A3B8`).
  - *Hipóteses (H)*: Azul técnico de engenharia (`#F0F9FF`, texto `#0369A1`, borda `#7DD3FC`).
  - *Falha de Projeto (FP)*: Teal técnico de processo (`#F0FDFA`, texto `#0F766E`, borda `#5EEAD4`), diferenciado visualmente de fatores humanos.
  - *Fatores Humanos (FH)*: Azul ardósia corporativo (`#EFF6FF`, texto `#1D4ED8`, borda `#93C5FD`).
  - *Subfatores (FS)*: Índigo analítico (`#F5F3FF`, texto `#4338CA`, borda `#C7D2FE`).
  - *Causa Contribuinte (CC)*: Âmbar/areia discreto (`#FFFBEB`, texto `#92400E`, borda `#FCD34D`).
  - *Causa-Raiz (CR)*: Esmeralda de processo (`#ECFDF5`, texto `#065F46`, borda `#34D399` com 2.5px).
  - *Portas Lógicas (E / OU)*: Badges compactos com tipografia monoespacada nítida (`#059669` para E; `#2563EB` para OU).
- **Refinamento do Inspector Flutuante, Stencil Dock e Toolbar**:
  - *Stencil Dock ("BLOCOS")*: Superfície plana sólida com cantos técnicos de 8px, botões retangulares funcionais de 4px com tipografia tabular monoespacada e micro-interação precisa de 1px de elevação.
  - *Inspector Lateral*: Cabeçalho reestruturado com fundo `#F8FAFC`, tag de bloco monoespacada, inputs e textareas com anéis de foco limpos e contadores numéricos tabulares.
  - *Editor de Ramificação dos Filhos*: Cartão integrado de 6px com cabeçalho em caixa alta sóbrio, seletor de forma de ligação com altura calibrada e botão de aplicação em destaque navy (`#1E293B`).
  - *Barra de Controles do Canvas*: Superfície plana com cantos de 6px, botões neutros de 28x28px e divisores verticais de 1px.
  - *Grade de Fundo (Canvas Grid)*: Padrão milimetrado com micro-pontos em ardósia técnica (`rgba(15,23,42,0.07)` a cada 20px) sobre fundo `#FAFAFA`, eliminando o aspecto de tela vazia.
  - *Legenda de Estados*: Pílulas redondas infantis substituídas por tags retangulares funcionais com cantos de 4px e contraste WCAG AA.
- **Governança & Preservação**:
  - Passo Zero executado atômica e estritamente com `npm run bump:patch` promovendo o sistema para `v6.40.8` e preservando `backups/FACIU-v6.40.7.html`.
  - Criada suíte automatizada `tests/test_v6_40_8_tree_professional_visual.js` com 29 asserções cobrindo integridade de versão, paleta de cores, eliminação de neon e componentes de UI (100% de aprovação).

## [6.40.7] - 2026-10-16

### Adicionado & Aprimorado (Itens Obrigatórios de Emissão do RIA: Barreiras Canônicas, Estudo de Risco e Número do Relatório)
- **Sistemas de Proteção / Intertravamentos Canônicos (Tabela 4.2 do RIA)**:
  - Implementada lista canônica com os 5 sistemas mandatórios da Brava Energia:
    1. *Intertravamento por nível alto*
    2. *Intertravamento por presença de H2S*
    3. *Intertravamento por gás inflamável*
    4. *Intertravamento por presença de fogo*
    5. *Padrões Brava Energia*
  - Os 5 sistemas são pré-carregados na Tabela 4.2 do RIA com nome em destaque e campo de avaliação em branco para preenchimento.
  - A remoção acidental dos itens canônicos foi bloqueada na interface, permitindo remoção exclusivamente para sistemas adicionais personalizados.
  - O motor de validação (`validationItems`) agora bloqueia a emissão oficial se qualquer um dos 5 sistemas estiver sem avaliação definida.
  - Se a avaliação for *"Existia e não funcionou"* ou *"Não existia, mas teria ajudado"*, o preenchimento do campo *"Por quê?"* torna-se formalmente bloqueante.
- **Estudo de Risco (Seção 6 do RIA)**:
  - O campo **Instalação ou Poço** (`riskStudy.asset`) herda automaticamente a instalação/local da Triagem (ex.: *"Polo Macau"* / *"Macau"*) e sua presença é validada como obrigatória.
  - A seleção da **Necessidade de revisão do Estudo de Risco** (`riskStudy.reviewRequired`: *"Sim"* ou *"Não"*) passa a ser obrigatória para emissão oficial.
  - O campo **Justificativa técnica** (`riskStudy.technicalJustification`) torna-se obrigatório (bloqueante) tanto para decisões afirmativas quanto negativas.
  - Inseridos marcadores visuais de obrigatoriedade (`*`) nos campos correspondentes na aba de encerramento do RIA.
- **Identificação Documental**:
  - O campo **Número do RIA** (`control.reportNumber`) foi integrado ao motor de validação (`ria.reportNumber`) como bloqueante para emissão oficial do PDF.
- **Roteamento de Correção Direta**:
  - Ajustado `editValidationItem()` para direcionar os botões de ação ("Avaliar", "Justificar", "Preencher") diretamente para as abas corretas do Passo 3: Dados Iniciais (`control.`), Investigação (`protectionSystems`) e Encerramento (`riskStudy.`).
- **Governança & Preservação**:
  - Cumprido o Passo Zero: versão promovida de forma atômica para `v6.40.7` com backup íntegro de `backups/FACIU-v6.40.6.html`.
  - Criada suíte automatizada de testes `tests/test_v6_40_7_ria_required_fields.js` com 36 asserções cobrindo integridade de versão, pré-carga canônica, herança de campos e regras de validação bloqueantes (100% de aprovação).

## [6.40.6] - 2026-10-16

### Aprimorado (Refino Visual Cirúrgico, Alinhamento Ótico de Ícones e Higienização de Notificações)
- **Refino Cirúrgico In-Place dos Elementos Existentes (Sem Perda de Identidade)**:
  - Preservada 100% da disposição visual, estrutura de cartões e fluxos que já haviam sido apresentados aos usuários e comissões da Brava Energia.
  - Calibração de contraste de bordas nos tokens CSS (`--line: #cbd5e1;` no modo claro; `--line: #2e384d;` no modo escuro), garantindo limites nítidos em monitores de campo e ambientes com reflexo.
  - Harmonização sutil das superfícies do tema escuro (`--card: #15112e; --surface: #15112e; --surface2: #1c173d;`), unificando o visual entre variáveis nativas e classes utilitárias sem alterar a paleta Brava Navy.
  - Foco nos inputs refinado com borda sóbria em azul-marinho e glow suave no modo claro, e realce limpo com verde-limão Brava no modo escuro.
- **Alinhamento Ótico de Ícones Lucide**:
  - Padronização com regra CSS global (`[data-lucide], svg.lucide`) para garantir alinhamento vertical rigoroso com os textos adjacentes e evitar distorções de proporção (`flex-shrink: 0; vertical-align: middle;`).
- **Higienização de Notificações (Toasts)**:
  - Ajustada a função `toast(m)` para desobstruir automaticamente notificações anteriores, eliminando o acúmulo de caixas sobrepostas no canto inferior direito durante alternâncias de tema ou salvamentos frequentes.
- **Governança & Preservação**:
  - Cumprido o Passo Zero: versão promovida de forma atômica para `v6.40.6` com backup íntegro de `backups/FACIU-v6.40.5.html`.
  - Criada suíte automatizada de testes `tests/test_v6_40_6_visual_polish.js` com 27 asserções cobrindo integridade de versão, stacking context, tokens refinados e higienização de toasts (100% de aprovação).

## [6.40.5] - 2026-10-16

### Adicionado & Aprimorado (Substâncias Liberadas Canônicas e Exportação JSON FORM-CORP-SMS-088 Rev. 08)
- **Grade Canônica de Substâncias Liberadas (Item 3 do RIA)**:
  - Substituída a lista genérica de preenchimento livre por uma grade canônica com os 6 tipos normativos exigidos pela ANP e pela Brava Energia no FORM-CORP-SMS-088 Rev. 08 (*Petróleo bruto, Água oleosa, Emulsão oleosa, Óleo diesel, Óleo hidráulico, Fluido de perfuração*) mais o campo *Outro* com descrição personalizada.
  - Cada item possui checkbox de marcação e campo numérico em metros cúbicos (`m³`), ativado quando selecionado.
  - Sincronização bidirecional em tempo real com `state.ria.consequences.releases` garantindo retrocompatibilidade total com a geração do PDF, da minuta impressa e de estudos legados.
- **Módulo de Exportação Canônica do RIA em JSON (FORM-088 Rev. 08)**:
  - Implementada a função `buildRiaCanonicalRev08Json()` que compila as 12 seções da investigação no formato estruturado idêntico ao schema oficial da Revisão 08 da Brava Energia.
  - Adicionados botões na barra de ações do RIA:
    - **Exportar JSON FORM-088**: realiza o download direto do arquivo `RIA_{numero}_FORM-088_Rev08.json`.
    - **Copiar JSON**: copia o JSON canônico formatado para a área de transferência com feedback visual via `toast`, pronto para integração com Power Automate, APIs ou LLMs corporativos.
  - Funções exportadas globalmente em `window` e `window.faciuRia`.
- **Governança & Preservação**:
  - Cumprido o Passo Zero: versão promovida de forma atômica para `v6.40.5` com backup íntegro de `backups/FACIU-v6.40.4.html`.
  - Criada suíte automatizada de testes `tests/test_v6_40_5_ria_improvements.js` com 49 asserções cobrindo integridade de versão, manipulação de substâncias canônicas, schema do JSON Rev. 08 e regressão de camadas (100% de aprovação).

## [6.40.4] - 2026-10-15

### Corrigido (Hierarquia de Camadas Z-Index e Resolução de Sobreposição no Menu de Estudo)
- **Correção da Sobreposição do Menu Suspenso de Ações do Estudo (#studyMenuDropdown)**:
  - Identificado conflito de contexto de empilhamento (*stacking context*) entre a Barra 1 (cabeçalho superior) e a Barra 2 (`#faciu-nav-row2`, stepper e integridade): ambas utilizavam a classe `z-30`. Como a Barra 2 sucede a Barra 1 na árvore DOM, ela era renderizada à frente da Barra 1, fazendo com que o widget de Integridade Global (`#topbarIntegrityContainer`) cobrisse o cabeçalho e os primeiros itens do menu suspenso de ações do estudo.
  - Ajustada a Barra 2 (`#faciu-nav-row2`) para `z-20` (em classe HTML e com regra CSS defensiva), mantendo a Barra 1 em `z-30`.
  - Como `30 > 20`, a Barra 1 agora projeta todos os seus menus suspensos (`#studyMenuDropdown`, `#helpDropdown`, `#folderMonitorDropdown`) estritamente à frente da Barra 2 e de qualquer componente nela contido.
  - Mantida a hierarquia global: modais corporativos em `z-[20000]` > Barra de navegação em `z-40` (Barra 1 em `z-30` > Barra 2 em `z-20`) > conteúdo padrão da página.
- **Preservação e Governança**:
  - Cumprido o Passo Zero e as diretrizes de monólito SFA: versão promovida de forma atômica para `v6.40.4` com backup íntegro de `backups/FACIU-v6.40.3.html`.
  - Criada suíte automatizada de testes `tests/test_v6_40_4_study_menu_zindex.js` com 39 asserções cobrindo integridade de versão, stacking context e funcionalidade do menu (100% de sucesso).

## [6.40.3] - 2026-10-15

### Adicionado & Aprimorado (Central de Configurações, Modo Offshore/Onshore & Heurística de Importação do CII)
- **Central de Configurações do Sistema Unificada**:
  - Modal de configurações (`#aiConfigModal`) remodelado com navegação por abas:
    - **Aba 1 (Ambiente Operacional)**: Seleção visual entre *Onshore / ATI / TAG* e *Offshore (Marítimo / Plataforma)*, com cards descritivos, indicadores de seleção e status do ambiente ativo no estudo.
    - **Aba 2 (Diretrizes Copilot / IA)**: Diretrizes corporativas e prompts parametrizáveis para o Microsoft Copilot (100% offline, zero API).
  - Implementada função `openSystemSettings(initialTab)` e função de alternância `switchSettingsTab(tabName)`.
  - Mantida compatibilidade retroativa integral para chamadas à função `window.configurarIA()`.
- **Limpeza e Desacoplamento da View 1 (Triagem)**:
  - Removido o bloco de seleção de ambiente operacional de dentro do card "Metodologia da Investigação" na tela de Triagem, deixando a Triagem focada exclusivamente na metodologia causal (Árvore de Causa vs 5 Porquês).
- **Indicadores Visuais Globais de Ambiente (Badges no Cabeçalho)**:
  - Adicionado badge operacional no cabeçalho da tela inicial (`#startAmbienceBadge`) e no topbar de navegação da investigação (`#topbarAmbienceBadge`).
  - Badges exibem ícone e nome do ambiente ativo (`🏭 Onshore` ou `⚓ Offshore`) e atuam como atalho clicável para abrir diretamente a aba de Ambiente Operacional nas Configurações.
- **Detecção Inteligente e Seleção no Comunicado Inicial (CII)**:
  - Criada função heurística `detectCiiEnvironment(parsed)` que analisa campos de instalação, polo, local e descrição técnica do CII em busca de termos marítimos (FPSO, plataforma, marítimo, bacia de campos/santos, flotitel, embarcação, etc.) ou terrestres (estações, refinarias, polos terrestres).
  - Adicionada seção de confirmação do Ambiente Operacional no modal de pré-visualização do CII (`showCiiPreviewModal`), já pré-selecionando a opção sugerida pela heurística e permitindo alternância pelo usuário antes da confirmação.
  - `confirmCiiImport()` e `applyCiiParsedData()` agora aplicam o ambiente operacional selecionado diretamente ao estudo.
- **Governança de Estado e Compatibilidade**:
  - `novoEstado()` passa a inicializar estudos em branco por padrão como `ambiente: 'onshore'`.
  - Fallback seguro em `hydrateTriage()` e rotinas de carregamento para garantir retrocompatibilidade com arquivos `.faciu` anteriores.

## [6.40.2] - 2026-10-15

### Corrigido & Aprimorado (Conformidade com FORM-CORP-SMS-087 Rev. 08 & PG-CORP-SMS-015 Rev. 09)
- **Tabela 1 do PG-CORP-SMS-015 (Comissão Investigadora)**:
  - Ajustado requisito de Gestor para Nível 2 em `commissionRequirements()` para `"Gerente de Operações (ou Gerente do Polo)"` conforme nomenclatura oficial da Tabela 1.
  - Ajustado requisito de Coordenador para Nível 3 em `commissionRequirements()` para `"Gerente de QSSO ou Coordenador Sr. onshore/offshore"`.
- **Matriz de Severidade FORM-CORP-SMS-087 Rev. 08 (Nota PD-02 em SEV-03-s3)**:
  - Adicionada nota formal PD-02 no critério de Descarga Maior (`SEV-03-s3`), explicitando que solo natural, mangues e rios constituem áreas ecologicamente sensíveis (descarga $\ge 8\,\text{m}^3$ = Nível 3 Grave).
- **Rastreabilidade e Visibilidade dos Alertas SMS**:
  - Inclusão dos formulários oficiais **FORM-CORP-SMS-089** (Alerta Preliminar SMS em até 72h) e **FORM-CORP-SMS-090** (Alerta SMS em até 72h pós-aprovação da investigação) no painel de mandatos normativos e no seletor de severidade.
- **Validação Algorítmica de Prazos de Ações Corretivas (PG-015 item 6.7.d.5)**:
  - Adicionada verificação dinâmica em `actionEffectivenessValidationItems()` que calcula o tempo decorrido entre a ocorrência e o prazo previsto da ação, alertando (`warning`) caso o prazo exceda o teto normativo por nível (Grave: 30 dias, Moderado: 90 dias, Leve: 180 dias).

## [6.40.1] - 2026-10-15

### Corrigido & Aprimorado (Revisão de Código & Governança de Severidade Real 0)
- **Correções do Code Review e Governança**:
  - Habilitada opção `value="0"` no seletor de override manual (`#classificationOverride`).
  - Suporte ao valor numérico 0 na função `set('f_sev', 0)`.
  - Preservação e renderização de severidade real 0 em `renderClassificationAssessments()`, `migrarEstudo()` e contadores de consequência.
  - Sincronização e promoção de esquemas legados em `normalizeTriageSelection()`.

## [6.40.0] - 2026-10-15

### Adicionado & Atualizado (Matriz FORM-CORP-SMS-087 Rev. 08 & Severidade Real 0 / Quase Acidentes PG-015 Rev. 09)
- **Implementação Integral da Matriz FORM-CORP-SMS-087 Rev. 08 (Brava Energia)**:
  - Substituição da matriz embutida anterior pela Revisão 08 oficial com 19 tipologias de severidade real (`SEV-01` a `SEV-19`) distribuídas em 6 seções normativas (Saúde Humana, Meio Ambiente, Interrupção, Patrimônio, Custos e Compliance).
  - Categorização de 26 tipologias de Quase Acidentes (`QA-01` a `QA-26`) alinhadas ao Manual ANP e ao PG-CORP-SMS-015 Rev. 09.
- **Suporte Nativo a Severidade Real 0 (Quase Acidente)**:
  - Motor de cálculo (`recalcClassification`) refatorado para suportar formalmente Severidade Real 0 sem falhas de tipo ou tratamento nulo/falsy.
  - Atualização de `METHODS_BY_LEVEL` com nível 0 rotulado como `Quase Acidente (Real 0)`.
  - Vinculação dos mandatos metodológicos (Tabela 2: 5 Porquês, Árvore de Causa/Falha) e comissão mínima (`commissionLevel`, Tabela 1) à **Severidade Potencial** quando a Severidade Real for 0.
- **Interface e Triagem Renovada (Passo 1)**:
  - Adicionado seletor de Natureza do Evento (Acidente com Dano Real vs Quase Acidente / Perda de Barreira) no card de classificação.
  - Adicionado campo dedicado para definição da **Severidade Potencial** (Pior Cenário Crível — PG-015 Rev. 09).
  - Adicionado painel dinâmico com prazos e mandatos normativos do PG-CORP-SMS-015 Rev. 09 (mobilização em 48h, conclusão de RIA em 30d/45d e prazos máximos de ações corretivas).
  - Rótulos visuais nos badges e no cabeçalho do RIA refletindo com precisão: `Quase Acidente (Real 0 | Potencial [Leve/Moderado/Grave])`.
- **Decisões Homologadas Incorporadas aos Critérios**:
  - Incorporação das notas normativas: PD-01 (gás inflamável é vazamento de gás/QA, não descarga), PD-02 (solo natural/mangues/rios são áreas sensíveis, ≥8m³ = nível 3), PD-05 (líquido em bacia de contenção secundária não é meio ambiente atingido), PD-10 (tancagem contida em bacia = perda de contenção primária/QA) e notas orientativas em faixas limítrofes (PD-03).
- **Preservação e Governança**:
  - Passo Zero cumprido: `FACIU-v6.39.1.html` arquivado e preservado em `backups/FACIU-v6.39.1.html`.
  - Nova versão `FACIU-v6.40.0.html` criada com promoção SemVer Minor atômica.
  - Suíte automatizada `tests/test_v6_40_0_rev8_matrix_and_real_zero.js` criada com 33 verificações rigorosas e 100% de aprovação (33/33 PASS).

## [6.39.1] - 2026-10-13

### Corrigido & Aprimorado (Importação de CII: Tipo de Incidente como Descrição e Evento Topo)
- **Priorização do Tipo de Incidente na Importação de CII (`parseCiiHtml` e `suggestCiiTitle`)**:
  - Na rotina de importação de arquivos HTML de Comunicado Inicial de Incidente (CII), o campo `Tipo de Incidente` (devidamente higienizado de prefixos redundantes por `cleanCiiValue`) agora tem precedência primária absoluta sobre a classificação genérica.
  - O título sugerido (`suggestCiiTitle`) agora é gerado prioritariamente como `<Tipo de Incidente> — <Instalação/Polo>` (ex.: `Parada emergencial de planta de processo (Emergency Shutdown – ESD) — Estação Coletora de Macau`), evitando que a classificação genérica ou dano (ex.: "Quase Acidentes Risco de dano...") assuma indevidamente o título.
- **Aplicação no Estudo Causal (`applyCiiParsedData`)**:
  - **Triagem**: O campo `triagem.descricao` (`f_descricao` / "O que aconteceu (descrição objetiva)") e `triagem.titulo` passam a receber o Tipo de Incidente do CII.
  - **Árvore de Causas**: O nó de Evento Topo (`evt`) tem seu rótulo (`evt.label`) e descrição (`evt.desc`) automaticamente populados com o Tipo de Incidente formatado.
  - **5 Porquês**: O estudo causal recebe o Tipo de Incidente como descrição do problema (`study.description`) e título (`study.title`).
  - **Relatório RIA (Passo 3)**: A narrativa técnica detalhada contida em "Descrição do incidente e Consequências reais" continua sendo preservada com prioridade em `ria.description.technicalDescription`.
- **Preservação e Governança**:
  - Passo Zero cumprido: `FACIU-v6.39.0.html` copiado e preservado integralmente em `backups/FACIU-v6.39.0.html`.
  - Nova versão `FACIU-v6.39.1.html` criada com atualização de `APP_VERSION`, títulos, badges e pills.
  - Suíte de testes TDD `tests/test_v6_39_1_cii_incident_type_as_event_and_desc.js` criada e 100% aprovada (12/12 PASS).

## [6.39.0] - 2026-10-13

### Adicionado & Atualizado (Alinhamento Normativo Integral com PG-CORP-SMS-015 Rev. 09 - 23/09/2026)
- **Atualização do Padrão Corporativo Brava Energia para a Rev. 09 (23/09/2026)**:
  - Atualizadas todas as referências normativas no código, títulos, metadados do RIA e Central de Ajuda Técnica de PG-CORP-SMS-015 Rev. 07 para **Rev. 09 (Data da Revisão: 23/09/2026)**.
- **Diretrizes e Investigação de Quase Acidentes (Itens 4, 6.1, 6.4, 6.7)**:
  - Consolidação explicativa na Central de Ajuda: Quase Acidentes possuem obrigatoriamente **Severidade Real 0 (zero)** na Matriz de Severidade, pois não há dano final materializado.
  - O rigor da investigação é inteiramente governado pela **Severidade Potencial** (avaliada pelo pior cenário plausível). A Severidade Potencial determina a composição mínima da Comissão (Tabela 1 do padrão) e a metodologia (Tabela 2).
  - Quase Acidentes de Potencial Moderado (Nível 2) ou Grave (Nível 3) exigem investigação formal por Árvore de Causa/Falha e emissão obrigatória de RIA (FORM-CORP-SMS-088), além de Alerta Preliminar de SMS em até 72h para potencial grave.
- **Inclusão do FORM-CORP-SMS-116 (Formulário de Depoimento de Incidente)**:
  - Adicionada orientação explícita no item 6.3 e na Central de Ajuda sobre o uso obrigatório do formulário oficial de depoimento na oitiva de envolvidos e testemunhas para subsidiar a reconstituição fática.
- **Análise Causal com Fatores Psicossociais e Anonimização (Item 6.7.d)**:
  - Inclusão formal de diretrizes para avaliação de riscos psicossociais organizacionais (cargas de trabalho excessivas, exigências contraditórias, indefinição de papéis, assédio psicológico/sexual, violência ou falhas de apoio gerencial).
  - Reforço do princípio de não identificação nominal de trabalhadores e supervisores nos relatórios de causas do incidente.
- **Prazos Máximos Regulamentares de Ações Corretivas por Criticidade (Item 6.7.d.5 e 6.14.1)**:
  - Formalização dos prazos limites normativos: até 30 dias para condições graves, até 90 dias para moderadas, até 180 dias para leves, e prazo imediato para elementos com falha no Conjunto Solidário de Barreiras (CSB) ou riscos graves e iminentes.
- **Análise Histórica no Banco Corporativo (Item 6.6)**:
  - Referenciação e orientações para consulta ao banco histórico de incidentes em instalações da Brava Energia para aferição de frequência, tipologias e reincidência.
- **Preservação e Governança**:
  - Cumprido o Passo Zero: `FACIU-v6.38.0.html` copiado e preservado integralmente em `backups/FACIU-v6.38.0.html`.
  - Suíte de testes automatizados `tests/test_v6_39_0_rev9_compliance.js` implementada e 100% aprovada (12/12 PASS).
  - Auditoria profunda `diagnostic_full_audit.js` executada e 100% aprovada (38/38 PASS).

## [6.38.0] - 2026-10-13

### Adicionado & Melhorado (Multi-Seleção em Bloco, Eliminação de Ligações Livres e Reforço Hierárquico de Portas E/OU)
- **Eliminação de Ligações Livres e Restrição de Portas Cardinais**:
  - Eliminadas as conexões laterais e de topo (`node-port` nas 4 extremidades) que permitiam criar conexões desestruturadas e correlações diagonais/livres.
  - O sistema passa a operar em regime de **Árvore Causal Estrita**: exatamente **uma porta na base inferior** de nós que podem dar origem a filhos (`node-port-bottom`). Nós terminais como Ação (`kind === 'acao'`) não exibem porta inferior.
  - A rotina `handleNewConnection` agora bloqueia sumariamente qualquer tentativa de conexão entre tipos incompatíveis por `canCreateChild(source.kind, target.kind)`, além de impedir a criação de ciclos (`riaAncestorPath`), emitindo feedback visual e notificação toast informativa. Zero arestas de correlação livre soltas são geradas.
  - Realce magnético durante o arraste: destaca nós compatíveis com anel de sucesso e nós incompatíveis com contorno de advertência (`.target-hover-invalid`).
- **Multi-Seleção de Nós (Seleção em Bloco e Marquee Selection)**:
  - Adicionado suporte nativo a seleção retangular em caixa (Marquee Box Selection) via Cytoscape (`boxSelectionEnabled: true`), ativável segurando `Shift + arrastar` no fundo do canvas.
  - Adicionado botão de alternância `[Modo Seleção]` (`#btnSelectMode`) na micro-toolbar flutuante superior do canvas. Quando ativado, arrastar no fundo desenha a caixa de seleção retangular diretamente (sem necessidade de segurar teclas modificadoras).
  - Suporte a seleção incremental individual através de `Shift + Clique` e `Ctrl + Clique` em nós para somar ou subtrair elementos da seleção ativa.
  - Painel do Inspetor Lateral reativo (`#treeInspectorMultiBox`): ao selecionar 2 ou mais nós, exibe badge `LOTE (N)`, contagem de blocos selecionados, chips com rótulos dos nós, instruções de uso e botões de ação em lote (*Desmarcar* e *Excluir N blocos*).
- **Arrasto em Bloco (Multi-Drag)**:
  - Ao arrastar qualquer um dos nós do conjunto selecionado no canvas, todos os nós selecionados são movidos conjuntamente com o mesmo deslocamento relativo, e suas coordenadas consolidadas são salvas no estado da árvore (`state.tree.nodes`).
- **Exclusão em Lote (Batch Delete) e Atalhos**:
  - `deleteSelected()` aprimorado para exclusão em lote de múltiplos blocos selecionados simultaneamente (incluindo todos os seus descendentes causais, análises de 5 Porquês e ações dependentes vinculadas).
  - Suporte ao acionamento via teclado pelas teclas `Delete` e `Backspace` quando nós estiverem selecionados.
- **Manutenção e Herança das Portas Lógicas [E] e [OU]**:
  - Reforçado o comportamento de referência (FTA / Árvore de Causas INRS): ramificações filhas sob o mesmo nó pai são governadas pela porta lógica (`[E]` ou `[OU]`) centralizada no tronco do pai.
  - Ao arrastar para conectar novos filhos a um nó pai que já possui ramificação lógica, o novo filho herda automaticamente o operador daquela ramificação.
  - O clique direto na badge de porta lógica (`__gate_<parentId>`) continua alternando instantaneamente entre `[E]` e `[OU]` para todas as arestas da ramificação sincronizadamente.
- **Governança & Passo Zero Inviolável**:
  - Backup de preservação gerado em `backups/FACIU-v6.37.1.html`.
  - Suíte completa de testes Playwright criada em `tests/test_v6_38_0_multiselect_and_strict_hierarchy.js` com 19 asserções cobrindo integridade de backup, versão, eliminação de portas livres, modo de seleção, sincronização de inspetor, arrasto em bloco, exclusão em lote e portas lógicas (100% verde).

## [6.37.1] - 2026-10-13

### Adicionado & Melhorado (Conectores Lógicos Unificados no Tronco do Nó Pai - FTA)
- **Unificação de Portas Lógicas no Tronco do Nó Pai (Fim dos Rótulos Duplicados em Barramento)**:
  - Em conformidade com a metodologia de Análise por Árvore de Falhas (FTA / ANP SGSO), a porta booleana (`[OU]` ou `[E]`) agora é representada como um **conector visual único** posicionado exatamente no tronco vertical de saída do nó pai (`__gate_<parentId>`), antes de qualquer ramificação horizontal para os filhos.
  - Eliminada a repetição de múltiplos rótulos `[OU]` e `[E]` espalhados ao longo das arestas filhas (ex: 5 caixas `[OU]` para 5 filhos ou 2 caixas `[E]` para 2 filhos foram unificadas em 1 único conector limpo).
  - Badge estilizado com alta nitidez: roxo (`#4F46E5`) para hipóteses independentes/alternativas (`OU`) e verde esmeralda (`#059669`) para causas simultâneas/combinadas (`E`).
- **Interatividade Direta no Conector Lógico**:
  - Clique direto no badge (`[OU]` ou `[E]`) na tela do canvas alterna instantaneamente entre os modos lógico `OU` $\leftrightarrow$ `E`, atualizando sincronizadamente todas as arestas causais filhas daquela ramificação e disparando notificação toast explicativa.
  - A ferramenta `setSelectedEdgeLogic(logic)` na barra de ações rápidas atualiza em lote todas as arestas irmãs que partem do mesmo nó pai.
- **Rastreamento Dinâmico de Posição (Drag Tracking)**:
  - Adicionado listener de sincronização reativa `cy.on('position', 'node')`: ao reposicionar ou arrastar qualquer nó pai pelo canvas, sua badge de porta lógica acompanha o movimento instantaneamente, mantendo-se sempre centralizada 12px abaixo da base do bloco.
  - Ajustado seletor Cytoscape para `edge[?isActionEdge]`, preservando o traçado ortogonal em barramento (*taxi-direction: downward*) em todas as conexões causais padrão.
- **Preservação e Integridade Estrutural**:
  - `state.tree.nodes` permanece 100% puro e semântico (zero injeção de nós artificiais no payload salvo em JSON ou exportado no RIA).
  - Cumprido o Passo Zero: `backups/FACIU-v6.37.0.html` preservado e intacto.
  - Criada suíte automatizada Playwright `tests/test_v6_37_1_gate_connectors.js` com 19 asserções cobrindo integridade de versão, 5 filhos com OU, 2 filhos com E (ponto vermelho), alternância por clique, drag tracking e integridade de dados (100% verde).

## [6.37.0] - 2026-10-13

### Adicionado & Corrigido (Melhorias Offshore, Motor Causal e Ergonomia do Estudo)
- **Correção Definitiva do Teste do Portanto na Árvore de Causas**:
  - Sanada a discrepância de chaves em `getAvailableThereforeChains()`, onde a busca de causas contribuintes filtrava apenas por `'contribuinte'`, enquanto o modelo de dados utiliza `'contrib'`. Agora suporta transparentemente tanto `'contrib'` quanto `'contribuinte'`.
  - Expandido o seletor para nós com `kind === 'raiz'`, `root: true` e `isRoot: true`, além de fallback para ramos com hipóteses/fatores quando ainda não houver causa-raiz formal cadastrada.
  - No algoritmo `buildTreeThereforeChain()`, adicionado rastreamento defensivo bidirecional de arestas causais até o Evento Topo (`evt`), impedindo travamentos ou cadeias vazias caso arestas tenham sido desenhadas com orientação reversa.
- **Sanitização de Arestas para Ações Preventivas (Fim da Seta de Volta com Operador OU)**:
  - Ao criar blocos de Ação Preventiva (`kind === 'acao'`) via `addChild()` ou `createActionForRoot()`, o seletor `childGate` agora é sanitizado para string vazia (`gate: ''` e `logic: ''`), impedindo a herança indevida de operadores booleanos (`OU`/`E`).
  - No Cytoscape (`styleCy()`), adicionada regra com `curve-style: 'bezier'` e supressão de rótulo para arestas conectadas a ações (`edge[isActionEdge]`), eliminando curvas de retorno ortogonais invertidas ("setas de volta").
- **Destaque Visual em Vermelho Pulsante nas Pendências da Verificação**:
  - Atualizado o estilo de [`.correction-target`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/FACIU-v6.37.0.html) de anel na cor lima para um anel vermelho corporativo pulsante de alta visibilidade (`#EF4444` no tema claro e `#F87171` no tema escuro com `@keyframes pulseCorrection`).
  - Ao clicar em "Preencher" na aba de Verificação (Passo 4), o campo alvo na Triagem, Estudo, RIA ou Ações é focalizado com rolagem suave ao centro da tela e destaque vermelho imediato.
- **Defaults Regulatórios do RIA (Vítimas e Vazamentos em '0')**:
  - Em `riaDefault()` e `riaSyncDefaults()`, os 6 contadores de pessoas afetadas (`ownInjured`, `ownFatalities`, `contractorInjured`, etc.) agora iniciam com `'0'` por padrão, alinhando-se aos manuais de SMS e eliminando falsas pendências de preenchimento.
  - Adicionado o botão de ação rápida `[✓ Sem vítimas (Zerar)]` na Seção 3 do RIA para zerar os contadores em 1 clique com notificação toast.
- **Seletor de Ambiente Onshore / Offshore e Severidade Potencial**:
  - Adicionado seletor tátil no Passo 1 (Triagem) entre `[ 🌊 Offshore ]` e `[ 🏭 Onshore / ATI / TAG ]` (`state.triagem.ambiente`), condicionando dinamicamente exigências marítimas no formulário RIA.
  - A rotina `recalcClassification()` agora suporta a apuração por `Severidade Potencial`, calculando o nível final da investigação como o máximo entre a severidade real e a severidade potencial (`MAX(Real, Potencial)`).
- **Nova Barra de Ferramentas Contextual do Estudo (Passo 2)**:
  - As subguias contextuais (*Cronologia*, *Árvore*, *Raias*, *Portanto*, *Ações*) foram desacopladas do cabeçalho global e reposicionadas como uma barra contextual exclusiva no Passo 2 (`.study-contextual-bar` em `data-view="2"`), localizada logo acima da área de trabalho ativa.
  - O cabeçalho global permanece estritamente dedicado às 5 Etapas Canônicas (1. Triagem, 2. Estudo, 3. RIA, 4. Verificação, 5. Emissão), eliminando a superlotação visual.
- **Garantia de Qualidade e Preservação**:
  - Cumprido o Passo Zero e o protocolo estrito de preservação: backup `backups/FACIU-v6.36.12.html` intacto e preservado.
  - Criada suíte automatizada Playwright `tests/test_v6_37_0_offshore_improvements.js` com 19 asserções cobrindo todas as novas regras (100% verde).
  - Suítes de regressão `test_v6_36_12_zindex_and_dropdown.js` e `test_v6_36_11_chronology_and_menu.js` validadas com 100% de aprovação.

## [6.36.12] - 2026-10-08

### Corrigido (Hierarquia de Camadas Z-Index, Modais e Menus Suspensos)
- **Hierarquia de Camadas e Resolução de Stacking Context entre Barras e Modais**:
  - Resolvido o conflito de contexto de empilhamento onde a Barra 1 possuía `z-[10001]`, fazendo com que caixas modais e diálogos (como `#modal-study-info`, `#modal-tip-detail`, `#modalWorkspaceManager` e painéis de ajuda) ficassem presos ou interceptados pela barra superior.
  - A Barra 1 agora utiliza `z-30`, mantendo-se fixa no topo da janela acima do conteúdo padrão da página, mas rigorosamente abaixo de qualquer modal do sistema.
  - Elevada a camada de todos os modais, janelas de diálogo e overlays para `z-[20000]` (`#modal-tip-detail`, `#modal-study-info`, `#modalWorkspaceManager`, `.therefore-overlay`, `.node-modal`, `.app-help-overlay`, `.fivewhy-import`, `.gal-modal`, `.faciu-camada`), assegurando que qualquer janela modal sempre apareça à frente de todas as barras de navegação e ferramentas.
  - Menus suspensos e dropdowns da Barra 1 e da barra de ferramentas da árvore permanecem com `z-index` elevado (`10005` e `.dropdown-portal` com `10050`), preservando a proteção contra sobreposição de portas cardinais amarelas introduzida na v6.36.11.
- **Garantia de Qualidade e Preservação**:
  - Cumprido o Passo Zero e o protocolo estrito de preservação: backup `backups/FACIU-v6.36.11.html` intacto e preservado.
  - Criada suíte automatizada Playwright `tests/test_v6_36_12_zindex_and_dropdown.js` com 17 asserções cobrindo integridade de versão, z-index de barras e modais, abertura de modais e menus suspensos, e testes de regressão da cronologia (100% verde).

## [6.36.11] - 2026-10-08

### Corrigido (Ordenação por Fases na Cronologia do RIA e Isolamento de Menus Suspensos na Árvore)
- **Ordenação Canônica da Cronologia no RIA por Fases (Antes, Durante e Depois)**:
  - Atendida a diretriz de organização cronológica e metodológica dos fatos no Relatório de Investigação de Acidente (RIA): os eventos agora são agrupados e ordenados sequencialmente pelas fases **Antes**, **Durante** e **Depois** (exatamente como construído na etapa inicial de Estruturação > Cronologia), com ordenação temporal secundária por data/hora dentro de cada fase.
  - Criada a função canônica `getChronologyByPhases(list)` (também exportada em `window.faciuRia.chronByPhases` e `window.getChronologyByPhases`), que classifica robustamente as fases `'before'`/`'antes'`, `'during'`/`'durante'`, `'after'`/`'depois'` e registros contextuais.
  - Atualizadas as funções `riaChronRows()` (tabela HTML do RIA oficial) e `riaModelo()` (adaptador para minutas e geração vetorial/PDF) para consumirem `getChronologyByPhases(state.chronology)`.
  - **Preservação Integral do Formato**: Nenhuma coluna, estilo ou layout de apresentação do formulário FORM-CORP-SMS-088 foi alterado; a tabela preserva rigorosamente as 3 colunas regulamentares (*Data (dd/mm/aaaa)*, *Hora (hh mm)* e *Descrição do evento*).
- **Isolamento Completo de Menus Suspensos e Prevenção de Bolinhas Amarelas sobre Menus**:
  - Solucionada a sobreposição em que, ao abrir qualquer menu suspenso na barra de ferramentas superior (`#studyMenuDropdown`, `#helpDropdown`, `#folderMonitorDropdown`, `#startHelpDropdown`) sobre um bloco da Árvore de Causas, o hover do cursor do mouse sobre o nó disparava o desenho das portas cardinais amarelas (`.node-port`) sobrepostas ao menu.
  - Elevado o contexto de empilhamento (`z-index`) da barra superior (`.faciu-nav-root`) para `10000` e dos menus suspensos (`.faciu-dropdown`) para `10005`, garantindo que fiquem acima de **todos os elementos da árvore** (nós, arestas, `.tree-floating-inspector` em 50, `.cxtmenu` em 9000, `.node-port` em 26 e `#portOverlay` em 25).
  - Removido o aprisionamento de stacking context causado pela classe `z-40` na primeira linha do cabeçalho, convertida para `relative z-[10001]`.
  - Adicionado gerenciador de estado reativo `updateBodyDropdownState()` que adiciona a classe `.dropdown-open` ao `document.body` sempre que qualquer menu suspenso estiver aberto, disparando regras de CSS defensivas (`display: none !important; visibility: hidden !important; pointer-events: none !important; opacity: 0 !important;`) na camada `#portOverlay` e nos seletores `.node-port`.
  - Atualizados os manipuladores Cytoscape (`cy.on('mouseover', 'node')` e `cy.on('mousemove')`) para invocar `hidePorts()` e abortar a exibição de conectores cardinais enquanto qualquer menu ou dropdown estiver ativo.
- **Garantia de Qualidade e Preservação**:
  - Cumprido o Passo Zero e o protocolo estrito de preservação: backup `backups/FACIU-v6.36.10.html` intacto e preservado.
  - Criada suíte automatizada Playwright `tests/test_v6_36_11_chronology_and_menu.js` com 20 asserções cobrindo ordenação por fases no RIA, formato intacto de tabela, z-index relativo e simulação de hover com menus abertos (100% verde).
  - Suítes de regressão `test_v6_36_9_save_status.js` e `test_v6_36_8_tree_fixes.js` validadas com 100% de aprovação.

## [6.36.10] - 2026-10-08

### Corrigido (Apontamentos de Testes Práticos: Verificação do RIA, Colunas da Comissão e Sobreposição na Árvore)
- **Eliminação do Falso Erro de Verificação nas Datas da Investigação**:
  - Investigada e sanada a discrepância de chaves onde as datas salvas no modelo RIA (`r.investigationPeriod.startedAt` e `r.investigationPeriod.endedAt`) eram validadas apenas contra propriedades legadas (`start` e `end`), gerando falso bloqueio de "Período da investigação incompleto" mesmo com as datas devidamente preenchidas no formulário.
  - O validador canônico em `validationItems()` agora verifica `(r.investigationPeriod?.startedAt || r.investigationPeriod?.start) && (r.investigationPeriod?.endedAt || r.investigationPeriod?.end)`.
  - Atualizado o target do item de verificação para `investigationPeriod.startedAt` com localização exata `RIA > 2. Descrição do Incidente`.
  - Implementada a função de navegação direta `switchRiaTab` / `window.faciuRia.switchTab`: ao clicar no botão "Preencher" na Verificação, a interface do RIA agora transiciona automaticamente para a aba *2. Descrição do Incidente* e aplica foco/destaque visual com scroll no campo correspondente.
  - Atualizada a serialização do RIA no payload de exportação para suportar `startedAt`/`endedAt` com compatibilidade retroativa para `start`/`end`.
- **Correção do Mapeamento de Colunas na Tabela 4.3 da Comissão de Investigação (FORM-CORP-SMS-088)**:
  - Criado o resolver canônico centralizado `resolveCommissionMember(m)` que padroniza a separação entre:
    - **Função na Comissão**: Gestor da investigação, Coordenador da investigação ou Membro da comissão (apenas papéis formais da comissão investigadora).
    - **Nome**: Nome completo do integrante.
    - **Cargo / Setor**: Especialidade funcional / ocupação na empresa (ex.: Operação, Técnico de Segurança, Engenheiro, Gerente do Polo).
    - **Empresa**: Brava Energia ou nome da contratada parceira.
  - Atualizadas as funções `riaMemberRows()` (tabela 4.3 HTML), `riaModelo()` (minuta PDF/impressão), `commissionSummary()`, `comissao_investigacao` (exportação JSON/prompt de auditoria) e formulário de adição de membros na Triagem (`renderTeam()`).
  - Corrigido o parseamento de estudos legados e recém-importados, garantindo que membros antigos com informações unificadas em `func` e `area` sejam distribuídos com precisão pelas 4 colunas formais do modelo corporativo.
- **Correção da Sobreposição de Elementos na Árvore de Causas (Menu Suspenso x Conectores Cardinais)**:
  - Corrigido o conflito de camadas (`z-index`) e renderização onde as bolinhas amarelas (`.node-port`) da camada `#portOverlay` apareciam sobrepostas ao menu dropdown da topbar (`.faciu-dropdown` / `#btnStudyMenu` / `#startHelpDropdown`) quando o cursor do mouse se movia na área do nó sob o menu aberto.
  - A barra superior (`.faciu-nav-root`) teve seu `z-index` elevado para `1000` e os menus suspensos (`.faciu-dropdown`) para `1100`.
  - As portas de conexão cardinais (`.node-port`) tiveram seu `z-index` ajustado para `26` (abaixo dos menus suspensos).
  - Adicionadas regras em CSS que ocultam integralmente a camada `#portOverlay` (`display: none !important`) sempre que qualquer menu suspenso ou menu de contexto estiver aberto.
  - Implementada verificação em JavaScript `isAnyMenuOrDropdownActive()` e chamada a `hidePorts()` nos gatilhos de abertura de dropdowns, assegurando que o hover em nós da árvore Cytoscape seja ignorado durante a navegação em menus.
- **Garantia de Qualidade e Preservação**:
  - Cumprido o Passo Zero e o protocolo estrito de preservação: arquivo `backups/FACIU-v6.36.9.html` criado e intacto, e nenhuma versão anterior apagada.
  - Criada suíte automatizada `tests/test_v6_36_10_shirlley_feedback.js` com 32 verificações cobrindo os 3 problemas reportados (100% aprovada).
  - Verificação de não-regressão executada com as suítes `test_v6_36_9_save_status.js` e `test_v6_36_8_tree_fixes.js`, ambas 100% verdes.

## [6.36.9] - 2026-10-08

### Corrigido (Indicador de Salvamento: Transição Confiável de "Salvando..." para "Sincronizado" / "Salvo no Navegador")
- **Eliminação do Congelamento no Estado "Salvando..."**:
  - Investigada e sanada a causa raiz técnica onde a pílula de status (`#syncStatusPill`, `#syncStatusText`, `#syncStatusDot`) permanecia congelada permanentemente em `"Salvando..."` com a bolinha azul piscando.
  - O problema ocorria porque `FaciuFolderMonitor.saveToDisk` chamava `updateSyncStatus('synced')` antes de resetar a flag `this.isSaving` (que só ocorria no bloco `finally`). Dentro de `updateSyncStatus`, a condição `isSaving` capturava `FaciuFolderMonitor.isSaving === true`, forçava o texto para `"Salvando..."` e executava retorno precoce (`return`), sem que nenhuma nova chamada ocorresse após o `finally`.
  - Corrigido o cálculo de `isSaving` em `updateSyncStatus(explicitStatus)` para garantir que chamadas explícitas de confirmação (`'synced'` e `'saved_browser'`) tenham precedência e desativem o modo de salvamento em trânsito.
  - Em `FaciuFolderMonitor.saveToDisk`:
    - Adicionado cancelamento explícito do temporizador de debounce (`clearTimeout(this.saveTimer)`) no início da gravação manual/direta para evitar gravações concorrentes redundantes.
    - Flag `this.isSaving` redefinida para `false` antes da atualização da interface (`updateUI` e `updateSyncStatus('synced')`), mantendo a segurança defensiva adicional no `finally`.
- **Confirmação Clara para Salvamento no Navegador (Sem Arquivo em Disco)**:
  - Quando o estudo é salvo no navegador (IndexedDB) sem vínculo prévio com arquivo JSON no disco, a pílula de status agora transiciona para o estado verde esmeralda com o texto `"Salvo no Navegador"` e tooltip explicativo, substituindo o estado âmbar de alerta quando não há alterações pendentes.
  - Tratado o cancelamento voluntário do diálogo de seleção de arquivo (`AbortError` no `showSaveFilePicker`) no `saveStudy` para confirmar com segurança que as alterações foram persistidas no armazenamento do navegador.
- **Garantia de Qualidade e Preservação**:
  - Preservado backup integral compulsório em `backups/FACIU-v6.36.8.html`.
  - Criada suíte automatizada `tests/test_v6_36_9_save_status.js` (Playwright) com 6 cenários de teste cobrindo: salvamento manual com arquivo em disco, estabilidade contra timers concorrentes, auto-save contínuo de 1.5s, salvamento em navegador, alterações pendentes e disparo por atalho de teclado `Ctrl+S`.
  - 100% de sucesso obtido nos testes unitários e na auditoria completa de 38 itens (`npm run test:all`).

## [6.36.8] - 2026-10-08

### Corrigido (Árvore de Causas: Menu Radial Desobstruído e Eliminação do Quadrado Cinza)
- **Eliminação da Sobreposição das Portas Amarelas sobre o Menu Radial**:
  - Ao abrir o menu radial de contexto com o segurar do clique do botão esquerdo (`taphold` / clique longo) ou clique direito (`cxttapstart`), as portas de conexão cardinais (`.node-port` dentro de `#portOverlay`) agora são instantaneamente ocultadas via `hidePorts()`.
  - Implementada função de guarda `isRadialMenuActive()` e proteção defensiva em CSS (`.tree-canvas-container:has(.cxtmenu > div[style*="display: block"]) #portOverlay`) que impede a recriação das portas enquanto o menu estiver ativo, desobstruindo totalmente as fatias de ação (*Gerenciar*, *Confirmar*, *Filho (+)*, *Ligar a...*, *Excluir*) e prevenindo interceptação de cliques.
  - Ao fechar ou concluir qualquer ação no menu, as portas cardinais reaparecem suavemente na interação normal de hover sobre os blocos.
- **Eliminação Definitiva do Nó Fantasma "Quadrado Cinza" & 80+ Avisos no DevTools**:
  - Desativada a biblioteca legada `cytoscape-edgehandles` (`initEdgeHandles`), cuja execução concorrente injetava um nó fantasma não tipado no topo do bloco no canvas Cytoscape, gerando um quadrado cinza residual e disparando mais de 80 avisos de mapeamento ausente no console (`Do not assign mappings to elements without corresponding data`).
  - O seletor de estilo base em `styleCy()` foi refinado para `{selector:'node[disp]', style:{...}}`, garantindo que apenas nós de causa autênticos recebam estilos de bloco.
  - O sistema de conexão por arraste (*Drag-to-Connect*) continua 100% operacional através da camada dedicada de portas cardinais interativas e curvas Bézier SVG (`#dragSvg`).
- **Garantia de Qualidade e Preservação**:
  - Passo Zero executado com backup compulsório em `backups/FACIU-v6.36.7.html`.
  - Criada suíte automatizada `tests/test_v6_36_8_tree_fixes.js` com 5 testes rigorosos cobrindo hover, ocultação no menu radial, ausência de nós fantasmas, arraste de conexão e regressão na topbar. 100% aprovada.

## [6.36.7] - 2026-10-07

### Aprimorado (Menu Unificado de Ações do Estudo na Barra Superior)
- **Menu Dropdown Consolidado (`#btnStudyMenu` & `#studyMenuDropdown`)**:
  - Reorganizada a fileira de 5 botões dispersos na barra superior (*Novo*, *Abrir*, *Salvar*, *Salvar Como...*, *Fechar*) em um único botão elegante e corporativo `[ 📁 Estudo ▾ ]`.
  - Ao clicar, abre-se uma lista suspensa rica e estruturada (`.study-actions-dropdown`, 280px), dividida semanticamente por divisores sutis:
    - **Novo Estudo**: Iniciar investigação em branco do zero (ícone âmbar `file-plus`).
    - **Abrir Estudo...**: Carregar arquivo `.json` do computador com atalho `<kbd>Ctrl+O</kbd>` (ícone sky `folder-open`).
    - **Salvar**: Gravar alterações no arquivo ou navegador com indicador ativo e atalho `<kbd>Ctrl+S</kbd>` (ícone lima `save`).
    - **Salvar Como...**: Nova cópia independente em disco com atalho `<kbd>Ctrl+Shift+S</kbd>` (ícone roxo `copy`).
    - **Fechar Estudo**: Encerrar sessão ativa e retornar à Tela Inicial com atalho `<kbd>Ctrl+Shift+W</kbd>` (ícone rose `folder-x`).
- **Design System & Acessibilidade**:
  - Totalmente adaptado aos temas Claro e Escuro com tokens corporativos Brava Enterprise (`#16132b` de fundo, `#332373` em bordas e sombras de elevação suaves).
  - Suporte completo a fechamento ao clicar fora ou pressionar a tecla `Esc`.
  - Cabeçalho dinâmico do dropdown integrado à função `updateTopBarActiveStudy()`, exibindo o CII e título do estudo ativo em tempo real.
- **Preservação e Testes**:
  - Mantidos todos os IDs originais (`#btnTopCloseStudy`, `#startBtnSaveAs`, `#btnTopSaveStudy`, etc.) para 100% de compatibilidade retroativa.
  - Criado teste automatizado E2E `tests/test_v6_36_7_study_menu.js` (Playwright) e integrado à suíte mestra `npm run test:all`.

## [6.36.6] - 2026-10-07

### Corrigido & Aprimorado (Barra Superior Sólida, Alternador de Temas e Coerência no Modo Escuro)
- **Barra Superior Sólida Corporativa (Sem Transparência no Scroll)**:
  - Restauradas e consolidadas as definições de `.gradient-brava` e `.gradient-hero` com `background-color` opaco (`#100a26` no tema claro e `#0b071a` no tema escuro) e bordas corporativas Brava Energia.
  - Ao rolar a tela inicial, a barra superior (`#startScreen header`) permanece 100% preenchida e opaca, impedindo vazamentos ou sobreposições visuais com cartões e textos do catálogo.
- **Botão de Alternância de Tema na Tela Inicial (`#startBtnThemeToggle`)**:
  - Inserido no cabeçalho da Tela Inicial botão acessível e responsivo para alternar entre Modo Claro e Modo Escuro, perfeitamente integrado e alinhado aos botões *Configurações* e *Ajuda*.
  - Sincronização dinâmica de ícones Lucide (`moon` no tema claro, `sun` no tema escuro) e descrições semânticas de acessibilidade via `updateThemeIcons()`.
- **Harmonização do Rodapé e Catálogo no Tema Escuro**:
  - Eliminado o bloco branco no rodapé (`bg-white/90`): adicionados estilos dedicados para `html[data-theme="dark"] #startScreen footer` com fundo corporativo escuro `#100a26`, bordas `#332373` e pílula de versão com `white-space: nowrap`.
  - Normalizado o painel do catálogo e estados vazios para superfícies escuras `#16132b` / `#100a26`.
- **Garantia de Qualidade e Preservação**:
  - Criada suíte automatizada `tests/test_v6_36_6_ui_fixes.js` validando SemVer, integridade de cores computadas da barra superior em scroll, alternância de tema e contraste.
  - 100% de aprovação mantida em todos os 62 testes automatizados (`npm run test:all`).

## [6.36.5] - 2026-10-07

### Aprimorado (Redesign da Central de Ajuda & Coerência Visual em Modo Escuro)
- **Design System e Coerência Total de Temas (Claro e Escuro)**:
  - Implementado sistema completo de tokens CSS em `faciuAjudaIntegradaStyle` com suporte nativo a `html[data-theme="dark"]` e `html.dark`.
  - Eliminado o ofuscamento visual no Tema Escuro: substituídos fundos brancos (`#fff`) e cinza claro (`#f4f5fa`) por superfícies corporativas profundas Brava Energia (`#0b071a`), containers de cartão (`#16132b`), bordas sutis (`#332373`) e tipografia de alto contraste (`#f8fafc`).
  - Cards de objetivo, requisitos metodológicos, blocos de passos numerados e tópicos do editor agora adaptam-se dinamicamente com contraste superior a WCAG AAA.
- **Modernização da Barra Superior (Padrão Linear-App / Brava Enterprise)**:
  - Cabeçalho superior unificado e fluido (altura mínima de 54px), com fundo em gradiente corporativo e borda translúcida.
  - Ícone oficial em moldura destacada, título *"Ajuda do FACIU"*, badge de revisão da documentação (*"conteúdo do arquivo · rev. 14"*) e subtítulo explicativo.
  - Navegação segmentada em pílula centralizada (*Linear-App Segmented Pill Switcher*): abas *"Como usar a aplicação"* e *"Conteúdo técnico"* com destaque ativo em Brava Lima (`#d0f50d`, texto `#100a26`) e hover elegante.
  - Barra de ações utilitárias (`.topo-acoes`) alinhada à direita com botões *"Recarregar"*, *"Editar"* e botão de fechamento com badge semântica do atalho `<kbd>Esc</kbd>`.
- **Compatibilidade e Qualidade Assegurada**:
  - Preservados todos os IDs e hooks de eventos (`#busca`, `#btRecarregar`, `#btEditar`, `#origem`, `.faciu-ajuda-fechar`), assegurando que busca em tempo real, visualização de tópicos e editor de artigos operem com 100% de integridade.
  - Suite de testes dedicada `tests/test_v6_36_5_help_redesign.js` implementada e validada (24 testes aprovados), em adição aos 38 testes da auditoria profunda `tests/diagnostic_full_audit.js`.

## [6.36.4] - 2026-10-07

### Corrigido (Ciclo de Vida ao Fechar Estudo & Persistência em Memória)
- **Desvinculação e Limpeza Completa ao Fechar Estudo (`closeStudy`)**:
  - Corrigido o vazamento de estado onde clicar em "Fechar Estudo" mantinha os dados visíveis como "em andamento" na tela inicial e no cabeçalho superior.
  - Implementado cancelamento atômico de temporizadores assíncronos pendentes (`window.store.idbTimeout`, `FaciuFolderMonitor.saveTimer`, `riaRevalTimer`, `invalPendente`) antes da redefinição de estado, evitando que gravações agendadas ressuscitassem o estudo no `IndexedDB`.
  - Adicionada limpeza exaustiva dos campos de formulário do DOM (inputs `#f_cii`, `#f_titulo`, `#f_ocorr`, rádios de classificação, equipe e raias) e chamada obrigatória a `hydrateTriage()`, impedindo que chamadas secundárias a `validationItems()` / `syncTriage()` reidratassem o estudo a partir de inputs sujos no DOM.
  - Expurgadas chaves ativas do `IndexedDB` (`active_study`, `file_handle`, `file_name`) e do `localStorage` (`brava_investigacao_v1/v2/v3`).
  - Reinicializado o Hero Card da tela inicial para *"Nenhuma Investigação Ativa no Navegador"*, ocultando o botão de fechar e exibindo as ações de início limpo.
- **Prevenção de Gravação Fantasma (`save` & `FaciuStudyCatalog.recordCurrentStudy`)**:
  - Adicionadas travas de guarda (`hasData`) para impedir que estudos vazios recém-fechados sejam gravados no `IndexedDB` durante ciclos automáticos de upgrade ou revalidação de regras.

## [6.36.3] - 2026-10-07

### Corrigido & Aprimorado (Persistência & Salvamento no Arquivo Aberto)
- **Salvamento Direto no Arquivo Aberto (`saveStudy`)**:
  - Corrigido o comportamento do botão **Salvar** (Ctrl+S): ao editar um estudo aberto a partir de um arquivo em disco ou previamente vinculado, a gravação atualiza diretamente o arquivo existente sem solicitar a criação/seleção de um novo arquivo JSON (`showSaveFilePicker`).
  - `saveStudy()` agora verifica e recupera handles válidos persistidos no `faciuDB` (`handles`) caso a referência em memória do `FaciuFolderMonitor` esteja nula ou reidratada após reload da página.
  - O seletor nativo `showSaveFilePicker` agora só é acionado na primeira gravação de um estudo em branco que nunca foi salvo em disco, vinculando-o permanentemente para gravações diretas posteriores.
  - Para gerar novas cópias intencionais com novo nome em disco, a função e atalho dedicados **"Salvar Como..."** (Ctrl+Shift+S / `saveStudyAs()`) permanecem disponíveis.
- **Abertura e Vinculação Não-Destrutiva de Handles (`FaciuFolderMonitor.bindFile`)**:
  - `bindFile(fileHandle, requireWrite = false)` não mais aborta a vinculação nem descarta o handle caso a permissão de escrita não esteja previamente concedida no momento da abertura (o `showOpenFilePicker` fornece permissão de leitura).
  - A permissão de escrita é verificada e requisitada pontualmente pelo `saveToDisk()` durante o clique explícito do usuário no botão Salvar (com *user gesture* ativo garantido pelo navegador Chromium).
  - Implementado `unbindFile(notify = true)` no `FaciuFolderMonitor` para desvinculação limpa de arquivos sem lançar erros de referência.
- **Resiliência na Importação (`chooseImportFile` & `applyPendingImport`)**:
  - `chooseImportFile()` agora trata com resiliência falhas causadas por diretórios expirados em `pickerOpts.startIn`, realizando fallback transparente antes de recorrer ao input tradicional.
  - Eliminado o `confirm()` bloqueante nativo redundante ao acionar "Abrir para Edição" a partir da prévia de importação, preservando o token de ativação do usuário (*transient user activation*) exigido pela File System Access API.

## [6.36.2] - 2026-10-07

### Corrigido & Aprimorado (Design & Alto Contraste no Teste do Portanto)
- **Alto Contraste no Teste do Portanto (Tema Escuro)**:
  - Definido token global `--ink: #0f172a` em `:root` e `--ink: #F8FAFC` em `html[data-theme="dark"], html.dark`, eliminando falhas de herança de texto escuro sobre fundos profundos.
  - Títulos dos passos causais (`.therefore-step-card .card-text`) atualizados para branco nítido (`#F8FAFC`, peso 600, razão de contraste > 16:1, superando WCAG AAA).
  - Justificativas e evidências (`.card-rationale`) atualizadas para cinza suave legível (`#CBD5E1`) com rótulo `<strong>Evidência/Justificativa:</strong>`.
  - Hierarquia cromática por nível causal:
    - **Causa-Raiz (`.is-cause`, `.kind-raiz`)**: Borda e badge esmeralda (`#10B981` / `#34D399`) com fundo esmeralda noturno.
    - **Causa Contribuinte (`.kind-contrib`)**: Borda e badge âmbar (`#F59E0B` / `#FBBF24`).
    - **Hipótese Causal (`.kind-hip`, `.kind-hipotese`)**: Borda e badge violeta (`#A855F7` / `#C084FC`).
    - **Causa Imediata (`.kind-imed`, `.kind-imediata`)**: Borda e badge rosa magenta (`#EC4899` / `#F472B6`).
    - **Evento Topo (`.is-target`, `.kind-evt`)**: Borda e badge índigo periwinkle (`#818CF8` / `#C7D2FE`).
- **Conectores e Condições Lógicas Refinadas**:
  - Notas de lógica causal intermediárias (`.therefore-logic-note`, e.g. "Condição alternativa (Porta OU...)") agora renderizam como pílulas translúcidas nítidas com borda sutil e texto em tom claro (`#E2E8F0`).
  - Badge "PORTANTO..." reforçado com sombra sutil e tipografia preta legível sobre o amarelo lima corporativo (`var(--lime)`).
- **Caixa de Reflexão Causal (Comissão)**:
  - Cabeçalho da reflexão (`h4`) atualizado para lavanda de alto contraste (`#DDD6FE`) com ícone âmbar.
  - Rótulos dos checkboxes sanitizados no painel HTML (`#structurePaneTherefore`) de `text-[var(--ink)]` para `text-slate-800 dark:text-slate-100` e estilizados no CSS com `#F1F5F9` e prefixos em negrito destacados em roxo suave (`#C4B5FD`).
  - Controles do seletor de ramos (`#thereforeChainSelector`) estilizados com fundo escuro e tipografia clara no tema escuro.

---

## [6.36.1] - 2026-10-07

### Corrigido & Aprimorado (Tema Escuro & Interface)
- **Contraste de Indicadores de Data/Hora no Tema Escuro**:
  - Implementado `color-scheme: dark` nos seletores raiz `html[data-theme="dark"]`, `html.dark` e diretamente nos controles nativos `input`, `select` e `textarea`.
  - Assegurado que o ícone do seletor de calendário nativo (`::-webkit-calendar-picker-indicator`) renderize em alto contraste (branco/prata nítido com opacidade de 85% e 100% no hover) sobre os fundos escuros dos campos de Triagem, Cronologia e Ações.
  - Padronizado contraste de `::placeholder` para `#94A3B8` no tema escuro e `color-scheme: light` para o modo claro.
- **Contraste e Tema Dinâmico no Badge do Inspector Flutuante**:
  - Corrigido o badge de tipo (`#inspectorBadge`) no editor lateral da árvore causal (`.tree-floating-inspector`), adicionando regras específicas de alto contraste para o tema escuro (`[data-theme="dark"] .tree-inspector-badge`: fundo sutil com brilho violeta e texto `#c4b5fd` legível).
  - Promovido o mapa de cores `KIND_DARK` para escopo global e integrado a `selectNode()`, garantindo que os blocos selecionados também apliquem a paleta noturna correspondente ao nó no badge.
  - Sincronização dinâmica no `toggleTheme()` para atualizar o badge do nó selecionado ou estado padrão (`SELECIONE`) imediatamente ao alternar temas.
- **Eliminação de Itens Soltos no Rodapé da Modal de Bloco/Ação**:
  - Removido caractere `<` solto decorrente de tag duplicada `<<div class="node-modal-footer">` na janela modal de nós e ações.
  - Higienização de tags `<input ...><p>...</p></input>` para a sintaxe canônica void `<input ... /><p>...</p>`.

---

## [6.36.0] - 2026-10-02

### Alterado & Aprimorado (Arquitetura 100% Offline / Copilot Corporativo)
- **Substituição do Botão de Verificação no Passo 4 (`#btnCopyProjectCopilot`)**:
  - O antigo botão de acionamento de IA na barra de KPI do Passo 4 foi substituído pelo botão **"Copiar Dados p/ Copilot"** (`#btnCopyProjectCopilot`), acionando a função `copyProjectDataForCopilot()`.
  - Ao clicar, gera e copia instantaneamente para a área de transferência o prompt executivo consolidado com todo o dataset do incidente (Triagem, Cronologia, Árvore de Causas, 5 Porquês principal e auxiliares, Plano de Ações SMART e Relatório RIA FORM-CORP-SMS-088) formatado em Markdown com diretrizes técnicas da Brava Energia para análise no Microsoft Copilot.
  - Fornece feedback visual dinâmico no botão (`✓ Copiado p/ Copilot!`) e notificação toast informativa.
  - Preservado o botão compatível `#btnOpenAiAuditor` no DOM para retrocompatibilidade com suítes de teste legadas.

### Removido & Blindado (Zero-API / Desacoplamento Externo)
- **Eliminação Total de Chamadas de API de IA**:
  - Removidas todas as chamadas `fetch()` para APIs externas (Google AI Studio Gemini, Groq, OpenRouter, OpenAI) e Chrome Nano, tornando o FACIU 100% autônomo, seguro e estritamente client-side.
  - Eliminados os campos de entrada de chave de API (`#aiConfigKey`), URL customizada (`#aiConfigUrl`), seletor de provedores externos e o botão de busca de modelos (`#aiConfigFetchBtn`).
  - Removidas as chaves `GROQ_KEY` e `AI_URL` de `FaciuConfig.KEYS`.
  - Removido o botão de execução direta de API (`#btnAiRunAudit`) da modal do auditor, promovendo a exportação executiva para Copilot como ação primária (`#btnAiCopyCopilot`).
- **Limpeza de Ações Textuais no RIA e Triagem**:
  - Removido o botão legado de API "Melhorar com IA" (`.btn-field-ai`) dos 24 textareas do formulário oficial RIA e do campo `f_descricao` da Triagem, consolidando o fluxo no botão **"Copiar p/ Copilot"** (`.btn-field-copilot`).
  - Redirecionada a rotina `openTextEnhancer()` diretamente para a cópia do prompt de campo do Copilot.

---

## [6.35.9] - 2026-10-01

### Corrigido & Blindado (Resiliência Total)
- **Eliminação Definitiva do `VersionError` no IndexedDB (`faciuDB`)**:
  - Elevação do esquema `FaciuDatabase` para a versão 3 (`dbVersion: 3`), compatibilizando clientes que já possuíam versão 3 registrada em seu armazenamento de origem.
  - Implementação de recuperação dinâmica automática: caso o navegador informe qualquer divergência (`VersionError`), o `faciuDB` reabre imediatamente na versão corrente do navegador sem parâmetros rígidos (`tryOpen(null)`), evitando falhas de inicialização.
- **Camada de Contingência em Memória Volátil (`inMemoryFallback`)**:
  - Implementado espelho de dados transparente em memória (`Map`) para o `faciuDB`. Se o IndexedDB for bloqueado (navegação anônima estrita, drivers bloqueados ou cota estourada), as operações de `get`, `put` e `delete` mantêm os dados do estudo e catálogo íntegros durante a sessão sem lançar exceções não tratadas.
- **Proteção Defensiva no Monitor de Pasta (`FaciuFolderMonitor`)**:
  - Captura e tratamento específico de `NotFoundError`: se um arquivo vinculado em disco for excluído ou renomeado externamente, a sincronização é suspensa com notificação clara e humanizada, impedindo loops de erro a cada polling.
- **Polyfill Defensivo para Bibliotecas Gráficas Offline/Zero-Dependency**:
  - Adicionado helper leve de `memoize`, `throttle` e `debounce` para garantir que extensões do Cytoscape (`cytoscape-edgehandles`) carreguem sem erros em qualquer ambiente.
- **Humanização de Alertas no Global Error Handler**:
  - Erros e avisos operacionais recebem mensagens orientadas ao usuário, evitando exposição desnecessária de termos técnicos crus no console e nos toasts.

---

## [6.35.8] - 2026-10-01

### Adicionado
- **Estrutura Completa de Fechamento de Estudo ("Fechar Estudo")**:
  - Implementação da função `closeStudy()` com prevenção ativa contra perda acidental de dados: exibe alerta de confirmação caso existam alterações pendentes não salvas em disco.
  - **Botão na Barra 1 de Utilitários**: Adicionado botão `#btnTopCloseStudy` ("Fechar") ao lado de "Salvar Como...", completando o conjunto de ações de ciclo de vida (`Novo`, `Abrir`, `Salvar`, `Salvar Como...`, `Fechar`).
  - **Botão no Hero Card da Tela Inicial**: Adicionado botão `#btn-close-active-study` ("Fechar Estudo") ao lado de "Continuar Investigação" para encerramento direto a partir da tela de entrada.
  - **Atalho de Teclado**: Configurado atalho global `Ctrl+Shift+W` para fechar o estudo ativo e retornar à Tela Inicial.
  - **Desvinculação Segura**: Ao fechar, desvincula o monitor de disco/pasta local, cancela o modo consulta, redefine o estado em memória para um molde limpo e atualiza o catálogo de estudos.

---

## [6.35.7] - 2026-10-01

### Adicionado
- **Menu Popup / Dropdown Unificado de Ajuda no Cabeçalho da Tela Inicial**:
  - Unificação dos botões isolados de ajuda em um menu dropdown moderno e elegante (`#startBtnHelpMenu` + `#startHelpDropdown`) com indicador de seta, rótulo "Ajuda" e suporte completo a acessibilidade (`aria-haspopup="true"`, `aria-expanded`).
  - Agrupamento harmonioso das duas vertentes de apoio no mesmo popup:
    1. **Central de Ajuda Técnica** (`#startMenuOptHelp`) — Acesso direto aos conceitos e biblioteca do padrão `PG-CORP-SMS-015`.
    2. **Ajuda da Aplicação** (`#startMenuOptAppHelp`) — Guia operacional com manual de telas, botões e atalhos.
  - Implementado fechamento automático ao clicar fora e na tecla `Escape`.

---

## [6.35.6] - 2026-10-01

### Removido
- **Eliminação de Redundância de Botões de Ajuda na Tela Inicial**:
  - Removidos os botões duplicados "Central de Ajuda" e "Ajuda da Aplicação" do card lateral "Início Rápido", mantendo-o estritamente focado em ações de abertura e criação de estudos ("Nova Investigação", "Novo a partir de CII", "Abrir Estudo" e "Pasta de Trabalho").

### Melhorado
- **Acessibilidade e Identificadores do Cabeçalho Superior**:
  - Adicionados identificadores semânticos e títulos informativos aos botões do cabeçalho da Tela Inicial: `#startBtnConfig` (Configurações), `#startBtnHelp` (Central de Ajuda Normativa) e `#startBtnAppHelp` (Guia Operacional da Aplicação).
  - Preservado o acesso ao padrão técnico normativo e manual da aplicação via cabeçalho global, sem poluição visual ou sobreposição de funções.

---

## [6.35.3] - 2026-09-25

### Corrigido
- **Restauração das Regras Canônicas de Acionamento e Visibilidade das Guias no Passo 2 (Estudo)**:
  - **Metodologia Árvore de Causa (`tree`)**:
    - As guias exibidas no agrupador `Ferramentas:` são: `Cronologia`, `Árvore`, `5 Porquês (Auxiliar)` (condicional), `Raias`, `Portanto` e `Ações`.
    - A subguia `5 Porquês (Auxiliar)` é **estritamente condicional**: permanece oculta (`display: none`) por padrão e só é ativada quando houver efetivamente um estudo auxiliar criado e atrelado a algum nó da árvore (`state.whysAuxiliary.length > 0`).
    - Ao excluir o último estudo auxiliar de 5 Porquês (ou na exclusão em cascata do nó associado na árvore), a guia `5 Porquês` é ocultada automaticamente e a visualização é redirecionada de volta para a `Árvore`.
  - **Metodologia 5 Porquês Principal (`whys`)**:
    - As guias exibidas no agrupador `Ferramentas:` são: `Cronologia`, `5 Porquês`, `Portanto` e `Ações`.
    - As subguias `Árvore` e `Raias` são **estritamente ocultadas** (`display: none`), e qualquer navegação anterior posicionada nessas abas é automaticamente redirecionada para a guia canônica dos `5 Porquês`.
  - **Ciclo de Vida Integrado**:
    - A função `syncMethodologyTabs()` foi conectada aos pontos de mutação do ciclo de vida: `goStep(2)`, `addNewAuxiliaryWhy()`, `deleteAuxiliaryWhy()`, `deleteSelected()` (cascata causal) e `resetTree()`.
    - A guia `Cronologia` é preservada como ponto inicial comum de reconstrução factual em ambas as metodologias, conforme orientação e confirmação do usuário.

---

## [6.35.2] - 2026-09-25

### Adicionado
- **Feedback Visual Dinâmico e Status em Tempo Real de Salvamento e Arquivo Local**:
  - **Pill Dinâmico de Sincronização (`#syncStatusPill`)**:
    - Substituição do badge estático "Sincronizado" por um componente inteligente e reativo com dot luminoso pulsante e texto de estado contextual.
    - Suporte a 6 estados bem definidos:
      1. **Não Salvo em Arquivo** (âmbar com pulse suave): Exibido quando uma nova investigação é iniciada no navegador ou ainda não foi gravada em um arquivo JSON em disco.
      2. **Salvando...** (azul celeste com animação pulse): Exibido durante operações ativas de I/O em disco ou persistência assíncrona no IndexedDB.
      3. **Alterações Pendentes** (âmbar): Exibido quando há edições no estudo não salvas no arquivo vinculado em disco.
      4. **Sincronizado** (verde esmeralda): Exibido quando o arquivo em disco está 100% atualizado e compatível com os dados em memória.
      5. **Modo Consulta** (roxo/púrpura): Exibido quando uma investigação foi aberta em modo somente leitura.
      6. **Erro ao Salvar** (vermelho carmim): Exibido quando ocorrem falhas de permissão de escrita ou problemas de I/O na gravação.
  - **Interatividade Direta**:
    - O clique no pill (`onclick="checkSyncStatus()"`) oferece ação contextual inteligente: aciona diálogo de salvamento (`Ctrl+S`) se houver pendências ou se não houver arquivo, ou abre o Gerenciador de Pasta de Trabalho (`openWorkspaceManager()`) para gerenciar arquivos quando já sincronizado.
  - **Integração Completa com o Ciclo de Vida**:
    - Conectado diretamente a `InvestigationStore.prototype.persist()`, `FaciuFolderMonitor.saveToDisk()`, `FaciuFolderMonitor.bindFile()`, `applyPendingImport()`, `exitConsultationMode()`, `initiateNewStudyFlow()`, `saveStudy()` e `boot()`.

---

## [6.35.1] - 2026-09-25

### Removido
- **Remoção do Botão "Monitor de Disco" na Tela Inicial**:
  - Eliminado o botão redundante "Monitor de Disco" do cabeçalho superior da Tela Inicial (`#startScreen`), mantendo a interface limpa, focada e sem elementos duplicados.
  - A gestão de arquivos e pastas no disco local é centralizada através dos botões "Pasta de Trabalho" (`#startBtnFolder`) e do modal unificado do Gerenciador de Pasta de Trabalho (`#modalWorkspaceManager`).
  - O utilitário `#folderMonitorWrapper` permanece ativo na barra superior do espaço de investigação.

---

## [6.35.0] - 2026-09-25

### Adicionado
- **Redesenho Completo da Tela Inicial, Gestão de Arquivos e Catálogo Local de Estudos**:
  - **Ações Imediatas de Arquivo no Cabeçalho e Tela Inicial**:
    - **Nova Investigação**: Criação de estudo limpo do zero com confirmação preventiva quando há dados não salvos.
    - **Abrir Estudo (.json)**: Carregamento de arquivos JSON locais com atalho de teclado global `Ctrl+O`, suporte a drag-and-drop e pré-visualização de compatibilidade.
    - **Salvar Como...**: Novo fluxo e atalho de teclado `Ctrl+Shift+S` para salvar cópia independente diretamente no disco ou download de novo arquivo JSON.
    - **Pasta de Trabalho (Workspace)**: Acesso direto ao disco local para sincronização em tempo real via W3C File System Access API.
  - **Catálogo Inteligente de Estudos (`FaciuStudyCatalog`)**:
    - Listagem dinâmica unificada de investigações salvas no navegador (`localStorage`/`IndexedDB`) e arquivos `.json` presentes na pasta conectada do computador.
    - Abas de navegação rápida: "Todos", "Pasta Local" e "Navegador".
    - Campo de busca em tempo real com debounce para filtrar por código CII, título, ativo/unidade, líder e data de modificação.
    - Cartões de estudo ricos com badges de metodologia ativa (Árvore de Causas, 5 Porquês), conformidade percentual, carimbo de data/hora e ações rápidas ("Abrir para edição" e "Visualizar para consulta").
    - Skeleton loaders fluidos e Empty States informativos com atalhos contextuais.
  - **Modal de Gerenciamento da Pasta de Trabalho (Workspace Manager)**:
    - Interface dedicada (`#modalWorkspaceManager`) exibindo status de conexão da pasta, arquivo vinculado atual, botão para conectar/trocar diretório e listagem completa dos arquivos de estudo na pasta com carregamento em um clique.
  - **Atalhos Globais de Teclado**:
    - `Ctrl+O`: Abrir estudo de arquivo JSON local.
    - `Ctrl+S`: Salvar alterações (no arquivo vinculado em disco ou navegador).
    - `Ctrl+Shift+S`: Salvar como nova cópia.

---

## [6.34.3] - 2026-09-25

### Corrigido
- **Fidelidade Cromática Estrita da Variante A (Cores do Protótipo & Contraste do Stepper)**:
  - **Sincronização dos Tokens de Cor Brava com `prototype_navigation.html`**: Configurado `tailwind.config` com a paleta exata da Brava Energia (`brava.navy: #120e2e`, `deep: #0b0820`, `surface: #1b1540`, `yellow: #d4fb21`, `lime: #cbf720`, `purple: #5e3da8`, `purpleLight: #7950dc`, `border: #2c2260`) e sombras glow/subtle (`shadow-glow-lime`, `shadow-subtle`), eliminando discrepâncias cromáticas anteriores (roxo claro `#221C4F` e verde `#C6E600`).
  - **Contraste Perfeito no Passo Ativo da Esteira Metodológica**: Corrigido o bug onde o título da etapa ativa herdava cor cinza escuro (`text-slate-700`), tornando-o quase invisível sobre o fundo Navy escuro (`#120e2e`). Agora o título ativo recebe tipografia branca em negrito (`text-white font-bold`), badge circular amarelo (`#d4fb21`) com dígito preto e subtítulo luminoso amarelo (`text-brava-yellow font-semibold`).
  - **Conectores Dinâmicos com Feedback de Conclusão**: Implementadas linhas conectores reativas (`#varA-connector-1..4`) entre as etapas: conectores entre passos concluídos tornam-se verde esmeralda (`bg-emerald-400 dark:bg-emerald-600`), enquanto conectores para etapas pendentes permanecem em tom neutro suave (`bg-slate-200 dark:bg-slate-700`).
  - **Gradients e Pills Alinhados**: Gradiente do medidor de integridade atualizado para as cores oficiais `#d4fb21` a `#cbf720`, pill de sincronização e monitor de disco com indicadores esmeralda autênticos.

---

## [6.34.2] - 2026-09-25

### Corrigido
- **Correção da Variante A: Eliminação da Barra de Rolagem & Visibilidade Total das Ferramentas**:
  - **Eliminação Definitiva da Barra de Rolagem Horizontal na Barra 2**: Resolvida a inflação do contêiner de passos (`#stepperNav` / `.varA-stepper`) causada por regras CSS legadas de `.steps` (que inflavam os botões para 190px cada, somando 1318px). A largura foi normalizada para 591px e a barra de rolagem horizontal foi eliminada (`overflow-x: hidden !important`, `scrollbar-width: none !important`), mantendo 0 scrollbars na interface em resoluções de 1280px a 1920px+.
  - **Visibilidade Irrestrita de Todas as 6 Ferramentas de Estudo**: No Passo 2 (Estudo), todas as 6 subguias (Cronologia, Árvore, 5 Porquês, Raias, Portanto e Ações) permanecem 100% visíveis simultaneamente no bloco contextual `#varA-subtabs`, idêntico à especificação da Variante A no protótipo (`prototype_navigation.html`), eliminando o bug de ocultação com `display: none` via `syncMethodologyTabs()`.
  - **Remoção de Logotipo Duplicado na Barra 1**: Corrigida a exibição simultânea da tag `<img>` e do texto tipográfico "BRAVA energia", mantendo exclusivamente a marca corporativa tipográfica autêntica da Brava Energia conforme o protótipo.
  - **Ajuste Fino de Densidade & Responsividade**: Espaçamentos e separadores entre passos ajustados com classe defensiva (`hidden xl:block`), garantindo que o conjunto completo (5 passos + 6 ferramentas + widget de integridade) caiba perfeitamente no viewport a partir de 1280px sem cortes nem quebras.

---

## [6.34.1] - 2026-09-25

### Alterado
- **Consolidação Exclusiva da Variante A na Barra Superior e Guias de Navegação**:
  - **Adoção Direta e Definitiva da Variante A (`prototype_navigation.html`)**: A barra superior e as guias de navegação (stepper) adotam exclusivamente a arquitetura visual corporativa da Variante A da Brava Energia, sem variantes concorrentes (B e C eliminadas).
  - **Remoção da Barra Flutuante de Protótipo (`#prototype-switcher`)**: Eliminada a barra flutuante inferior de alternância, teclas de atalho de ciclo (`←` / `→`) e persistência de variante em `localStorage`/URL, mantendo a interface de usuário 100% limpa, objetiva e focada na operação.
  - **Barra 1 (Governança & Identidade - 48px)**: Fundo Navy corporativo (`#120e2e`), branding Brava Energia com acento amarelo/lima (`#d4fb21`/`#cbf720`), badge de versão (`v6.34.1`), pill interativo do estudo ativo com modal completa de metadados (`#modal-study-info`), status de sincronização com dot pulsante (`.status-pulse`), cluster de utilitários globais (ajuda, exportar JSON, monitor de disco local com ícone estático, alternador de tema claro/escuro, configurações de IA), histórico de Desfazer/Refazer (`faciuUndo`/`faciuRedo`), botão "Novo" e CTA primário "Salvar" (`saveStudy(true)` com atalho `Ctrl+S`).
  - **Barra 2 (Esteira Metodológica & Subguias - 44px)**: Stepper com 5 etapas canônicas (1. Triagem, 2. Estudo, 3. RIA, 4. Verificação, 5. Emissão) com badges reativos de status ("Concluída", "Etapa Atual", "Pendente") + subguias contextuais de ferramentas de causa no Passo 2 (Cronologia, Árvore, 5 Porquês, Raias, Teste do Portanto, Plano de Ação) + medidor global de integridade com barra de progresso.
  - **Zero Regressões**: Preservado o comportamento estático do ícone de disco (sem animação de rotação), fluxo de novo estudo com isolamento estrito e tela inicial hero card.

---

## [6.34.0] - 2026-09-25

### Adicionado
- **Implementação do Protótipo de Navegação Multi-Variante (`prototype_navigation.html`)**:
  - **Identidade Corporativa Brava Energia Refinada**: A barra superior foi completamente modernizada com fundo Navy corporativo (`#120e2e`), tipografia Montserrat/Inter/JetBrains Mono, acentos amarelo/lima (`#d4fb21`/`#cbf720`) e alta densidade de informação.
  - **Pill Interativo do Estudo Ativo na Barra Superior**: Exibição em tempo real do identificador CII, título do estudo e indicador de status. Clique abre modal interativa (`#modal-study-info`) com metadados completos (localidade, data da ocorrência, líder e status metodológico).
  - **Suporte Nativo a 3 Variantes de Barra e Navegação**:
    - *Variante A (Dual-Bar Corporativo)*: Barra 1 com governança global e Barra 2 com esteira metodológica dos 5 passos + subguias contextuais de ferramentas do Estudo + medidor global de integridade.
    - *Variante B (Unified Command Ribbon / Cockpit)*: Barra única integrada de 56px com stepper segmentado e mini gauge circular radial de integridade.
    - *Variante C (Workstation Tool Hub)*: Trilha breadcrumb das 5 etapas e abas superiores de ferramentas com contadores reais de fatos, raízes, ramos de porquês e ações.
  - **Floating Prototype Switcher & Alternância por Teclado/URL**: Barra flutuante inferior para alternar dinamicamente entre as variantes (`A`, `B`, `C`), com suporte a parâmetro de URL (`?variant=A|B|C`), atalhos de teclado (`←` / `→`) e persistência em `localStorage`.
  - **Medidor Dinâmico de Integridade no Cabeçalho**: Atualização reativa da porcentagem de conformidade e contagem de bloqueios para emissão do RIA diretamente no topo da tela.

---

## [6.33.2] - 2026-09-25

### Corrigido
- **Ícone Estático no Monitor de Disco / Sincronização Local**:
  - **Eliminação de Rotação Indesejada**: Removida a aplicação de `animate-spin` durante a sincronização de disco no método `FaciuFolderMonitor.updateUI()` e `saveToDisk()`.
  - **Limpeza Defensiva de Classes**: O elemento do ícone (`#folderMonitorIcon` e `#btnDiskSync svg`) agora tem qualquer classe de rotação residual ativamente removida, permanecendo 100% estático durante a digitação, salvamento automático e alterações de estado.
  - **Correção do Ciclo do Lucide**: Corrigido bug onde o `lucide.createIcons()` recriava o nó SVG clonando a classe de animação e desvinculando o timer de remoção, o que causava giro perpétuo do ícone na barra superior.

---

## [6.33.1] - 2026-09-24

### Corrigido
- **Isolamento Estrito e Reset Completo ao Iniciar Novo Estudo**:
  - **Nome Neutro no Seletor de Arquivos**: Ao clicar em "Nova Investigação" ou "Novo Estudo", o `showSaveFilePicker` passa a sugerir sempre `novo-estudo.json` (em vez de herdar o CII ou título de uma investigação que estava previamente aberta em tela).
  - **Desvinculação Imediata de Arquivo Anterior**: Interrompe o polling de sincronização e limpa qualquer `fileHandle` prévio do `FaciuFolderMonitor` e do IndexedDB antes da criação do novo estudo, evitando sobrescritas acidentais de arquivos anteriores.
  - **Reinicialização Pristina do Estado**: O estado do estudo é redefinido imediatamente para `novoEstado()` (com triagem vazia, cronologia zerada, árvore esqueleto padrão e RIA limpo) e persistido no IndexedDB antes da vinculação ao novo arquivo no disco, garantindo que o JSON salvo contenha exclusivamente dados novos.
  - **Reset de Vínculo em Importação de CII ("new")**: Ao iniciar novo estudo a partir de arquivo CII, desvincula automaticamente arquivos de monitoramento anteriores.

---

## [6.33.0] - 2026-09-24

### Adicionado
- **Integração Completa de Arquivos Locais (.json) via File System Access API**:
  - **Fluxo Nativo para "Novo Estudo"**: Ao clicar em "Novo" ou "Iniciar Nova Investigação", o FACIU abre imediatamente o seletor nativo do sistema operacional (`showSaveFilePicker`) sugerindo o salvamento de `investigacao-nova.json`. O arquivo físico é criado no disco e vinculado automaticamente para gravação contínua. Caso o usuário cancele a janela de salvamento, é disponibilizada a opção de prosseguir com o estudo em branco na memória do navegador.
  - **Importação Direta com Permissão de Escrita (`showOpenFilePicker`)**: Ao clicar em "Importar Estudo", o FACIU utiliza a API de arquivos nativa para obter o `FileSystemFileHandle` do JSON escolhido. Ao confirmar "Importar para edição", o arquivo é vinculado ao `FaciuFolderMonitor`, permitindo que todas as modificações posteriores sejam salvas de volta no próprio arquivo físico original.
  - **Botão "Salvar" e Atalho `Ctrl+S` com Gravação Imediata**: Pressionar o botão "Salvar" ou o atalho de teclado `Ctrl+S` grava os dados imediatamente no arquivo vinculado no disco (sem depender do timer de debounce) e exibe uma notificação toast informando o nome do arquivo atualizado. Se nenhum arquivo estiver vinculado, o sistema aciona a janela para salvar/vincular um novo arquivo no computador.
  - **Sincronização Contínua em Segundo Plano**: Debounce do salvamento automático ajustado para 1.5s com feedback silencioso no cabeçalho (indicador de status e ponto verde com nome do arquivo).

---

## [6.32.1] - 2026-09-24

### Corrigido
- **Correção da Ocultação da Tela Inicial e Desbloqueio dos Botões do Início Rápido**:
  - **Resolução de Conflito de Especificidade CSS**: Adicionado `#startScreen[hidden], .start-screen[hidden] { display: none !important; }` e regra universal `<style id="faciuUniversalHidden"> [hidden] { display: none !important; } </style>`, impedindo que o seletor utilitário `.flex` do Tailwind CSS sobreponha a diretiva nativa `[hidden]`.
  - **Controle Defensivo de Exibição (`hideStartScreen` / `showStartScreen`)**: As funções de transição da tela inicial agora alternam explicitamente `style.display = 'none' !important` e `style.display = 'flex' !important`, garantindo que ações de saída (como clicar em "Nova Investigação", "Continuar Investigação" ou avançar pela esteira de etapas) liberem o canvas e as telas da aplicação imediatamente.
  - **Operação Plena dos 5 Botões da Coluna Lateral**:
    1. *Nova Investigação*: Reseta o estado local e fecha a tela inicial, direcionando para a Triagem.
    2. *Novo a partir de CII*: Dispara o seletor de arquivos de Comunicados Preliminares (`#ciiImportInput`).
    3. *Importar Estudo*: Dispara o seletor de arquivos JSON (`#jsonImportInput`).
    4. *Central de Ajuda*: Abre o modal integrado na aba `central` (PG-CORP-SMS-015).
    5. *Ajuda da Aplicação*: Abre o modal integrado na aba `aplicacao` (Guia de telas, campos e botões).

---

## [6.32.0] - 2026-09-24

### Adicionado
- **Redesign Completo da Tela Inicial (Start Screen) com Identidade Brava Energia**:
  - **Paleta Oficial e Estilo Visual Corporativo**: Integração das cores corporativas Brava Energia (Deep Navy `#221C4F`, Electric Lime `#C6E600`, Slate/White `#FFFFFF`, e Gray `#F4F5FA`) com Tailwind CSS estendido e suporte a Dark Mode.
  - **Hero Card da Investigação Ativa**: Destaque para o estudo em andamento no navegador, exibindo identificador CII, título fático, instalação, líder da comissão multidisciplinar, status da fase e botão de ação rápida "Continuar Investigação".
  - **Esteira Oficial das 5 Etapas do FACIU**: Stepper interativo com navegação direta para os 5 passos canônicos do sistema (1. Triagem & Classificação, 2. Estrutura Causal, 3. Plano de Ação, 4. Verificação & Auditoria IA, 5. Emissão do RIA Oficial).
  - **Carrossel de Conhecimento Causal & Metodológico**: 7 cartões explicativos interativos com filtragem por categorias ("Metodologia" e "Sistema"), rolagem suave e modal de detalhamento técnico (`#modal-tip-detail`):
    1. *Regra Fundamental da Ligação Causal Direta* (Padrão Estrito com teste *Conditio Sine Qua Non*)
    2. *Filosofia Técnica: Criar sem Gerenciar* (Tabela 4.7 do formulário RIA FORM-CORP-SMS-088)
    3. *Auditor IA em 3 Dimensões* (Inconsistências, Barreiras e Liberação Documental)
    4. *Início Rápido com Comunicado CII* (Importação de HTML preliminar da operação)
    5. *Teste do Portanto* (Validação causal reversa no 5 Porquês)
    6. *Histórico Completo com Desfazer/Refazer* (Até 40 restaurações com Ctrl+Z / Ctrl+Y)
    7. *Monitor de Pasta Local* (Persistência contínua com File System Access API)
  - **Painel Lateral de Início Rápido**: Acesso ergonômico e unificado para Nova Investigação, Importação de CII (.html), Importação de Estudo (.json), Central de Ajuda Técnica e Ajuda da Aplicação.
  - **Estado Vazio Convidativo**: Apresentação amigável quando não há investigação ativa no navegador, orientando o usuário a iniciar do zero ou carregar arquivos.
  - **Filtro em Tempo Real**: Campo de busca instantânea para localização rápida de investigações por número de CII, ativo, instalação ou título.

---

## [6.31.3] - 2026-09-24

### Adicionado
- **Novos Tópicos Especializados na Ajuda da Aplicação**:
  - `Auditor IA (Auditoria Inteligente)`: Documentação dos 3 modos de auditoria técnica (*Inconsistências*, *Barreiras de Segurança* e *Liberação do RIA*) e do Bloqueador Pré-Auditoria (`validateAuditReadiness`) que exige dados mínimos antes de permitir a execução.
  - `Aprimorador de Texto com IA & Botão Copilot`: Instruções sobre o modal de refinamento de redação lado a lado (modo híbrido Gemini Nano / Groq API), diretrizes de voz passiva e termos de SMS, e o botão rápido "Copiar p/ Copilot" disponível em todos os 24 textareas do formulário RIA.
  - `Histórico e Desfazer/Refazer (Ctrl+Z / Ctrl+Y)`: Guia operacional do gerenciador de estado (`InvestigationStore`) com pilha imutável de até 40 níveis de restauração para desfazer mutações, exclusões e inserções por IA.

### Modificado
- **Atualização Abrangente da Central de Ajuda Técnica e da Ajuda da Aplicação**:
  - **Revisão 13 de Conteúdo Integrado**: Bumping para a revisão 13 em `faciu-ajuda-revisao`, garantindo que clientes e navegadores descartem caches locais obsoletos e carreguem a documentação oficial atualizada.
  - **Árvore de Causas & Conexões Causais**: Artigos `guia-arvore`, `tree` e `arvore-conceitos` atualizados para explicar o canvas interativo, portas visuais de ancoragem, padronização da **Ligação Causal** estrita (`kind: 'causal'`), operadores lógicos OU/E renderizados diretamente na linha sem nós intermediários de gate, e subfatores humanos.
  - **Plano de Ação Centralizado & "Criar sem Gerenciar"**: Artigos `guia-acoes` e `plano-acao` totalmente reestruturados para refletir a centralização na guia Plano de Ação, Tabela 4.7 do RIA (FORM-CORP-SMS-088 Rev. 08), ênfase no Tipo de Ação (Preventiva, Corretiva, Abrangência) e desassociação de status de execução contínua na investigação.
  - **Raias Causais de 3 Fases**: Artigo `lanes` atualizado para descrever o grid causal limpo de 3 colunas (Campo de Hipóteses, Causas Contribuintes e Causas-Raiz), formalizando a remoção da coluna legada de ações.
  - **5 Porquês (Canônico vs Auxiliar)**: Artigos `guia-5porques` e `whys` atualizados com a dupla metodologia (método principal para incidentes leves e auxiliar para nós da árvore), Teste do Portanto e atalho direto para o Plano de Ação.
  - **Persistência em Camadas e Importação de CII**: Artigos `save`, `home` e `import` atualizados com o Monitor de Pasta Local (File System Access API), armazenamento IndexedDB e importação rápida de Comunicados Iniciais (CII em HTML).
- **Correção Arquitetural do Roteamento dos Modais de Ajuda**:
  - Eliminação definitiva de chamadas legadas a elementos inexistentes (`helpModal`, `helpFrame`, `HELP_CENTER_B64`).
  - As funções `openHelp()` e `openAppHelp(topic)` agora delegam diretamente para o host integrado `appHelpOverlay`, alternando de forma limpa entre a aba `central` (Central de Ajuda Técnica) e a aba `aplicacao` (Ajuda da Aplicação).

---

## [6.31.2] - 2026-09-24

### Modificado
- **Padronização da Ligação Causal (`kind: 'causal'`) como Padrão da Árvore de Causas**:
  - `skeletonTree()` atualizado para inicializar todas as arestas com `kind: 'causal'`, garantindo que ao iniciar um novo projeto a árvore utilize estritamente o modelo de ligação causal com flecha direcionada e validação lógica.
  - Funções de manipulação e expansão de nós da árvore (`addChild` e `addSibling`) atualizadas para instanciar arestas explicitamente com `kind: 'causal'`.
  - Rotina de migração e sanitização (`migrarEstudo`) atualizada para atribuir defensivamente `kind: 'causal'` a qualquer aresta legada sem tipo definido.
- **Atualização Completa dos Arquivos de Exemplo Oficiais (v6.31.2)**:
  - Exemplos 1, 2 e 3 (`docs/exemplos/` e pasta Documentos do usuário) atualizados para `appVersion: "6.31.2"` e `study.versao: "6.31.2"`.
  - Removidas as conexões transversais de correlação livre (`kind: "correlation"`) dos exemplos 1 e 3, padronizando 100% das arestas com ligação causal hierárquica (`kind: "causal"`).
  - Validação automatizada confirmando 0 erros estruturais de grafo e 100% de conformidade documental no formulário RIA (FORM-CORP-SMS-088).

---

## [6.31.1] - 2026-09-24

### Modificado
- **Desacoplamento de Gestão de Execução e Foco em Formulação de Ações ("Criar sem Gerenciar")**:
  - Removida a coluna de "Status" da tabela do Plano de Ação, substituindo-a pela exibição de destaque do **Tipo da Ação** (Preventiva, Corretiva ou Abrangência em badge visual colorido), em conformidade estrita com o formulário oficial RIA (FORM-CORP-SMS-088 Rev. 08, Tabela 4.7).
  - Removido o campo redundante `Status da execução` do formulário modal de ações (`#nmActionFields`), alinhando o propósito da aplicação à criação e definição técnica das recomendações na investigação, sem impor fluxos de gestão contínua de status na fase de estudo.
  - Simplificação da regra de completude de ação (`nodeComplete`): uma ação é considerada concluída para o relatório quando possui título/descrição, tipo, responsável e prazo definidos.

---

## [6.31.0] - 2026-09-24

### Adicionado
- **Centralização Completa do Plano de Ação (Gestão Unificada de Ações)**:
  - Eliminação de qualquer redirecionamento indevido para a guia 5 Porquês: a criação, edição e visualização de ações agora ocorrem 100% dentro da guia **Plano de Ação**.
  - O modal detalhado de blocos (`#nodeModal`) abre diretamente na guia Plano de Ação para qualquer ação (originária da Árvore de Causa ou dos 5 Porquês), permitindo preenchimento de tipo, causa-raiz vinculada, responsável, prazo, status da execução e critérios de eficácia sem trocar de tela.
  - Botão "+ Nova ação" com criação instantânea e abertura do modal para cadastrar ações a qualquer momento da investigação, mesmo sem causa vinculada a priori.
  - Exclusão com confirmação e suporte a `Ctrl+Z`: botão com ícone de lixeira em cada linha da tabela do Plano de Ação e botão "Excluir ação" em vermelho no rodapé do modal de edição.

### Modificado
- **Otimização Visual da Guia Raias (Remoção do Campo de Ações)**:
  - A coluna "CAMPO DE AÇÕES" foi removida da tela de Raias (`#raias`), mantendo a visão focada estritamente nas 3 fases causais da investigação (Campo de Hipóteses, Causas Contribuintes e Causas-Raiz) em grid equilibrado de 3 colunas.
  - Total integridade preservada: o modelo de dados unificado (`state.tree.nodes` com `kind: 'acao'`) e funções de leitura (`byFaixa('acoes')`) permanecem 100% operacionais para o RIA (Tabela 4.7) e validações.
- **Desacoplamento de Ações na Guia 5 Porquês**:
  - A seção de lista de ações embutida nos 5 Porquês foi substituída por um card executivo com atalho direto ("Abrir Plano de Ação"), eliminando redundâncias e centralizando toda a gestão no local correto.

---

## [6.30.0] - 2026-09-24

### Adicionado
- **Aprimoramento Textual com IA (AI Text Enhancer Engine & Modal Lado a Lado)**:
  - Novo modal integrado (`#modalTextEnhancer`) para refinamento técnico de campos de texto extenso, exibindo metadados do incidente (Instalação, Data, Título), texto original do rascunho e sugestão aprimorada pela IA.
  - Suporte de execução híbrido: Chrome Built-in AI (Gemini Nano local) ou Cloud LLM via Groq API (configurável em Ferramentas > Configurações de IA).
  - Prompts de engenharia especializados nos padrões de SMS da Brava Energia: tom impessoal e formal (voz passiva), precisão terminológica de processos/O&G e preservação estrita de dados fáticos sem inventar informações.
  - Aplicação com 1 clique (`applyEnhancedTextToField`): injeta o texto gerado no campo, dispara sincronização bidirecional no RIA (`riaSet`) e grava snapshot no histórico (`InvestigationStore.pushHistory`), permitindo desfazer instantaneamente via `Ctrl+Z` (`faciuUndo`).
- **Ação Rápida "Copiar p/ Copilot" Direta no Cabeçalho dos Campos**:
  - Botão dedicado presente no cabeçalho do campo da Triagem (`f_descricao`) e em todos os 24 textareas do formulário oficial RIA (FORM-CORP-SMS-088 Rev. 08).
  - Validação de entrada: bloqueia cópias de textos com menos de 15 caracteres, instruindo o usuário a redigir ao menos uma ideia preliminar.
  - Montagem automatizada de prompt executivo estruturado contendo contexto do incidente, diretrizes de SMS e o rascunho atual devidamente delimitado para ser colado diretamente no Microsoft Copilot Corporativo.
- **Bloqueador Pré-Auditoria do Auditor IA (`validateAuditReadiness`)**:
  - Mecanismo de validação de dados mínimos antes de permitir a execução da auditoria por IA em qualquer dos 3 modos (Inconsistências, Barreiras e Liberação do RIA).
  - Avaliação de 6 dimensões essenciais: Título do incidente, Data/hora da ocorrência, Descrição técnica detalhada (>= 20 caracteres), Estrutura Causal (Árvore de Causas ou 5 Porquês com dados preenchidos), Marcos cronológicos e Plano de Ações preventivas.
  - Renderização de cartão de alerta vermelho (`#aiAuditorBlockerBox`) no topo do Auditor IA detalhando as pendências obrigatórias e desabilitando o botão de execução (`#btnAiRunAudit`).
  - Bloqueio preventivo na chamada `FACIUAssistant.startAudit()`, impedindo disparos de requisições de API quando o estudo for insuficiente.
- **Endurecimento Anti-Complacência nos Prompts do Auditor IA (Regra Zero)**:
  - Adição de cláusula obrigatória nos prompts dos 3 modos de auditoria determinando que o modelo aja como um auditor técnico adversarial e independente.
  - Proibição absoluta de declarar "solidez", "conformidade" ou emitir parecer de liberação do RIA caso existam dados essenciais não informados, forçando a categorização explícita como "REPROVADO / NÃO CONFORME" ou "INAPTO PARA LIBERAÇÃO — INVESTIGAÇÃO INCOMPLETA".

### Corrigido
- **Expurgo Total de Fallbacks Fictícios em `buildAuditPayload()`**:
  - Removidas todas as contingências que fabricavam informações inexistentes em investigações em branco (ex: `'SGSO 10 - Integridade Mecânica'`, `'PAD-CORP-MAN-004'`, `'Nenhuma lesão ou fatalidade'`, `'Evidências e registros consolidados na árvore de causas'`, `'Sim'` no estudo de risco).
  - Substituídos por valores transparentes e honestos (`'Não informado'`, `'Não avaliado'`, `'Nenhuma medida preventiva cadastrada'`), permitindo que a IA aponte com exatidão onde estão os vazios documentais sem falsos positivos.

---

## [6.29.1] - 2026-09-24

### Adicionado
- **Escolha de Metodologia da Investigação no Modal de Importação CII**:
  - Seletor nativo no modal `#ciiPreviewModal` permitindo ao usuário definir antecipadamente a metodologia causal principal (**Árvore de Causa** vs. **5 Porquês**).
  - Sugestão inteligente de metodologia padrão com base na severidade calculada da Matriz Rev.07 (Nível 1 sugere 5 Porquês ou Árvore; Nível 2 e 3 sugerem Árvore de Causa).
  - Inicialização automática da metodologia escolhida (`state.mainMethodology`), com atualização dos estudos canônicos e sincronização das abas.
- **Seletor de Modo de Importação (Novo Estudo Limpo vs. Mesclar)**:
  - Opção explícita no modal entre **Iniciar Nova Investigação (Limpar histórico/estudo anterior)** (padrão) e **Mesclar com a investigação atual**.
  - No modo "Novo Estudo", executa reset limpo completo via `novoEstado()`, destruindo nós antigos da árvore e evitando que dados de incidentes anteriores travem a troca de metodologia ("Metodologia travada").

### Corrigido
- **Eliminação Defensiva de Consequências Corrompidas ("Nível 2 - undefined")**:
  - Filtro sanitizador automático em `migrarEstudo`, `recalcClassification` e `renderClassificationAssessments` que expurga registros malformados onde `occurrence`, `criterionId` ou `severity` sejam `undefined` ou nulos.
  - Previne a renderização anômala de cartões de consequências órfãs herdadas de sessões legadas no navegador.
- **Isolamento e Correção de "Dados do Comunicante (Notificação Inicial — CII)"**:
  - Removido o fallback indevido `t.comunicante?.nome || t.regpor || ''` em `hydrateTriage`, que contaminava o nome do Comunicante com o autor do estudo anterior ou usuário logado.
  - Desacoplamento estrito entre o Comunicante do incidente (informante no campo registrado no CII, ex: Flávia Lage) e o usuário responsável pelo preenchimento/emissão da investigação (`t.regpor`).
  - Adicionado subtítulo explicativo no card da Triagem para esclarecer a origem dos dados da Notificação Inicial.

## [6.29.0] - 2026-09-24

### Adicionado
- **Importação Nativa de Comunicado Inicial de Incidente (CII .html) e Alimentação em Cascata**:
  - **Ingestão Client-Side Inteligente (Zero-Backend)**:
    - Leitura direta de arquivos HTML do Comunicado Inicial (ex: `Comunicado - CII-064-2026-Macau`) via `DOMParser` nativo do navegador, sem dependências externas.
    - Extração estruturada de metadados: número do CII, polo, instalação, CNPJ, datas e horas (ocorrência, constatação, resposta e primeiro atendimento), descrição fática, contratada, protocolos ANP/OEMA e dados de contato do Comunicante.
  - **Cascata Completa e Integrada (Triagem + Cronologia + RIA)**:
    - **Passo 1 (Triagem)**: Pré-preenchimento dos metadados gerais, título composto inteligente (`[Evento] — [Instalação]`) e novo grupo de campos para os **Dados do Comunicante do CII** (Nome, Função e Telefone), mantendo o **Responsável pela emissão do RIA** independente.
    - **Passo 2 (Estudo / Cronologia)**: Criação automática dos 4 marcos temporais preliminares do incidente (Ocorrência estimada, Constatação na instalação, Encerramento da resposta com `isEnd: true` e Primeiro atendimento médico).
    - **Passo 3 (Relatório RIA - FORM-CORP-SMS-088 Rev. 08)**: Preenchimento automático de dados cadastrais da instalação (CNPJ, contratos, autorizações), protocolos oficiais (SISO ANP / IDEMA), descrição técnica (item 3.1) e providências adotadas / ações preliminares (item 5.1).
  - **Prioridade Documental e Modo Aditivo Seguro**:
    - O formulário oficial RIA possui prioridade absoluta: campos já preenchidos pelo usuário são estritamente preservados por padrão, com preenchimento automático apenas de campos em branco.
    - Modal de prévia e conferência (`#ciiPreviewModal`) com resumo dos dados extraídos, avisos de investigação em andamento e opção explícita para o usuário autorizar sobrescritas se desejar.
    - Integração com `InvestigationStore.pushHistory('Importar Comunicado CII')`, permitindo reverter toda a importação com um único `Ctrl+Z` (`faciuUndo()`).
  - **Enquadramento Automático na Matriz de Risco Rev.07**:
    - Algoritmo de correspondência semântica cruzando Dano e Classificação do CII diretamente com as categorias e ocorrências da `SEVERITY_MATRIX` (`cat8 > m07-r10 > s1`), calculando e registrando a severidade real automaticamente.
  - **Pontos de Entrada Híbridos no Shell (Linear-app)**:
    - Novo card na Tela Inicial (`#startScreen`): *"Novo a partir de CII (.html)"*.
    - Botão de ação rápida no cabeçalho da Triagem (Passo 1): *"Importar / Atualizar via CII (.html)"*.
- **Governança de Versão e Suíte de Testes Automatizados**:
  - Promoção de versão SemVer para `v6.29.0` no monólito `FACIU-v6.29.0.html`, títulos e metadados.
  - Criação da suíte `jsdom_test/test_v6290_cii_import.js` com 9 testes automatizados cobrindo extração do fixture real `CII-064-2026-Macau.html`, enquadramento na matriz, cascata nos 3 passos, prioridade do RIA e reversão via Undo (100% de sucesso).
  - Backup da versão anterior `v6.28.1` preservado em `backups/FACIU-v6.28.1.html`.

---

## [6.28.1] - 2026-09-23

### Corrigido
- **Correção da Captura de Snapshot e Sincronização de Desfazer/Refazer em Campos de Texto (ex: "Número do RIA")**:
  - **Sessão Inteligente Pré-Mutação em Inputs (`activeInputSession`)**:
    - Anteriormente, o snapshot era capturado no evento `focusout`. Como o FACIU altera `state` no evento `input` a cada tecla digitada (via `riaSet` e `onTriage`), o snapshot gravado no `focusout` já continha o novo valor digitado, impossibilitando a reversão.
    - Nova arquitetura com gravação de snapshot pré-edição no evento `focusin` com verificação de alteração de valor e commit no `focusout`, `change` ou imediatamente antes de `faciuUndo()` / `faciuRedo()`.
  - **Sincronização DOM Bidirecional no Módulo do RIA (Passo 3)**:
    - O ciclo `refreshAppAfterHistoryChange()` agora atualiza dinamicamente os valores de todos os elementos `[data-ria]` no DOM (preservando o foco quando o usuário digita) e reavalia o progresso do RIA e título do cabeçalho.
    - Exportação de `window.riaGet` e `window.riaSet` e integração em `window.faciuRia`.
  - **Atalhos Globais `Ctrl+Z` e `Ctrl+Y` Habilitados Durante o Foco**:
    - Remoção do bloqueio que impedia o acionamento de `faciuUndo()` e `faciuRedo()` via teclado quando o foco estava ativo dentro de campos de entrada (`<input>`, `<textarea>`, `<select>`).
- **Governança de Versão e Suíte de Testes Automatizados**:
  - Promoção de versão SemVer para `v6.28.1` no monólito `FACIU-v6.28.1.html`, títulos e metadados.
  - Criação da suíte `jsdom_test/test_v6281_undo_redo.js` cobrindo 8 etapas de testes (árvore estrutural, digitação no campo "Número do RIA", campo de instalação, atalhos de teclado com foco e integridade de state e DOM), passando com 100% de sucesso.
  - Backup da versão anterior `v6.28.0` preservado em `backups/FACIU-v6.28.0.html`.

---

## [6.28.0] - 2026-09-23

### Adicionado
- **Recurso Completo de Desfazer e Refazer Ações (Undo / Redo - Ctrl+Z / Ctrl+Y)**:
  - **Gerenciador de Histórico Central no `InvestigationStore`**:
    - Pilha imutável de até 40 snapshots em memória na sessão (`structuredClone`), garantindo reversão instantânea de qualquer alteração causal ou estrutural sem inchar o IndexedDB.
    - Captura automática de pontos de restauração antes de mutações na Árvore de Causas (criação via stencil, filhos, irmãos, conversão em causa-raiz, edição no inspetor, conexão de portas e exclusão de arestas), 5 Porquês (estudos auxiliares, porquês e ações), Cronologia e Membros da Comissão.
    - Atalhos de teclado universais: `Ctrl+Z` (Desfazer) e `Ctrl+Y` / `Ctrl+Shift+Z` (Refazer).
  - **Foco Estrutural Inteligente & Isolamento de Digitação**:
    - Durante a digitação em `<input>` ou `<textarea>`, o navegador mantém seu `Ctrl+Z` local caractere a caractere sem poluir o histórico do estudo.
    - Gravação automática de snapshot de campo apenas no encerramento da edição (`focusout` / `blur`), caso o valor tenha sido alterado.
  - **Controles Visuais na TopBar e no Canvas**:
    - Cluster dedicado de botões Desfazer (`undo-2`) e Refazer (`redo-2`) na barra superior principal (`.faciu-nav-row1`) e espelhado na micro-toolbar flutuante do canvas (`.tree-canvas-toolbar`).
    - Tooltips contextuais dinâmicos indicando a ação exata a ser desfeita (ex: *"Desfazer: Criar Hipótese (Ctrl+Z)"*) e desabilitação tátil quando a pilha estiver vazia.
  - **Toast Interativo de Segurança Pós-Exclusão (`toastWithAction`)**:
    - Eliminação do `confirm()` bloqueante nativo para nós-folhas, tornando a exclusão ágil e fluida.
    - Notificação toast de 8 segundos com botão tátil em verde-lima `[Desfazer]` para recuperação em 1 clique.
    - Manutenção de aviso descritivo de confirmação para ramos que contenham dependentes e descendentes em cascata, seguido igualmente do toast com `[Desfazer]`.
- **Governança de Versão e Suíte de Testes Automatizados**:
  - Promoção de versão SemVer para `v6.28.0` no monólito `FACIU-v6.28.0.html`, títulos e metadados.
  - Criação da suíte `jsdom_test/test_v6280_undo_redo.js` com 12 testes automatizados (100% de sucesso).
  - Backup histórico da versão anterior preservado em `backups/FACIU-v6.27.2.html`.

---

## [6.27.2] - 2026-09-23

### Corrigido
- **Restauração Integral da Codificação UTF-8 ("Erros nas Letras" / Mojibake)**:
  - Reversão byte-a-byte de toda a contaminação de codificação ANSI/Windows-1252 que havia corrompido acentuações, cedilhas e caracteres especiais em todo o monólito (títulos, modais de IA, mensagens de validação, prompts sistêmicos e separadores de passos `›`).
  - 100% dos textos da aplicação, tooltips e diálogos restaurados para padrão UTF-8 íntegro e legível.
- **Suporte Completo ao Tema Escuro (`data-theme="dark"`) na Tela Inicial (`#startScreen`)**:
  - Implementação de regras CSS dedicadas para `.start-screen-v39`, `.start-topbar`, cards de ação `.start-card-v39`, card de retomada `.continue-card-v39`, janela de ajuda e rodapé.
  - Eliminação total dos fundos brancos fixos (`#fff`, `#f8f9fd`, `#f0edff`) no modo escuro, assegurando harmonia com as superfícies dark do monólito (`#0B0E14`, `#151A23`, `#1E2638`), contraste acessível nos textos (`#E2E8F0`, `#94A3B8`) e bordas suaves.

---

## [6.27.1] - 2026-09-22

### Corrigido
- **Botão de Configurações de IA ausente na topbar principal**: O ícone de engrenagem (`settings`) que abre `configurarIA()` estava presente na tela inicial mas não havia sido incluído na barra de navegação principal. Adicionado ao cluster de ações, após o alternador de tema (lua) e antes do separador vertical.
- **Contraste de Cabeçalhos no Tema Escuro**: Foram criadas novas variáveis `--text-brand` e `--text-brand2` para evitar que a cor `--navy` ficasse ilegível contra o fundo escuro. Todo o projeto (44 ocorrências) foi atualizado para usar as novas variáveis, que recebem um tom de azul claro (`#818CF8`) no dark mode.
- **`overflow: hidden` nos botões de ícone removido**: Propriedade que ocultava ícones Lucide em determinadas situações foi removida do `.faciu-icon-btn`.

### Aprimorado
- **Altura da topbar aumentada em 20%**: `.faciu-nav-row1` passou de `52px` para `62px`, com botões de ação proporcionalmente maiores (`32px→36px` para ícones, `30px→36px` para CTA + e Salvar).

---

## [6.27.0] - 2026-09-22


### Adicionado e Aprimorado
- **Restyle Visual Moderno e Minimalista da Tela Inicial e Dashboard (Linear Archetype)**:
  - **Reestruturação Completa da Tela Inicial (`#startScreen`)**:
    - Substituição das ilustrações e sombras do layout legado por uma interface minimalista com foco em clareza editorial, alta densidade e acabamento refinado.
    - Nova barra de navegação superior compacta (52px) com efeito translúcido (*backdrop blur*), badge oficial da marca Brava Energia e botões discretos para alternância de tema, configurações de IA e central de ajuda.
    - *Hero Section* com selo de integridade ("Ambiente Local de Alta Produtividade • Zero-Backend"), tipografia hierarquizada e card de status em tempo real garantindo ao usuário que o app opera 100% offline no navegador sem vazamento de dados.
    - Grid de 4 ações principais estilizado com o arquétipo Linear, destacando visualmente a "Nova Investigação" com borda iluminada e realce em verde-lima (`#C6E600`), mantendo cards secundários harmoniosos com micro-transições táteis.
    - Card de retomada de estudo (`#continueCard`) redesenhado com indicador de status, identificação clara do incidente e botão primário de continuação imediata.
  - **Suporte Total ao Tema Escuro (`data-theme="dark"`) na Tela Inicial**:
    - Harmonização de todas as superfícies, bordas e textos com a paleta dark do monólito (`#0B0E14`, `#121722`, `#1E2638`), eliminando fundos brancos fixos legados.
  - **Preservação Absoluta da Árvore de Causas e Lógica Causal**:
    - 100% dos identificadores de nós, canvas Cytoscape (`#cy`), portas de ancoragem magnética, operadores lógicos na linha (`OU`/`E`), toolbar flutuante, inspetor e dados de persistência mantidos intactos e sem qualquer regressão.
- **Governança de Versão, Testes Automatizados e Backup**:
  - Promoção da versão SemVer para `v6.27.0` no monólito `FACIU-v6.27.0.html`, metadados e scripts.
  - Criação da suíte de testes `jsdom_test/test_v6270_start_screen_restyle.js` (18 testes aprovados com 100% de sucesso).
  - Execução unânime das suítes de regressão do layout de verificação (22 testes aprovados).
  - Backup histórico criado em `backups/FACIU-v6.27.0.html`.

## [6.26.0] - 2026-09-22

### Adicionado e Aprimorado
- **Assistência de Inteligência Artificial para Liberação do Relatório RIA (FORM-CORP-SMS-088 Rev. 08)**:
  - **Módulo `FACIUAssistant` Integrado ao Passo 4**: Assistente inteligente desenvolvido para apoiar a Comissão de Investigação na auditoria lógica, verificação de consistência e elaboração do parecer conclusivo para liberação regulatória do RIA.
  - **3 Modos Especializados de Auditoria e Apoio à Decisão**:
    1. *Inconsistências & Coerência*: Varredura cruzada entre fatos da Cronologia, Árvore de Causas, 5 Porquês e Seções do RIA para identificar contradições temporais ou causais.
    2. *Barreiras & Ações SMART*: Avaliação das barreiras de segurança falhas/ausentes, priorização na hierarquia de controles (Engenharia > Administrativo > EPI) e auditoria de critérios SMART no Plano de Ações (Tabela 4.7).
    3. *Parecer de Liberação RIA*: Minuta formal do Parecer Técnico Conclusivo da Comissão de Investigação pronto para homologação gerencial e arquivamento corporativo.
  - **Fluxo "Zero-Key" Corporativo ("Copiar Estudo para Copilot Corporativo")**:
    - Extração holística de todo o estado ativo da investigação (`buildAuditPayload()`), consolidando Triagem, Cronologia, Árvore (causas-raiz e hipóteses descartadas), 5 Porquês, Ações e RIA.
    - Formatação estruturada em Markdown com prompt sanitizado copiado instantaneamente para a Área de Transferência (`copyPromptForCopilot()`), permitindo execução imediata no Microsoft Copilot ou ChatGPT Corporativo da Brava Energia sem configuração de chaves de API.
  - **Conectividade de Inferência Direta e Client-Side**:
    - Suporte a chamadas diretas via `fetch()` para APIs compatíveis com o padrão OpenAI (Google Gemini 2.0 Flash / AI Studio, Groq / Llama 3.3 70B, OpenRouter, OpenAI) com armazenamento seguro de chaves exclusivamente no `localStorage`.
    - Suporte nativo experimental à Chrome Built-in AI (`window.ai.languageModel` / Gemini Nano) para inferência local 100% offline no navegador Chromium.
    - Respeito estrito à diretriz de não utilizar Ollama ou servidores locais que exijam instalação no desktop do usuário.
  - **Interface e Painel de Configurações de IA**:
    - Modal interativa `#modalAiAuditor` com abas dinâmicas para alternância entre os 3 modos, resumo contextual das diretrizes, botões de ação ("Executar Auditoria", "Copiar Estudo para Copilot Corporativo", "Copiar Parecer") e renderização de respostas em Markdown.
    - Painel de configurações `#aiConfigModal` com seletor de modo de prompt, edição customizada de diretrizes de auditoria, teste de conectividade e listagem de modelos.
  - **Preservação Integral do Paradigma Zero-Backend (SFA)**:
    - Toda a inteligência e orquestração operam 100% no cliente sem comprometer a validação regulatória determinística ou a autonomia do arquivo único.
  - **Refinamento do Motor de Extração de Payload e Eliminação de Falsos Positivos**:
    - *Consolidação Defensiva de Datas e Horas na Cronologia*: Mapeamento e normalização ampla de propriedades (`dateTime`, `datetime`, `data` + `hora`, `dataHora`, `data_hora`) garantindo que todos os timestamps e marcos da cronologia sejam transmitidos fidedignamente para o LLM.
    - *Resolução Semântica de Vínculos Causal-Temporais*: Mapeamento resiliente de `linkedNodeId`, `nodeId`, `noId` e `vinculoId`, enriquecendo os identificadores de nós com suas descrições e títulos para permitir auditoria de causa-efeito real pela IA.
    - *Compatibilização com a Arquitetura Metodológica Dual*: Incorporação de diretrizes explícitas no prompt do sistema e no payload esclarecendo que, no modo Árvore de Causas (`mainMethodology: 'tree'`), o método dos 5 Porquês opera em estudos auxiliares (`whysAuxiliary`) vinculados a nós da árvore e a ausência do 5 Porquês principal é o comportamento nominal de projeto.
    - *Consolidação Agregada de Metadados Regulatórios do RIA*: Cruzamento automático de normas corporativas (ex: `PAD-CORP-MAN-004`), correlações SGSO (ANP), sistemas de proteção (Tabela 4.5 do RIA), medidas preventivas e fatos relevantes entre Árvore, 5P e relatório FORM-CORP-SMS-088.
    - *Taxonomia Causal e Hipóteses Confirmadas*: Instrução especializada no prompt para que hipóteses com estado "Confirmada" sejam auditadas como elos válidos e comprovados da cadeia causal, sem falsos apontamentos de ambiguidade estrutural.
  - **Estabilização e Reatividade do Ícone de Sincronização e Vínculo de Pasta (`FaciuFolderMonitor`)**:
    - *Reatividade da Pílula de Sincronização*: Integração do elemento `#syncStatusPill` (`#syncStatusDot`, `#syncStatusText`) ao ciclo de vida do `InvestigationStore.persist()`, transitando visualmente entre `Salvando...` (ponto âmbar pulsante) e `Sincronizado` (ponto verde) após confirmação de gravação no IndexedDB (`faciuDB`).
    - *Eliminação de Prompts Indevidos em Novo Estudo*: Remoção de invocações automáticas de `enableDiskSync` dentro de `newStudy()` e `startNewInvestigation()`, garantindo que a seleção de pasta/arquivo ocorra estritamente sob demanda através do botão `#btnDiskSync`.
    - *Resiliência de Seleção de Ícone e Vínculo Avulso*: Ajuste no seletor de ícone do disco (`document.querySelector('#btnDiskSync svg, #btnDiskSync [data-lucide]')`) para compatibilidade total com substituições dinâmicas do Lucide, e expansão de `selectFileToBind()` para permitir vincular arquivos `.json` avulsos diretamente via `showOpenFilePicker()` / `showSaveFilePicker()` mesmo sem pasta conectada previamente.
- **Governança de Versão, Testes Automatizados e Backup**:
  - Atualização do SemVer para `v6.26.0` no monólito `FACIU-v6.26.0.html`, títulos e metadados.
  - Criação da suíte `jsdom_test/test_v6260_ai_auditor.js` (16 testes aprovados com 100% de sucesso).
  - Atualização e expansão da suíte `jsdom_test/test_v6250_folder_monitor_and_persistence.js` (45 testes aprovados).
  - Execução e aprovação unânime de toda a suíte de testes de regressão do projeto (119 testes aprovados no total).
  - Criação de backup histórico em `backups/FACIU-v6.26.0.html`.

## [6.25.0] - 2026-09-22

### Adicionado e Aprimorado
- **Monitoramento Ativo de Pasta Local no PC (File System Access API — Zero-Backend)**:
  - **Conexão Nativa de Diretório de Trabalho**: Integração com a Chromium *File System Access API* (`window.showDirectoryPicker()`, `FileSystemDirectoryHandle`, `FileSystemFileHandle`) permitindo ao usuário vincular uma pasta de trabalho local diretamente no navegador sem necessidade de servidores Node.js/Python ou extensões.
  - **Direct-to-Disk Autosave**: Gravação atômica contínua no arquivo `.json` ativo em disco a partir de modificações efetuadas na aplicação, despachada reativamente via `InvestigationStore.persist()` e `FaciuFolderMonitor.saveToDisk()`.
  - **Detecção Inteligente de Alterações Externas**: Monitoramento periódico em background (polling a cada 3s e no evento de foco da janela `window.onfocus`) combinando checagem de timestamp (`lastModified`), tamanho e cálculo criptográfico de hash SHA-256 (`crypto.subtle.digest`) para detectar edições concorrentes ou sincronizações de rede (OneDrive/SharePoint/rede local).
  - **Resolução de Conflitos em 3 Vias (`#modalFolderConflict`)**: Modal visual interativa permitindo comparar metadados das versões (local vs disco) com 3 opções claras de decisão:
    1. *Carregar do Disco (Substituir local)*: Carrega as alterações externas e sincroniza o estado da aplicação.
    2. *Sobrescrever Disco (Manter versão do app)*: Grava forçadamente o estado ativo da tela sobre o arquivo no disco.
    3. *Salvar Cópia*: Grava uma nova cópia com timestamp (`_copia_YYYYMMDD_HHMMSS.json`) na pasta monitorada.
  - **Persistência de Handles no IndexedDB v2**: Evolução do banco `FaciuDatabase` com criação da objectStore `'handles'` para manter a pasta conectada e o arquivo vinculado persistentes entre recargas do navegador.
  - **Interface no Topo (Header)**: Indicador visual interativo `#folderMonitorWrapper` com badge de status em tempo real (ponto verde com pulso de gravação), nome do arquivo/pasta vinculado e menu dropdown com ações rápidas (vincular arquivo, forçar salvamento, desconectar pasta).
- **Auditoria e Revisão Completa do Sistema de Persistência, Exportação e Importação**:
  - Revisão rigorosa de `InvestigationStore`, `faciuDB`, `save()`, `saveStudy()`, `persistentSave()`, `exportInvestigationJson()`, `validateImportPackage()` e `applyPendingImport()`.
  - Sincronização global bidirecional de variáveis de estado (`window.store`, `window.state`) garantindo consistência em todos os contextos de execução.
  - Suíte de testes automatizados `jsdom_test/test_v6250_folder_monitor_and_persistence.js` cobrindo 100% dos fluxos de conexão, gravação atômica, detecção de divergência externa, resolução de conflitos e validação estrutural de pacotes JSON (34 testes aprovados).
- **Otimização e Reformulação Compacta de Layout do Passo 4 (Verificação)**:
  - **Barra de KPI Compacta Horizontal (1A)**: Substituição dos cards altos de integridade e anel donut por uma barra de topo integrada de ~48px de altura com percentual de integridade (`#integPct`), barra linear de progresso (`#integProgressFill`), tag de status reativo e pills de contagem (`✓ Atendidos`, `✕ Bloqueios`, `⚠ Pendências`).
  - **Macro-Indicadores Modulares (2B)**: Fileira horizontal de 5 mini-cards interativos (`Triagem`, `Árvore de Causas`, `5 Porquês`, `Plano de Ações`, `Conformidade RIA`) indicando o status de conformidade de cada fase com bordas coloridas semânticas (verde, âmbar, vermelho) e atalhos de navegação rápida por teclado ou clique.
  - **Foco Central em Exceções e Itens Prioritários (2A)**: O corpo principal da tela de verificação prioriza 100% os itens com bloqueios e pendências que exigem ação corretiva, exibindo cartões de atenção com botões de redirecionamento imediato para a origem do ajuste (`editValidationItem`).
  - **Checklist de Conformidade Colapsável (Accordion)**: Os critérios já atendidos ficam organizados e recolhidos por padrão no accordion `#validationOkAccordion`, reduzindo a poluição visual e garantindo que toda a tela caiba na primeira dobra visual (sem necessidade de rolagem).
  - **Auditor IA em Modal sob Demanda (3B)**: O acionador do Auditor IA foi transferido para um botão direto na barra de KPI (`#btnOpenAiAuditor`), abrindo a modal dedicada `#modalAiAuditor` e liberando espaço no topo da página.
  - **Rastreabilidade Causa-Raiz → Ação no Accordion**: Painel de conferência de vínculos mandantes organizado em detalhes expansíveis com resumo de conformidade em badge no summary.
- **Governança de Versão e Testes Automatizados**:
  - Atualização do SemVer para `v6.25.0` no monólito `FACIU-v6.25.0.html` e nos arquivos de dados de exemplo.
  - Criação da suíte `jsdom_test/test_v6250_verification_layout.js` com 100% de aprovação para validação de layout, responsividade, cálculo de KPIs e interações modais.

## [6.24.0] - 2026-09-21

### Adicionado
- **Anexo Regulatório Oficial ao RIA: Detalhamento dos Blocos da Árvore de Causas**:
  - Implementação de anexo metodológico ao relatório de investigação RIA (`FORM-CORP-SMS-088 Rev. 08`) contendo fichas técnicas detalhadas e estruturadas para todos os blocos causais investigados na Árvore de Causas (Evento Topo, Imediata, Hipóteses, Falhas, Fatores, Causas Contribuintes e Causas-Raiz).
  - Preservação integral dos metadados analíticos coletados: identificador e código (`ET`, `CI`, `H1..Hn`, `FP1..FPn`, `CC1..CCn`, `CR1..CRn`), natureza causal, estado de validação (`Confirmada`, `Não confirmada`, `Descartada`), descrição técnica, evidências / justificativas técnicas, critérios de descarte / teste, referências externas vinculadas, correlações regulatórias com práticas do SGSO ANP, padrões corporativos e mapeamento de operadores lógicos de ramificação (`OU`, `E`, `Direta`).
  - Suporte completo a hipóteses e falhas descartadas com seus respectivos critérios de descarte técnico, atendendo a auditorias e diligências regulatórias sem violar a estrutura regulamentada do formulário principal de 6 páginas.
  - Omissão cirúrgica de nós de ação (`kind === 'acao'`) do anexo da árvore, preservando sua governança dedicada na Tabela 4.7 do relatório principal.
- **Paridade 100% entre Motores de Renderização (HTML Interativo e PDF Vetorial jsPDF)**:
  - Criação do adaptador de modelo de dados `riaTreeDetailsModel()` para extração e ordenação topológica-causal consistente.
  - Implementação do renderizador HTML `riaTreeAnnexHtml()` integrado ao `#riaPreviewModal`, `riaDocumentHtml()` e modal de impressão.
  - Integração no motor vetorial `faciuRiaGenerator` (`riaModelo()` / `blocos(d)`), com quebra automática de anexo (`{tipo:'quebraAnexo'}`), tabelas modulares de fichas técnicas e paginação A4 automática.
  - Isolamento metodológico: o anexo é gerado exclusivamente quando a Árvore de Causas for utilizada no estudo, mantendo investigações com 5 Porquês puro intactas.
- **Política de Versionamento e Backups Contínuos**:
  - Atualização do SemVer para `v6.24.0` em metadados da aplicação, interface de usuário e barra de navegação.
  - Criação de backup histórico em `backups/FACIU-v6.24.0.html`.
- **Suíte de Testes Automatizados**:
  - Implementação do teste `jsdom_test/test_v6240_tree_annex.js` validando modelo estruturado, renderização HTML, blocos de PDF vetorial e isolamento metodológico.

## [6.23.0] - 2026-09-21

### Adicionado
- **Recurso Analítico "Teste do Portanto" (Leitura Reversa de Causalidade)**:
  - Operacionalização da prática de engenharia de segurança de processos (CCPS, Lean, ASQ) para validação de suficiência lógica causal no Passo 2 (Estudo).
  - Implementação do motor `buildWhyThereforeChain` para a metodologia dos 5 Porquês (primário e auxiliares): organiza a leitura reversa partindo da causa-raiz confirmada, subindo pelos passos invertidos (5º → 1º) intercalados por badges `"PORTANTO..."`, finalizando no problema / efeito observado.
  - Implementação do motor `buildTreeThereforeChain` para a Árvore de Causas: percorre o grafo de causalidade a partir de causas-raiz ou contribuintes em direção aos ancestrais até o Evento Topo, mapeando operadores de confluência lógica (Porta E: combinação concorrente; Porta OU: suficiência independente).
  - Modal dedicada `#modalThereforeTest` com visual Linear-app contendo timeline de elos causais, badges estilizados e checklist de reflexão de suficiência causal para a comissão de investigação.
  - Botão de acionamento rápido nos 5 Porquês (`#btnWhyThereforeTest`) e botão contextual dinâmico no Floating Inspector da Árvore de Causas (`#btnTreeThereforeTest`).
  - Função de exportação / cópia estruturada da narrativa causal para ata de reunião (`copyThereforeNarrative`).
  - Preservação estrita da imutabilidade do formulário RIA (FORM-CORP-SMS-088) e da Tabela 4.7.
- **Suíte de Testes Automatizados e Exemplos Oficiais**:
  - Adição do teste `jsdom_test/test_v6230_therefore_test.js` com 100% de aprovação em JSDOM cobrindo cadeias do 5 Porquês e Árvore, abertura da modal, inspeção flutuante e cópia de narrativa.
  - Atualização dos arquivos de exemplo para a versão `v6.23.0` com zero pendências de validação.

## [6.22.7] - 2026-09-21

### Corrigido e Aprimorado
- **Exibição do Título/Descrição da Causa na Tabela 4.7 do RIA ("Descrever causa (FC / CR)")**:
  - Substituída a exibição de códigos sintéticos de causa-raiz (como `CR1`, `CR2`) pelo título/descrição claro da causa ou fator causal tanto na visualização HTML (`riaActionRows`) quanto na exportação de dados para o relatório em PDF vetorial (`riaModelo` / `carregarDadosFormularioParaPdf`).
  - Criação das funções `actionCauseNames(actionOrId)` e `actionCauseDescription(actionOrId, isHtml)` com suporte a múltiplas causas vinculadas (separadas por `<br>` no HTML e `\n` no PDF) e fallback elegante com travessão (`"—"`) para ações não vinculadas a causas.
  - Compatibilidade transversal com causas originadas tanto da Árvore de Causa (causas-raiz, fatores causais, contribuintes) quanto de estudos de 5 Porquês (principais ou auxiliares).
- **Atualização dos Pacotes de Exemplo e Validação Automática**:
  - `investigacao_faciu.json`, `investigacao_faciu_5porques_principal.json` e réplicas em `docs/exemplos/` atualizados para a versão `v6.22.7`.
  - Novos testes automatizados adicionados em `jsdom_test/test_v6227_table_47_causes.js` e `jsdom_test/test_v6227_examples_and_import_verification.js` (100% de aprovação).

## [6.22.6] - 2026-09-21

### Corrigido e Refinado
- **Validação Dual e Resolução de Falsos Alertas nos 5 Porquês Auxiliares (`fiveWhyStudyIssues`)**:
  - `fiveWhyStudyIssues` agora reconhece propriedades em português e inglês de forma interoperável (`responsible` / `responsavel`, `dueDate` / `prazo`, `title` / `label`, `causeId` / `causaRaizId` / `causaRaizIds`), eliminando falsos alertas de "Ação sem responsável" e "Ação sem prazo" para ações integradas ao plano unificado.
  - Vínculo causal de tratamento aprimorado: causas-raiz de estudos 5 Porquês auxiliares agora identificam corretamente ações atreladas ao estudo (`studyId === w.id` ou `c.actions.includes(a.id)`), solucionando o falso alerta de "Causa-raiz sem ação".
- **Deduplicação Inteligente de Ações na Importação e Sincronização (`migrateLegacyWhyActions` / `renderUnifiedActions`)**:
  - Prevenção de duplicatas de ações: detecção por identificador (`id === oldAct.id`) e por estudo e título (`studyId === w.id && label === oldLabel`).
  - Sincronização e remapeamento automático de referências de causa (`c.actions`), evitando o surgimento de nós redundantes (ex: `act_5p_01` e `a1`).
- **Arquivos de Exemplo e Suíte de Testes Atualizados**:
  - Atualizados `investigacao_faciu.json`, `investigacao_faciu_5porques_principal.json` e réplicas em `docs/exemplos/` para SemVer `v6.22.6` com dados 100% consistentes e zero pendências no checklist.
  - Adicionado `jsdom_test/test_v6226_examples_and_import_verification.js` com validação de ponta a ponta em JSDOM.

## [6.22.5] - 2026-09-21

### Corrigido e Refinado
- **Prevenção de Perda de Dados na Importação JSON (`applyPendingImport`)**:
  - Corrigida a ordem de inicialização e hidratação do DOM ao importar pacotes de investigação: `renderAll()` (que chama `hydrateTriage()`) agora é executado antes de `persistentSave()`. Anteriormente, `persistentSave()` acionava `updateStepStatus()` e `syncTriage()` antes da hidratação dos elementos do formulário, lendo valores vazios do DOM e apagando os dados de Triagem (`f_cii`, `f_titulo`, `f_ocorr`, `f_site`, `f_local`, `f_descricao`).
  - Sincronização explícita da instância de `store` (`store = new InvestigationStore(imported); state = store.getState()`), garantindo persistência contínua correta no IndexedDB e no File System Access API.
- **Arquivos de Exemplo Totalmente Preenchidos e Validados**:
  - Atualizados `investigacao_faciu.json` e `investigacao_faciu_5porques_principal.json` (e réplicas em `docs/exemplos/`) para o schema 1.1 e versão `v6.22.5`, com 0 erros de importação e 0 pendências no Passo 4 (Verificação).
- **Suíte de Testes Automatizada**:
  - Adicionado `jsdom_test/test_v6225_examples_and_import_verification.js` cobrindo o fluxo de importação real via input de arquivos e validação completa sem perda de dados (100% de aprovação).

## [6.22.4] - 2026-09-21

### Corrigido e Refinado
- **Reorganização Hierárquica sem Sobreposições (`relayout` / `semanticLayout`)**:
  - Novo algoritmo de posicionamento horizontal baseado em caixas delimitadoras de subárvores (*Subtree Bounding Boxes*), garantindo espaçamento mínimo seguro de 40px entre bordas de cartões adjacentes e eliminando todas as sobreposições horizontais.
  - Correção do rank de `fator_sub` (desdobramento sob `fatores`), que antes recebia o mesmo nível $Y$ do pai `fatores` causando colisão direta em linha; agora os subfatores (`ORGANIZACIONAL`, `AMBIENTAL`, `TECNOLÓGICO`, `INDIVIDUAL`) são organizados na linha inferior com o nó pai perfeitamente centrado acima deles.
- **Eliminação dos Nós Gate Legados e Migração Automática**:
  - Remoção completa de nós intermediários em formato de diamante (`kind: 'gate'`). Toda a lógica causal é representada diretamente na linha da conexão (`edge.logic = 'OU' | 'E'`).
  - Função `migrateLegacyGateNodes` converte automaticamente investigações legadas com conectores em ligações diretas no carregamento e na reorganização.
  - `skeletonTree` inicializado sem nós gate, com operadores textuais "OU" nas arestas sob Causa Imediata.
- **Suíte de Testes Automatizada**:
  - Adicionado `jsdom_test/test_v6224_clean_relayout_no_gates.js` com 8 testes funcionais cobrindo SemVer, migração de gates, zero colisões no cenário real do print e edição direta de lógica nas arestas (100% de aprovação).

## [6.22.2] - 2026-09-20

### Corrigido e Refinado
- **Higienização Final do Protótipo e Toolbar de Operadores**:
  - Remoção dos glifos residuais `⬡` e `&` nos botões da barra flutuante do protótipo (`prototype/prototype_edge_logic.html`), padronizando-os estritamente como `OU (Alternativas)` e `E (Combinada)`.
  - Atualização completa do Single-File Monolith para `v6.22.2` com suíte de testes dedicada `test_v6222_plain_badges_and_ports.js` e `test_v6222_edge_ports_and_scale.js` (100% de aprovação).

## [6.22.1] - 2026-09-20

### Corrigido e Refinado
- **Remoção de Símbolos e Glifos das Lógicas de Conexão**:
  - Exibição de texto puro e estrito nos botões da barra e nos badges de aresta: `OU` e `E` (sem glifos `⬡` ou `&`).
  - Ajuste nas ferramentas do protótipo interativo e nos controles do canvas de produção.

## [6.22.0] - 2026-09-20

### Adicionado
- **Portas Cardinais de Conexão no Hover ("Bolinhas")**:
  - Exibição de 4 portas cardinais (`.node-port`, 15×15px, cor Lima `#C6E600` e borda Marinho `#0E1D3C`) ao posicionar o cursor sobre qualquer bloco no canvas Cytoscape.
  - Área de clique invisível expandida para 44×44px (`.node-port::after`) para total aderência às diretrizes de acessibilidade motora WCAG 2.2.
  - Temporizador debounce de 500ms (`scheduleHidePorts()`) que previne o desaparecimento involuntário da porta ao transitar o mouse do centro do bloco para a borda.
- **Arraste e Conexão em Tempo Real (Drag-to-Connect)**:
  - Clicar e arrastar de qualquer porta renderiza uma linha curva Bézier animada em camada SVG dedicada (`#dragSvg`).
  - Snapping magnético inteligente (+20px) com detecção via `getNodeUnderPoint` e destaque visual de nó alvo (`.target-hover`).
- **Operadores Lógicos Textuais Diretos na Linha (`OU` e `E`)**:
  - Badges retangulares arredondados de alto contraste diretamente no centro da aresta:
    - **`OU`**: Fundo índigo (`#4F46E5`), texto branco puro `'OU'`, para hipóteses independentes e caminhos alternativos.
    - **`E`**: Fundo esmeralda (`#059669`), texto branco puro `'E'`, para causas combinadas simultâneas.
  - Remoção completa de glifos e símbolos intermediários (`⬡`, `&`), priorizando clareza técnica e conformidade visual.
  - Integração com a barra flutuante `#edgeFloatingActions` com controle segmentado para alternar entre `OU`, `E` e conexão direta.
  - Plena retrocompatibilidade com investigações legadas com blocos físicos `kind: 'gate'`.
- **Unificação Global de Escala Visual e Tipografia (Linear-App)**:
  - Padronização de tokens de superfícies, linhas e acentos em todo o sistema (`--surface`, `--surface2`, `--line`, `--lime`, `--navy`).
  - Altura e padding de controles unificados (botões em 32-34px, inputs em 34px, tipografia base em 12-13px com foco acessível).
- **Suíte de Testes Automatizada**:
  - Adicionado `jsdom_test/test_v6220_edge_ports_and_scale.js` com 16 testes funcionais cobrindo portas, curvas SVG, operadores textuais na aresta, tokens de escala e validação estrutural da árvore.
- **Documentação de Arquitetura**:
  - Criado `docs/adr/0005-conexao-por-portas-e-unificacao-escala-visual.md`.

---

## [6.21.0] - 2026-09-20

### Adicionado
- **Biblioteca Flutuante de Elementos (Stencil Dock - `#treeStencilDock`)**:
  - Barra lateral flutuante compacta (46px) com efeito translúcido integrada à esquerda do canvas Cytoscape.
  - Suporte completo a arrastar e soltar (HTML5 Drag and Drop com conversão de coordenadas para o plano do grafo) e clique direto para inserção inteligente no centro da tela.
  - Chips interativos para todos os tipos da taxonomia oficial da Brava Energia: Evento Topo (`ET`), Causa Imediata (`CI`), Hipótese (`H`), Causa Contribuinte (`CC`), Causa Raiz (`CR`), Ação Preventiva (`A`), Falha (`F`), Fator Sistêmico (`FSO`), Gatilho (`G`) e Recuperação (`R`).
- **Modelo Dual de Ligações (Causal vs. Correlação Transversal)**:
  - Arestas causais contínuas (`kind: 'causal'`) para a cadeia hierárquica oficial, integradas à contagem do relatório FORM-CORP-SMS-088 e ao validador da árvore.
  - Arestas de correlação tracejadas/pontilhadas em tom índigo (`#6366F1`) com curvatura Bezier para expressar conexões sistêmicas e interações transversais livres sem gerar falsos erros de validação ou violar regras de múltiplos pais.
  - Classificação inteligente automática em `handleNewConnection` baseada na taxonomia causal permitida.
- **Posicionamento Híbrido com Persistência**:
  - Nós arrastados ou soltos no canvas mantêm suas coordenadas manuais persistidas em `node.pos = { x, y }` em `state.tree.nodes`.
  - O algoritmo `semanticLayout` preserva posições manuais customizadas, calculando apenas nós automáticos.
  - Botão de reorganização (`#btnRelayout`) avisa o usuário via modal de confirmação antes de limpar posições manuais e reconstruir a árvore hierarquicamente.
- **Gestão e Exclusão Isolada de Arestas**:
  - Clique direto em arestas com destaque visual e barra flutuante de ações (`#edgeFloatingActions`) para alternar tipo de relação (`Causal` <-> `Correlação`) ou excluir a aresta.
  - Atalhos de teclado `Delete` e `Backspace` para remoção ágil de arestas sem excluir os nós conectados.

---

## [6.20.0] - 2026-09-19

### Adicionado
- **Redesign do Stepper e Navegação com Identidade Brava Energia**:
  - Indicadores visuais de status reativos por etapa no stepper principal: Completo (✓ verde `#22C55E`), Alerta de pendência recomendada (! âmbar `#F59E0B`), Bloqueio impeditivo (✕ vermelho `#EF4444`) e etapa ativa em Lima Brava (`#C6E600`) com fundo Navy (`#0E1D3C`).
  - Atualização contínua e reativa de status através de `updateStepStatus()`, integrado a `goStep()`, `renderAll()` e ao salvar estudo (`save()`).
  - Tooltips contextuais acessíveis informando o número de pendências bloqueantes ou recomendadas de cada etapa.
- **Acessibilidade Completa por Teclado**:
  - Suporte a navegação por setas (`ArrowRight` / `ArrowLeft`) para transição ágil entre passos da investigação com foco automático.
  - Ativação direta por `Enter` ou barra de `Espaço` com semântica `role="button"` e `tabindex="0"`.
- **Subguias Contextuais do Estudo (Passo 2)**:
  - Integração visual das subguias (Cronologia, 5 Porquês, Árvore de Causas, Raias, Plano de Ação) na barra inferior de navegação com transição suave.

---

## [6.19.3] - 2026-09-19

### Corrigido
- **Navegação de Correção (Passo 4)**: Restaurado o elemento `#correctionBar` no DOM do shell principal com botão "Voltar à Verificação", prevenindo exceção `TypeError` ao clicar em botões "Revisar" / "Editar".
- **Redirecionamento do 5 Porquês**: `editValidationItem()` agora seleciona automaticamente o estudo alvo (`selectedWhyId`), transiciona para o Passo 2, abre a subguia de 5 Porquês e posiciona o foco no editor.
- **Validação Interoperável de Ações e Causas**:
  - Suporte simultâneo a propriedades em português (`responsavel`, `prazo`, `label`) e em inglês (`responsible`, `dueDate`, `title`) em `fiveWhyStudyIssues()` e `getStudyGlobalActions()`.
  - Reconhecimento de vínculos de causa-raiz via `causeId`, `causaRaizId` ou array `causaRaizIds`.
  - Tabela de ações do relatório PDF de 5 Porquês compatibilizada com os campos unificados.
- **Arquivo de Demonstração**: Atualizado `investigacao_faciu.json` e suíte `jsdom_test/test_v6193_functional.js` com aprovação de 100% dos critérios e 0 pendências na verificação.

---

## [6.19.2] - 2026-09-19

### Adicionado
- **Exclusão em Cascata na Árvore de Causas**: Ao excluir um bloco ou ramo descendente na árvore, todos os estudos auxiliares de 5 Porquês vinculados são removidos em conjunto.
- **Purga de Ações Órfãs**: Ações geradas por análises de 5 Porquês excluídas são limpas automaticamente de `state.tree.nodes`.
- **Confirmação e Feedback Contextual**: Modal de exclusão informa a quantidade exata de estudos e blocos afetados.

---

## [6.19.1] - 2026-09-19

### Corrigido
- **Vínculo Fantasma nos 5 Porquês**: Corrigido fallback indevido em `getSelectedAuxiliaryWhyStudy()` que criava automaticamente um estudo atrelado a `H1` em diagramas novos.
- **Empty State Limpo**: O módulo de 5 Porquês auxiliar agora exibe orientações claras e inicia sem registros até que o investigador opte por criar um estudo.

---

## [6.19.0] - 2026-09-19

### Adicionado
- **Canvas Full-Width (100% de largura)**: Grafo Cytoscape ocupa toda a largura útil da viewport, eliminando o layout rígido de 2 colunas.
- **Floating Inspector (Linear-App)**: Painel flutuante translúcido no canto superior esquerdo para inspecionar e editar o bloco selecionado, com botão de minimização em pílula (`#btnToggleMinimize`) e contador de caracteres (máx. 70).
- **Siglas Limpas e Blocos Dinâmicos**:
  - Cabeçalho dos nós exibe apenas siglas formais (`[ET]`, `[CI]`, `[H1]`, `[CC1]`, `[CR1]`, `[A1]`), removendo nomes de categorias por extenso.
  - Dimensionamento dinâmico (`calcNodeDims`) de 140px a 200px de largura e 52px a 68px de altura com base no título.
  - Estilização com linhas finas e delicadas (1.5px de borda, 1.5px de aresta, pontas de seta 0.75).
- **Micro-Toolbar do Canvas**: Botões flutuantes no canto superior direito para Ajustar Zoom (`Fit`), Reorganizar Grafo (`Relayout`) e Exportar PNG.
- **Componente React**: Disponibilizado em `src/components/TreeFloatingInspector.tsx`.

---

## [6.18.0] - 2026-09-19

### Adicionado
- **Novo Cabeçalho no Arquétipo Linear-App**: Redução da altura vertical de ~230px para ~80px fixos com efeito de desfoque (`backdrop-filter: blur(12px)`).
  - Linha 1 (44px): Top bar minimalista com marca, monitor de sync discreto, botões utilitários em ícones e botão de salvar em tom Lima (`#C6E600`).
  - Linha 2 (36px): Stepper com pílulas compactas e subguias contextuais do Estudo (Cronologia, 5 Porquês, Árvore, Raias, Plano de Ação) integradas.
- **Conformidade de Design**: 100% sem emojis (ícones Lucide/SVG em `currentColor`), suporte a 8 estados interativos e compatibilidade total com tema escuro.
- **Componente React**: Disponibilizado em `src/components/NavigationHeader.tsx`.

---

## [6.17.0] - 2026-09-18

### Adicionado
- **Unificação dos 5 Porquês no Fluxo do RIA**:
  - Eliminação de relatórios e PDFs isolados de 5 Porquês em favor do RIA oficial (FORM-CORP-SMS-088 Rev. 08).
  - Estudo principal ocupa diretamente a Seção 4.4 do RIA para incidentes conduzidos exclusivamente por 5 Porquês.
  - Estudos auxiliares compõem Anexos Metodológicos automáticos.
  - Repositório único de ações em `state.tree.nodes` integrando a Tabela 4.7 do RIA e a Verificação Global.
- **ADR 0002**: Formalização da unificação metodológica.
