# ADR 0005: Conexão por Portas Cardinais ("Bolinhas"), Badges Textuais Lógicos na Linha e Unificação da Escala Visual

**Data:** 2026-09-20  
**Status:** Aceito  

## Contexto

Na versão v6.21.0, a Árvore de Causas do FACIU incorporou o Stencil Dock e o modelo dual de ligações causais e correlações livres. No entanto, duas necessidades críticas de usabilidade e arquitetura visual foram identificadas:

1. **Conexão Direta e Operadores Lógicos Integrados na Linha**:
   - Historicamente, operadores lógicos entre hipóteses ou causas concorrentes dependiam de nós físicos intermediários (`kind: 'gate'`), que poluíam o canvas com elementos extras e complicavam a reorganização visual.
   - Os investigadores demandavam uma interação análoga a ferramentas modernas de modelagem (Lucidchart/Linear): passar o mouse sobre o bloco revela portas de ancoragem ("bolinhas" nos 4 lados), clicar e arrastar puxa uma linha curva dinâmica com snapping magnético no bloco destino, e a linha exibe diretamente o operador lógico da bifurcação (`OU` ou `E`) sem necessidade de blocos intermediários.
   - O usuário expressamente definiu que a rotulagem dos operadores deve ser em **texto puro limpo** (`OU` e `E`), sem glifos, símbolos ou ícones intermediários (`⬡`, `&`), garantindo legibilidade imediata e conformidade técnica.

2. **Unificação da Escala Visual, Resolução e Densidade (Linear-App)**:
   - Os 5 passos da aplicação (Triagem, Estudo, RIA, Verificação, Emissão) possuíam sutis divergências de densidade de controles, padding de inputs e tamanho tipográfico.
   - Era imperativo estender a escala de alta produtividade (Linear Archetype) — com botões padronizados a 32-34px, inputs a 34px, tipografia base em 12-13px com contraste WCAG 2.2 AA — para todas as telas do FACIU de ponta a ponta.

## Decisões

1. **Portas Cardinais Dinâmicas de Conexão com Hit Area Expandida (WCAG 44×44px)**:
   - Foi implementado um overlay absoluto de portas (`#portOverlay`) renderizado sobre o canvas Cytoscape, ativado no evento `mouseover` de qualquer nó.
   - Cada bloco exibe 4 portas circulares (`.node-port`, 15×15px, `#C6E600` com borda `#0E1D3C`) posicionadas exatamente nas extremidades Norte, Sul, Leste e Oeste calculadas via `renderedPosition()` e `renderedOuterWidth/Height()`.
   - **Tolerância e Hit Area**: Para evitar que a porta desapareça enquanto o cursor se move do centro do nó até a borda, implementou-se um buffer debounce de 500ms (`scheduleHidePorts()`) e uma área de clique invisível expandida para 44×44px via pseudo-elemento `.node-port::after`.

2. **Linha de Arraste em Tempo Real com Curva Bézier e Snapping Magnético**:
   - Um elemento SVG dedicado (`#dragSvg`) renderiza a curva dinâmica (`#activeDragPath`) durante o arraste (`startConnectingDrag`), com visual tracejado animado (`.drag-line`).
   - A detecção do bloco de destino utiliza algoritmo de proximidade magnética (`getNodeUnderPoint`) com margem expandida de +20px, destacando visualmente o nó alvo (`.target-hover`).
   - Ao soltar o mouse (`onConnectingDragUp`), se o alvo for válido, a conexão é criada automaticamente via `handleNewConnection`.

3. **Operadores Lógicos Textuais Diretos na Aresta (`OU` e `E`)**:
   - As arestas agora suportam o atributo `logic` diretamente no modelo de dados (`edge.logic: 'OU' | 'E' | ''`).
   - O Cytoscape renderiza badges de texto arredondados diretamente no centro da aresta:
     - **`OU`**: Fundo índigo (`#4F46E5`), texto branco (`#FFFFFF`), rotulado como `'OU'` para hipóteses concorrentes e caminhos alternativos independentes.
     - **`E`**: Fundo esmeralda (`#059669`), texto branco (`#FFFFFF`), rotulado como `'E'` para causas combinadas simultâneas.
   - **Retrocompatibilidade Plena**: O validador estrutural e os seletores mantêm compatibilidade reversa com arquivos e investigações legadas que possuam nós de porta física (`kind: 'gate'`), migrando-os suavemente.
   - A barra flutuante de arestas (`#edgeFloatingActions`) inclui controle segmentado direto para alternar entre `OU`, `E` e ligação direta.

4. **Padronização Global de Tokens e Densidade em Todos os 5 Passos**:
   - O `:root` foi unificado em torno dos tokens semânticos do Linear Archetype:
     - Superfícies: `--surface: #FFFFFF;`, `--surface2: #F8FAFC;`, `--line: #E2E8F0;`
     - Acentos de Marca: `--lime: #C6E600;`, `--navy: #0E1D3C;`, `--navy2: #1E293B;`
   - Inputs, selects e textareas padronizados com altura de 34px e foco com anel suave de 3px em `--lime`.
   - Botões padronizados em 32-34px com tipografia em 12-13px e peso 600.

## Consequências

- **Experiência Visual e Fluidez Imersiva**: O processo de elaboração da árvore causal atinge o mesmo nível de fluidez e acabamento de ferramentas como Miro e Lucidchart, sem dependências de frameworks pesados.
- **Clareza Metodológica**: Elimina nós fantasmas no diagrama, tornando o encadeamento causal mais legível para gerentes e auditores da ANP.
- **Acessibilidade e Usabilidade Garantidas**: O hit target de 44px e o debounce de 500ms corrigem integralmente problemas de precisão motora ao acionar as portas de conexão.
- **Unidade Estética Total**: Toda a jornada do usuário (da Triagem à Emissão do RIA) transmite consistência visual de alta qualidade.
