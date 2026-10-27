# ADR 0003: Modernização da Interface Linear-App, Editor Flutuante da Árvore e Ciclo de Vida dos 5 Porquês

**Data:** 2026-09-19  
**Status:** Aceito  

## Contexto

À medida que o FACIU evoluiu para investigações complexas de acidentes industriais com árvores de causas extensas e múltiplas análises de 5 Porquês, surgiram limitações severas de ergonomia visual, desempenho e rastreabilidade:
1. **Sobrecarga Vertical da Interface**: O cabeçalho tradicional consumia mais de 230px verticais da viewport com banners grandes, descrições redundantes de etapas e barras de ferramentas secundárias.
2. **Restrição de Espaço no Canvas da Árvore**: A divisão em 2 colunas fixas (painel lateral de 360px + canvas) comprimia o grafo Cytoscape, forçando os investigadores a rolar e aplicar zoom excessivo em árvores médias e grandes.
3. **Poluição Visual nos Blocos Causa**: Os nós da árvore repetiam o nome por extenso da categoria (como `"HIPÓTESES"` ou `"CAUSA CONTRIBUINTE"`), roubando espaço valioso do título e gerando nós desproporcionais com linhas pesadas.
4. **Vínculo Fantasma e Falta de Exclusão em Cascata nos 5 Porquês**:
   - Investigações novas da árvore iniciavam inadvertidamente com um estudo de 5 Porquês auxiliar pré-criado atrelado à primeira hipótese (`H1`), poluindo a interface com o marcador `5P × 1`.
   - Ao deletar um bloco ou ramo na árvore, as análises de 5 Porquês vinculadas permaneciam órfãs em `state.whysAuxiliary`, assim como suas respectivas ações no plano global.
5. **Falha na Navegação de Correção e Validação**:
   - No Passo 4 (Verificação), cliques no botão "Revisar" falhavam silenciosamente devido à ausência do container `#correctionBar` no DOM.
   - O validador exigia nomenclaturas estritas em inglês para ações de 5 Porquês (`responsible`, `dueDate`), gerando falsos alertas para dados consolidados em português (`responsavel`, `prazo`).

## Decisões

1. **Cabeçalho Ultra-Compacto no Arquétipo Linear-App (v6.18.0)**:
   - Redução da altura vertical total para ~80px fixos com efeito de desfoque de fundo (`backdrop-filter: blur(12px)`).
   - Linha 1 (44px): Identidade visual discreta, monitor de sincronização tátil, ferramentas de exportação/disco/tema em ícones minimalistas e botões de ação com contraste calibrado (Lima `#C6E600` para salvar).
   - Linha 2 (36px): Stepper com pílulas compactas à esquerda e subguias contextuais do Estudo (Cronologia, 5 Porquês, Árvore, Raias, Plano de Ação) à direita, visíveis apenas no Passo 2.
2. **Canvas 100% Full-Width e Editor Flutuante Sobreposto (v6.19.0)**:
   - Canvas Cytoscape (`#cy`) expandido para 100% da largura útil.
   - Painel lateral substituído por um **Floating Inspector** translúcido no canto superior esquerdo com minimização em pílula (`#btnToggleMinimize`), contador de caracteres e grid compacto de criação de filhos/irmãos e 5 Porquês.
   - Micro-toolbar flutuante translúcida no canto superior direito para zoom fit, relayout hierárquico e exportação em imagem PNG.
3. **Nós Dinâmicos com Siglas Limpas e Linhas Delicadas**:
   - Substituição de categorias textuais longas por siglas formais padronizadas (`[ET]`, `[CI]`, `[H1]`, `[CC1]`, `[CR1]`, `[A1]`).
   - Dimensionamento dinâmico calculado por `calcNodeDims(n)` (largura de 140px a 200px; altura de 52px a 68px) proporcional ao tamanho do título (máx. 70 caracteres com reticências).
   - Traços refinados: bordas de nós de 1.5px (halo sutil de 2px no nó selecionado) e arestas de 1.5px com pontas de seta delicadas (`arrow-scale: 0.75`).
4. **Ciclo de Vida Rigoroso dos 5 Porquês na Árvore (v6.19.1 e v6.19.2)**:
   - Eliminação de estudos fantasma: novos diagramas iniciam com `state.whysAuxiliary = []` e exibem empty state explicativo até que o usuário clique em `[5 Porquês]` em um bloco.
   - Exclusão em cascata: deletar um nó na árvore remove automaticamente todas as análises de 5 Porquês associadas àquele nó ou aos seus descendentes, além de purgar as ações correspondentes em `state.tree.nodes`.
5. **Navegação de Correção e Validação Interoperável (v6.19.3)**:
   - Elemento `#correctionBar` restaurado no DOM com tratamento defensivo em `showCorrectionBar()` e `returnToVerification()`.
   - Redirecionamento inteligente em `editValidationItem()`: itens de 5 Porquês selecionam o estudo específico, ativam o Passo 2, abrem a aba correspondente e rolam até o editor.
   - Validação dual em `fiveWhyStudyIssues()` e `getStudyGlobalActions()` com suporte nativo a `responsible` / `responsavel`, `dueDate` / `prazo`, `title` / `label` e `causeId` / `causaRaizId` / `causaRaizIds`.

## Consequências

- **Ergonomia e Foco**: A área útil para desenhar e analisar a Árvore de Causas aumentou em mais de 45%, permitindo visualização de cenários complexos sem sensação de confinamento.
- **Integridade Causal**: Nenhuma análise ou ação de 5 Porquês fica órfã no banco local após a remoção de ramos descartados da árvore de causas.
- **Fluidez na Verificação**: Investigadores navegam diretamente do apontamento de inconformidade para o formulário exato da correção com um único clique.
- **Interoperabilidade**: Compatibilidade total na importação e validação de investigações históricas e novos arquivos gerados em múltiplos formatos de propriedade.
