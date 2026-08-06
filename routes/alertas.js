import express from 'express';
import db from '../db.js';


const router = express.Router();

router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM  insumos WHERE qtdAtual < qtdMin');

    const alertas = rows.map(insumo => ({
        id: insumo.id,
        tipo: insumo.qtdAtual < insumo.qtdMin / 2 ? 'critico' : 'atencao',
        icon: insumo.qtdAtual < insumo.qtdMin / 2 ? 'critico' : 'atencao',  // ← muda emoji pra chave
        titulo: `${insumo.nome} - Estoque baixo`,
        desc: `${insumo.nome} possui apenas ${insumo.qtdAtual} ${insumo.unidade} restantes em estoque.`,
    }))

    res.json(alertas)
});

export default router;


