---
name: single-file-app
description: >-
  Use this skill when tasked to write, edit, maintain, or refactor a Single-File HTML application (SFA), like the FACIU project. It contains strict rules for managing state, DOM, and performance within a massive monolith.
---

# Single-File Application (SFA) Management

Desenvolver e manter um sistema monolítico (onde HTML, CSS e JavaScript vivem no mesmo arquivo `.html`) requer uma disciplina estrutural rigorosa para que o código não se torne um emaranhado de responsabilidades. Siga este runbook meticulosamente.

## Princípio Fundamental: A Restrição do Arquivo Único
Sob nenhuma hipótese divida o projeto em arquivos externos (`.js` ou `.css`). O aplicativo deve permanecer *standalone*. Suas refatorações de arquitetura devem ser estritamente *internas* ao arquivo.

---

## 1. Organização e Navegabilidade (Regions)
Navegar em arquivos com mais de 5.000 linhas é o maior gargalo cognitivo.
- **Sempre utilize Banners de Região** ao agrupar funções de mesmo domínio, o que auxilia leitores humanos e IDEs (code folding).
- Exemplo de sintaxe obrigatória:
  ```javascript
  /* ==========================================
  // REGION: NODE MUTATIONS & STATE
  // ========================================== */
  ```

## 2. Controle de Estado e Acoplamento
SFA frequentemente caem na armadilha do *Monkey Patching* e mutações globais espalhadas (variáveis como `state`).
- **Desacople Responsabilidades**: Nunca mantenha uma função gigante misturando extração de formulário (DOM), regras de negócio e manipulação de estado.
- **Aja Cirurgicamente ("Mini-Services")**: Se encontrar uma função massiva, quebre-a antes de mexer nela. Exemplo:
  1. `validateData(v)`: Validações puras.
  2. `updateRelations(n, v)`: Mutações no estado/grafo.
  3. `saveController()`: O orquestrador que chama as anteriores.
- **Proteja o Estado Global**: Evite alterar a variável `state` em rotinas visuais (`UI Controllers`). Utilize padrões baseados em eventos ou funções centralizadas de manipulação de *Store*.

## 3. Web Vitals e Performance Visual
A principal fraqueza do SFA é o Total Blocking Time (TBT). Como o navegador baixa todo o sistema antes de desenhar, qualquer renderização gráfica ou cálculo síncrono trava a tela (FCP).
- **Yielding the Main Thread**: Ao lidar com bibliotecas gráficas pesadas (como `Cytoscape.js`), NUNCA force o desenho na mesma thread síncrona.
- Envolva processamentos pesados em `requestAnimationFrame`:
  ```javascript
  function cyFromState() {
    if (!cy) return;
    requestAnimationFrame(() => {
      // Cálculo pesado do layout do grafo
      // Mutação pesada do DOM
    });
  }
  ```
- **UX**: Utilize molas e atenuação não-linear (Física Real) ao invés de CSS Transitions lineares. Para modais, aplique `cubic-bezier(0.34, 1.56, 0.64, 1)` no `transform: scale()` para dar resposta tátil.

## 4. O Ciclo de Refatoração ("Surgical Strike")
Ao ser instruído para refatorar ou adicionar código:
1. **Leia Estreito (Read Narrow)**: Identifique o escopo exato no monolito e leia apenas a função alvo e suas dependências diretas.
2. **Entenda a Intenção**: Se estiver consertando algo, certifique-se de que a falha não é no seu entendimento das Regras de Negócio, e sim no código.
3. **Não Reescreva o Mundo**: Modifique ou fragmente estritamente o bloco solicitado.
4. **Validação**: Por não haver testes unitários robustos num arquivo solto, crie sempre passos claros para validação manual visual na tela.
