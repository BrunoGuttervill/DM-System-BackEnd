import express from 'express';
const router = express.Router();
import db from '../db.js';
import { verificarToken } from '../middleware/auth.js';

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT v.id, v.data, v.responsavel, v.formaPagamento, v.total, v.observacoes,
                   COUNT(iv.id) AS totalItens
            FROM vendas v
            LEFT JOIN itens_venda iv ON iv.vendaId = v.id
            GROUP BY v.id, v.data, v.responsavel, v.formaPagamento, v.total, v.observacoes
            ORDER BY v.data DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar vendas.' });
    }
});

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const [itens] = await db.query(`
            SELECT iv.id, iv.produtoId, iv.quantidade, iv.precoUnitario, iv.subtotal, p.nome AS produtoNome
            FROM itens_venda iv
            JOIN pizzas p ON iv.produtoId = p.id
            WHERE iv.vendaId = ?
        `, [id]);
        res.json(itens);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar itens da venda.' });
    }
});

router.post('/', verificarToken, async (req, res) => {
    const { responsavel, formaPagamento, observacoes, itens } = req.body;

    if (!responsavel || !formaPagamento || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ error: 'responsavel, formaPagamento e ao menos um item são obrigatórios.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let total = 0;
        const itensCalculados = [];

        for (const item of itens) {
            const { produtoId, quantidade, precoUnitario } = item;

            if (!produtoId || !quantidade || quantidade <= 0 || precoUnitario === undefined) {
                throw { status: 400, message: 'Cada item precisa de produtoId, quantidade e precoUnitario válidos.' };
            }

            const [produtoRows] = await connection.query(
                'SELECT id, nome, qtd FROM pizzas WHERE id = ? FOR UPDATE',
                [produtoId]
            );

            if (produtoRows.length === 0) {
                throw { status: 404, message: `Produto ${produtoId} não encontrado.` };
            }

            const produto = produtoRows[0];

            if (produto.qtd < quantidade) {
                throw {
                    status: 400,
                    message: `Estoque insuficiente de "${produto.nome}". Disponível: ${produto.qtd}, solicitado: ${quantidade}.`,
                };
            }

            const subtotal = Number(precoUnitario) * quantidade;
            total += subtotal;
            itensCalculados.push({ produtoId, quantidade, precoUnitario, subtotal });

            await connection.query('UPDATE pizzas SET qtd = qtd - ? WHERE id = ?', [quantidade, produtoId]);
        }

        const [resultVenda] = await connection.query(
            'INSERT INTO vendas (responsavel, formaPagamento, total, observacoes) VALUES (?, ?, ?, ?)',
            [responsavel, formaPagamento, total, observacoes || null]
        );
        const vendaId = resultVenda.insertId;

        for (const item of itensCalculados) {
            await connection.query(
                'INSERT INTO itens_venda (vendaId, produtoId, quantidade, precoUnitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [vendaId, item.produtoId, item.quantidade, item.precoUnitario, item.subtotal]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Venda registrada com sucesso', vendaId, total });

    } catch (error) {
        await connection.rollback();
        const status = error.status || 500;
        if (!error.status) console.error(error);
        res.status(status).json({ error: error.message || 'Erro ao registrar venda.' });
    } finally {
        connection.release();
    }
});

export default router;