# Projeto FACIU

*Ferramenta de Análise de Causas e Investigação Unificada*

## O Sistema

O **FACIU** é uma ferramenta standalone (isolada, sem integração direta ou banco de dados externo - *Zero-Backend*) focada no auxílio à investigação de acidentes e quase acidentes. O sistema operacionaliza o padrão corporativo de investigação da **Brava Energia** (**PG-CORP-SMS-015 Rev. 09 - 23/09/2026**). O objetivo final da ferramenta é gerar e exportar o **RIA** (*Relatório de Investigação e Análise*, FORM-CORP-SMS-088). O estado do projeto vive no navegador e é salvo via download/upload de arquivos `.json`.

## Classificação e Triagem

- **Triagem**: O estágio inicial da investigação que cadastra os metadados vitais do incidente (Título, Data, Local, Severidade, etc).
- **Níveis de Risco**: O sistema e a Brava Energia operam com 3 níveis (Nível 1, Nível 2 e Nível 3). Esses níveis controlam a obrigatoriedade dos métodos investigativos e as regras de composição da Comissão.
- **Comissão**: A equipe designada para a investigação. Possui validações automatizadas dependendo do nível de risco (ex: exigência de um membro de segurança).

## Metodologias de Investigação

O FACIU suporta metodologias que podem atuar em conjunto ou de forma isolada, a depender do Nível de Risco do acidente.

### Árvore de Causas (Motor Gráfico)
A metodologia principal para traçar a causalidade. Possui um dicionário estrito de restrições topológicas:
1. **Evento Topo**: O acidente em si. (Pai de todos, só aceita Causa Imediata).
2. **Causa Imediata**: Aceita Hipóteses com operadores lógicos diretamente na ligação (`OU` ou `E`) ou portas lógicas legadas.
3. **Hipótese / Operadores Lógicos (FTA)**: Ferramentas para ramificar a investigação. A partir da v6.37.1, em conformidade estrita com a metodologia de Análise por Árvore de Falhas (FTA / ANP SGSO), o operador booleano (`OU` índigo `#4F46E5` e `E` esmeralda `#059669`) é unificado em uma única badge posicionada centralizada no tronco vertical de saída do nó pai, antes de qualquer ramificação horizontal para os filhos. Isso elimina a repetição de rótulos nas arestas filhas e permite alternar o operador com 1 clique direto no conector. Hipóteses aceitam aprofundamento (outras Hipóteses) ou Causas Contribuintes.
4. **Causa Contribuinte**: Aceita Causa Raiz.
5. **Causa Raiz**: Onde o problema fundamental foi encontrado. Aceita Ação Preventiva.
6. **Ação Preventiva (Eficácia)**: Nó-folha (não aceita filhos). Representa a barreira final que evitará a repetição.

### 5 Porquês
Metodologia de aprofundamento e desdobramento linear da causalidade. **Não possui formulário próprio, documento isolado ou plano de ação paralelo: todas as informações geradas convergem e compõem exclusivamente o Relatório RIA oficial (FORM-CORP-SMS-088).**
- **Arquitetura de Escopo Dual**:
  - **Metodologia Primária (`state.mainMethodology === 'whys'`)**: Existe exatamente 1 estudo principal (`state.whysPrimary`), pré-preenchido automaticamente da Triagem (problema, título, responsável, local e pergunta inicial). Ocupa diretamente a **Seção 4.4 do RIA oficial**, substituindo a Árvore de Causas sem gerar anexos redundantes.
  - **Metodologia Auxiliar na Árvore de Causas (`state.mainMethodology === 'tree'`)**: A Árvore ocupa a Seção 4.4 do RIA, e a investigação permite **múltiplos estudos auxiliares** independentes (`state.whysAuxiliary`), cada um vinculado a um nó específico da Árvore (Hipóteses, Falhas, Fatores). Cada estudo auxiliar gera um Anexo Metodológico próprio nas páginas finais do RIA.
- **Isolamento e Standby de Dados**: Alternar entre metodologias preserva os dados de ambos os métodos intactos em standby, com aviso/bloqueio inteligente no seletor para evitar sobrescritas acidentais.
- **Repositório Único de Ações**: Toda recomendação/ação gerada em qualquer estudo (primário ou auxiliar) é registrada em `state.tree.nodes` com `kind: 'acao'`, alimentando unificadamente a aba de Plano de Ação, o motor de Verificação Global e a Tabela 4.7 do RIA oficial.
- **Taxonomia SGSO**: Causas-raiz apuradas no 5 Porquês herdam a correlação com a taxonomia oficial do SGSO (ANP), alimentando a Tabela 4.5 do RIA.

### Relatório RIA
O **Relatório de Investigação e Análise (FORM-CORP-SMS-088 Rev. 08)** é o **único produto documental oficial** gerado pelo FACIU. Todos os métodos (Triagem, Árvore de Causas, 5 Porquês, Cronologia, Raias e Ações) são etapas de apuração que convergem exclusivamente para alimentar as seções oficiais do RIA.

### Fluxo de Trabalho e Verificação Global Unificada
A navegação e ciclo de vida da investigação segue a sequência canônica de 5 passos:
1. **Passo 1 - Triagem (`data-view="1"`)**: Metadados, classificação de risco e comissão.
2. **Passo 2 - Estudo (`data-view="2"`)**: Metodologia investigativa (Árvore de Causas, 5 Porquês canônico, Linha do Tempo e Raias).
3. **Passo 3 - RIA (`data-view="3"`)**: Documento oficial FORM-CORP-SMS-088 integrado e alimentado pelas fases anteriores.
4. **Passo 4 - Verificação (`data-view="4"`)**: Motor único e unificado de Verificação Global (conformidade da árvore/estudo, triagem, ações preventivas e integridade documental do RIA com lista de atenção e navegação direta para correção).
5. **Passo 5 - Emissão (`data-view="5"`)**: Exportação, fechamento e controle de revisões oficiais.

### Cronologia e Raias
- **Cronologia**: Lista ordenada de eventos (Fatos) antes, durante e após o acidente (com Ator, Data e Hora).
- **Raias (Lanes)**: Uma ferramenta de agrupamento visual/gerencial no sistema (representação de interface) para facilitar a organização dos elementos da árvore de causas pelos investigadores.

## Arquitetura de Interface e Navegação (Linear-app v6.18.0)

