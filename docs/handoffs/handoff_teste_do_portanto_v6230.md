# Handoff: Implementação do "Teste do Portanto" no FACIU v6.23.0

**Data:** 21 de Setembro de 2026  
**Status Atual do Código:** `v6.22.7` operacional em [FACIU-v6.22.7.html](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/FACIU-v6.22.7.html)  
**Alvo da Próxima Sessão:** Lançamento da versão `v6.23.0` com o recurso "Teste do Portanto"  
**Documento de Planejamento Vinculado:** [implementation_plan.md](file:///C:/Users/rtair/.gemini/antigravity-ide/brain/65c11a50-8c29-47a7-ab06-71f7f07174fd/implementation_plan.md)  
**Pesquisa e Fundamentação:** [pesquisa_boas_praticas_metodologias_faciu.md](file:///c:/Users/rtair/OneDrive/Documentos/Projetos%20e%20Desenvolvimento/FACIU/docs/pesquisa_boas_praticas_metodologias_faciu.md)  

---

## 1. Contexto e Decisões Estabelecidas

1. **Premissa de Imutabilidade do RIA:**
   - O formulário oficial **RIA (FORM-CORP-SMS-088)** e a sua **Tabela 4.7** são estritamente regulamentados pela ANP e governança da Brava Energia. **NÃO DEVEM SER ALTERADOS.**
   - O ciclo de vida estendido das ações (gestão SMART, execução, acompanhamento) é tratado em ferramenta corporativa externa.
2. **Escopo do Recurso a Ser Implementado:**
   - O "Teste do Portanto" (leitura reversa de causalidade recomendada pelo CCPS/Lean para conferência de suficiência causal) operará **exclusivamente no Passo 2 (Estudo)**.
   - Atuará como ferramenta de auxílio analítico para a comissão antes da emissão do relatório.
3. **Padrão de Interface Acordado via Grilling:**
   - Modal dedicada no Passo 2 (`#modalThereforeTest`) exibindo a linha do tempo invertida (Causa-Raiz $\rightarrow$ *PORTANTO...* $\rightarrow$ Passos anteriores $\rightarrow$ *PORTANTO...* $\rightarrow$ Problema/Evento).
   - Acionamento via botão no 5 Porquês (`#btnWhyThereforeTest`) e no Inspetor Flutuante da Árvore de Causas (`#btnTreeThereforeTest`).

---

## 2. Roteiro Passo a Passo para o Próximo Agente / LLM

### Passo 1: Versionamento e Cópia do Monólito
1. Copiar `FACIU-v6.22.7.html` para `FACIU-v6.23.0.html`.
2. Em `FACIU-v6.23.0.html`:
   - Atualizar `const APP_VERSION = '6.23.0';`
   - Atualizar `<title>FACIU v6.23.0 | ...</title>`
   - Atualizar `<span class="start-version">v6.23.0</span>`

### Passo 2: Estrutura HTML e CSS da Modal no Monólito
1. Adicionar estilos para `.therefore-timeline`, `.therefore-step-card`, `.therefore-badge`, `.therefore-connector` respeitando as variáveis de tema (`var(--surface)`, `var(--line)`, `var(--text)`).
2. Adicionar o HTML da modal `#modalThereforeTest` ao final do arquivo:
   - Cabeçalho com título, subtítulo explicativo e botão de fechar.
   - Corpo `#thereforeModalBody` onde a timeline reversa será injetada dinamicamente.
   - Rodapé com botão *"Copiar Narrativa Causal"* e botão *"Fechar"*.
3. Inserir botão de acionamento no painel de ferramentas do 5 Porquês (`renderWhyEditor`).
4. Inserir botão de acionamento no Floating Inspector da Árvore de Causas (`renderFloatingInspector`) quando o nó selecionado for `raiz` ou `contrib`.

### Passo 3: Funções JavaScript Auxiliares
1. `buildWhyThereforeChain(study)`:
   - Coleta a causa-raiz confirmada (`study.causes`).
   - Coleta os passos em ordem reversa (5 a 1).
   - Coleta o problema no topo.
   - Retorna a lista de itens e conectores.
2. `buildTreeThereforeChain(nodeId)`:
   - Caminha pelos ancestrais até o nó `evt`.
   - Considera operadores nas arestas (`OU` ou `E`).
3. `openThereforeModal(chainData)` e `renderThereforeModalContent(chainData)`:
   - Monta o DOM e renderiza ícones com `lucide.createIcons()`.
4. `copyThereforeNarrative()`:
   - Copia texto estruturado para a área de transferência (`navigator.clipboard.writeText`).

### Passo 4: Atualização de Pacotes e Testes Automatizados
1. Criar `jsdom_test/test_v6230_therefore_test.js` validando a montagem correta das cadeias e a abertura da modal.
2. Em `jsdom_test/generate_examples.js`:
   - Atualizar versão para `6.23.0`.
   - Executar `node jsdom_test/generate_examples.js` para regerar os JSONs de exemplo.
3. Executar a suíte de testes de regressão:
   - `node jsdom_test/test_v6230_therefore_test.js`
   - `node jsdom_test/test_v6227_table_47_causes.js`
4. Atualizar `CHANGELOG.md` documentando o release `v6.23.0`.

---

## 3. Suggested Skills para o Próximo Agente

Ao iniciar a execução, recomenda-se que o próximo agente ative:
- **`fable-method`**: seguir os passos cirúrgicos de implementação, verificação por observação e relatório direto.
- **`single-file-app`**: seguir as restrições estritas de manipulação do monólito SFA sem corromper scripts inline.
- **`tdd`**: executar os testes em `jsdom_test/` antes e depois das alterações.
