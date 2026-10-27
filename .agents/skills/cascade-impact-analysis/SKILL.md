---
name: cascade-impact-analysis
description: Use when adding, renaming, removing, or changing any data field, schema, API endpoint, or model in code. Forces systematic tracking of all callers, consumers, UI panels, serializers, forms, types, and tests across all layers before declaring the change complete.
---

# Cascade Impact Analysis (Alterações em Cadeia)

Quando você altera uma ponta do código (ex: adiciona ou altera um campo num model, schema ou banco), a alteração NUNCA termina naquele arquivo. Modelos LLM tendem a sofrer de *tunnel vision* (visão de túnel), alterando apenas o arquivo solicitado e deixando o restante do sistema quebrado ou desatualizado (painéis visuais, formulários, rotas, serializers, contratos de API e testes).

Esta skill obriga a análise de impacto ponta a ponta (end-to-end impact tracking).

---

## 1. O Protocolo das 4 Camadas (The 4-Layer Rule)

Para qualquer alteração de dado, campo ou contrato, você DEVE inspecionar obrigatoriamente as 4 camadas do ecossistema:

1. **Camada 1: Estrutura & Persistência (Database / Model / Schema)**
   - Migrations, tabelas SQL, entidades ORM (Prisma, TypeORM, SQLAlchemy, Drizzle, etc.).
   - Modelos base e Schemas de validação (Zod, Pydantic, Joi, Marshmallow).

2. **Camada 2: Transporte & Regra de Negócio (API / Services / Serializers)**
   - DTOs de entrada (Payload de criação/edição) e saída (Responses).
   - Endpoints/Controllers e Services que processam o objeto.
   - Rotas de exportação/relatórios (CSV, PDF, webhooks).

3. **Camada 3: Apresentação & Consumo Frontend (UI / Painéis / Formulários)**
   - **Formulários de Entrada:** O usuário consegue preencher esse novo dado? Inputs, selects, modais.
   - **Tabelas e Listagens:** As colunas da tabela ou grid incluem o novo campo?
   - **Painéis / Dashboards / Cards:** O painel existente que resume ou renderiza esse dado foi atualizado para exibi-lo ou calculá-lo?
   - **Gerenciamento de Estado / Hooks:** Interfaces TypeScript do frontend, stores (Redux, Pinia, Zustand), queries/mutations (React Query, SWR).

4. **Camada 4: Garantia & Testes (Types / Mocks / E2E)**
   - Tipos e interfaces compartilhadas.
   - Factories, fixtures e mocks de teste.
   - Testes unitários, de integração e e2e que validam a persistência e exibição.

---

## 2. Passo a Passo Obrigatório de Execução

### Passo 1: Caça aos Consumidores (Grep / Search Antes de Editar)
Antes de editar qualquer linha de código, execute uma busca por todos os arquivos que referenciam o modelo ou entidade relacionada.
```bash
# Exemplo: ao alterar um campo em "Order" ou "Pedido":
# Busque pelo modelo, pelos componentes da UI que consom esse modelo, e pelos schemas
rg -l "Order|order" src/
```

### Passo 2: Declarar o Inventário de Impacto
No seu raciocínio e comunicação com o usuário, declare explicitamente a lista de arquivos afetados em cadeia antes de finalizar:
- **Origem:** `models/order.py` (Adicionado campo `delivery_fee`)
- **Transporte:** `schemas/order_response.py` (Exposto no serializer)
- **Painel / UI:** `components/OrderDashboardCard.tsx` (Adicionado valor do frete no card de resumo)
- **Formulário UI:** `components/OrderForm.tsx` (Adicionado input de taxa de entrega)

### Passo 3: Edição Cirúrgica em Todas as Camadas
Aplique as alterações em cada um dos arquivos identificados. Nunca deixe a UI consumindo um contrato defasado nem deixe o backend ignorando dados que a UI envia.

### Passo 4: Verificação Twin & Drift
Após editar, rode linter, build ou testes para garantir que:
- Não há campos órfãos ou `undefined` sendo renderizados na tela.
- TypeScript / linters não acusam propriedades ausentes.
- Os painéis existentes que agregam esses dados continuam consistentes com o novo schema.

---

## 3. Checklist de Conclusão (Definition of Done)

Antes de reportar a tarefa como concluída, valide mentalmente:
- [ ] O banco / model recebeu a alteração?
- [ ] A API / backend recebe e devolve o novo campo?
- [ ] O formulário ou interface de entrada permite enviar o novo campo?
- [ ] O painel existente / visualizador / tabela mostra o novo campo?
- [ ] Os tipos / TypeScript / schemas de validação foram atualizados?
- [ ] Nenhum componente adjacente quebrou ou ficou inconsistente?
