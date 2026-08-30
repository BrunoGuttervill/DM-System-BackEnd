import express from 'express';
const router = express.Router();
import db from '../db.js'
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import 'dotenv/config'

const pastaUploads = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(pastaUploads)) fs.mkdirSync(pastaUploads, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, pastaUploads),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `usuario-${req.params.id}-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Arquivo precisa ser uma imagem.'));
        }
        cb(null, true);
    },
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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

        const [rows] = await db.query('SELECT id, nome, email, perfil, fotoUrl FROM usuarios WHERE id = ?', [result.insertId]);
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
            'SELECT id, nome, email, senhaHash, perfil, fotoUrl FROM usuarios WHERE email = ?',
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

        const token = jwt.sign(
            { id: usuario.id, perfil: usuario.perfil },
            process.env.JWT_SECRET,
            { expiresIn: '8h'}
        )

        const { senhaHash, ...usuarioSemSenha } = usuario;
        res.json({ token , usuario: usuarioSemSenha });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Não foi possível fazer login. Tente novamente.' });
    }
});

// POST /api/usuario/esqueci-senha — gera um token temporário e envia por e-mail
router.post('/esqueci-senha', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Informe seu e-mail.' });
    }

    try {
        const [rows] = await db.query('SELECT id, nome FROM usuarios WHERE email = ?', [email]);

        // Por segurança, responde "ok" mesmo se o e-mail não existir no banco —
        // assim ninguém consegue descobrir quais e-mails estão cadastrados testando aqui.
        if (rows.length === 0) {
            return res.json({ ok: true });
        }

        const usuario = rows[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expira = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

        await db.query(
            'UPDATE usuarios SET resetToken = ?, resetTokenExpira = ? WHERE id = ?',
            [token, expira, usuario.id]
        );

        const linkReset = `http://localhost:5173/?token=${token}`;

        await transporter.sendMail({
            from: `"Dany Massas" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Redefinição de senha — MassaStock',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h2 style="color:#6B1A2A; margin-bottom: 4px;">Dany Massas</h2>
                <p style="color:#8A7060; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-top:0;">Controle de Estoque</p>
                <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;" />
                <p>Olá, ${usuario.nome}!</p>
                <p>Recebemos um pedido para redefinir sua senha no MassaStock. Clique no botão abaixo para criar uma nova senha:</p>
                <p style="text-align:center; margin: 28px 0;">
                  <a href="${linkReset}" style="background:#6B1A2A; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; display:inline-block; font-weight:bold;">
                    Redefinir minha senha
                  </a>
                </p>
                <p style="color:#888; font-size:13px;">Esse link expira em <strong>30 minutos</strong>. Se você não pediu essa redefinição, pode ignorar este e-mail com segurança.</p>
              </div>
            `,
        });

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Não foi possível enviar o e-mail. Tente novamente.' });
    }
});

// POST /api/usuario/resetar-senha — valida o token e salva a nova senha
router.post('/resetar-senha', async (req, res) => {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
        return res.status(400).json({ error: 'Link inválido.' });
    }
    if (novaSenha.length < 6) {
        return res.status(400).json({ error: 'A nova senha precisa ter pelo menos 6 caracteres.' });
    }

    try {
        const [rows] = await db.query(
            'SELECT id FROM usuarios WHERE resetToken = ? AND resetTokenExpira > NOW()',
            [token]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Link inválido ou expirado. Solicite um novo.' });
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        await db.query(
            'UPDATE usuarios SET senhaHash = ?, resetToken = NULL, resetTokenExpira = NULL WHERE id = ?',
            [novaSenhaHash, rows[0].id]
        );

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Não foi possível redefinir a senha. Tente novamente.' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ error: 'Informe nome e e-mail.' });
    }

    try {
        const [existente] = await db.query(
            'SELECT id FROM usuarios WHERE email = ? AND id != ?',
            [email, id]
        );
        if (existente.length > 0) {
            return res.status(409).json({ error: 'Já existe uma conta cadastrada com esse e-mail.' });
        }

        await db.query(
            'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
            [nome, email, id]
        );

        const [rows] = await db.query(
            'SELECT id, nome, email, perfil, fotoUrl FROM usuarios WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(rows[0]);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Já existe uma conta cadastrada com esse e-mail.' });
        }
        console.error(err);
        res.status(500).json({ error: 'Não foi possível salvar as alterações. Tente novamente.' });
    }
});

router.put('/:id/senha', async (req, res) => {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });
    }
    if (novaSenha.length < 6) {
        return res.status(400).json({ error: 'A nova senha precisa ter pelo menos 6 caracteres.' });
    }

    try {
        const [rows] = await db.query('SELECT senhaHash FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const senhaConfere = await bcrypt.compare(senhaAtual, rows[0].senhaHash);
        if (!senhaConfere) {
            return res.status(401).json({ error: 'Senha atual incorreta.' });
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        await db.query('UPDATE usuarios SET senhaHash = ? WHERE id = ?', [novaSenhaHash, id]);

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Não foi possível trocar a senha. Tente novamente.' });
    }
});

router.put('/:id/foto', upload.single('foto'), async (req, res) => {
    const { id } = req.params;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
        }

        const fotoUrl = `/uploads/${req.file.filename}`;
        await db.query('UPDATE usuarios SET fotoUrl = ? WHERE id = ?', [fotoUrl, id]);

        const [rows] = await db.query(
            'SELECT id, nome, email, perfil, fotoUrl FROM usuarios WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Não foi possível salvar a foto. Tente novamente.' });
    }
});

export default router;