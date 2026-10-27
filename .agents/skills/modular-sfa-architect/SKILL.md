---
name: modular-sfa-architect
description: Architect, migrate, and build Single-File Applications (SFA) using a Modular Monolith source structure. Use when the user wants to split a monolithic HTML file into modular CSS, JS/TS, and JSON files, design a single-file web utility (CDN-based or fully offline), reduce token usage in AI-assisted coding, or bundle a multi-file web project back into one self-contained HTML file using Bun or Vite. Gatilhos em português: dividir HTML, modularizar aplicação, arquivo único, HTML autocontido, juntar módulos em um HTML, reduzir tokens, refatorar app HTML/JS.
---
# Modular SFA Architect

Projete, refatore e compile aplicações web de arquivo único (*Single-File Applications* - SFA), separando a estrutura de desenvolvimento (**Monólito Modular**) do arquivo de distribuição (um único `.html`).

## Quando Usar

- Refatorar um `.html` monolítico extenso em módulos de CSS, JS/TS e JSON, mantendo a entrega em arquivo único.
- Projetar utilitários web que rodam a partir de um único `.html` aberto com duplo clique (`file://`).
- Reduzir consumo de tokens em programação assistida por IA, isolando regras, estilos e dados em arquivos pequenos e mapeados.
- Configurar o build com **Bun** ou **Vite** para fundir HTML, CSS, JS e arquivos de mídia em um único arquivo.

## 0. Decisão Inicial Obrigatória: Modo de Dependências

Antes de qualquer etapa, defina e registre no `MAPA.md` qual modo o projeto usa:

| Modo | Quando usar | Bibliotecas externas |
|---|---|---|
| **CDN (padrão)** | O ambiente de uso sempre tem internet | Mantidas via `<script src="https://...">` no `index.html`, acessadas como globais (`window.jspdf`, `cytoscape`, etc.) |
| **Offline total** | O arquivo precisa funcionar sem rede | Instaladas via `bun add` e importadas no código para serem embutidas no build |

Não embuta bibliotecas grandes no modo CDN. Não use CDN no modo offline total.

## 1. Auditar o Artefato Monolítico

Antes de extrair qualquer arquivo:

- **Criar a referência de comparação:** salve uma cópia intocada do HTML original em `reference/original.html` e um JSON exportado com dados reais em `reference/dados-teste.json`.
- Identifique todos os blocos `<style>`, conflitos de especificidade, regras duplicadas e sobrescritas de tema claro/escuro.
- Localize dados estáticos embutidos (`<script type="application/json">`, imagens em Base64, catálogos).
- Liste as dependências por CDN (`<script src>` e `<link href>`) e classifique conforme o modo da etapa 0.
- Identifique o mecanismo de estado (store, desfazer/refazer) e de persistência (`IndexedDB`, `localStorage`, `File System Access API`).
- Liste todos os eventos inline (`onclick`, `oninput`, `onchange`) que dependem de funções no `window`.
- Localize funções reatribuídas entre blocos de script diferentes (ex.: `minhaFuncao = function() {...}` sobre uma função declarada em outro bloco). Elas quebram ao virar módulo.

## 2. Estrutura de Diretórios

```text
project-root/
├── reference/
│   ├── original.html         # Cópia intocada do monólito (referência de comparação)
│   └── dados-teste.json      # Dados reais exportados para teste
├── src/
│   ├── core/
│   │   ├── version.js        # APP_VERSION (fonte única da versão)
│   │   ├── store.js          # Estado central, pub/sub e desfazer/refazer
│   │   ├── persistence.js    # IndexedDB, localStorage, exportação/importação JSON
│   │   └── bridge.js         # Ponte única de funções públicas no window
│   ├── data/                 # JSON estáticos, catálogos e textos de ajuda
│   ├── styles/
│   │   ├── layers.css        # Declaração da ordem das camadas (importado primeiro)
│   │   ├── tokens.css        # Variáveis CSS e temas claro/escuro
│   │   ├── base.css          # Reset, tipografia e estrutura de layout
│   │   ├── components.css    # Componentes reutilizáveis, modais e tabelas
│   │   └── print.css         # Paginação para impressão e PDF
│   ├── modules/              # Funcionalidades independentes, uma pasta por domínio
│   └── main.js               # Inicialização e importações de CSS/módulos
├── scripts/
│   └── build-sfa.js          # Build do arquivo único com Bun
├── index.html                # Estrutura HTML limpa com marcadores de injeção
├── MAPA.md                   # Mapa do projeto para leitura rápida pela IA
├── CHANGELOG.md
├── package.json
└── vite.config.js            # Apenas se usar a Opção 1
```

### Regras de tamanho e mapeamento

- **Limite de 300 linhas por arquivo.** Acima disso, divida por responsabilidade.
- **`MAPA.md` é obrigatório** e deve ser atualizado a cada alteração estrutural. Formato:

