import express from 'express';
const app = express();
app.use(express.json());

 const pizza = [
        {id: 1,  nome: 'Calabresa',           tipo: 'Salgada',  sabores: ['Calabresa'], qtd: 6,  precoVarejo: 30.00, precoAtacado: 24.00, status: 'ok',},
        {id: 2,  nome: 'Frango com Catupiry', tipo: 'Salgada',  sabores: ['Frango', 'Catupiry'], qtd: 10, precoVarejo: 35.00, precoAtacado: 28.00, status: 'ok'},
        {id: 3,  nome: 'Portuguesa',          tipo: 'Salgada',  sabores: ['Portuguesa'], qtd: 1,  precoVarejo: 32.00, precoAtacado: 25.60, status: 'critico'},
        {id: 4,  nome: 'Marguerita',          tipo: 'Salgada',  sabores: ['Marguerita'], qtd: 5,  precoVarejo: 28.00, precoAtacado: 22.40, status: 'baixo'},
        {id: 5,  nome: 'Quatro Queijos',      tipo: 'Salgada',  sabores: ['Queijo Prato', 'Queijo Gorgonzola', 'Queijo Parmesão', 'Queijo Mozzarella'], qtd: 4,  precoVarejo: 38.00, precoAtacado: 30.40, status: 'baixo'},
        {id: 6,  nome: 'Pepperoni',           tipo: 'Salgada',  sabores: ['Pepperoni'], qtd: 7,  precoVarejo: 34.00, precoAtacado: 27.20, status: 'ok'},
        {id: 7,  nome: 'Banana com Canela',   tipo: 'Doce',     sabores: ['Banana', 'Canela'], qtd: 3,  precoVarejo: 25.00, precoAtacado: 20.00, status: 'baixo'},
        {id: 8,  nome: 'Atum',                tipo: 'Salgada',  sabores: ['Atum'], qtd: 2,  precoVarejo: 33.00, precoAtacado: 26.40, status: 'critico'},
        {id: 9,  nome: 'Napolitana',          tipo: 'Salgada',  sabores: ['Napolitana'], qtd: 8,  precoVarejo: 31.00, precoAtacado: 24.80, status: 'ok'},
        {id: 10, nome: 'Presunto e Queijo',   tipo: 'Salgada',  sabores: ['Presunto', 'Queijo'], qtd: 9,  precoVarejo: 27.00, precoAtacado: 21.60, status: 'ok'},

 ]

 const insumos = [
    {id: 1, nome : 'farinha', qtdAtual: 100, unidade: 'kg'},
    {id: 2, nome : 'molho de tomate', qtdAtual: 50, unidade: 'l'},
    {id: 3, nome : 'queijo', qtdAtual: 80, unidade: 'kg'},
    {id: 4, nome : 'calabresa', qtdAtual: 60, unidade: 'kg'},
    {id: 5 , nome: 'frango', qtdAtual: 40, unidade: 'kg'},
    {id: 6 , nome: 'catupiry', qtdAtual: 30, unidade: 'kg'},
    {id: 7 , nome: 'milho', qtdAtual: 20, unidade: 'kg'},
 ]

 const receitas = [
    {pizzaId: 1 , insumos: [
        {insumosId: 1 , qtd: 0.3},
        {insumosId: 2 , qtd: 0.1},
        {insumosId: 3 , qtd: 0.2},
        {insumosId: 4 , qtd: 0.15},
    ]
    },
    {pizzaId: 2 , insumos: [
        {insumosId: 1 , qtd: 0.1},
        {insumosId: 2 , qtd: 0.1},
        {insumosId: 3 , qtd: 0.1},
        {insumosId: 5 , qtd: 0.1},
        {insumosId: 6 , qtd: 0.1},
        {insumosId: 7 , qtd: 0.1},
    ]}

    
 ]

app.get('/api/produtos', (req, res) => {
   
   
    res.json(pizza);
});

app.post('/api/produtos', (req, res) => {
    const id = pizza.length + 1;
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
    pizza.push(novaPizza);
    res.status(201).json(novaPizza);
});

app.post('/api/producao', (req, res) => {

    console.log('recebi no body', req.body);

    const pizzaId = req.body.pizzaId;
    const quantidade = req.body.quantidade;

    const ficha = receitas.find(r => r.pizzaId === pizzaId);

    console.log('ficha encontrada', ficha);

    ficha.insumos.forEach(item => {
        const insumo = insumos.find(i => i.id === item.insumosId);
        const usados = item.qtd * quantidade;
        insumo.qtdAtual -= usados;
    });
       
       res.json(insumos);    
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));