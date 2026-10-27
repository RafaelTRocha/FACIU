# Exemplos de Investigação do FACIU

Este diretório contém investigações completas de referência técnica e validação documental no padrão oficial do FACIU.

## Arquivos Disponíveis

### 1. `investigacao_exemplo1_arvore_de_causas.json` (ou `C:\Users\rtair\OneDrive\Documentos\investigacao_faciu.json`)
- **Versão:** `v6.31.2` (Schema 1.1)
- **Metodologia Principal:** Árvore de Causas (`tree`)
- **Cenário:** Vazamento de óleo lubrificante durante partida do turbocompressor TC-201 no FPSO Brava Spirit (CII-2026-OP-042).
- **Estrutura Investigativa:**
  - Triagem completa (Nível 2) com equipe multidisciplinar e papéis SGSO.
  - Cronologia detalhada de 6 eventos com marcos temporais e atores.
  - Grafo completo na Árvore de Causas sem nós gate intermediários: Evento Topo (`ET`), Causa Imediata (`CI`), Hipóteses com operador direto `OU` na linha (`H`), Falha de Projeto (`FAL`), Fatores Humanos (`FAT`) desdobrados em Subfatores (`FS`), Causa Contribuinte (`CC`), Causa-Raiz (`CR`), Ações Preventivas (`A`) e todas as conexões no formato padrão de Ligação Causal (`kind: causal`).
  - Análise auxiliar de 5 Porquês atrelada à hipótese de sobretorque e montagem inadequada.
  - Plano de ação com 2 ações vinculadas a causas-raiz, com responsáveis, prazos e critérios de eficácia.
- **Status de Verificação:** 100% aprovado (0 pendências, 0 bloqueios).

### 2. `investigacao_exemplo2_5porques_principal.json` (ou `C:\Users\rtair\OneDrive\Documentos\investigacao_faciu_5porques_principal.json`)
- **Versão:** `v6.31.2` (Schema 1.1)
- **Metodologia Principal:** 5 Porquês Canônico (`whys`)
- **Cenário:** Parada não planejada da bomba de injeção de sequestrante de H2S (P-3101B) na Plataforma P-50 (CII-2026-MN-019).
- **Estrutura Investigativa:**
  - Triagem de incidente Nível 1.
  - Estudo de 5 Porquês estruturado com 5 etapas iterativas de perguntas e respostas objetivas.
  - Causa-raiz correlacionada com a taxonomia oficial do SGSO (ANP) e padrão corporativo PAD-CORP-QUI-002.
  - Ações preventivas detalhadas vinculadas diretamente à causa-raiz.
  - RIA (FORM-CORP-SMS-088) completo.
- **Status de Verificação:** 100% aprovado (0 pendências, 0 bloqueios).

### 3. `investigacao_exemplo3_arvore_pura.json` (ou `C:\Users\rtair\OneDrive\Documentos\investigacao_faciu_arvore_pura.json`)
- **Versão:** `v6.31.2` (Schema 1.1)
- **Metodologia Principal:** Árvore de Causas Pura (`tree` exclusiva, sem 5 Porquês anexo)
- **Cenário:** Desarme involuntário do turbogerador TG-01 por queda transiente de pressão no sistema de óleo lubrificante no FPSO Brava Spirit (CII-2026-OP-055).
- **Estrutura Investigativa:**
  - Triagem de incidente Nível 1/2 com classificação pela Matriz Rev. 07 (Interrupção das Operações).
  - Cronologia com 6 eventos detalhados mapeados aos nós da árvore.
  - Grafo completo e puro da Árvore de Causas: Evento Topo (`evt`), Causa Imediata (`imed`), 4 hipóteses concorrentes sob operador direto `OU` na linha (`hip1`, `fal1`, `hip2`, `fat1`), subfatores organizacional e tecnológico (`fs1`, `fs2`), causas contribuintes (`cc1`, `cc2`, `cc3`), duas causas-raiz independentes com classificação SGSO (`cr1` e `cr2`), 100% de conexões causais estritas (`kind: causal`), e 3 ações recomendadas com status `"Proposta"` (`a1`, `a2`, `a3`).
  - Totalmente sem estudos de 5 Porquês (`whysPrimary: null`, `whysAuxiliary: []`, `whys: []`).
  - RIA (FORM-CORP-SMS-088) completo e consistente.
- **Status de Verificação:** 100% aprovado (0 pendências estruturais, 0 bloqueios).

---

## Como Utilizar para Testes e Demonstrações

1. No cabeçalho do FACIU, clique no ícone **Menu** (ou **Importar Investigação**).
2. Selecione um dos arquivos `.json` deste diretório.
3. O FACIU carregará todos os dados, sincronizará os nós da árvore/estudo e preencherá o RIA (FORM-CORP-SMS-088).
4. Navegue até o **Passo 4 (Verificação)** para constatar o selo verde **"Estudo pronto para o relatório"**.