```markdown
# Mapa do Projeto
Modo de dependências: CDN
Versão: 1.4.0

| Arquivo | Responsabilidade | Expõe | Depende de |
|---|---|---|---|
| core/store.js | Estado central e desfazer/refazer | getState, setState, subscribe | — |
| modules/relatorio/pdf.js | Geração do PDF do relatório | gerarPdf | store, window.jspdf |
```

- Antes de editar o código, a IA deve ler o `MAPA.md` e abrir **somente** os arquivos necessários para a tarefa.

## 3. Fronteiras de Módulo e Contratos de Estado

- Toda mutação de estado entre módulos passa por `src/core/store.js`. Um módulo nunca altera o DOM pertencente a outro.
- **Ponte única no `window`:** funções usadas em eventos inline são registradas apenas em `src/core/bridge.js`:

```javascript
import { salvar, abrirModal } from '../modules/editor/acoes.js';
Object.assign(window, { salvar, abrirModal });
```

- **Nunca reatribua uma função importada ou declarada em outro módulo.** Importações são somente leitura e, em modo estrito, a reatribuição gera erro e interrompe o script inteiro. Para estender um comportamento, crie uma nova função que chama a original e registre a nova na ponte.
- Estados obtidos do store devem ser lidos novamente no momento do evento e após cada `await`, nunca guardados em variável no carregamento do módulo.
- **Não use importação dinâmica (`import()`).** Ela gera arquivos separados e quebra o arquivo único.

### Camadas de CSS

`src/styles/layers.css` deve ser o primeiro CSS importado:

```css
@layer vendor, tokens, base, components, modules, utilities, print;
```

**Atenção:** estilos fora de qualquer camada sempre vencem os estilos em camada. CSS de bibliotecas externas (Tailwind, ícones, componentes) carregado por `<link>` fica fora das camadas e passará por cima da aplicação. Para evitar isso, carregue o CSS externo dentro da camada `vendor`:

```css
@import url('https://cdn.exemplo.com/biblioteca.css') layer(vendor);
```

Tailwind via script CDN injeta estilos fora de camada. Nesse caso, não use `@layer` para competir com ele: mantenha os estilos da aplicação fora de camada ou com seletores próprios, e documente a escolha no `MAPA.md`.

## 4. Persistência no Protocolo `file://`

- O comportamento de `localStorage` e `IndexedDB` em `file://` varia entre navegadores: arquivos diferentes podem compartilhar ou não os mesmos dados. **Use sempre prefixo por aplicação e versão de esquema** nas chaves (ex.: `faciu:v1:investigacoes`).
- **Exportação e importação em JSON são obrigatórias** como cópia de segurança, com campo `schemaVersion` e aceitação de versões anteriores compatíveis.
- Proteja toda gravação contra `QuotaExceededError` e informe o usuário quando o limite for atingido.
- A `File System Access API` existe apenas em navegadores baseados em Chromium. Sempre ofereça alternativa por download (`<a download>`) e upload (`<input type="file">`).

## 5. Migração Incremental (Padrão *Strangler Fig*)

Após **cada** estágio: gere o build, abra via `file://`, carregue `reference/dados-teste.json` e compare com `reference/original.html` (telas, modais, cálculos, PDF e persistência). Só avance se o comportamento for idêntico.

1. **Estágio 1 - Toolchain:** inicialize com Bun, coloque o HTML original como `index.html` e confirme que o build gera um arquivo funcional idêntico ao original.
2. **Estágio 2 - Dados estáticos:** mova JSON e catálogos para `src/data/*.json` e importe-os em `src/main.js`.
3. **Estágio 3 - Estilos:** extraia os `<style>` para `src/styles/*.css`, mantendo exatamente a ordem original da cascata. Só depois reorganize em camadas e remova `!important`.
4. **Estágio 4 - Núcleo:** extraia `version`, `store`, `persistence` e `bridge`.
5. **Estágio 5 - Domínios:** extraia um módulo de domínio por vez, testando após cada extração e atualizando o `MAPA.md`.

## 6. Build do Arquivo Único

### `index.html` com marcadores

Use marcadores fixos em vez de procurar tags por expressão regular:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Aplicação</title>
  <!-- Bibliotecas CDN (somente no modo CDN) -->
  <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
  <!-- SFA:STYLE -->
</head>
<body>
  <span id="appVersionLabel"></span>
  <!-- conteúdo -->
  <!-- SFA:SCRIPT --><script type="module" src="/src/main.js"></script><!-- /SFA:SCRIPT -->
</body>
</html>
```

### `package.json`

```json
{
  "name": "minha-sfa",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:sfa": "bun scripts/build-sfa.js"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vite-plugin-singlefile": "^2.0.0"
  }
}
```

Instalação: `bun install`. As dependências do Vite são necessárias apenas na Opção 1 e no servidor de desenvolvimento.

### Opção 1: Vite com `vite-plugin-singlefile`

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    outDir: 'dist',
  },
});
```

