import express from 'express';
const router = express.Router();
import db from '../db.js'



router.get('/', async (req, res) => {

    const [rows] = await db.query('SELECT * FROM producoes');
    res.json(rows);
});

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const [rows] = await db.query('SELECT * FROM producoes WHERE id = ?', [id])

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Produção não encontrada.' });
    }
    res.json(rows[0]);
});


//Simula a produção de pizzas, abatendo a quantidade necessária de insumos do estoque com base na receita.
router.post('/', async (req, res) => {
    const camposObrigatorios = ['pizzaId', 'quantidade', 'responsavel']
    const faltando = camposObrigatorios.find(campo => !req.body[campo]);

    if (faltando) {
        return res.status(400).json({ error: `O campo ${faltando} é obrigatório.` });
    }

    const { pizzaId, quantidade, responsavel } = req.body;

    const [pizzasResult] = await db.query('SELECT * FROM pizzas WHERE id = ?', [pizzaId]);
    if (pizzasResult.length === 0) {
        return res.status(404).json({ error: 'Pizza não encontrada.' });
    }
    const pizza = pizzasResult[0];

    const [receita] = await db.query(
        `SELECT r.qtdPorUnidade, i.id AS insumoId, i.nome, i.unidade, i.qtdAtual
         FROM receitas r
         JOIN insumos i ON r.insumoId = i.id
         WHERE r.pizzaId = ?`,
        [pizzaId]
    );

    if (receita.length === 0) {
        return res.status(404).json({ error: 'Receita não regiustrada pra esta pizza.' })
    }

    for (const ingrediente of receita) {
        const qtdTotal = ingrediente.qtdPorUnidade * quantidade;

        if (qtdTotal > ingrediente.qtdAtual) {
            return res.status(400).json({
                error: `Estoque insuficiente para o insumo ${ingrediente.nome}`,
                sugestao: `Faltam ${qtdTotal - ingrediente.qtdAtual} unidades`
            });
        }
    }

    const consumidos = [];
    for (const ingrediente of receita) {
        const qtdTotal = ingrediente.qtdPorUnidade * quantidade;
        const qtdTotalArredondada = Math.round(qtdTotal * 1000) / 1000;

        await db.query(
            'UPDATE insumos SET qtdAtual = qtdAtual - ? WHERE id = ?',
            [qtdTotalArredondada, ingrediente.insumoId]
        );

        consumidos.push(`${qtdTotalArredondada} ${ingrediente.unidade} de ${ingrediente.nome}`);
    }

    const insumosTexto = consumidos.join(', ');

    const [result] = await db.query(
        `INSERT INTO producoes (pizzaId, produto, qtd, responsavel, insumos)
         VALUES (?, ?, ?, ?, ?)`,
        [pizzaId, pizza.nome, quantidade, responsavel, insumosTexto]
    );

    const [novaProducao] = await db.query('SELECT * FROM producoes WHERE id = ?', [result.insertId]);

    res.status(201).json(novaProducao[0]);
});



export default router;