A partir da versão v6.18.0, o FACIU adota uma navegação de densidade ultra-compacta inspirada no arquétipo **linear-app** (`ux-apply-aesthetic`), reduzindo a altura vertical do cabeçalho de ~230px para apenas ~80px fixos com `backdrop-filter: blur`:
1. **Linha 1 (44px - Top Bar)**:
   - Marca Brava + FACIU com badge de versão.
   - Monitor de sincronização discreto (ponto com estado visual de sync, idle e offline).
   - Ações utilitárias minimalistas em ícones com tooltips acessíveis (Menu de Ajuda unificado, Exportar JSON, Sincronização em Disco Local e Alternador de Tema claro/escuro).
   - Ações de criação e salvamento: Botão "Novo" discreto e Botão "Salvar" com alto contraste (Lima `#C6E600`), suporte ao atalho global `Ctrl+S`.
2. **Linha 2 (36px - Stepper & Subguias Integradas)**:
   - **Lado Esquerdo**: Stepper minimalista com as 5 etapas canônicas (1. Triagem, 2. Estudo, 3. RIA, 4. Verificação, 5. Emissão), eliminando os cards descritivos pesados e mantendo apenas pills compactas com numeração e status de conclusão.
   - **Lado Direito**: Subguias de trabalho contextual do Estudo (Cronologia, 5 Porquês, Árvore de Causa, Raias, Plano de Ação) ativadas e exibidas exclusivamente durante o Passo 2, eliminando barras secundárias redundantes no corpo da página.
3. **Padrão de Código e Componentização**:
   - Disponibilizado tanto no monolito de produção [FACIU-v6.18.0.html](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/FACIU-v6.18.0.html) quanto como componente React isolado em TypeScript + Tailwind CSS em [`src/components/NavigationHeader.tsx`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/src/components/NavigationHeader.tsx).
   - Conformidade rigorosa com o `ux-design-doctrine`: zero emojis (apenas ícones Lucide/SVG `currentColor`), 8 estados em todos os controles interativos e suporte integral a tema escuro.

## Editor Flutuante da Árvore de Causa e Blocos Dinâmicos (v6.19.0)

A partir da versão v6.19.0, a área de manipulação da Árvore de Causas foi modernizada para liberar 100% da largura útil para o canvas Cytoscape (`#cy`), eliminando a divisão rígida em duas colunas:
1. **Canvas 100% Full-Width**:
   - O canvas Cytoscape expande por toda a largura disponível da viewport.
   - Micro-toolbar flutuante translúcida no canto superior direito (`.tree-canvas-toolbar`) com controles de Ajustar Zoom (`#btnFit`), Reorganizar nós hierarquicamente (`#btnRelayout`) e Exportar PNG (`#btnPng`).
2. **Editor Flutuante Sobreposto (Floating Inspector - Linear-app)**:
   - Ancorado no canto superior esquerdo (`top: 14px; left: 14px; width: 320px; z-index: 20`) com acabamento translúcido (`backdrop-blur-md`, bordas sutis de 1px e sombra elegante).
   - Suporte a **minimização em pílula compacta** (~36px de altura) via `#btnToggleMinimize`, recolhendo o corpo e mantendo visível apenas a sigla e o título do bloco selecionado.
   - Formulário contextual com contador de caracteres (máx. 70), descrição, seletor de tipo de filho/conector e grid de ações tátil em 2 colunas (`[+ Filho]`, `[+ Irmão]`, `[5 Porquês]`, `[Causa-Raiz]`, `[Excluir]`).
3. **Siglas Limpas de Identificação & Blocos Dinâmicos com Linhas Finas**:
   - **Fim da poluição por categoria**: Nomes repetitivos de tipo (como `"HIPÓTESES"` ou `"CAUSA CONTRIBUINTE"`) foram completamente eliminados do interior dos blocos.
   - **Siglas limpas e concisas**: Identificação no cabeçalho por siglas formais (`[ET]`, `[CI]`, `[H1]`, `[CC1]`, `[CR1]`, `[A1]`, `[FP1]`, `[FH1]`, `[FS1]`) com marcadores discretos de estado e 5 Porquês (`5P × N`).
   - **Mais espaço para o título**: Suporte a até 70 caracteres com quebra de linha inteligente e reticências (`…`) quando exceder.
   - **Linhas finas e delicadas com alta legibilidade**:
     - Bordas de nós finas (`border-width: 1.5px`, nós selecionados `2px` com halo lime delicado).
     - Linhas de conexão refinadas (`width: 1.5px`, pontas de seta reduzidas `arrow-scale: 0.75`).
     - Tipografia equilibrada e legível (`font-size: 9.5px`, `font-weight: 500`, `line-height: 1.24`).
   - **Dimensionamento Dinâmico**: Largura (140px a 200px) e altura (52px a 68px) calculadas dinamicamente via `calcNodeDims(n)` com base no tamanho do título, sincronizadas automaticamente em `cyFromState()` e `cyPatch(n)`.
4. **Componentização e Padrões**:
   - Componente React em TypeScript + Tailwind CSS: [`src/components/TreeFloatingInspector.tsx`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/src/components/TreeFloatingInspector.tsx).
   - Aplicação de produção: [`FACIU-v6.19.3.html`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/FACIU-v6.19.3.html).
   - Suíte de testes automatizados: [`jsdom_test/test_v6193_functional.js`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/jsdom_test/test_v6193_functional.js).

## Correção do Vínculo Fantasma de 5 Porquês na Árvore (v6.19.1)

Na versão v6.19.1, foi corrigido o comportamento em que investigações novas da Árvore de Causas iniciavam inadvertidamente com um estudo de 5 Porquês auxiliar atrelado à primeira hipótese (`H1` / `hip`), exibindo `5P × 1` no bloco:
1. **Causa Raiz Corrigida**: `getSelectedAuxiliaryWhyStudy()` continha um fallback automático que criava um estudo atrelado a `firstHyp` quando `state.whysAuxiliary` estava vazio, disparado durante o boot via `save()` e `syncMethodologyTabs()`.
2. **Ciclo de Vida Limpo**:
   - `getSelectedAuxiliaryWhyStudy()` agora retorna `null` caso não haja estudos auxiliares criados pelo usuário.
   - `resetTree()` zera explicitamente `state.whysAuxiliary = []` e `selectedWhyId = null`.
   - `deleteAuxiliaryWhy()` não recria estudos fantasma ao excluir o último item.
   - `renderWhyEditor()` e `renderWhyDashboard()` tratam `w = null` com empty state informativo e amigável, sem lançar `TypeError`.
   - Botão `5 Porquês deste bloco` (`createWhyFromSelectedNode()`) foi devidamente conectado para originar estudos apenas sob demanda explícita do investigador.