O resultado é um `<script type="module">` **escrito dentro do HTML**, que funciona normalmente com duplo clique em `file://`. O bloqueio do `file://` atinge apenas módulos carregados de arquivos externos.

### Opção 2: Bun nativo em formato IIFE (`scripts/build-sfa.js`)

Gera um `<script>` clássico, sem módulos, com máxima compatibilidade.

```javascript
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const result = await Bun.build({
  entrypoints: ['./src/main.js'],
  format: 'iife',
  minify: true,
  loader: {
    '.png': 'dataurl',
    '.jpg': 'dataurl',
    '.svg': 'dataurl',
    '.woff2': 'dataurl',
  },
});

if (!result.success) {
  console.error('Falha no build:');
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

let js = '';
let css = '';
for (const out of result.outputs) {
  if (out.path.endsWith('.js')) js += await out.text();
  if (out.path.endsWith('.css')) css += await out.text();
}

// Impede que "</script" ou "</style" dentro do código fechem a tag antes da hora
js = js.replace(/<\/script/gi, '<\\/script');
css = css.replace(/<\/style/gi, '\\3C /style');

const template = readFileSync('./index.html', 'utf-8');
const scriptBlock = /<!-- SFA:SCRIPT -->[\s\S]*?<!-- \/SFA:SCRIPT -->/;

if (!template.includes('<!-- SFA:STYLE -->') || !scriptBlock.test(template)) {
  console.error('Marcadores SFA:STYLE ou SFA:SCRIPT ausentes no index.html.');
  process.exit(1);
}

// Funções na substituição evitam que "$&", "$'" e "$`" do código minificado sejam interpretados
const html = template
  .replace('<!-- SFA:STYLE -->', () => `<style>\n${css}\n</style>`)
  .replace(scriptBlock, () => `<script>\n${js}\n</script>`);

// Verificação: nenhuma referência local pode sobrar
const refsLocais = html.match(/(?:src|href)=["'](?:\.{0,2}\/)(?!\/)[^"']*["']/gi);
if (refsLocais) {
  console.error('Referências locais encontradas no HTML final:', refsLocais);
  process.exit(1);
}

mkdirSync('./dist', { recursive: true });
writeFileSync('./dist/index.html', html, 'utf-8');
console.log(`Build concluído: dist/index.html (${(html.length / 1024).toFixed(1)} KB)`);
```

### Verificação Pós-Build

- O script já interrompe o build se houver referência local (`src="./..."`, `href="/..."`). Na Opção 1, faça a mesma busca manualmente em `dist/index.html`.
- Abra `dist/index.html` com duplo clique e teste interações, modais, persistência, exportação/importação JSON e geração de PDF usando `reference/dados-teste.json`.
- Confira se a versão exibida na tela corresponde à `APP_VERSION`.

## 7. Controle de Versão a Cada Entrega

- `src/core/version.js` é a **fonte única** da versão:

```javascript
export const APP_VERSION = '1.4.0';
```

- O rótulo visível é preenchido no carregamento, nunca escrito à mão no HTML:

```javascript
import { APP_VERSION } from './core/version.js';
document.getElementById('appVersionLabel').textContent = `Versão ${APP_VERSION}`;
```

- A cada build entregue: atualize `APP_VERSION`, registre a versão e as mudanças no `CHANGELOG.md` e atualize a versão no `MAPA.md`.

## Armadilhas Comuns

- **Eventos inline vs. módulos:** funções em módulos não ficam no `window`. Registre-as em `bridge.js` até migrar para `addEventListener`.
- **Reatribuição de funções:** reatribuir função de outro módulo ou bloco gera erro em modo estrito e interrompe todo o script. Use a ponte única.
- **`file://` e módulos externos:** módulos carregados por `src` externo são bloqueados em `file://`. Módulos escritos dentro do HTML funcionam. Por isso o build precisa embutir todo o código.
- **Importação dinâmica:** `import()` gera arquivos separados e quebra o arquivo único.
- **Ordem da cascata:** preserve a ordem original de importação do CSS antes de refatorar seletores ou remover `!important`.
- **CSS externo vence camadas:** estilos fora de `@layer` sempre têm prioridade sobre os que estão em camada.
- **Momento de inicialização:**
  - Na **Opção 1 (Vite)**, o script de módulo é adiado automaticamente e roda após o DOM ser montado.
  - Na **Opção 2 (Bun)**, o script entra no fim do `body`, e o DOM já está pronto.
  - Em ambos os casos, inicialize bibliotecas de grafos e PDF **uma única vez**, em uma função `init()` chamada em `main.js`. Não registre `DOMContentLoaded` em vários módulos, pois isso causa inicialização duplicada ou que nunca acontece.
- **Bibliotecas CDN no modo CDN:** acesse-as pelo `window` (ex.: `window.jspdf.jsPDF`) e verifique se estão carregadas antes de usar, exibindo mensagem clara se a rede falhar.
