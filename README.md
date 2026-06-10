# Dany Massas — Backend API

API REST desenvolvida para o sistema de controle de estoque da **Dany Massas Caseiras**, 
empresa localizada em Canoinhas/SC, especializada em massas, pizzas e lasanhas artesanais.

## Tecnologias

- Node.js
- Express
- MySQL
- dotenv

## Pré-requisitos

- Node.js v18+
- MySQL 8+

## Instalação

```bash
git clone https://github.com/seu-usuario/dany-massas-backend.git
cd dany-massas-backend
npm install
```

Configure o arquivo `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=dany_massas
PORT=3001
```

Execute o servidor:

```bash
npm run dev
```

## Endpoints

| Método | Rota                   | Descrição                                |
|--------|------------------------|------------------------------------------|
| GET    | /api/produtos/:id      | Busca uma pizza pelo id                  |
| POST   | /api/produtos          | Cadastra uma nova pizza                  |
| PUT    | /api/produtos/:id      | Atualiza uma pizza existente             |
| DELETE | /api/produtos/:id      | Remove uma pizza                         |
| GET    | /api/insumos/:id       | Busca um insumo pelo id                  |
| PUT    | /api/insumos/:id       | Atualiza um insumo                       |
| DELETE | /api/insumos/:id       | Remove um insumo                         |
| GET    | /api/fornecedores/:id  | Busca um fornecedor pelo id              |
| POST   | /api/fornecedores      | Cadastra um novo fornecedor              |
| PUT    | /api/fornecedores/:id  | Atualiza um fornecedor                   |
| DELETE | /api/fornecedores/:id  | Remove um fornecedor                     |
| GET    | /api/producao          | Lista o histórico de ordens de produção  |

## Estrutura do Projeto

DM-BACKEND/
├── server.js           # ponto de entrada — sobe o app e plugue os routers
├── package.json
├── .gitignore
└── routes/
    ├── produtos.js     # rotas e dados de pizzas
    ├── insumos.js      # rotas e dados de insumos (estoque)
    ├── fornecedores.js # rotas e dados de fornecedores
    └── producao.js     # rota de produção e histórico

