import express from 'express';
import db from '../db.js';


const router = express.Router();

router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM  insumos WHERE qtdAtual < qtdMin');

    const alertas = rows.map(insumos => ({
        id: insumos.id,
        tipo: insumos.qtdAtual < insumos.qtdMin / 2 ? 'critico' : 'atencao',
        icon: insumos.qtdAtual < insumos.qtdMin / 2 ? '🔴' : '🟡',
        titulo: `${insumos.nome} - Estoque baixo`,
        desc: `${insumos.nome} possui apenas ${insumos.qtdAtual} ${insumos.unidade} restantes em estoque.`,
    }))

    res.json(alertas)
});

export default router;