## Exclusão em Cascata de 5 Porquês ao Deletar Bloco da Árvore (v6.19.2)

Na versão v6.19.2, foi implementada a exclusão em cascata das análises de 5 Porquês vinculadas ao remover blocos na Árvore de Causas:
1. **Exclusão em Cascata (`deleteSelected`)**: Ao excluir um bloco e seus descendentes na árvore (`rm`), qualquer estudo auxiliar em `state.whysAuxiliary` vinculado a um desses blocos é permanentemente excluído em conjunto.
2. **Limpeza de Ações Associadas**: Todas as ações do plano de ação em `state.tree.nodes` geradas dentro dos 5 Porquês excluídos (`studyId`) são removidas, evitando ações órfãs.
3. **Confirmação e Feedback Detalhados**: O diálogo de confirmação detalha quantos blocos descendentes e quantas análises de 5 Porquês vinculadas serão apagadas, e o toast de conclusão confirma a operação.
4. **Atualização Imediata da Interface**: Se o estudo excluído for o ativo, o seletor `selectedWhyId` é atualizado para o próximo estudo remanescente ou `null`, e o editor de 5 Porquês é renderizado de imediato.

## Resolução de Navegação na Verificação e Validação dos 5 Porquês (v6.19.3)

Na versão v6.19.3, foram corrigidos o redirecionamento de itens de atenção no Passo 4 e a convergência de validação das ações nos 5 Porquês:
1. **Restauração do Elemento `#correctionBar`**:
   - Inserido no DOM do shell principal com botão de retorno ("Voltar à Verificação") e tratamento defensivo em `showCorrectionBar(title)` e `returnToVerification()` para prevenir exceções não tratadas.
2. **Navegação Direta e Precisa (`editValidationItem`)**:
   - Suporta itens com `targetType === 'whys'`, setando automaticamente `selectedWhyId`, ativando o Passo 2, selecionando a aba dos 5 Porquês e renderizando o editor correspondente com rolagem suave.
3. **Compatibilização Dual de Ações e Causas (`fiveWhyStudyIssues` e `getStudyGlobalActions`)**:
   - Validação interoperável suportando tanto nomes de atributos em português (`responsavel`, `prazo`, `label`) quanto em inglês (`responsible`, `dueDate`, `title`).
   - Reconhecimento de vínculos de causa-raiz via `causeId`, `causaRaizId` e arrays `causaRaizIds`.
   - Geração de relatório PDF dos 5 Porquês alinhada com as propriedades unificadas.
4. **Conjunto de Validação Real**:
   - Arquivo canônico `investigacao_faciu.json` e suíte `jsdom_test/test_v6193_functional.js` com 9 testes automatizados cobrindo 100% dos critérios e 0 pendências.

## Árvore Interativa Lucid-like, Stencil Dock e Modelo Dual de Ligações (v6.21.0)

Na versão v6.21.0, a Árvore de Causas incorpora recursos interativos de diagramação avançada no estilo Lucidchart / Miro, preservando rigorosamente a taxonomia causal da Brava Energia e do formulário FORM-CORP-SMS-088:

1. **Biblioteca de Elementos Flutuante (Stencil Dock - `#treeStencilDock`)**:
   - Barra vertical compacta (46px de largura) ancorada à esquerda do canvas Cytoscape.
   - Suporte completo a drag-and-drop HTML5 diretamente no canvas e clique rápido para inserção imediata.
   - Contém chips coloridos com as siglas de toda a taxonomia oficial: Evento Topo (`ET`), Causa Imediata (`CI`), Hipótese (`H`), Causa Contribuinte (`CC`), Causa Raiz (`CR`), Ação Preventiva (`A`), Falha (`F`), Fator Sistêmico (`FSO`), Gatilho (`G`) e Recuperação (`R`).

2. **Modelo Dual de Ligações (Causal vs. Correlação)**:
   - **Arestas Causais (`kind: 'causal'`)**: Linhas sólidas contínuas que formam a espinha dorsal metodológica exigida pela ANP SGSO. Apenas estas arestas compõem a hierarquia oficial e são auditadas por `validateTreeStructure()`.
   - **Arestas de Correlação (`kind: 'correlation'`)**: Linhas tracejadas/pontilhadas em tom índigo (`#6366F1`) com curvatura Bezier. Permitem conectar nós transversais, fatores concomitantes ou influências sistêmicas sem quebrar a árvore hierárquica e sem disparar falsos alertas de múltiplos pais ou ciclos causais.

3. **Posicionamento Híbrido com Persistência e Confirmação de Relayout**:
   - Elementos posicionados ou arrastados pelo usuário gravam coordenadas manuais em `node.pos = { x, y }` persistidas em `state.tree.nodes`.
   - O algoritmo `semanticLayout` respeita nós com posições manuais atribuídas.
   - O botão de reorganização automática (`#btnRelayout`) solicita confirmação antes de limpar coordenadas customizadas (`delete n.pos`), prevenindo perda involuntária de diagramações manuais.

4. **Gestão e Exclusão Isolada de Arestas**:
   - Clique em arestas ativa a barra flutuante de ações (`#edgeFloatingActions`) com botões para alternar tipo (Causal <-> Correlação) e deletar a ligação isoladamente sem excluir nenhum dos nós.
   - Suporte a atalhos de teclado `Delete` e `Backspace` para remoção rápida de conexões selecionadas.

## Conexão por Portas Cardinais, Operadores Lógicos na Linha e Escala Visual Unificada (v6.22.0)

Na versão v6.22.0, o FACIU aprimora a modelagem causal direta e unifica a experiência visual em todos os módulos:

1. **Portas Cardinais de Conexão no Hover ("Bolinhas")**:
   - Ao passar o cursor sobre qualquer bloco no canvas, 4 portas circulares de conexão (`.node-port`, 15×15px, cor Lima `#C6E600` e borda Marinho `#0E1D3C`) surgem nas extremidades Norte, Sul, Leste e Oeste do nó.
   - **Tolerância Motora e Acessibilidade (WCAG)**: Hit area expandida de 44×44px via pseudo-elemento invisível e temporizador debounce de 500ms (`scheduleHidePorts()`), impedindo que a porta desapareça acidentalmente durante a transição do cursor entre o interior do nó e a borda.
