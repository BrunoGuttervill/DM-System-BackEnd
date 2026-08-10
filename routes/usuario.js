import express from 'express';
const router = express.Router();
import db from '../db.js'
import bcrypt from 'bcrypt';

router.post('/', async (req, res) => {
    const {nome, email, senha, perfil} = req.body;

    const camposObrihatorios = ['nome', 'email', 'senha', 'perfil'];
    const faltando = camposObrihatorios.filter(campo => !req.body[campo]);

    if(faltando.length > 0) {
        return res.status(400).json({ error: `Campos obrigatórios faltando: ${faltando.join(', ')}` });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const [result] = await db.query(
            'INSERT INTO usuarios (nome, email, senhaHash, perfil) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, perfil]
        );

        const [rows] = await db.query('SELECT id, nome, email, perfil FROM usuarios WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Já existe uma conta cadastrada com esse e-mail.' });
        }
        console.error(err);
        res.status(500).json({ error: 'Não foi possível criar o usuário. Tente novamente.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    try {
        const [rows] = await db.query(
            'SELECT id, nome, email, senhaHash, perfil FROM usuarios WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const usuario = rows[0];
        const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);

        if (!senhaConfere) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const { senhaHash, ...usuarioSemSenha } = usuario;
        res.json(usuarioSemSenha);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Não foi possível fazer login. Tente novamente.' });
    }
});

export default router;