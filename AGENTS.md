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

**IMPORTANT:** The FACIU app relies on a Single-File Architecture (SFA). When the version changes, the agent MUST:
1. Update `APP_VERSION`, the `<title>`, and the display string `<span class="start-version">` inside the HTML file.
2. Rename the main file (e.g., `FACIU-v6.8.0.html` -> `FACIU-v6.8.1.html`) to reflect the new version.