2. **Arraste e Conexão em Tempo Real (Drag-to-Connect)**:
   - Clicar e arrastar a partir de qualquer porta ativa uma linha curva Bézier interativa em tempo real renderizada em camada SVG dedicada (`#dragSvg`).
   - Algoritmo de proximidade com tolerância magnética expandida (+20px) detecta o nó sob o cursor (`getNodeUnderPoint`) e aplica destaque visual de alvo (`.target-hover`).
   - Soltar o mouse estabelece a conexão direta e aplica a classificação causal ou de correlação.
3. **Operadores Lógicos Textuais Diretos na Aresta (`OU` e `E`)**:
   - Elimina a necessidade de nós intermediários (`kind: 'gate'`) no canvas para expressar ramificações lógicas.
   - As arestas exibem badges retangulares arredondados de alto contraste diretamente na linha:
     - **`OU`**: Fundo índigo (`#4F46E5`), texto branco puro `'OU'`, para hipóteses concorrentes e alternativas independentes.
     - **`E`**: Fundo esmeralda (`#059669`), texto branco puro `'E'`, para causas combinadas simultâneas.
   - Sem ícones ou glifos intermediários (`⬡`, `&`), priorizando legibilidade técnica imediata.
   - Barra flutuante de arestas (`#edgeFloatingActions`) permite alternar instantaneamente entre `OU`, `E` e ligação direta.
   - Suporte transparente e retrocompatível com investigações legadas com nós `gate`.
4. **Unificação Global de Escala e Tipografia (Linear-App)**:
   - Resolução e densidade estendidas a todos os 5 passos da aplicação (Triagem, Estudo, RIA, Verificação, Emissão).
   - Botões padronizados em 32-34px de altura, campos de formulário em 34px, tipografia base em 12-13px e foco acessível com anel de 3px em `--lime`.

## Recurso Analítico "Teste do Portanto" (v6.23.0)

Na versão v6.23.0, o FACIU implementa o método formal de verificação reversa de causalidade ("Teste do Portanto / Therefore Test"), consagrado pelas diretrizes do CCPS e metodologia Lean/6-Sigma:

1. **Objetivo e Governança**:
   - Operação restrita ao Passo 2 (Estudo) como ferramenta analítica da comissão para validação de suficiência lógica antes da emissão.
   - Preserva estritamente a imutabilidade do formulário oficial RIA (FORM-CORP-SMS-088) e da Tabela 4.7.
2. **Motor Causal para 5 Porquês (`buildWhyThereforeChain`)**:
   - Constrói a leitura de baixo para cima: Causa-Raiz confirmada $\rightarrow$ *PORTANTO...* $\rightarrow$ 5º Porquê $\rightarrow$ ... $\rightarrow$ 1º Porquê $\rightarrow$ *PORTANTO...* $\rightarrow$ Problema/Efeito Observado.
3. **Motor Causal para Árvore de Causas (`buildTreeThereforeChain`)**:
   - Percorre o grafo a partir de Causas-Raiz ou Causas Contribuintes subindo pelos ancestrais até o Evento Topo.
   - Interpreta com precisão as portas lógicas nas arestas (Porta E: combinação concorrente necessária; Porta OU: suficiência independente).
4. **Interface e Usabilidade**:
   - Subguia dedicada "Teste do Portanto" e modal de auditoria rápida `#modalThereforeTest` com timeline visual e checklist reflexivo.
   - Botões contextuais no editor de 5 Porquês (`#btnWhyThereforeTest`) e no Floating Inspector da Árvore (`#btnTreeThereforeTest`).
   - Botão para cópia rápida da narrativa causal estruturada em texto formatado para atas e relatórios de comissão (`copyThereforeNarrative`).

## Anexo Regulatório Oficial ao RIA: Detalhamento da Árvore de Causas (v6.24.0)

Na versão v6.24.0, o FACIU incorpora o Anexo Metodológico da Árvore de Causas no relatório oficial RIA:

1. **Fichas Técnicas Estruturadas**:
   - Detalhamento bloco a bloco de todos os nós causais investigados (Evento Topo, Causa Imediata, Hipóteses, Falhas, Fatores, Causas Contribuintes e Causas-Raiz).
   - Registro minucioso de metadados: Identificador formal (`ET`, `CI`, `H1..Hn`, `CR1..CRn`), status de validação (`Confirmada`, `Não confirmada`, `Descartada`), descrição técnica, evidências/justificativas, critérios de descarte, padrões corporativos e taxonomia SGSO ANP.
2. **Preservação de Hipóteses Descartadas**:
   - Hipóteses e falhas descartadas são devidamente listadas com seus critérios técnicos de descarte, comprovando rigor metodológico para auditorias da ANP sem poluir a narrativa sintética do corpo principal do RIA.
3. **Isolamento de Ações**:
   - Nós de ação preventiva (`kind === 'acao'`) são omitidos do anexo da árvore, centralizados exclusivamente na Tabela 4.7 do RIA oficial.
4. **Paridade Absoluta HTML e PDF Vetorial jsPDF**:
   - Modelo de dados unificado via `riaTreeDetailsModel()`.
   - Renderização HTML integrada via `riaTreeAnnexHtml()` na visualização prévia do RIA e impressão.
   - Renderização vetorial no gerador de PDF `faciuRiaGenerator` com paginação automática A4, tabelas com quebra de página limpa e cabeçalhos formais do anexo.
   - Isolamento metodológico: gerado exclusivamente quando a metodologia utilizada for a Árvore de Causas.

## Otimização e Layout Compacto do Passo 4 - Verificação (v6.25.0)

Na versão v6.25.0, o Passo 4 (Verificação) foi inteiramente reestruturado para maximizar a densidade de informação e o foco em exceções na primeira dobra visual:

1. **Barra de KPI Compacta Horizontal (1A)**:
   - Uma barra de topo (~48px) consolida o percentual de integridade (`#integPct`), barra linear de progresso (`#integProgressFill`), tag de status reativa (`#validationStatusTag`) e pills semânticas (`✓ Atendidos`, `✕ Bloqueios`, `⚠ Pendências`).
2. **Macro-Indicadores por Módulo (2B)**:
   - Grade horizontal com 5 mini-cards (`Triagem`, `Árvore de Causas`, `5 Porquês`, `Plano de Ações`, `Conformidade RIA`), exibindo o status de cada fase com indicação visual (`is-ok`, `has-required`, `has-blocking`) e navegação imediata ao módulo ao clicar.
3. **Foco 100% em Exceções e Itens Prioritários (2A)**:
   - A lista de atenção principal destaca exclusivamente os itens com bloqueios e pendências que exigem ação do usuário, oferecendo botões rápidos para preenchimento na origem (`editValidationItem`).
