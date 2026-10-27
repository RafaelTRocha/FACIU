## Agent skills

### Issue tracker

Issues and specs live as markdown files in `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses canonical roles: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (one CONTEXT.md at root). See `docs/agents/domain.md`.

### Versioning Rules

Whenever changes are made to the codebase, the agent MUST update the application version proportionally to the size of the changes (SemVer):
- **Patch (e.g., v6.8.0 to v6.8.1):** For small bug fixes and minor HTML/CSS tweaks.
- **Minor (e.g., v6.8.0 to v6.9.0):** For new features, architectural refactoring, or significant payload updates.
- **Major (e.g., v6.8.0 to v7.0.0):** For complete redesigns or backward-incompatible state structure changes.

### Mandatory Backup Protocol & Preservation Rules (CRITICAL)

**REGRA INVIOLÁVEL DE PRESERVAÇÃO E BACKUP:**
Sob NENHUMA hipótese delete qualquer arquivo de versão do FACIU (`Remove-Item`, `os.remove`, `rm`, `del` são expressamente PROIBIDOS para arquivos `FACIU-*.html`).

Antes de iniciar qualquer edição, refatoração ou incremento de versão:
1. **Passo 0 (Obrigatório e Imediato):** O agente DEVE verificar e assegurar que a versão ativa atual (`FACIU-vX.Y.Z.html`) está copiada em `backups/FACIU-vX.Y.Z.html`. Se ainda não estiver em `backups/`, faça a cópia imediatamente ANTES de qualquer alteração no código.
2. **Geração de Nova Versão:**
   - Crie a nova versão na raiz (e.g., `FACIU-v6.33.2.html`).
   - Atualize `APP_VERSION`, `<title>`, `<span class="start-version">`, badges e pills no arquivo.
   - Execute os testes automatizados para garantir integridade.
3. **Arquivamento Seguro (NUNCA Deletar):**
   - A versão anterior (`FACIU-vX.Y.Z.html`) NUNCA deve ser apagada. Ela DEVE residir em `backups/FACIU-vX.Y.Z.html`.
   - Na raiz do projeto permanece apenas a versão ativa mais recente (e.g., `FACIU-v6.33.1.html`).
   - A pasta `backups/` mantém o histórico completo e intacto de todas as versões já produzidas.

