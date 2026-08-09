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
    
    const { pizzaId, ingredientes } = req.body;

   if (!pizzaId || !Array.isArray(ingredientes) || ingredientes.length === 0) {
    return res.status(400).json({ error: 'pizzaId e ao menos um ingrediente são obrigatórios.' });
}

    const connection = await db.getConnection();

    try{
        await connection.beginTransaction();
        for (const item of ingredientes){
            await connection.query(
                'INSERT INTO receitas (pizzaId, insumoId, qtdPorUnidade) VALUES (?, ?, ?)',
                [pizzaId, item.insumoId, item.qtdPorUnidade]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Receita criada com sucesso' });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Erro ao criar receita', error: error.message });
    } finally {
        connection.release();
    }
});


export default router;