4. **Checklist de Critérios em Conformidade Colapsável**:
   - Critérios já atendidos ficam recolhidos dentro de um accordion discreto (`#validationOkAccordion`), liberando o espaço vertical da tela para os pontos críticos.
5. **Auditor IA sob Demanda em Modal (3B)**:
   - O painel de IA foi desacoplado do topo da tela e convertido em um botão rápido na barra de KPI (`#btnOpenAiAuditor`), abrindo a modal `#modalAiAuditor` apenas quando requisitado pelo usuário.
6. **Rastreabilidade Causa-Raiz → Ação Preventiva**:
   - Estruturado em painel de detalhes expansíveis (`#rootActionTracePanel`) com chip de status resumido (`✓ 100% Vinculadas` ou `N pendente(s)`).

## Monitoramento Ativo de Pasta Local & Auditoria de Persistência (v6.25.0)

Na versão v6.25.0, o FACIU implementa monitoramento nativo de pasta e arquivo no cliente via **Chromium File System Access API** (`window.showDirectoryPicker`, `FileSystemDirectoryHandle`, `FileSystemFileHandle`) com auditoria rigorosa de persistência:

1. **Monitoramento Ativo Client-Side (Zero-Backend)**:
   - Conexão nativa a diretórios e arquivos `.json` locais no computador através do navegador (Chrome, Edge, Opera), sem dependência de servidores Node.js/Python ou extensões.
   - Polling inteligente e não intrusivo (a cada 3s com janela ativa e no evento `window.onfocus`).
   - Detecção criptográfica de alterações externas combinando `file.lastModified` e hash SHA-256 (`crypto.subtle.digest`), evitando falsos alertas gerados pela própria aplicação.

2. **Direct-to-Disk Autosave**:
   - Gravação atômica contínua em disco orquestrada via `InvestigationStore.persist()` e `FaciuFolderMonitor.saveToDisk()`.
   - Debouncing de 2000ms para digitação rápida, garantindo que alterações no estado em memória sejam sincronizadas diretamente no arquivo do PC sem travar a interface.

3. **Resolução de Conflitos em 3 Vias (`#modalFolderConflict`)**:
   - Caso um arquivo monitorado seja alterado concorrentemente (ex: outro usuário, sincronização de rede OneDrive/SharePoint), a modal de conflito é acionada com 3 opções claras:
     1. **Carregar alterações do disco (`reload`)**: Normaliza e atualiza o estado em memória com a versão do disco.
     2. **Sobrescrever disco (`overwrite`)**: Força a gravação da versão atual do aplicativo sobre o arquivo no disco.
     3. **Salvar como cópia (`copy`)**: Cria um novo arquivo versionado com timestamp (`_copia_YYYYMMDD_HHMMSS.json`).

4. **Persistência de Conexão no IndexedDB (`handles`)**:
   - `faciuDB` expandido para v2 com a nova objectStore `'handles'` para reter os handles de diretório e arquivo entre sessões do navegador.

5. **Auditoria de Persistência, Importação e Exportação**:
   - Validação aprimorada de pacotes canônicos `brava-investigacao-causas` (schema v1.1).
   - Suíte de testes automatizados com mocks de File System Access API (`jsdom_test/test_v6250_folder_monitor_and_persistence.js`) garantindo 100% de conformidade.

## Assistente de Inteligência Artificial para Liberação do RIA (v6.26.0)

Na versão v6.26.0, o FACIU introduz uma integração robusta de Inteligência Artificial focada em apoiar a Comissão de Investigação na auditoria lógica, consistência cruzada e emissão do parecer conclusivo de liberação do relatório RIA (`FORM-CORP-SMS-088 Rev. 08`), respeitando 100% o paradigma *Zero-Backend* e a restrição de não exigir instalação local de servidores como Ollama:

1. **3 Modos Especializados de Auditoria e Análise**:
   - **Modo 1: Inconsistências & Coerência (`inconsistencies`)**: Varredura lógica automatizada cruzando dados da Cronologia de Fatos, Árvore de Causas, 5 Porquês e Seções do RIA (3.1 - Descrição e 4.6 - Análise Técnica) para identificar incongruências temporais, causas órfãs ou lacunas de evidência.
   - **Modo 2: Barreiras & Ações SMART (`barriers`)**: Análise das barreiras de segurança (preventivas e mitigadoras), verificação do posicionamento na hierarquia de controles (priorizando Engenharia sobre Procedimento/EPI) e checagem de critérios mensuráveis SMART no Plano de Ações (Tabela 4.7).
   - **Modo 3: Parecer de Liberação RIA (`release`)**: Elaboração técnica e fundamentada da minuta do Parecer Técnico Conclusivo da Comissão de Investigação para subsidiar a aprovação gerencial e encerramento formal do incidente.

2. **Fluxo Exclusivo Copilot Corporativo 100% Offline (v6.36.0)**:
   - Compilação holística e estruturada de todas as evidências, metadados de triagem, nós da árvore (incluindo hipóteses descartadas), estudos de 5 Porquês e ações em Markdown com prompt executivo sanitizado (`buildAuditPayload()` e `buildFormattedPrompt()`).
   - Cópia instantânea para a Área de Transferência (`copyProjectDataForCopilot()` e `copyPromptForCopilot()`), permitindo ao usuário colar diretamente no Microsoft Copilot ou ChatGPT Corporativo da Brava Energia sem tráfego de rede para APIs externas.

3. **Arquitetura 100% Segura e Client-Side (Zero-API / Zero-External-Fetch)**:
   - **Eliminação Total de Chamadas de API**: A partir da versão v6.36.0, o FACIU não realiza nenhuma chamada de rede externa via `fetch()` para APIs de IA, eliminando riscos de vazamento de credenciais ou dependência de serviços externos.
   - **Isolamento de Segurança Absoluto**: Todos os dados do estudo permanecem estritamente no cliente local, sem chaves de API armazenadas e sem necessidade de conexão com provedores de inferência de nuvem.

4. **Interface Visual e Ação Rápida no Passo 4**:
   - Botão direto na barra de KPI do Passo 4 (`#btnCopyProjectCopilot`), permitindo copiar em 1 clique o estudo consolidado para análise no Copilot.
   - Modal interativa `#modalAiAuditor` com abas dinâmicas para os 3 modos de análise técnica e exportação especializada.
   - Painel `#aiConfigModal` simplificado para personalização de diretrizes textuais da comissão sem requisição ou armazenamento de chaves de API.

