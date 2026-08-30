# Projeto FACIU

*Ferramenta de Análise de Causas e Investigação Unificada*

## O Sistema

O **FACIU** é uma ferramenta standalone (isolada, sem integração direta ou banco de dados externo - *Zero-Backend*) focada no auxílio à investigação de acidentes. O sistema operacionaliza o padrão interno de investigação da **Brava Energia**. O objetivo final da ferramenta é gerar e exportar o **RIA** (Relatório de Investigação de Acidentes). O estado do projeto vive no navegador e é salvo via download/upload de arquivos `.json`.

## Classificação e Triagem

- **Triagem**: O estágio inicial da investigação que cadastra os metadados vitais do incidente (Título, Data, Local, Severidade, etc).
- **Níveis de Risco**: O sistema e a Brava Energia operam com 3 níveis (Nível 1, Nível 2 e Nível 3). Esses níveis controlam a obrigatoriedade dos métodos investigativos e as regras de composição da Comissão.
- **Comissão**: A equipe designada para a investigação. Possui validações automatizadas dependendo do nível de risco (ex: exigência de um membro de segurança).

## Metodologias de Investigação

O FACIU suporta metodologias que podem atuar em conjunto ou de forma isolada, a depender do Nível de Risco do acidente.

### Árvore de Causas (Motor Gráfico)
A metodologia principal para traçar a causalidade. Possui um dicionário estrito de restrições topológicas:
1. **Evento Topo**: O acidente em si. (Pai de todos, só aceita Causa Imediata).
2. **Causa Imediata**: Aceita Porta Lógica ou Hipótese.
3. **Porta Lógica (OU)** / **Hipótese**: Ferramentas para ramificar a investigação. Hipóteses só aceitam aprofundamento (outras Hipóteses) ou Causas Contribuintes.
4. **Causa Contribuinte**: Aceita Causa Raiz.
5. **Causa Raiz**: Onde o problema fundamental foi encontrado. Aceita Ação Preventiva.
6. **Ação Preventiva (Eficácia)**: Nó-folha (não aceita filhos). Representa a barreira final que evitará a repetição.

### 5 Porquês
Metodologia complementar de desdobramento linear.
- **Uso Conjunto**: Funciona atrelada a um nó da Árvore. O "5 Porquês" atua expandindo (sendo um filho lógico) um elemento travado na Árvore de Causas, desdobrando-o.
- **Uso Isolado**: Em acidentes de menor nível de risco, o 5 Porquês pode ser utilizado como única metodologia investigativa, substituindo a construção visual da Árvore.

### Cronologia e Raias
- **Cronologia**: Lista ordenada de eventos (Fatos) antes, durante e após o acidente (com Ator, Data e Hora).
- **Raias (Lanes)**: Uma ferramenta de agrupamento visual/gerencial no sistema (representação de interface) para facilitar a organização dos elementos da árvore de causas pelos investigadores.
