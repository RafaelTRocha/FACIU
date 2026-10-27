# Especificação de Design: Plano de Manutenção, Atualização do Projeto e Higiene do Repositório FACIU

**Data:** 07 de Outubro de 2026  
**Status:** Aprovado  
**Versão Ativa do Sistema:** v6.36.4 (`FACIU-v6.36.4.html`)  

---

## 1. Visão Geral e Contexto

O **FACIU** (*Ferramenta de Análise de Causas e Investigação Unificada*) é uma aplicação *Single-File Application* (SFA / Zero-Backend) desenvolvida para investigar incidentes industriais no padrão corporativo da **Brava Energia**. O sistema integra metodologias de Árvore de Causas, 5 Porquês canônico e auxiliar, Cronologia, Raias e Teste do Portanto, convergindo todos os dados na emissão do relatório oficial **RIA (FORM-CORP-SMS-088 Rev. 08)**.

A aplicação evoluiu através de sucessivos incrementos e encontra-se atualmente na versão **v6.36.4**, após a implementação de:
1. Ciclo de vida robusto ao fechar estudos (`closeStudy`), cancelamento de temporizadores e prevenção de estudos fantasmas no `IndexedDB` (v6.36.4);
2. Persistência direta no arquivo aberto via File System Access API (`saveStudy` / `saveToDisk`) sem prompts redundantes de seleção (v6.36.3);
3. Design de alto contraste no tema escuro para a leitura reversa do Teste do Portanto (v6.36.2);
4. Geração de prompts estruturados para o Microsoft Copilot Corporativo nos 24 campos do RIA (v6.36.0).

### Problema Identificado
1. **Defasagem Documental:** O `README.md` raiz permaneceu estagnado indicando a versão `v6.35.3`, omitindo recursos da série v6.36.x e comandos padrão de teste.
2. **Ausência de um Plano de Manutenção Formal:** Não havia um manual explícito de manutenção preventiva e regras de não-proliferação de testes para orientar desenvolvedores e novos agentes de IA no ecossistema SFA.
3. **Inchaço de Artefatos Descartáveis:** Acúmulo de mais de 70 arquivos de teste e scripts de build transitórios em `scripts/`, `tests/`, `tests-e2e/` e `jsdom_test/` que foram criados para versões intermediárias e agora falham ou geram ruído no repositório.

---

## 2. Inspeção Técnica de Código (`FACIU-v6.36.4.html`)

### 2.1 Métricas Estruturais
* **Linhas Totais:** 20.698 linhas em arquivo único `.html` (CSS Tailwind + Custom CSS, HTML Semântico e Vanilla JS).
* **Organização em Regiões:** 58 banners de delimitação estrutural (`/* REGION: ... */`), facilitando code-folding e leitura estreita.
* **Tamanho em Disco:** ~2.99 MB.

### 2.2 Gerenciamento de Estado e Ciclo de Vida
* **Store Centralizado:** `window.store` gerencia a reatividade de salvamento e sincronização com o banco local `faciuDB` v2 (`IndexedDB`).
* **I/O e File System:** O módulo `FaciuFolderMonitor` opera com W3C File System Access API com debouncing, hashing SHA-256 e resolução de conflitos em 3 vias.
* **Isolamento de Estado:** A rotina `closeStudy` (v6.36.4) purga temporizadores assíncronos (`idbTimeout`, `saveTimer`, `riaRevalTimer`, `invalPendente`), limpa o DOM e o IndexedDB, garantindo estado imaculado após o encerramento do estudo.

### 2.3 Diagnóstico de Testes e Integridade
* `tests/diagnostic_full_audit.js`: Executa 38 testes ponta a ponta (Passos 1 a 5, Árvore Cytoscape, 5 Porquês, RIA, Copilot, persistência e tema escuro) com **38 PASS, 0 FAIL, 0 console errors**.
* `tests/test_v6_36_4_close_study_lifecycle.js`: Executa 30 testes focados no ciclo de vida com **30 PASS, 0 FAIL**.

---

## 3. Especificação do Plano de Manutenção (`docs/PLANO_DE_MANUTENCAO.md`)

O documento `docs/PLANO_DE_MANUTENCAO.md` será criado contendo as seguintes diretrizes normativas:

