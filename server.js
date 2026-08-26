import 'dotenv/config';
import express from 'express';
import path from 'path';
import produtosRouter from './routes/produtos.js';
import producaoRouter from './routes/producao.js';
import insumosRouter from './routes/insumos.js';
import fornecedoresRouter from './routes/fornecedor.js';
import alertasRouter from './routes/alertas.js';
import movimentacoesRouter from './routes/movimentacoes.js';
import receitasRouter from './routes/receitas.js';
import usuarioRouter from './routes/usuario.js';
import cors from 'cors'

const app = express();
app.use(cors())
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/produtos', produtosRouter);
app.use('/api/producao', producaoRouter);
app.use('/api/insumos', insumosRouter);
app.use('/api/fornecedor', fornecedoresRouter);
app.use('/api/alertas', alertasRouter);
app.use('/api/movimentacoes', movimentacoesRouter);
app.use('/api/receitas', receitasRouter);
app.use('/api/usuario', usuarioRouter);


app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));