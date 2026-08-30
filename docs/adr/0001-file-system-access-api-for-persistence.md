# ADR 0001: Persistência Contínua via File System Access API

**Data:** 2026-08-28
**Status:** Aceito

## Contexto
O FACIU é uma ferramenta isolada (Zero-Backend) projetada para auxiliar a elaboração de Relatórios de Investigação de Acidentes (RIA) na Brava Energia. Todo o estado da aplicação era mantido globalmente e persistido manualmente através de uma lógica de download/upload do arquivo `.json` inteiro.

Essa abordagem de persistência gera atrito: se o usuário precisa exportar manualmente cada alteração importante para se proteger contra perda de dados, a pasta de "Downloads" do sistema rapidamente se enche com múltiplas cópias do mesmo RIA.

A especificação de reconstrução exige a criação de uma costura (seam) para um Módulo de Gerenciamento de Estado profundo. Ao desenhar o adaptador de persistência para esse módulo, confrontamo-nos com o trade-off entre conveniência extrema (sincronização invisível de arquivo) e ampla compatibilidade de navegadores.

## Decisão
Implementaremos a sincronização contínua com arquivo local usando a **File System Access API**. 

Durante o ciclo de vida inicial da aplicação, o usuário fará uma única ação deliberada de "Salvar/Abrir", que concederá ao nosso adaptador de persistência um *FileSystemFileHandle*. A partir daí, toda mutação disparada pelo State Manager regravará silenciosamente aquele único arquivo `.json` em disco.

## Consequências

- **Impacto Positivo**: A experiência do usuário se aproxima de um aplicativo nativo (como o Word Autosave). Nenhuma perda de dados acidental. O adaptador de persistência pode ser injetado como um *middleware* invisível ao resto do código.
- **Impacto Negativo (Restrição)**: A *File System Access API* não tem suporte nativo completo no Safari ou no Mozilla Firefox (por políticas arquiteturais destes vendors). **Nós deliberadamente abandonamos o suporte oficial a estes navegadores em prol da funcionalidade corporativa.** Os usuários da Brava Energia deverão ser instruídos a usar Chrome ou Edge para interagir com o FACIU.
