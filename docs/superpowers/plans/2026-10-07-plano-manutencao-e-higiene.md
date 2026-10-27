# Plano de Implementação: Manutenção, Documentação e Higiene do FACIU

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o plano oficial de manutenção preventiva, atualizar a documentação raiz para a versão v6.36.4 e realizar a higiene total do repositório eliminando artefatos e testes obsoletos com preservação garantida de backups.

**Architecture:** Operação em cinco fases: 1. Preservação mandatória em `backups/` e sanitização da raiz; 2. Elaboração do documento normativo de manutenção; 3. Atualização de `package.json`, `README.md` e `CONTEXT.md`; 4. Expurgo controlado de scripts e testes obsoletos; 5. Auditoria de integridade ponta a ponta.

**Tech Stack:** HTML5, CSS Tailwind/Custom, JavaScript Vanilla ES2022, Node.js, Playwright, JSDOM, Markdown.

**Spec:** `docs/superpowers/specs/2026-10-07-plano-manutencao-e-higiene-design.md`

## Global Constraints
- Proibição inviolável de deletar qualquer arquivo `FACIU-*.html`.
- Preservar a versão ativa `FACIU-v6.36.4.html` em `backups/FACIU-v6.36.4.html` antes de qualquer alteração.
- Manter apenas a versão ativa mais recente na raiz do projeto.
- Manter o aplicativo estritamente *Single-File Application* (Zero-Backend, sem dependências de compilação ou arquivos externos `.js`/`.css`).
- Garantir 100% de sucesso nas suítes `diagnostic_full_audit.js` e `test_v6_36_4_close_study_lifecycle.js`.

## Review Focus
- Integridade do arquivo `FACIU-v6.36.4.html` mantida sem regressões.
- Existência garantida e verificável de todos os backups em `backups/`.
- `README.md` refletindo com exatidão a versão `v6.36.4` e a nova estrutura limpa.
- Ausência de scripts e testes quebrados ou orfãos no repositório.
- Scripts de teste no `package.json` executando com sucesso no terminal.

---

### Task 1: Protocolo de Backup e Preservação da Raiz (Passo Zero)

**Files:**
- Create: `backups/FACIU-v6.36.4.html` (cópia idêntica de `FACIU-v6.36.4.html`)
- Remove da Raiz: `FACIU-v6.36.2.html`, `FACIU-v6.36.3.html` (já preservados em `backups/`)

**Interfaces:**
- Consumes: Arquivos `FACIU-v6.36.*.html` da raiz
- Produces: Raiz limpa contendo apenas a versão ativa `FACIU-v6.36.4.html` e histórico completo em `backups/`

- [x] **Step 1: Copiar `FACIU-v6.36.4.html` para `backups/FACIU-v6.36.4.html`**
  Executado e confirmado com 2.998.471 bytes idênticos.

- [x] **Step 2: Verificar a presença dos backups de versões anteriores em `backups/`**
  Confirmado que `backups/FACIU-v6.36.2.html` e `backups/FACIU-v6.36.3.html` existem e estão íntegros.

- [x] **Step 3: Remover da raiz os arquivos redundantes `FACIU-v6.36.2.html` e `FACIU-v6.36.3.html`**
  Removidos com segurança da raiz, mantendo apenas `FACIU-v6.36.4.html`.

- [x] **Step 4: Verificar a integridade do Passo Zero**
  Raiz contém exclusivamente `FACIU-v6.36.4.html`.

---

### Task 2: Criação do Plano de Manutenção Oficial (`docs/PLANO_DE_MANUTENCAO.md`)

**Files:**
- Create: `docs/PLANO_DE_MANUTENCAO.md`

**Interfaces:**
- Produces: Manual técnico normativo de engenharia de software para o projeto FACIU

- [x] **Step 1: Redigir `docs/PLANO_DE_MANUTENCAO.md` com diretrizes completas**
  Documento normativo elaborado com todas as seções: Passo Zero, SemVer, Padrões SFA, Política de Testes e Checklist Pré-Lançamento.

- [x] **Step 2: Validar formatação e referências cruzadas**
  Links e regras auditados e consistentes.

---

### Task 3: Atualização de `package.json`, `README.md` e `CONTEXT.md`

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Modify: `CONTEXT.md`

**Interfaces:**
- Consumes: `docs/PLANO_DE_MANUTENCAO.md`, `FACIU-v6.36.4.html`
- Produces: Metadados e documentação raiz 100% alinhados à versão v6.36.4

- [x] **Step 1: Atualizar scripts no `package.json`**
  Scripts `"test"`, `"test:lifecycle"` e `"test:all"` adicionados e validados.

- [x] **Step 2: Atualizar `README.md`**
  README atualizado para v6.36.4 com recursos consolidados, nova árvore limpa e comandos npm.

- [x] **Step 3: Atualizar `CONTEXT.md`**
  Adicionada seção sobre inovações de persistência, Copilot e ciclo de fechamento de estudo.

- [x] **Step 4: Verificar integridade dos documentos atualizados**

---

### Task 4: Higiene e Expurgo de Artefatos Descartáveis e Testes Obsoletos

**Files:**
- Remove em `scripts/`: 57 scripts descartáveis
- Remove em `tests/`: 14 testes de versões passadas
- Remove em `tests-e2e/`: 21 scripts e imagens temporárias
- Remove em `jsdom_test/`: 38 scripts de teste legados

- [x] **Step 1: Excluir scripts de build e inspeção descartáveis de `scripts/`**
  57 scripts descartáveis removidos; 7 utilitários permanentes preservados.

- [x] **Step 2: Excluir testes obsoletos em `tests/`**
  14 testes obsoletos removidos; suíte unificada preservada (`diagnostic_full_audit.js`, `test_v6_36_4_close_study_lifecycle.js`, `example.spec.js`).

- [x] **Step 3: Excluir testes obsoletos em `tests-e2e/`**
  21 arquivos obsoletos removidos; estrutura Playwright e testes canônicos preservados.

- [x] **Step 4: Excluir testes obsoletos em `jsdom_test/`**
  38 testes legados removidos; `generate_examples.js` preservado.

---

### Task 5: Verificação e Auditoria de Integridade Pós-Higiene

- [x] **Step 1: Executar `npm test`**
  Executado: 38/38 testes verdes, 0 erros de console, 0 crashes.

- [x] **Step 2: Executar `npm run test:lifecycle`**
  Executado: 30/30 testes verdes, 0 falhas.

- [x] **Step 3: Executar `git status` e conferência final**
  Apenas `FACIU-v6.36.4.html` na raiz, histórico 100% preservado em `backups/`, 0 testes orfãos.
