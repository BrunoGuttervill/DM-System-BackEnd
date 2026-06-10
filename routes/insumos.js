import express from 'express';
const router = express.Router();

export const insumos = [
    { id: 1, nome: 'farinha', qtdAtual: 100, unidade: 'kg', categoria: 'teste', qtdMinima: 20, validade: '2024-12-31', status: 'ok' },
    { id: 2, nome: 'molho de tomate', qtdAtual: 50, unidade: 'l', categoria: 'teste', qtdMinima: 10, validade: '2024-12-31', status: 'ok' },
    { id: 3, nome: 'queijo', qtdAtual: 80, unidade: 'kg', categoria: 'teste', qtdMinima: 15, validade: '2024-12-31', status: 'ok' },
    { id: 4, nome: 'calabresa', qtdAtual: 60, unidade: 'kg', categoria: 'teste', qtdMinima: 10, validade: '2024-12-31', status: 'ok' },
    { id: 5, nome: 'frango', qtdAtual: 40, unidade: 'kg', categoria: 'teste', qtdMinima: 5, validade: '2024-12-31', status: 'ok' },
    { id: 6, nome: 'catupiry', qtdAtual: 30, unidade: 'kg', categoria: 'teste', qtdMinima: 5, validade: '2024-12-31', status: 'ok' },
    { id: 7, nome: 'milho', qtdAtual: 20, unidade: 'kg', categoria: 'teste', qtdMinima: 5, validade: '2024-12-31', status: 'ok' },
];

// Retorna a lista completa de todos os insumos (ingredientes) do estoque.
router.get('/', (req, res) => {
    res.json(insumos);
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const insumo = insumos.find(i => i.id === id);

    if (!insumo) {
        return res.status(404).json({ error: 'Insumo não encontrado.' });
    }

    res.json(insumo);
});


//Cadastra um novo insumo (ingrediente) no estoque.
router.post('/', (req, res) => {
    const camposObrigatorios = ['nome', 'qtdAtual', 'unidade', 'categoria', 'qtdMinima', 'validade', 'status'];
    const faltando = camposObrigatorios.find(campo => !req.body[campo]);

    if (faltando) {
        return res.status(400).json({ error: `O campo ${faltando} é obrigatório.` });
    }

    const id = insumos.length + 1;
    const novoInsumos = {
        id: id,
        nome: req.body.nome,
        qtdAtual: req.body.qtdAtual,
        unidade: req.body.unidade,
        categoria: req.body.categoria,
        qtdMinima: req.body.qtdMinima,
        validade: req.body.validade,
        status: req.body.status
    };

    insumos.push(novoInsumos);
    res.status(201).json(novoInsumos);
});


router.put('/:id', (req, res) => {
    const insumoId = parseInt(req.params.id);
    const insumo = insumos.find(i => i.id === insumoId);

    if (!insumo) {
        return res.status(404).json({ error: 'Insumo não encontrado.' });
    }

    insumo.nome = req.body.nome || insumo.nome;
    insumo.qtdAtual = req.body.qtdAtual || insumo.qtdAtual;
    insumo.unidade = req.body.unidade || insumo.unidade;
    insumo.categoria = req.body.categoria || insumo.categoria;
    insumo.qtdMinima = req.body.qtdMinima || insumo.qtdMinima;
    insumo.validade = req.body.validade || insumo.validade;
    insumo.status = req.body.status || insumo.status;
    res.json(insumo);
});

router.delete('/:id', (req, res) => {
    const insumoId = parseInt(req.params.id);
    const index = insumos.findIndex(i => i.id === insumoId);

    if (index === -1) {
        return res.status(404).json({ error: 'Insumo não encontrado.' });
    }

    insumos.splice(index, 1);
    res.status(204).send();
});

export default router;