## Recurso Completo de Desfazer e Refazer (Undo / Redo - v6.28.0 / v6.28.1)

Nas versões v6.28.0 e v6.28.1, o FACIU implementa histórico completo de reversão com controle imutável de até 40 passos no `InvestigationStore`:
1. **Atalhos Globais**: Suporte total a `Ctrl+Z` e `Ctrl+Y` / `Ctrl+Shift+Z` na interface e durante o foco em campos.
2. **Sincronização Bidirecional**: Reversão e restauração simultânea no estado em memória (`state`) e em todos os controles visuais do DOM (`[data-ria]`, inputs da Triagem, nós do Cytoscape).
3. **Botões Contextuais e Toast com Desfazer**: Controles visuais na TopBar e no Canvas, com toast tátil de recuperação pós-exclusão.

## Ingestão de Comunicado Inicial de Incidente (CII) e Cascata Documental (v6.29.0)

Na versão v6.29.0, o FACIU introduz a capacidade de importar arquivos HTML de Comunicado Inicial de Incidente (CII corporativo da Brava Energia), operando a alimentação progressiva em cascata com prioridade documental do RIA:
1. **Parser DOM Nativo Client-Side (`parseCiiHtml`)**:
   - Processamento 100% no navegador (Zero-Backend) via `DOMParser`, extraindo metadados gerais, número do CII, polo, instalação/sonda, CNPJ, datas de ocorrência, constatação, resposta e primeiro atendimento, contratada e protocolos (ANP/OEMA).
2. **Alimentação em Cascata nos 3 Primeiros Passos**:
   - **Passo 1 (Triagem)**: Metadados gerais, título composto inteligente (`[Evento] — [Instalação]`) e novo grupo dedicado para **Dados do Comunicante do CII** (Nome, Função e Telefone), mantendo o **Emissor do RIA** independente.
   - **Passo 2 (Estudo / Cronologia)**: Criação automática dos 4 marcos temporais iniciais do evento com identificação de encerramento da resposta (`isEnd = true`).
   - **Passo 3 (Relatório RIA - FORM-CORP-SMS-088 Rev. 08)**: Preenchimento de dados cadastrais, protocolos (SISO ANP / IDEMA), descrição técnica (item 3.1) e providências adotadas / ações preliminares (item 5.1).
3. **Prioridade Absoluta do RIA e Modo Aditivo**:
   - O formulário oficial FORM-CORP-SMS-088 e campos já digitados pelo usuário nunca são sobrescritos por padrão; a importação preenche exclusivamente campos vazios.
   - Modal de prévia e conferência (`#ciiPreviewModal`) permite visualização antes da aplicação com opção de substituição forçada apenas sob autorização explícita do usuário.
   - Reversível instantaneamente via `faciuUndo()` (`Ctrl+Z`).
4. **Enquadramento Semântico na Matriz de Risco Rev.07 (`matchCiiToMatrix`)**:
   - Correlaciona Dano e Classificação do CII diretamente com a taxonomia oficial da `SEVERITY_MATRIX` (`cat8 > m07-r10 > s1`), calculando e registrando a severidade real na Matriz.
5. **Pontos de Entrada no Shell**:
   - Card dedicado na Tela Inicial (`#startScreen`) e botão rápido no cabeçalho do Passo 1 (Triagem).

## Escolha de Metodologia, Modo de Importação e Limpeza de Histórico (v6.29.1)

Na versão v6.29.1, o fluxo de importação do CII foi aprimorado para conceder total controle metodológico ao usuário e garantir isolamento estrito entre investigações:
1. **Seleção de Metodologia no Modal de Importação**:
   - Inclusão de seletor causal no `#ciiPreviewModal` permitindo escolher entre **Árvore de Causa** e **5 Porquês** antes de abrir a investigação.
   - Pré-seleção inteligente baseada na severidade calculada na Matriz Rev.07 (Nível 1 sugere 5 Porquês ou Árvore; Níveis 2 e 3 sugerem Árvore).
2. **Seletor de Modo (Novo Estudo Limpo vs. Mesclar)**:
   - Permite ao usuário escolher entre iniciar uma **Nova Investigação** (com reset completo e limpo de nós pré-existentes via `novoEstado()`, evitando bloqueios indevidos de metodologia) ou **Mesclar com a investigação atual** (para atualizar campos mantendo a árvore em andamento).
3. **Expurgo Defensivo de Consequências Corrompidas ("Nível 2 - undefined")**:
   - Sanitização automática contínua em `migrarEstudo()`, `recalcClassification()` e `renderClassificationAssessments()` para eliminar registros órfãos sem critério ou com ocorrência `undefined`.
4. **Desacoplamento e Esclarecimento de "Dados do Comunicante"**:
   - Eliminação do fallback `t.regpor` que contaminava o campo do Comunicante com o usuário logado no navegador.
   - Identificação visual nítida na Triagem esclarecendo que o Comunicante representa a pessoa que emitiu o alerta inicial na instalação (extraído do formulário CII), totalmente independente do investigador ou emissor do RIA.

## Aprimoramento Textual com IA, Ações Copilot e Bloqueadores Pré-Auditoria (v6.30.0)

Na versão v6.30.0, o FACIU aprofunda a integração de IA na redação técnica de campos extensos e estabelece guardrails rigorosos contra falsos positivos e laudos em branco:
1. **AI Text Enhancer Engine & Modal Comparativo (`#modalTextEnhancer`)**:
   - Mecanismo integrado de aprimoramento textual em campos de texto longo (Triagem `f_descricao` e todos os 24 textareas do formulário oficial RIA).
   - Modal com interface lado a lado: metadados do incidente, visualização do rascunho original em modo leitura e área editável com a sugestão aprimorada por IA.
   - Engenharia de prompts com diretrizes estritas da Brava Energia: tom impessoal e formal (voz passiva), terminologia de SMS e engenharia de processos, com preservação fática absoluta (proibição de inventar dados ou causas).
   - Injeção direta no campo via `applyEnhancedTextToField()`, sincronizando o DOM e o estado do RIA (`riaSet`), com gravação de snapshot no histórico (`InvestigationStore.pushHistory`) para permitir reversão instantânea via `Ctrl+Z` (`faciuUndo`).
2. **Ação Rápida "Copiar p/ Copilot" por Campo**:
   - Botão direto presente no cabeçalho dos campos de texto, permitindo copiar em 1 clique um prompt estruturado para o Microsoft Copilot Corporativo.
   - Validação defensiva que impede cópias de rascunhos com menos de 15 caracteres.
   - O prompt inclui metadados do incidente (Instalação, Data, Título, Campo), instruções formais de SMS e o rascunho do usuário delimitado em aspas triplas.
