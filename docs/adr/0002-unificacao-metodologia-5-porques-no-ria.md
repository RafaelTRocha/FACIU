# ADR 0002: Unificação do Método dos 5 Porquês no Fluxo Documental do RIA

**Data:** 2026-09-18  
**Status:** Aceito  

## Contexto

Historicamente, o módulo de 5 Porquês no FACIU foi desenvolvido com resquícios de uma ferramenta autônoma: possuía botões para gerar relatório isolado, opções de exportação de JSONs parciais (`5-porques-*.json`) e uma lista interna própria de ações (`w.actions`) desconectada do repositório de ações da investigação.

Essa fragmentação causava atrito operacional e riscos regulatórios severos:
1. **Dispersão de Documentos:** Investigadores geravam PDFs e relatórios avulsos de 5 Porquês que não possuíam o cabeçalho, a rastreabilidade e a validação formal do **RIA (FORM-CORP-SMS-088 Rev. 08)**, único documento reconhecido pela auditoria interna e pela ANP.
2. **Duplicidade de Planos de Ação:** Ações cadastradas dentro do 5 Porquês precisavam ser "promovidas" manualmente para a Árvore de Causas. Quando isso era esquecido, as ações ficavam órfãs dentro do 5 Porquês e não chegavam à Tabela 4.7 do RIA oficial.
3. **Conflito de Validação:** O motor de validação oficial do RIA só reconhecia causas e ações desenhadas no grafo da Árvore de Causas, bloqueando investigações de incidentes de menor risco conduzidas legitimamente via 5 Porquês.

## Decisão

1. **Eliminação de Documento/Formulário Autônomo:** O 5 Porquês deixa de gerar qualquer relatório, PDF ou exportação JSON isolada. Todas as abas e botões que sugeriam um mini-aplicativo independente são removidos. No seu lugar, é disponibilizado um atalho de acesso direto: *"Visualizar no RIA"*.
2. **Convergência Total no RIA:**
   - Em investigações com *Árvore + 5 Porquês*: a Árvore ocupa a Seção 4.4 e os estudos de 5 Porquês são integrados automaticamente como Anexo Metodológico técnico do RIA oficial.
   - Em investigações de menor risco com *Apenas 5 Porquês*: a tabela do 5 Porquês ocupa diretamente a Seção 4.4 do RIA, sem necessidade de desenhar nós na árvore gráfica.
3. **Repositório Único de Ações:** Não existe lista de ações paralela. Toda ação criada dentro do 5 Porquês alimenta diretamente o plano de ação unificado da investigação (Tabela 4.7 do RIA), com tipo, responsável, prazo e verificação de eficácia padronizados.
4. **Herança da Taxonomia SGSO:** As causas-raiz apuradas no 5 Porquês herdam a lista suspensa padrão de 326 itens da taxonomia SGSO (ANP) e o botão *Sugerir*, alimentando a Tabela 4.5 do RIA com a mesma conformidade exigida na Árvore.
5. **Criação Assistida na Árvore:** Quando o 5 Porquês for vinculado a um nó da Árvore de Causas, o usuário pode, com um clique, incorporar as causas confirmadas como novos blocos filhos no grafo.
6. **Validação Polimórfica:** O motor de validação (`validationResult`) passa a reconhecer causas-raiz e ações geradas no 5 Porquês quando este for o método exclusivo, liberando a emissão oficial do RIA sem pendências artificiais.
7. **Migração Transparente:** Investigações legadas com ações em `w.actions` são migradas automaticamente para o repositório geral ao serem abertas.

## Consequências

- **Impacto Positivo:** 
  - Fim da ambiguidade documental: o RIA é o único artefato oficial entregue aos órgãos reguladores e à gerência.
  - Rastreabilidade ponta a ponta: causas e ações do 5 Porquês entram diretamente no fluxo de verificação de pendências e no cronograma de implementação do RIA.
  - Redução drástica da carga cognitiva do investigador, eliminando etapas manuais de "promoção" de dados.
- **Impacto Negativo (Trade-off / Restrição):** 
  - Não é mais possível gerar um arquivo ou folha solta de 5 Porquês fora do contexto de uma investigação do FACIU. Quem desejar um registro formal do 5 Porquês emitirá a minuta ou o documento oficial do RIA correspondente.
