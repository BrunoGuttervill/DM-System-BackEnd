import express from 'express';
const router = express.Router();
import db from '../db.js';



router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM movimentacoes');
    res.json(rows);
})

router.post('/', async (req, res) => {
    const camposObigatorios = ['insumosId', 'tipo', 'qtd']
    const faltando = camposObigatorios.find(campo => !req.body[campo]);

    if (faltando) {
        return res.status(400).json({ error: `O campo ${faltando} e obrigatorio` })
    }

    const [rows] = await db.query('SELECT * FROM insumos WHERE id = ?', [req.body.insumosId]);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Insumo não encontrado.' });
    }

    if (req.body.tipo === 'entrada') {
        await db.query('UPDATE insumos SET qtdAtual = qtdAtual + ? WHERE id = ?', [req.body.qtd, req.body.insumosId]);
    } else if (req.body.tipo === 'saida' || req.body.tipo === 'descarte') {
        await db.query('UPDATE insumos SET qtdAtual = qtdAtual - ? WHERE id = ?', [req.body.qtd, req.body.insumosId]);
    } else if (req.body.tipo === 'ajuste') {
        await db.query('UPDATE insumos SET qtdAtual = ? WHERE id = ?', [req.body.qtd, req.body.insumosId]);
    } else {
        return res.status(400).json({ error: 'Tipo inválido. Use entrada, saida, descarte ou ajuste.' });
    }

    const [result] = await db.query('INSERT INTO movimentacoes (insumoId, tipo, qtd, motivo ) VALUES (?, ?, ?, ?)', [
        req.body.insumosId,
        req.body.tipo,
        req.body.qtd,
        req.body.motivo || null
    ]);

    const [result1] = await db.query('SELECT * FROM movimentacoes WHERE id = ?', [result.insertId]);
    res.status(201).json(result1[0]);
})


export default router;