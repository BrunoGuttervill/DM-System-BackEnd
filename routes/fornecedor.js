import express from 'express';
const router = express.Router();
import db from '../db.js';



//Retorna a lista completa de todos os fornecedores cadastrados no sistema.
router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM fornecedores');

    res.json(rows);
});

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const [rows] = await db.query('SELECT * FROM fornecedores WHERE id = ?', [id]);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
    }
    res.json(rows[0]);
});

//cadastro de um novo fornecedor no sistema.
router.post('/', async (req, res) => {
    const camposObrigatorios = ['nome', 'cnpj', 'telefone', 'email', 'insumos'];
    const faltando = camposObrigatorios.find(campo => !req.body[campo]);

    if (faltando) {
        return res.status(400).json({ error: `O campo ${faltando} é obrigatório.` });
    }


    const [result] = await db.query('INSERT INTO fornecedores (nome, cnpj, telefone, email, insumos) VALUES (?,?,?,?,?)', [
        req.body.nome,
        req.body.cnpj,
        req.body.telefone,
        req.body.email,
        req.body.insumos
    ]
    );

    const idGerado = result.insertId;

    const [rows] = await db.query('SELECT * FROM fornecedores WHERE id = ?', [idGerado]);

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
    if (req.body.cnpj !== undefined) {
        campos.push('cnpj = ?');
        valores.push(req.body.cnpj);
    }
    if (req.body.telefone !== undefined) {
        campos.push('telefone = ?');
        valores.push(req.body.telefone);
    }
    if (req.body.email !== undefined) {
        campos.push('email = ?');
        valores.push(req.body.email);
    }
    if (req.body.insumos !== undefined) {
        campos.push('insumos = ?');
        valores.push(req.body.insumos);
    }

    if (campos.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    const set = campos.join(', ');

    const query = `UPDATE fornecedores SET ${set} WHERE id = ?`;
    valores.push(id);

    const [result] = await db.query(query, valores);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
    }

    const [rows] = await db.query('SELECT * FROM fornecedores WHERE id = ?', [id]);
    res.status(200).json(rows[0]);



});

router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    const [result] = await db.query('DELETE FROM fornecedores WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
    }

    res.status(204).send();
});

export default router;