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

| Método | Rota                  | Descrição                    |
|--------|-----------------------|------------------------------|
| GET    | /api/insumos          | Listar matérias-primas       |
| POST   | /api/insumos          | Cadastrar insumo             |
| GET    | /api/produtos         | Listar produtos acabados     |
| POST   | /api/producao         | Registrar ordem de produção  |
| GET    | /api/fornecedores     | Listar fornecedores          |
| GET    | /api/alertas          | Buscar alertas ativos        |

## Estrutura do Projeto
