# Plano de Manutenção e Governança do FACIU

*Ferramenta de Análise de Causas e Investigação Unificada — Brava Energia*  
**Documento Normativo de Engenharia de Software**  
**Versão:** 1.0.0 | **Data de Emissão:** 07 de Outubro de 2026  

---

## 1. Princípio Fundamental e Arquitetura

O **FACIU** é rigorosamente uma **Single-File Application (SFA / Zero-Backend)**. 
- Todo o código executável (HTML, CSS Tailwind, CSS Customizado e JavaScript Vanilla ES2022) reside em **um único arquivo `.html`** na raiz do projeto (atualmente [`FACIU-v6.36.9.html`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/FACIU-v6.36.9.html)).
- **Regra de Ouro:** Sob nenhuma hipótese divida o aplicativo de produção em múltiplos arquivos `.js` ou `.css` externos. O sistema deve permanecer plenamente executável com duplo clique em qualquer navegador Chromium moderno, mesmo offline e isolado da internet.

---

## 2. Protocolo Inviolável de Preservação e Backup (Passo Zero)

> [!CAUTION]
> **REGRA INVIOLÁVEL DE PRESERVAÇÃO DE VERSÕES:**
> Comandos de exclusão (`Remove-Item`, `os.remove`, `rm`, `del`) são **expressamente proibidos** para qualquer arquivo histórico `FACIU-*.html`.
> Todas as versões anteriores devem ser preservadas integralmente na pasta [`backups/`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/backups).

Antes de iniciar qualquer edição, refatoração ou incremento de versão:
1. **Passo Zero Obrigatório e Imediato:**
   O desenvolvedor ou agente de IA DEVE verificar e assegurar que a versão ativa atual (`FACIU-vX.Y.Z.html`) está copiada em `backups/FACIU-vX.Y.Z.html`. Se ainda não estiver em `backups/`, faça a cópia imediatamente **antes** de qualquer alteração no código.
2. **Geração de Nova Versão:**
   - Crie a nova versão na raiz (e.g., `FACIU-v6.36.5.html` ou `FACIU-v6.37.0.html`).
   - Atualize os **5 pontos obrigatórios de versão**:
     1. Constante JavaScript: `const APP_VERSION = "X.Y.Z";`
     2. Título da página: `<title>FACIU vX.Y.Z | Ferramenta de Análise...</title>`
     3. Rodapé do Hero Card: `<span class="start-version">FACIU vX.Y.Z</span>`
     4. Rótulo da barra superior: `<span id="appVersionLabel">vX.Y.Z</span>`
     5. Pílula da tela inicial: `<span id="startScreenVersionPill">vX.Y.Z</span>`
   - Execute os testes automatizados para garantir integridade.
3. **Regra de Versão Única na Raiz:**
   - Na raiz do projeto permanece **apenas a versão ativa mais recente**.
   - As versões anteriores já copiadas para `backups/` não devem ser duplicadas na raiz.

---

## 3. Política de Versionamento Semântico (SemVer)

Sempre que alterações forem realizadas, incremente a versão de acordo com o impacto:

* **Patch (`v6.36.4` -> `v6.36.5`):**
  - Correções de bugs pontuais e ajustes de layout/CSS.
  - Correções tipográficas ou de contraste visual (WCAG).
  - Sem alteração no esquema do payload JSON do estudo ou nos formulários oficiais do RIA.
* **Minor (`v6.36.4` -> `v6.37.0`):**
  - Adição de novos recursos, ferramentas investigativas ou novos prompts de IA.
  - Refatoração arquitetural interna de módulos ou mini-services.
  - Ajustes em tabelas do RIA ou relatórios derivados.
* **Major (`v6.36.4` -> `v7.0.0`):**
  - Redesign estrutural completo da interface.
  - Ruptura de retrocompatibilidade com arquivos JSON de investigações legadas.

---

## 4. Padrões de Refatoração no Monolito SFA