3. **Bloqueador Pré-Auditoria do Auditor IA (`validateAuditReadiness`)**:
   - Avaliação algorítmica de 6 dimensões essenciais da investigação antes de liberar a execução da auditoria.
   - Bloqueia automaticamente a execução em estudos incompletos ou em branco, desabilitando o botão `#btnAiRunAudit` e exibindo o cartão de alerta vermelho `#aiAuditorBlockerBox` com a lista detalhada de pendências impeditivas.
   - Interrupção assíncrona preventiva em `startAudit()` impedindo chamadas desnecessárias de API.
4. **Endurecimento Anti-Complacência e Expurgo de Fallbacks Fictícios**:
   - Inclusão da **Regra Zero Anti-Complacência** nos prompts do Auditor IA, exigindo reprovação técnica mandatória ("REPROVADO / NÃO CONFORME" ou "INAPTO PARA LIBERAÇÃO — INVESTIGAÇÃO INCOMPLETA") se houver campos não informados ou ausência de causas-raiz.
   - Erradicação de fallbacks que preenchiam dados fictícios (`SGSO 10 - Integridade Mecânica`, `PAD-CORP-MAN-004`, etc.) em `buildAuditPayload()`.


## Redesenho da Tela Inicial, Gestão de Arquivos e Catálogo Local de Estudos (v6.35.0)

Na versão v6.35.0, o fluxo inicial de entrada e gestão de arquivos locais foi totalmente modernizado:
1. **Gestão Descomplicada de Arquivos**:
   - **Nova Investigação**: Criação de estudos em branco com salvaguarda e isolamento total de dados.
   - **Abrir Estudo (`Ctrl+O`)**: Abertura nativa de arquivos `.json` locais através de `window.showOpenFilePicker` ou seletor tradicional com suporte a drag-and-drop.
   - **Salvar Como (`Ctrl+Shift+S`)**: Exportação ou gravação de cópias independentes no disco do computador.
   - **Pasta de Trabalho (`#modalWorkspaceManager`)**: Conexão com diretório local do usuário através da File System Access API para salvar alterações em tempo real a cada edição.
2. **Catálogo Inteligente de Estudos (`FaciuStudyCatalog`)**:
   - Unificação de investigações locais salvas no navegador (`IndexedDB`/`localStorage`) com arquivos de estudo `.json` contidos no diretório de trabalho conectado.
   - Abas "Todos", "Pasta Local" e "Navegador" com busca em tempo real por identificador CII, título, ativo, líder ou data.
   - Pré-visualização com indicadores visuais de integridade percentual, métodos ativos e atalhos rápidos para abrir em modo edição ou consulta.

## Feedback Visual Dinâmico e Status em Tempo Real de Salvamento (v6.35.2)

Na versão v6.35.2, foi implementada a máquina de estados de sincronização e o componente dinâmico de status na barra superior:
1. **Pill Dinâmico de Sincronização (`#syncStatusPill`)**:
   - Substituição do badge estático por um indicador inteligente e reativo com dot luminoso e texto contextual.
   - **6 Estados Funcionais**:
     1. `Não Salvo em Arquivo`: Âmbar pulsante — estudo criado na memória/IndexedDB sem arquivo JSON local associado.
     2. `Salvando...`: Índigo com spinner — gravação atômica em andamento.
     3. `Sincronizado`: Verde esmeralda com dot estático — arquivo em disco 100% alinhado com o estado da aplicação.
     4. `Alterações Pendentes`: Âmbar suave — modificações no estado aguardando persistência em disco.
     5. `Modo Consulta`: Roxo / Slate — estudo aberto em modo somente-leitura.
     6. `Erro ao Salvar`: Vermelho com dot de alerta — falha de E/S ou perda de permissão de acesso ao arquivo.
2. **Integração com IndexedDB (`faciuDB`) e Monitor de Disco (`FaciuFolderMonitor`)**:
   - Salvamento duplo com tolerância a falhas: persistência imediata no IndexedDB (`FaciuDatabase`/`faciuStore`) com debouncing de 300ms e gravação em disco com debouncing de 1500ms e verificação de integridade via hash SHA-256 (`crypto.subtle.digest`).

## Regras de Acionamento e Visibilidade das Guias no Passo 2 (v6.35.3)

Na versão v6.35.3, foram restabelecidas e blindadas as regras canônicas de visibilidade e alternância das subguias contextuais de estudo no cabeçalho #varA-subtabs (Passo 2 - Estudo):
1. **Ponto de Partida Fático Comum**:
   - Cronologia, Portanto e Ações permanecem permanentemente visíveis em ambas as metodologias, servindo como base de reconstrução factual e gestão de barreiras.
2. **Modo Árvore de Causa (state.mainMethodology === 'tree')**:
   - Árvore e Raias ficam visíveis por padrão.
   - 5 Porquês (Auxiliar) é **estritamente condicional**: permanece oculta (display: none) e só é revelada quando houver estudo auxiliar efetivamente criado e atrelado a algum nó da árvore (state.whysAuxiliary.length > 0).
   - Se o último estudo auxiliar for excluído (manualmente ou em cascata ao remover o nó vinculado), a guia 5 Porquês é imediatamente ocultada e a navegação ativa é redirecionada para a Árvore.
3. **Modo 5 Porquês Principal (state.mainMethodology === 'whys')**:
   - Árvore e Raias são **estritamente ocultadas** (display: none).
   - 5 Porquês fica visível com a denominação do método principal.
   - Se a navegação ativa estiver posicionada em Árvore ou Raias ao selecionar esta metodologia, o sistema redireciona automaticamente para os 5 Porquês.

## Ciclo de Vida, Interface e Resiliência Total (v6.35.6 a v6.35.9)

Entre as versões v6.35.6 e v6.35.9, foram consolidadas melhorias estruturais no ciclo de vida da aplicação e na robustez contra falhas:
1. **Limpeza e Desduplicação do Início Rápido (v6.35.6)**:
   - Eliminação de botões redundantes de ajuda do card "Início Rápido", mantendo-o estritamente focado em ações de ciclo de vida do estudo (`Novo`, `CII`, `Abrir`, `Pasta`).
2. **Menu Popup de Ajuda Unificado (v6.35.7)**:
   - Centralização dos pontos de apoio em menu dropdown no cabeçalho (`#startBtnHelpMenu` / `#startHelpDropdown`) com acessibilidade total e opções para Central de Ajuda Normativa e Ajuda Operacional.