1. **Protocolo Inviolável de Preservação e Backup (Passo Zero):**
   * Antes de qualquer edição ou novo build, o agente ou desenvolvedor DEVE verificar e assegurar que a versão ativa atual (`FACIU-vX.Y.Z.html`) está copiada em `backups/FACIU-vX.Y.Z.html`.
   * É estritamente proibido deletar arquivos `FACIU-*.html`.
   * Apenas a versão ativa mais recente permanece na raiz do projeto; todas as versões anteriores residem exclusivamente em `backups/`.
2. **Diretrizes SemVer:**
   * **Patch (ex: v6.36.4 -> v6.36.5):** Correções de bugs pontuais, ajustes de layout/CSS, correções de digitação sem alteração na estrutura de dados do RIA.
   * **Minor (ex: v6.36.4 -> v6.37.0):** Novos módulos, novas ferramentas investigativas, novos recursos de IA ou melhorias substanciais no gerador de PDF/RIA.
   * **Major (ex: v6.36.4 -> v7.0.0):** Rupturas na compatibilidade retroativa de arquivos `.json` ou redesign completo da arquitetura.
3. **Padrões de Engenharia no Monolito SFA:**
   * Proibição de fragmentação em arquivos externos `.js` ou `.css` (o FACIU deve continuar estritamente standalone e executável com duplo clique em qualquer navegador Chromium moderno).
   * Uso obrigatório de banners de região (`// REGION: NOME_DO_DOMINIO`).
   * Desacoplamento através de mini-services (`validateData`, `updateRelations`, `controller`).
   * Prevenção de TBT/FCP: isolar renderizações e layouts pesados do Cytoscape em `requestAnimationFrame`.
4. **Política de Testes e Não-Proliferação:**
   * Proibição de criação de arquivos descartáveis como `test_vX_Y_Z.js` para cada patch.
   * Manutenção de suítes de teste parametrizáveis (lendo a versão ativa do `package.json` ou da raiz).
   * Obrigatoriedade de execução de `npm test` antes de qualquer entrega ou commit.
5. **Checklist Pré-Lançamento:**
   * Verificação de versão nos 5 pontos obrigatórios (`APP_VERSION`, `<title>`, `.start-version`, `#appVersionLabel`, `#startScreenVersionPill`).
   * Teste de salvamento atômico em disco (`saveStudy` e `saveStudyAs`).
   * Teste de encerramento de estudo (`closeStudy`).
   * Verificação de contraste em tema claro e escuro.

---

## 4. Atualização da Documentação Raiz e Configurações

### 4.1 `README.md`
* Atualizar versão oficial para `v6.36.4` apontando para `FACIU-v6.36.4.html`.
* Documentar a série v6.36.x:
  * v6.36.0: Prompting Estruturado p/ Microsoft Copilot Corporativo nos 24 campos do RIA.
  * v6.36.1: Contraste de inputs datetime-local no tema escuro.
  * v6.36.2: Alto contraste e hierarquia cromática no Teste do Portanto.
  * v6.36.3: Salvamento direto no arquivo aberto (`saveStudy` via File System Access API).
  * v6.36.4: Fechamento atômico de estudo e expurgo de temporizadores (`closeStudy`).
* Atualizar a árvore de diretórios do repositório refletindo a higienização.
* Adicionar seção de execução de testes com `npm test`.

### 4.2 `CONTEXT.md`
* Consolidar os detalhes de persistência e fechamento de estudos no ciclo de vida de investigação.
* Atualizar referências de integridade do RIA FORM-CORP-SMS-088 Rev. 08.

### 4.3 `package.json`
* Adicionar scripts:
  * `"test"`: `"node tests/diagnostic_full_audit.js"`
  * `"test:lifecycle"`: `"node tests/test_v6_36_4_close_study_lifecycle.js"`
  * `"test:all"`: `"node tests/diagnostic_full_audit.js && node tests/test_v6_36_4_close_study_lifecycle.js"`

---

## 5. Protocolo de Higiene e Relação de Arquivos

Em estrita observância à habilidade `accidental-data-loss-prevention` e às regras de preservação:

