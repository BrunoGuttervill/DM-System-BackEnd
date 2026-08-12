import express from 'express';
const router = express.Router();
import db from '../db.js'


router.get('/:pizzaId', async (req, res) => {
    const pizzaId = parseInt(req.params.pizzaId);
    const [rows] = await db.query(
        `SELECT r.id, r.insumoId, r.qtdPorUnidade, i.nome, i.unidade
         FROM receitas r
         JOIN insumos i ON r.insumoId = i.id
         JOIN fichas_tecnicas f ON r.fichaId = f.id
         WHERE f.pizzaId = ?`,
        [pizzaId]
    );
    res.json(rows);
});

router.post('/', async (req, res) => {
    const { pizzaId, custo, ingredientes } = req.body;

    if (!pizzaId || custo === undefined || !Array.isArray(ingredientes) || ingredientes.length === 0) {
        return res.status(400).json({ error: 'pizzaId, custo e ao menos um ingrediente são obrigatórios.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [resultFicha] = await connection.query(
            'INSERT INTO fichas_tecnicas (pizzaId, custo) VALUES (?, ?)',
            [pizzaId, custo]
        );
        const fichaId = resultFicha.insertId;

        for (const item of ingredientes) {
            await connection.query(
                'INSERT INTO receitas (fichaId, insumoId, qtdPorUnidade) VALUES (?, ?, ?)',
                [fichaId, item.insumoId, item.qtdPorUnidade]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Ficha técnica criada com sucesso', fichaId });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Erro ao criar ficha técnica', error: error.message });
    } finally {
        connection.release();
    }
});

router.get('/', async (req, res) => {

    const [rows] = await db.query(
        `SELECT 
        f.id,
        f.pizzaId,
        f.custo,
        p.nome AS produtoNome,
        COUNT(r.id) AS totalInsumos
        FROM fichas_tecnicas f
        JOIN pizzas p ON f.pizzaId = p.id
        LEFT JOIN receitas r ON r.fichaId = f.id
        GROUP BY f.id, f.pizzaId, f.custo, p.nome`
    );
    res.json(rows);
});


export default router;