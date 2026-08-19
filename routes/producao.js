import express from 'express';
const router = express.Router();
import db from '../db.js'
import {verificarToken} from '../middleware/auth.js'



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

router.post('/', verificarToken, async (req, res) => {
    const camposObrigatorios = ['pizzaId', 'quantidade', 'responsavel']
    const faltando = camposObrigatorios.find(campo => !req.body[campo]);

    if (faltando) {
        return res.status(400).json({ error: `O campo ${faltando} é obrigatório.` });
    }

    const { pizzaId, quantidade, responsavel, observacoes } = req.body;

    const [pizzasResult] = await db.query('SELECT * FROM pizzas WHERE id = ?', [pizzaId]);
    if (pizzasResult.length === 0) {
        return res.status(404).json({ error: 'Pizza não encontrada.' });
    }
    const pizza = pizzasResult[0];

    const [receita] = await db.query(
        `SELECT r.qtdPorUnidade, i.id AS insumoId, i.nome, i.unidade, i.qtdAtual
        FROM receitas r
        JOIN insumos i ON r.insumoId = i.id
        JOIN fichas_tecnicas f ON r.fichaId = f.id
        WHERE f.pizzaId = ?`,
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
        `INSERT INTO producoes (pizzaId, produto, qtd, responsavel, insumos, observacoes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pizzaId, pizza.nome, quantidade, responsavel, insumosTexto, observacoes]
    );

    const [novaProducao] = await db.query('SELECT * FROM producoes WHERE id = ?', [result.insertId]);

    res.status(201).json(novaProducao[0]);
});

router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { quantidade, responsavel, observacoes } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [producaoResult] = await connection.query('SELECT * FROM producoes WHERE id = ?', [id]);
        if (producaoResult.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Produção não encontrada.' });
        }
        const producao = producaoResult[0];

        const diferenca = quantidade - producao.qtd;

        const [receita] = await connection.query(
            `SELECT r.qtdPorUnidade, i.id AS insumoId, i.nome, i.unidade, i.qtdAtual
             FROM receitas r
             JOIN insumos i ON r.insumoId = i.id
             JOIN fichas_tecnicas f ON r.fichaId = f.id
             WHERE f.pizzaId = ?`,
            [producao.pizzaId]
        );

        if (diferenca > 0) {
            for (const ing of receita) {
                const qtdAdicional = ing.qtdPorUnidade * diferenca;
                if (qtdAdicional > ing.qtdAtual) {
                    await connection.rollback();
                    return res.status(400).json({
                        error: `Estoque insuficiente para aumentar a produção. Falta ${ing.nome}.`
                    });
                }
            }
        }

        const consumidos = [];
        for (const ing of receita) {
            const ajuste = Math.round(ing.qtdPorUnidade * diferenca * 1000) / 1000;
            await connection.query(
                'UPDATE insumos SET qtdAtual = qtdAtual - ? WHERE id = ?',
                [ajuste, ing.insumoId]
            );
            const totalNovo = Math.round(ing.qtdPorUnidade * quantidade * 1000) / 1000;
            consumidos.push(`${totalNovo} ${ing.unidade} de ${ing.nome}`);
        }
        const insumosTexto = consumidos.join(', ');

        await connection.query(
            'UPDATE producoes SET qtd = ?, responsavel = ?, observacoes = ?, insumos = ? WHERE id = ?',
            [quantidade, responsavel, observacoes, insumosTexto, id]
        );

        await connection.commit();
        const [rows] = await connection.query('SELECT * FROM producoes WHERE id = ?', [id]);
        res.status(200).json(rows[0]);

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Erro ao editar produção.', detalhe: error.message });
    } finally {
        connection.release();
    }
});



export default router;