3. **Estrutura Canônica de Fechamento de Estudo (v6.35.8)**:
   - Implementação de `closeStudy()` com proteção contra perda de dados não salvos, botão "Fechar" na Barra 1 e no Hero Card, atalho global `Ctrl+Shift+W`, desvinculação de handles locais e redefinição limpa de estado.
4. **Resiliência Total e Blindagem contra Exceções (v6.35.9)**:
   - **IndexedDB (`faciuDB`)**: Elevação para v3 com recuperação dinâmica de `VersionError` (`tryOpen(null)`), abrindo na versão corrente do navegador caso haja divergência.
   - **Contingência em Memória (`inMemoryFallback`)**: Cache volátil transparente que absorve operações de `get`, `put` e `delete` caso o IndexedDB esteja bloqueado (navegação anônima, quota estourada ou falha de driver).
   - **Monitor de Pasta Defensivo**: Tratamento de `NotFoundError` ao detectar arquivos removidos/movidos em disco externamente.
   - **Polyfill Gráfico Defensivo**: Helper leve de utilitários funcionais para compatibilidade offline de extensões do Cytoscape.

## Inovações de Persistência, Integração com Copilot e Ciclo de Vida (v6.36.0 a v6.36.4)

Na série v6.36.x, o FACIU consolidou a integração com a IA oficial da Brava Energia, o alto contraste analítico e a blindagem definitiva do ciclo de vida de persistência em disco:
1. **Prompting Estruturado para o Microsoft Copilot Corporativo (v6.36.0)**:
   - Adição de botões de ação rápida "Copiar p/ Copilot" nos 24 campos de texto do RIA (Seções 1 a 5) e na barra de Verificação Global (Passo 4).
   - Montagem instantânea de prompts com instruções técnicas e dados do estudo no clipboard, permitindo o uso do Copilot Corporativo homologado pela Brava Energia.
2. **Alto Contraste e Acessibilidade no Teste do Portanto (v6.36.2)**:
   - Reestruturação cromática no tema escuro: tipografia de alto contraste (`#F8FAFC`, razão > 16:1, superando WCAG AAA).
   - Cartões coloridos por nível causal (Causa-Raiz em verde esmeralda, Causa Contribuinte em âmbar, Hipótese em violeta, Causa Imediata em magenta).
3. **Salvamento Direto no Arquivo Aberto (`saveStudy` - v6.36.3)**:
   - Ao salvar com `Ctrl+S`, o estudo atualiza diretamente o arquivo `.json` aberto via Chromium File System Access API sem abrir caixas de diálogo do sistema operacional.
   - Abertura de diálogo `showSaveFilePicker` reservada exclusivamente para o primeiro salvamento de novos estudos ou quando o usuário aciona intencionalmente "Salvar Como..." (`Ctrl+Shift+S`).
4. **Ciclo de Fechamento Limpo & Prevenção de Estudos Fantasmas (`closeStudy` - v6.36.4)**:
   - Cancelamento atômico de todos os temporizadores assíncronos (`idbTimeout`, `saveTimer`, `riaRevalTimer`, `invalPendente`) antes de redefinir o estado em memória.
   - Sanitização completa dos campos de formulário no DOM e reidratação da Triagem (`hydrateTriage`).
   - Expurgadas chaves ativas do `IndexedDB` (`active_study`, `file_handle`, `file_name`) e `localStorage`.
   - Adicionadas travas defensivas (`hasData`) no `save()` e no catálogo de estudos para impedir que estudos vazios recém-fechados ressuscitem no navegador.

## Melhorias Operacionais Offshore, Motor Causal e Ergonomia do Estudo (v6.37.0)

Na versão v6.37.0, o FACIU atende às demandas operacionais da equipe de investigação Offshore RJ da Brava Energia, sanando inconsistências no motor causal e otimizando a ergonomia da interface:
1. **Correção do Motor Causal e Teste do Portanto**:
   - Resolução da divergência de chaves em `getAvailableThereforeChains()` com suporte pleno tanto a `'contrib'` quanto `'contribuinte'`, além de identificação de nós raiz por `kind === 'raiz'`, `root: true` e `isRoot: true`.
   - Algoritmo `buildTreeThereforeChain()` aprimorado com varredura defensiva bidirecional de arestas causais, garantindo reconstrução lógica da cadeia reversa até o Evento Topo independentemente da ordem em que os nós foram conectados.
2. **Sanitização de Arestas para Ações Preventivas**:
   - A criação de blocos de Ação Preventiva (`kind === 'acao'`) via `addChild()` ou `createActionForRoot()` limpa forçadamente o valor de `childGate` (`gate: ''` e `logic: ''`), impedindo que ações herdem operadores lógicos `OU` e `E`.
   - No Cytoscape (`styleCy`), arestas vinculadas a ações (`edge[isActionEdge]`) utilizam traçado suave `bezier` sem rótulo, eliminando voltas ortogonais invertidas ("setas de volta").
3. **Destaque Visual em Vermelho Pulsante nas Pendências da Verificação**:
   - A classe `.correction-target` adota anel vermelho corporativo pulsante (`#EF4444` no tema claro e `#F87171` no escuro com `@keyframes pulseCorrection`), guiando o investigador com foco tátil e rolagem centralizada ao acionar itens pendentes na Verificação.
4. **Defaults Regulatórios de Vítimas no RIA**:
   - `riaDefault()` inicializa contadores de vítimas como `'0'`, e a Seção 3 do RIA disponibiliza o botão de ação rápida `[✓ Sem vítimas (Zerar)]` para preenchimento imediato.
5. **Seletor Onshore / Offshore e Severidade Potencial**:
   - Seletor tátil no Passo 1 (Triagem) entre `[ 🌊 Offshore ]` e `[ 🏭 Onshore / ATI / TAG ]` (`state.triagem.ambiente`), adaptando a exibição de requisitos marítimos no relatório.
   - A rotina `recalcClassification()` suporta a apuração por `Severidade Potencial`, dimensionando o nível da comissão e metodologia por `MAX(Real, Potencial)`.
6. **Barra de Ferramentas Contextual do Passo 2**:
   - As subguias contextuais (*Cronologia*, *Árvore*, *Raias*, *Portanto*, *Ações*) foram movidas do cabeçalho global para o topo da área de trabalho do Passo 2 (`.study-contextual-bar`), garantindo separação limpa entre as 5 etapas canônicas e as ferramentas investigativas.

