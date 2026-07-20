import express from 'express';
const router = express.Router();
import db from '../db.js';


// Retorna a lista completa de todos os insumos (ingredientes) do estoque.
router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM insumos');
    res.json(rows);
});

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const [rows] = await db.query('SELECT * FROM insumos WHERE id = ?', [id]);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Insumo não encontrado.' });
    }

    res.json(rows[0]);
});


//Cadastra um novo insumo (ingrediente) no estoque.
router.post('/', async (req, res) => {
    const camposObrigatorios = ['nome', 'qtdAtual', 'unidade', 'categoria', 'qtdMin', 'validade', 'status'];
    const faltando = camposObrigatorios.find(campo => !req.body[campo]);

    if (faltando) {
        return res.status(400).json({ error: `O campo ${faltando} é obrigatório.` });
    }

    const [result] = await db.query('INSERT INTO insumos (nome, qtdAtual, unidade, categoria, qtdMin, validade, status) VALUES (?,?,?,?,?,?,?)', [
        req.body.nome,
        req.body.qtdAtual,
        req.body.unidade,
        req.body.categoria,
        req.body.qtdMin,
        req.body.validade,
        req.body.status
    ]);

    const idGerado = result.insertId;

    const [rows] = await db.query('SELECT * FROM insumos WHERE id = ?', [idGerado]);

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
    if (req.body.qtdAtual !== undefined) {
        campos.push('qtdAtual = ?');
        valores.push(req.body.qtdAtual);
    }
    if (req.body.unidade !== undefined) {
        campos.push('unidade = ?');
        valores.push(req.body.unidade);
    }
    if (req.body.categoria !== undefined) {
        campos.push('categoria = ?');
        valores.push(req.body.categoria);
    }
    if (req.body.qtdMin !== undefined) {
        campos.push('qtdMin = ?');
        valores.push(req.body.qtdMin);
    }
    if (req.body.validade !== undefined) {
        campos.push('validade = ?');
        valores.push(req.body.validade);
    }
    if (req.body.status !== undefined) {
        campos.push('status = ?');
        valores.push(req.body.status);
    }

    if (campos.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    const set = campos.join(', ');

    const query = `UPDATE insumos SET ${set} WHERE id = ?`;
    valores.push(id);

    const [result] = await db.query(query, valores);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Insumo não encontrado.' });
    }

    const [rows] = await db.query('SELECT * FROM insumos WHERE id = ?', [id]);
    res.status(200).json(rows[0]);
});

router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const [result] = await db.query('DELETE FROM insumos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Insumo não encontrado.' });
    }

    res.status(204).send();
});

export default router;
