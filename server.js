import express from 'express';
import produtosRouter from './routes/produtos.js';
import producaoRouter from './routes/producao.js';
import insumosRouter from './routes/insumos.js';
import fornecedoresRouter from './routes/fornecedor.js';
import alertasRouter from './routes/alertas.js';
import movimentacaoRouter from './routes/movimentacao.js';
import cors from 'cors'

const app = express();
app.use(cors())
app.use(express.json());
app.use('/api/produtos', produtosRouter);
app.use('/api/producao', producaoRouter);
app.use('/api/insumos', insumosRouter);
app.use('/api/fornecedor', fornecedoresRouter);
app.use('/api/alertas', alertasRouter);
app.use('/api/movimentacao', movimentacaoRouter);



app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));