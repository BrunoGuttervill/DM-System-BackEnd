<p align="center">
  <h1 align="center">🍕 Dany Massas — Backend API</h1>
  <p align="center">
    API REST para o sistema de controle de estoque e produção da <strong>Dany Massas Caseiras</strong>
    <br />
    <em>Canoinhas/SC — Massas, pizzas e lasanhas artesanais</em>
  </p>
</p>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Executando o Servidor](#-executando-o-servidor)
- [Endpoints da API](#-endpoints-da-api)
  - [Produtos (Pizzas)](#-produtos-pizzas)
  - [Insumos (Estoque)](#-insumos-estoque)
  - [Fornecedores](#-fornecedores)
  - [Produção](#-produção)
  - [Alertas](#-alertas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Licença](#-licença)

---

## 📖 Sobre o Projeto

O **DM-Backend** é a API REST que alimenta o sistema de gestão da **Dany Massas Caseiras**. Ela permite o controle completo de:

- **Produtos** — Cadastro e gerenciamento das pizzas e massas do catálogo
- **Insumos** — Controle de estoque de ingredientes com quantidade mínima e validade
- **Fornecedores** — Registro e gestão dos fornecedores de matéria-prima
- **Produção** — Simulação de produção com abatimento automático de insumos do estoque
- **Alertas** — Monitoramento inteligente do estoque com alertas de nível crítico e atenção

---

## 🛠 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | v18+ | Runtime JavaScript |
| **Express** | v5.2 | Framework web minimalista |
| **ES Modules** | — | Sistema de módulos nativo do JavaScript |

---

## ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) (incluído com o Node.js)

---

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/BrunoGuttervill/DM-System-BackEnd.git

# Acesse o diretório do projeto
cd DM-System-BackEnd

# Instale as dependências
npm install
```

---

## ▶ Executando o Servidor

```bash
# Modo de desenvolvimento (com hot-reload)
npm run dev
```

O servidor estará disponível em: **http://localhost:3000**

---

## 📡 Endpoints da API

Base URL: `http://localhost:3000`

---

### 🍕 Produtos (Pizzas)

Gerenciamento do catálogo de pizzas.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/produtos` | Lista todas as pizzas |
| `GET` | `/api/produtos/:id` | Busca uma pizza pelo ID |
| `POST` | `/api/produtos` | Cadastra uma nova pizza |
| `PUT` | `/api/produtos/:id` | Atualiza uma pizza existente |
| `DELETE` | `/api/produtos/:id` | Remove uma pizza |

<details>
<summary>📄 <strong>Modelo do objeto Pizza</strong></summary>

```json
{
  "id": 1,
  "nome": "Calabresa",
  "tipo": "Salgada",
  "sabores": ["Calabresa"],
  "qtd": 6,
  "precoVarejo": 30.00,
  "precoAtacado": 24.00,
  "status": "ok"
}
```

</details>

<details>
<summary>📝 <strong>POST /api/produtos</strong> — Campos obrigatórios</summary>

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | `string` | Nome da pizza |
| `tipo` | `string` | Tipo da pizza (ex: "Salgada", "Doce") |
| `sabores` | `string[]` | Lista de sabores/ingredientes |
| `qtd` | `number` | Quantidade em estoque |
| `precoVarejo` | `number` | Preço de venda no varejo (R$) |
| `precoAtacado` | `number` | Preço de venda no atacado (R$) |
| `status` | `string` | Status do estoque: `ok`, `baixo` ou `critico` |

**Exemplo de requisição:**

```bash
curl -X POST http://localhost:3000/api/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Mussarela",
    "tipo": "Salgada",
    "sabores": ["Mussarela"],
    "qtd": 12,
    "precoVarejo": 26.00,
    "precoAtacado": 20.80,
    "status": "ok"
  }'
```

</details>

---

### 📦 Insumos (Estoque)

Controle dos ingredientes e matérias-primas.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/insumos` | Lista todos os insumos |
| `GET` | `/api/insumos/:id` | Busca um insumo pelo ID |
| `POST` | `/api/insumos` | Cadastra um novo insumo |
| `PUT` | `/api/insumos/:id` | Atualiza um insumo existente |
| `DELETE` | `/api/insumos/:id` | Remove um insumo |

<details>
<summary>📄 <strong>Modelo do objeto Insumo</strong></summary>

```json
{
  "id": 1,
  "nome": "farinha",
  "qtdAtual": 100,
  "unidade": "kg",
  "categoria": "teste",
  "qtdMinima": 20,
  "validade": "2024-12-31",
  "status": "ok"
}
```

</details>

<details>
<summary>📝 <strong>POST /api/insumos</strong> — Campos obrigatórios</summary>

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | `string` | Nome do insumo |
| `qtdAtual` | `number` | Quantidade atual em estoque |
| `unidade` | `string` | Unidade de medida (`kg`, `l`, etc.) |
| `categoria` | `string` | Categoria do insumo |
| `qtdMinima` | `number` | Quantidade mínima antes do alerta |
| `validade` | `string` | Data de validade (formato `YYYY-MM-DD`) |
| `status` | `string` | Status do estoque: `ok`, `baixo` ou `critico` |

**Exemplo de requisição:**

```bash
curl -X POST http://localhost:3000/api/insumos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "oregano",
    "qtdAtual": 5,
    "unidade": "kg",
    "categoria": "tempero",
    "qtdMinima": 2,
    "validade": "2025-06-30",
    "status": "ok"
  }'
```

</details>

---

### 🏢 Fornecedores

Gerenciamento dos fornecedores de matéria-prima.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/fornecedor` | Lista todos os fornecedores |
| `GET` | `/api/fornecedor/:id` | Busca um fornecedor pelo ID |
| `POST` | `/api/fornecedor` | Cadastra um novo fornecedor |
| `PUT` | `/api/fornecedor/:id` | Atualiza um fornecedor existente |
| `DELETE` | `/api/fornecedor/:id` | Remove um fornecedor |

<details>
<summary>📄 <strong>Modelo do objeto Fornecedor</strong></summary>

```json
{
  "id": 1,
  "nome": "Moinho São João",
  "cnpj": "12.345.678/0001-90",
  "telefone": "(11) 1234-5678",
  "email": "contato@moinhosaojoao.com",
  "insumos": "farinha"
}
```

</details>

<details>
<summary>📝 <strong>POST /api/fornecedor</strong> — Campos obrigatórios</summary>

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | `string` | Nome/Razão social do fornecedor |
| `cnpj` | `string` | CNPJ do fornecedor |
| `telefone` | `string` | Telefone de contato |
| `email` | `string` | E-mail de contato |
| `insumos` | `string` | Insumos fornecidos |

**Exemplo de requisição:**

```bash
curl -X POST http://localhost:3000/api/fornecedor \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Temperos Naturais Ltda",
    "cnpj": "55.666.777/0001-88",
    "telefone": "(47) 9999-8888",
    "email": "vendas@temperosnaturais.com",
    "insumos": "oregano"
  }'
```

</details>

---

### 🏭 Produção

Simulação de ordens de produção com abatimento automático de insumos do estoque.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/producao` | Lista o histórico de ordens de produção |
| `GET` | `/api/producao/:id` | Busca uma ordem de produção pelo ID |
| `POST` | `/api/producao` | Cria uma nova ordem de produção |

<details>
<summary>📄 <strong>Modelo do objeto Produção</strong></summary>

```json
{
  "id": 1,
  "pizzaId": 1,
  "qtd": 10,
  "produto": "Calabresa",
  "responsavel": "João",
  "insumos": "3kg de farinha, 1l de molho de tomate, 2kg de queijo, 1.5kg de calabresa",
  "data": "2026-06-11T15:30:00.000Z"
}
```

</details>

<details>
<summary>📝 <strong>POST /api/producao</strong> — Como funciona</summary>

Ao criar uma ordem de produção, o sistema:

1. Busca a **ficha técnica** (receita) da pizza informada
2. Calcula o consumo de cada insumo com base na **quantidade solicitada**
3. **Abate automaticamente** os insumos do estoque
4. Registra a ordem no **histórico de produção**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `pizzaId` | `number` | ✅ | ID da pizza a ser produzida |
| `quantidade` | `number` | ✅ | Quantidade de unidades a produzir |
| `responsavel` | `string` | ❌ | Nome do responsável pela produção |

**Exemplo de requisição:**

```bash
curl -X POST http://localhost:3000/api/producao \
  -H "Content-Type: application/json" \
  -d '{
    "pizzaId": 1,
    "quantidade": 10,
    "responsavel": "João"
  }'
```

> ⚠️ **Atenção:** As receitas estão disponíveis apenas para `pizzaId: 1` (Calabresa) e `pizzaId: 2` (Frango com Catupiry).

</details>

---

### 🔔 Alertas

Monitoramento inteligente do estoque de insumos. Os alertas são gerados **dinamicamente** com base na quantidade atual vs. quantidade mínima de cada insumo.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET`  | `/api/alertas`   | Lista os alertas ativos do sistema |

<details>
<summary>📄 <strong>Lógica dos alertas</strong></summary>

| Nível | Ícone | Condição |
|-------|:-----:|----------|
| **Crítico** | 🔴 | `qtdAtual < qtdMinima / 2` |
| **Atenção** | 🟡 | `qtdAtual < qtdMinima` |

**Exemplo de resposta:**

```json
[
  {
    "id": 1,
    "tipo": "critico",
    "icon": "🔴",
    "titulo": "farinha - critico",
    "desc": "farinha possui apenas 3 kg restantes em estoque."
  },
  {
    "id": 2,
    "tipo": "atencao",
    "icon": "🟡",
    "titulo": "queijo - atenção",
    "desc": "queijo possui apenas 12 kg restantes em estoque."
  }
]
```

</details>

---

## 📁 Estrutura do Projeto

```
DM-BACKEND/
├── server.js              # Ponto de entrada — configura o Express e registra os routers
├── package.json           # Dependências e scripts do projeto
├── .gitignore             # Arquivos ignorados pelo Git
└── routes/
    ├── produtos.js        # CRUD de pizzas (catálogo de produtos)
    ├── insumos.js         # CRUD de insumos (controle de estoque)
    ├── fornecedor.js      # CRUD de fornecedores
    ├── producao.js        # Ordens de produção + abatimento de estoque
    └── alertas.js         # Alertas dinâmicos de estoque baixo/crítico
```

---

## 💡 Exemplos de Uso

### Listar todas as pizzas

```bash
curl http://localhost:3000/api/produtos
```

### Buscar uma pizza específica

```bash
curl http://localhost:3000/api/produtos/1
```

### Atualizar o estoque de uma pizza

```bash
curl -X PUT http://localhost:3000/api/produtos/1 \
  -H "Content-Type: application/json" \
  -d '{"qtd": 20}'
```

### Deletar um insumo

```bash
curl -X DELETE http://localhost:3000/api/insumos/3
```

### Verificar alertas de estoque

```bash
curl http://localhost:3000/api/alertas
```

---

## 📌 Respostas de Erro

A API retorna erros no seguinte formato:

| Código | Descrição |
|--------|-----------|
| `400` | Requisição inválida — campo obrigatório ausente |
| `404` | Recurso não encontrado |
| `204` | Sucesso sem conteúdo (DELETE) |

**Exemplo de erro:**

```json
{
  "error": "O campo nome é obrigatório."
}
```

---

## 📄 Licença

Este projeto está sob a licença **ISC**.

---

<p align="center">
  Feito com ❤️ para a <strong>Dany Massas Caseiras</strong> — Canoinhas/SC
</p>
