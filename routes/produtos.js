import express from 'express';
import db from '../db.js'
const router = express.Router();

// Retorna a lista completa de todas as pizzas cadastradas no sistema. 
router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM pizzas');

    rows.forEach(pizza => {
        pizza.sabores = JSON.parse(pizza.sabores)

    });

    res.json(rows);
});

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const [rows] = await db.query('SELECT * FROM pizzas WHERE id = ?', [id]);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Pizza não encontrada.' });
    }
    res.json(rows[0]);
});


//Cadastra uma nova pizza no sistema.
router.post('/', async (req, res) => {
    const camposObrigatorios = ['nome', 'tipo', 'sabores', 'qtd', 'precoVarejo', 'precoAtacado', 'status'];
    const faltando = camposObrigatorios.find(campo => !req.body[campo]);

    if (faltando) {
        return res.status(400).json({ error: `O campo ${faltando} é obrigatório.` });
    }

    const novaPizza = {
        nome: req.body.nome,
        tipo: req.body.tipo,
        sabores: req.body.sabores,
        qtd: req.body.qtd,
        precoVarejo: req.body.precoVarejo,
        precoAtacado: req.body.precoAtacado,
        status: req.body.status
    };


    const [result] = await db.query('INSERT INTO pizzas (nome, tipo, sabores, qtd, precoVarejo, precoAtacado, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        novaPizza.nome,
        novaPizza.tipo,
        JSON.stringify(req.body.sabores),
        novaPizza.qtd,
        novaPizza.precoVarejo,
        novaPizza.precoAtacado,
        novaPizza.status
    ]
    );
    const idGerado = result.insertId;

    const [rows] = await db.query('SELECT * FROM pizzas WHERE id = ?', [idGerado]);
    res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {

    const campos = [];
    const valores = [];
    const id = parseInt(req.params.id);



    if (req.body.nome !== undefined) {
        campos.push('nome = ?');
        valores.push(req.body.nome);
    }
    if (req.body.tipo !== undefined) {
        campos.push('tipo = ?');
        valores.push(req.body.tipo);
    }
    if (req.body.sabores !== undefined) {
        campos.push('sabores = ?');
        valores.push(JSON.stringify(req.body.sabores));
    }
    if (req.body.qtd !== undefined) {
        campos.push('qtd = ?');
        valores.push(req.body.qtd);
    }
    if (req.body.precoVarejo !== undefined) {
        campos.push('precoVarejo = ?');
        valores.push(req.body.precoVarejo);
    }
    if (req.body.precoAtacado !== undefined) {
        campos.push('precoAtacado = ?');
        valores.push(req.body.precoAtacado);
    }
    if (req.body.status !== undefined) {
        campos.push('status = ?');
        valores.push(req.body.status);
    }

    if (campos.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    const set = campos.join(', ');

    const query = `UPDATE pizzas SET ${set} WHERE id = ?`;
    valores.push(id);

    const [result] = await db.query(query, valores);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Pizza não encontrada.' });
    }

    const [rows] = await db.query('SELECT * FROM pizzas WHERE id = ?', [id]);
    res.status(200).json(rows[0]);

});

router.delete('/:id', async (req, res) => {

    const id = parseInt(req.params.id);

    const [result] = await db.query('DELETE FROM pizzas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Pizza não encontrada.' });
    }

    res.status(204).send();
});


export default router;