import express from 'express';
const router = express.Router();
import { insumos } from './insumos.js';

export const movimentacao = [];

router.get('/', (req, res) => {
    res.json(movimentacao);
})

router.post('/', (req, res) => {
    const camposObigatorios = ['insumosId', 'tipo', 'qtd',]
    const faltando = camposObigatorios.find(campo => !req.body[campo]);

    if (faltando) {
        return res.status(400).json({ error: `O campo ${faltando} e obrigatorio` })
    }

    const insumo = insumos.find(i => i.id === req.body.insumosId);

    if (!insumo) {
        return res.status(404).json({ error: 'Insumo não encontrado.' });
    }

    if (req.body.tipo === 'entrada') {
        insumo.qtdAtual += req.body.qtd;
    } else if (req.body.tipo === 'saida' || req.body.tipo === 'descarte') {
        insumo.qtdAtual -= req.body.qtd;
    } else if (req.body.tipo === 'ajuste') {
        insumo.qtdAtual = req.body.qtd;
    }

    const ordem = {
        id: movimentacao.length + 1,
        insumosId: req.body.insumosId,
        tipo: req.body.tipo,
        qtd: req.body.qtd,
        motivo: req.body.motivo,
        data: new Date().toISOString()
    }
    movimentacao.push(ordem);
    res.status(201).json(ordem);
})


export default router;