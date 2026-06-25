import express from 'express';
const router = express.Router();

export const pizzas = [
    { id: 1, nome: 'Calabresa', tipo: 'Salgada', sabores: ['Calabresa'], qtd: 6, precoVarejo: 30.00, precoAtacado: 24.00, status: 'ok', },
    { id: 2, nome: 'Frango com Catupiry', tipo: 'Salgada', sabores: ['Frango', 'Catupiry'], qtd: 10, precoVarejo: 35.00, precoAtacado: 28.00, status: 'ok' },
    { id: 3, nome: 'Portuguesa', tipo: 'Salgada', sabores: ['Portuguesa'], qtd: 1, precoVarejo: 32.00, precoAtacado: 25.60, status: 'critico' },
    { id: 4, nome: 'Marguerita', tipo: 'Salgada', sabores: ['Marguerita'], qtd: 5, precoVarejo: 28.00, precoAtacado: 22.40, status: 'baixo' },
    { id: 5, nome: 'Quatro Queijos', tipo: 'Salgada', sabores: ['Queijo Prato', 'Queijo Gorgonzola', 'Queijo Parmesão', 'Queijo Mozzarella'], qtd: 4, precoVarejo: 38.00, precoAtacado: 30.40, status: 'baixo' },
    { id: 6, nome: 'Pepperoni', tipo: 'Salgada', sabores: ['Pepperoni'], qtd: 7, precoVarejo: 34.00, precoAtacado: 27.20, status: 'ok' },
    { id: 7, nome: 'Vegetariana', tipo: 'Salgada', sabores: ['Tomate', 'Cebola', 'Pimentão', 'Azeitona'], qtd: 3, precoVarejo: 29.00, precoAtacado: 23.20, status: 'baixo' },
    { id: 8, nome: 'Atum', tipo: 'Salgada', sabores: ['Atum'], qtd: 2, precoVarejo: 33.00, precoAtacado: 26.40, status: 'critico' },
    { id: 9, nome: 'Napolitana', tipo: 'Salgada', sabores: ['Napolitana'], qtd: 8, precoVarejo: 31.00, precoAtacado: 24.80, status: 'ok' },
    { id: 10, nome: 'Presunto e Queijo', tipo: 'Salgada', sabores: ['Presunto', 'Queijo'], qtd: 9, precoVarejo: 27.00, precoAtacado: 21.60, status: 'ok' },
];

// Retorna a lista completa de todas as pizzas cadastradas no sistema. 
router.get('/', (req, res) => {
    res.json(pizzas);
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const pizza = pizzas.find(p => p.id === id);

    if (!pizza) {
        return res.status(404).json({ error: 'Pizza não encontrada.' });
    }
    res.json(pizza);
});


//Cadastra uma nova pizza no sistema.
router.post('/', (req, res) => {
    const camposObrigatorios = ['nome', 'tipo', 'sabores', 'qtd', 'precoVarejo', 'precoAtacado', 'status'];
    const faltando = camposObrigatorios.find(campo => !req.body[campo]);

    if (faltando) {
        return res.status(400).json({ error: `O campo ${faltando} é obrigatório.` });
    }

    const id = pizzas.length + 1;
    const novaPizza = {
        id: id,
        nome: req.body.nome,
        tipo: req.body.tipo,
        sabores: req.body.sabores,
        qtd: req.body.qtd,
        precoVarejo: req.body.precoVarejo,
        precoAtacado: req.body.precoAtacado,
        status: req.body.status
    };

    pizzas.push(novaPizza);
    res.status(201).json(novaPizza);
});

router.put('/:id', (req, res) => {

    const pizzaId = parseInt(req.params.id);
    const pizza = pizzas.find(p => p.id === pizzaId);

    if (!pizza) {
        return res.status(404).json({ error: 'Pizza não encontrada.' });
    }

    pizza.nome = req.body.nome || pizza.nome;
    pizza.tipo = req.body.tipo || pizza.tipo;
    pizza.sabores = req.body.sabores || pizza.sabores;
    pizza.qtd = req.body.qtd || pizza.qtd;
    pizza.precoVarejo = req.body.precoVarejo || pizza.precoVarejo;
    pizza.precoAtacado = req.body.precoAtacado || pizza.precoAtacado;
    pizza.status = req.body.status || pizza.status;
    res.json(pizza);
});

router.delete('/:id', (req, res) => {
    const pizzaId = parseInt(req.params.id);
    const index = pizzas.findIndex(p => p.id === pizzaId);

    if (index === -1) {
        return res.status(404).json({ error: 'Pizza não encontrada.' });
    }

    pizzas.splice(index, 1);
    res.status(204).send();
});


export default router;