Navegar em arquivos com mais de 20.000 linhas requer disciplina estrita:

### 4.1 Banners de Região Obrigatórios
Agrupe funções de mesmo domínio delimitadas por banners para facilitar navegação e code-folding:
```javascript
/* ========================================================================= */
/* REGION: NOME_DO_DOMINIO_OU_MODULO (vX.Y.Z)                                */
/* ========================================================================= */
```

### 4.2 Desacoplamento através de Mini-Services
Nunca mantenha uma função gigante misturando extração de formulário (DOM), lógica de negócio e mutações globais:
1. `validateData(v)`: Validações puras sem efeitos colaterais.
2. `updateRelations(n, v)`: Mutações do estado e do grafo da árvore.
3. `saveController()`: Orquestrador que coordena as chamadas.

### 4.3 Proteção do Estado e Reatividade (`window.store`)
- Todas as mutações persistentes devem passar pela centralização de estado (`state` e `window.store`).
- Ao encerrar estudos (`closeStudy`), cancele atômica e preventivamente todos os timers pendentes (`idbTimeout`, `saveTimer`, `riaRevalTimer`, `invalPendente`) antes de redefinir o estado, evitando ressuscitação no `IndexedDB`.
- Use travas de guarda (`hasData`) no autosave para evitar gravação involuntária de estudos em branco.

### 4.4 Web Vitals e Performance Visual
- **Yielding da Thread Principal:** Mutações complexas no Cytoscape.js e renderizações do RIA devem rodar em `requestAnimationFrame`:
  ```javascript
  requestAnimationFrame(() => {
    // Cálculo pesado do layout do grafo ou renderização
  });
  ```
- **Transições e Modais:** Empregue curvas não lineares suaves (física real) em modais (`cubic-bezier(0.34, 1.56, 0.64, 1)` no `transform: scale()`).

---

## 5. Política de Testes e Não-Proliferação

Para manter a saúde e clareza do repositório, adote as seguintes regras:

1. **Proibição de Testes Descartáveis por Patch:**
   Não crie arquivos de teste isolados com o nome da versão (ex: `test_v6_36_5.js`).
2. **Suíte Paramétrica Unificada:**
   Todos os testes funcionais devem ser integrados ou executados a partir de suítes dinâmicas que leem automaticamente a versão ativa mais recente na raiz do projeto.
3. **Comandos Padrão no `package.json`:**
   - `npm test`: Executa o diagnóstico completo ponta a ponta ([`diagnostic_full_audit.js`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/tests/diagnostic_full_audit.js)).
   - `npm run test:lifecycle`: Executa o teste de ciclo de vida e persistência ([`test_v6_36_4_close_study_lifecycle.js`](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/tests/test_v6_36_4_close_study_lifecycle.js)).
   - `npm run test:all`: Executa ambas as suítes em sequência.

---

## 6. Checklist de Sanidade Pré-Lançamento

Antes de dar qualquer tarefa por concluída:

- [ ] **1. Backup:** Confirmar que a versão anterior e a nova versão estão intactas em `backups/`.
- [ ] **2. 5 Pontos de Versão:** Verificar conformidade em `APP_VERSION`, `<title>`, `.start-version`, `#appVersionLabel` e `#startScreenVersionPill`.
- [ ] **3. Testes Verdes:** Executar `npm test` e confirmar 100% de aprovação e zero erros de console.
- [ ] **4. Teste de Ciclo de Vida:** Executar `npm run test:lifecycle` e garantir que fechar estudo limpa o DOM e o IndexedDB.
- [ ] **5. Persistência em Disco:** Testar o salvamento em disco com `Ctrl+S` e "Salvar Como..." com `Ctrl+Shift+S`.
- [ ] **6. Contraste e Temas:** Alternar entre tema claro e tema escuro verificando legibilidade WCAG.
- [ ] **7. Documentação:** Atualizar `CHANGELOG.md` e `README.md` com as alterações da versão.
