import express from 'express';
import { insumos } from './insumos.js';


const router = express.Router();

router.get('/', (req, res) => {
    const alertas = [];

    insumos.forEach(insumo => {
        if (insumo.qtdAtual < insumo.qtdMinima / 2) {
            alertas.push({
                id: alertas.length + 1,
                tipo: 'critico',
                icon: '🔴',
                titulo: `${insumo.nome} - critico`,
                desc: `${insumo.nome} possui apenas ${insumo.qtdAtual} ${insumo.unidade} restantes em estoque.`
            })
        }

        else if (insumo.qtdAtual < insumo.qtdMinima) {
            alertas.push({
                id: alertas.length + 1,
                tipo: 'atencao',
                icon: '🟡',
                titulo: `${insumo.nome} - atenção`,
                desc: `${insumo.nome} possui apenas ${insumo.qtdAtual} ${insumo.unidade} restantes em estoque.`
            })
        }

    });






    res.json(alertas)
});

export default router;


