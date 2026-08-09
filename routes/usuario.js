import express from 'express';
const router = express.Router();
import db from '../db.js'
import bcrypt from 'bcrypt';

router.post('/', async (req, res) => {
    const {nome, email, senha, perfil } = req.body;

    const camposObrihatorios = ['nome', 'email', 'senha', 'perfil'];
    const faltando = camposObrihatorios.filter(campo => !req.body[campo]);

    if(faltando.length > 0) {
        return res.status(400).json({ error: `Campos obrigatórios faltando: ${faltando.join(', ')}` });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [result] = await db.query(
        'INSERT INTO usuarios (nome, email, senhaHash, perfil) VALUES (?, ?, ?, ?)',
        [nome, email, senhaHash, perfil]
    );

    const [rows] = await db.query('SELECT id, nome, email, perfil FROM usuarios WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
});

export default router;