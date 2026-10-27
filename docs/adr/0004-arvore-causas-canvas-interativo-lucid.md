# ADR 0004: Canvas Interativo da Árvore de Causas, Biblioteca de Elementos (Stencil Dock) e Modelo Dual de Ligações

**Data:** 2026-09-20  
**Status:** Aceito  

## Contexto

A Árvore de Causas no FACIU é o coração da investigação causal exigida pela Brava Energia e pelo padrão regulatório ANP SGSO (FORM-CORP-SMS-088). Historicamente, a criação de nós dependia de cliques nos botões do Floating Inspector ("+ Filho", "+ Irmão"), e o layout do Cytoscape era puramente algorítmico e rígido (DAG hierárquico com rankdir=LR).

Com a evolução das análises causais em incidentes operacionais complexos, os investigadores reportaram a necessidade de:
1. **Experiência de Diagramação Fluida (estilo Lucidchart / Miro)**: Adicionar elementos visuais diretamente no canvas por drag-and-drop ou clique rápido, posicionando blocos livremente para melhor narrativa visual.
2. **Conexões Transversais e Correlações**: Necessidade de conectar blocos que compartilham influências contextuais, hipóteses concorrentes ou correlações sistêmicas sem que isso violasse a regra formal de pai único e fluxo causal estrito da árvore oficial do RIA.
3. **Manipulação Precisa de Arestas**: Capacidade de selecionar, alternar o tipo e deletar conexões individuais entre blocos diretamente pelo teclado (`Delete`/`Backspace`) ou via barra flutuante sem risco de apagar os nós envolvidos.
4. **Preservação Regulatória**: Qualquer liberdade visual adicionada à ferramenta não poderia comprometer o cálculo dos fatores causais, a tabela de causas do RIA oficial ou gerar falsos positivos no validador estrutural da árvore.

## Decisões

1. **Modelo Dual de Ligações (Causal Estrita vs. Correlação Transversal)**:
   - **Arestas Causais (`kind: 'causal'`)**: Linha contínua sólida com seta triangular sutil, representando a cadeia formal exigida pela metodologia de Árvore de Causas (Ex: Evento Topo -> Causa Imediata -> Hipóteses -> Causa Contribuinte -> Causa Raiz). Estas arestas são as únicas contabilizadas para estatísticas do relatório oficial e validadas por `validateTreeStructure()`.
   - **Arestas de Correlação (`kind: 'correlation'`)**: Linha tracejada em tom índigo (`#6366F1`) com curvatura Bezier estilizada. Representam interações paralelas, condicionantes ambientais ou correlações sistêmicas. São desenhadas no canvas e impressas no relatório visual, mas ignoradas no validador estrutural (evitando falsos erros de múltiplos pais ou ciclos hierárquicos).
   - O método `handleNewConnection(sourceId, targetId)` classifica a nova aresta como causal caso obedeça à taxonomia formal; caso contrário, classifica defensivamente como correlação livre.

2. **Stencil Dock Flutuante de Elementos (`#treeStencilDock`)**:
   - Barra vertical compacta (46px de largura) ancorada à esquerda do canvas Cytoscape, com visual translúcido e elegante (`backdrop-filter: blur(8px)`).
   - Contém chips arrastáveis para toda a taxonomia oficial do FACIU: Evento Topo (`ET`), Causa Imediata (`CI`), Hipótese (`H`), Causa Contribuinte (`CC`), Causa Raiz (`CR`), Ação Corretiva (`A`), Falha (`F`), Fator Sistêmico/Organizacional (`FSO`), Gatilho (`G`) e Recuperação (`R`).
   - Suporta tanto arrastar e soltar (HTML5 Drag and Drop com conversão de coordenadas para o plano do Cytoscape via `cy.pan()` e `cy.zoom()`) quanto clique simples com posicionamento inteligente próximo ao centro da visão.

3. **Posicionamento Híbrido com Persistência e Confirmação de Relayout**:
   - O Cytoscape habilita movimentação livre dos nós (`dragfree`).
   - Ao mover ou soltar um nó, suas coordenadas manuais são salvas em `node.pos = { x, y }` e persistidas no estado da investigação (`state.tree.nodes`).
   - O algoritmo `semanticLayout` respeita nós com posições manuais atribuídas, recalculando apenas os nós que ainda dependem de posicionamento automático.
   - O botão de reorganização automática (`#btnRelayout`) avisa o usuário com confirmação modal antes de limpar posições manuais (`delete n.pos`), evitando perdas acidentais de layouts customizados elaborados pela equipe de investigação.

4. **Gestão e Exclusão Isolada de Arestas**:
   - O usuário pode clicar diretamente em qualquer aresta para selecioná-la. Arestas selecionadas ganham destaque visual com halo azul profundo e espessura destacada.
   - Uma barra flutuante de ações da aresta (`#edgeFloatingActions`) surge no rodapé do canvas oferecendo botões rápidos para:
     - Alternar tipo de relação (`Causal` <-> `Correlação`).
     - Excluir a ligação (desconectando os dois blocos sem deletar nenhum dos nós).
   - Atalhos de teclado `Delete` e `Backspace` conectados à aresta selecionada.

## Consequências

- **Produtividade Aumentada**: Investigadores agora constroem diagramas causais com a agilidade e fluidez do Lucidchart/Miro, reduzindo drasticamente o tempo necessário para estruturar incidentes de grande porte.
- **Rigor Metodológico Intacto**: A separação entre arestas causais e de correlação garante que a árvore de causas do RIA e os planos de ação permaneçam 100% aderentes à norma ANP SGSO e aos formulários FORM-CORP-SMS-088.
- **Interoperabilidade e Resiliência**: Investigações salvas em versões anteriores abrem sem qualquer inconsistência, assumindo automaticamente o modo causal para arestas existentes.
- **Zero Dependências Externas**: Todas as interações de drag-and-drop, conversão de viewport e desenho de conexões foram implementadas dentro da arquitetura SFA (Single-File Architecture), sem novos pacotes NPM ou bibliotecas externas pesadas.
