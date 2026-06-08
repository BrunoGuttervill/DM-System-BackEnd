import express from 'express';
const router = express.Router();
import {insumos} from './insumos.js';
import {pizzas} from './produtos.js';

const producoes = [];

const receitas = [
    {pizzaId: 1 , insumos: [
        {insumosId: 1 , qtd: 0.3},
        {insumosId: 2 , qtd: 0.1},
        {insumosId: 3 , qtd: 0.2},
        {insumosId: 4 , qtd: 0.15},
    ]},
    {pizzaId: 2 , insumos: [
        {insumosId: 1 , qtd: 0.1},
        {insumosId: 2 , qtd: 0.1},
        {insumosId: 3 , qtd: 0.1},
        {insumosId: 5 , qtd: 0.1},
        {insumosId: 6 , qtd: 0.1},
        {insumosId: 7 , qtd: 0.1},
    ]}
];



//Simula a produção de pizzas, abatendo a quantidade necessária de insumos do estoque com base na receita.
router.post('/', (req, res) => {
    const pizzaId = req.body.pizzaId;
    const quantidade = req.body.quantidade;

    if(!pizzaId){
        return res.status(400).json({error: 'O campo pizzaId é obrigatório.'});
    }
    if (!quantidade){
        return res.status(400).json({error: 'O campo quantidade é obrigatório.'});
    }

    // Busca a ficha técnica (receita) da pizza informada
    const ficha = receitas.find(r => r.pizzaId === pizzaId);

    if(!ficha){
        return res.status(404).json({error: 'Receita não encontrada para a pizzaId fornecida.'});
    }

    const consumidos = [];

    // Passa por cada ingrediente da receita e diminui do estoque global (insumos)
    ficha.insumos.forEach(item => {
        const insumo = insumos.find(i => i.id === item.insumosId);
        if (insumo) { // Verificação de segurança caso o insumoId não exista na lista de insumos
            const usados = item.qtd * quantidade;
            insumo.qtdAtual -= usados;
            consumidos.push(`${usados}${insumo.unidade} de ${insumo.nome}`);
        }
    });

    const consumidosTexto = consumidos.join(', ');


    const produto = pizzas.find(p => p.id === pizzaId);

    const novaOrdem = {
        id: producoes.length + 1,
        pizzaId: pizzaId,
        qtd : quantidade,
        produto : produto.nome,
        responsavel: req.body.responsavel,
        insumos : consumidosTexto,
        data: new Date().toISOString()
    };
    producoes.push(novaOrdem);
    
    res.status(201).json(novaOrdem)
});


router.get('/', (req, res) => {

    res.json(producoes);
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const producao = producoes.find(p => p.id === id);

    if(!producao){
        return res.status(404).json({error: 'Produção não encontrada.'});
    }   
    res.json(producao);
});

export default router;