### 5.1 Passo 0 - Preservação Obrigatória
* Copiar `FACIU-v6.36.4.html` para `backups/FACIU-v6.36.4.html`.
* Validar existência e tamanho dos backups de `FACIU-v6.36.2.html`, `FACIU-v6.36.3.html` e `FACIU-v6.36.4.html` em `backups/`.

### 5.2 Limpeza da Raiz do Projeto
* Remover os arquivos duplicados da raiz `FACIU-v6.36.2.html` e `FACIU-v6.36.3.html`, deixando exclusivamente a versão ativa `FACIU-v6.36.4.html`.

### 5.3 Higienização de `scripts/`
* **Excluir Scripts de Build Pontuais Descartáveis:**
  * `scripts/build_v6270.py` a `scripts/build_v6343.py` (12 arquivos)
  * `scripts/build_v6353.py` a `scripts/build_v6364.js` (10 arquivos)
* **Excluir Scripts de Inspeção Pontuais Descartáveis:**
  * `find_*.py` (6 arquivos: `find_cmds_170_191.py`, `find_creation.py`, `find_nav.py`, `find_ops.py`, `find_ops_119_204.py`, `find_pre77.py`, `find_transcript_steps.py`, `find_tree_def.py`)
  * `inspect_*.py` e `inspect_*.js` (8 arquivos: `inspect_backup.py`, `inspect_diffs.py`, `inspect_issue.py`, `inspect_proto.js`, `inspect_specific_diffs.py`, `inspect_startscreen_260.py`, `inspect_tree_diff.py`, `inspect_tree_structure.py`)
  * `diff_260_271.py`, `extract_exact_edits.py`, `compare_head_curr.py`, `print_steps.py`
  * `test_counts.py`, `test_find.py`, `test_reversal.py`, `test_layout.js`
  * `debug_why_chain.js`, `verify_v6272.py`
* **Preservar Scripts Utilitários Permanentes em `scripts/`:**
  * `make_backup.py`
  * `bump_version.py`
  * `organize_workspace.py`
  * `audit_full_flow.js`
  * `take_audit_screenshots.js`
  * `restore_brava_palette.py`
  * `analyze_derivation.py`

### 5.4 Higienização de Testes Obsoletos
* **Em `tests/`:**
  * Excluir testes pontuais obsoletos de versões antigas: `test_v6_35_0_start_catalog.js` a `test_v6_35_9_resilience.js`, `test_v6_36_0_copilot_export.js` a `test_v6_36_3_save_open_file.js`, `test_deep_stress_and_edge_cases.js`, `test_prototype_navigation.js`.
  * Preservar os testes ativos da versão atual:
    * `tests/diagnostic_full_audit.js` (38 testes completos de auditoria ponta a ponta)
    * `tests/test_v6_36_4_close_study_lifecycle.js` (30 testes de ciclo de vida e persistência)
    * `tests/example.spec.js`
* **Em `tests-e2e/`:**
  * Excluir os scripts pontuais obsoletos `test_v6321_*.js` a `test_v6360_*.js` e imagens temporárias `evidence_v6359_clean.png`, `evidence_v6360_copilot.png`.
  * Preservar `playwright.config.js` e a pasta `tests-e2e/tests/` (`auditor.spec.js`, `faciu.spec.js`).
* **Em `jsdom_test/`:**
  * Excluir os scripts pontuais legados `test_v6193_*.js` a `test_v6353_*.js`.
  * Preservar `generate_examples.js`.

---

## 6. Critérios de Conclusão e Verificação
1. Backup de `FACIU-v6.36.4.html` presente e com hash/tamanho idêntico em `backups/FACIU-v6.36.4.html`.
2. Apenas `FACIU-v6.36.4.html` presente na raiz do repositório como versão ativa.
3. `npm test` configurado e executando com sucesso (38/38 PASS, 0 erros).
4. `npm run test:lifecycle` executando com sucesso (30/30 PASS, 0 erros).
5. `docs/PLANO_DE_MANUTENCAO.md` criado e referenciado no `README.md`.
6. `README.md` e `CONTEXT.md` plenamente atualizados com as características canônicas e a versão `v6.36.4`.
7. Repositório limpo, sem scripts descartáveis nem testes quebrados.
