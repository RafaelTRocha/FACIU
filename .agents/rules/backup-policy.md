# Política Obrigatória de Backup e Preservação de Versões

> Regra fundamental para agentes trabalhando no projeto FACIU.

## 1. Passo Zero: Backup Imediato Antes de Qualquer Modificação
Antes de iniciar qualquer edição, refatoração, correção ou geração de código no aplicativo FACIU:
- Identifique a versão ativa atual na raiz (ex: `FACIU-v6.33.1.html`).
- **Verifique se ela já existe na pasta `backups/`**.
- Se não existir, faça uma cópia imediata:
  ```powershell
  Copy-Item "FACIU-vX.Y.Z.html" -Destination "backups/FACIU-vX.Y.Z.html"
  ```
- Garanta que o backup esteja 100% idêntico e preservado ANTES de alterar qualquer linha.

## 2. Proibição Absoluta de Exclusão de Versões
- **NUNCA** execute comandos de deleção (`Remove-Item`, `os.remove`, `rm`, `del`, `git rm`) contra arquivos `FACIU-*.html`.
- Todas as versões históricas e intermediárias do FACIU têm valor como registro e histórico de auditoria.
- Elas pertencem obrigatoriamente à pasta `backups/`.

## 3. Fluxo de Incremento de Versão (SemVer)
Ao avançar de versão (ex: de `v6.33.1` para `v6.33.2` ou `v6.34.0`):
1. Confirme que a versão atual (`FACIU-v6.33.1.html`) está salva em `backups/FACIU-v6.33.1.html`.
2. Crie a nova versão na raiz (`FACIU-v6.33.2.html`).
3. Atualize os identificadores no arquivo (`APP_VERSION`, `<title>`, `<span class="start-version">`, tags de região).
4. Execute os testes automatizados para validar a nova versão.
5. Somente após validação completa, se a versão anterior ainda estiver na raiz, remova apenas a duplicata da raiz caso ela já esteja seguramente preservada em `backups/`, garantindo que **a cópia em `backups/` nunca seja tocada ou removida**.
