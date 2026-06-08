import express from 'express';
const router = express.Router();

const fornecedores = [
    {id: 1, nome: 'Moinho São João', cnpj: '12.345.678/0001-90', telefone: '(11) 1234-5678', email: 'contato@moinhosaojoao.com', insumos: 'farinha'},
    {id: 2, nome: 'Molhos e Cia', cnpj: '98.765.432/0001-10', telefone: '(11) 8765-4321', email: 'contato@molhosecia.com', insumos: 'molho de tomate'},
    {id: 3, nome: 'Laticínios do Campo', cnpj: '11.222.333/0001-44', telefone: '(11) 1122-3344', email: 'contato@laticiniosdocampo.com', insumos: 'queijo'}
];


//Retorna a lista completa de todos os fornecedores cadastrados no sistema.
router.get('/', (req, res) => {
    res.json(fornecedores);
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const fornecedor = fornecedores.find(f => f.id === id);

    if(!fornecedor){
        return res.status(404).json({error: 'Fornecedor não encontrado.'});
    }

    res.json(fornecedor);
});


//cadastro de um novo fornecedor no sistema.
router.post('/', (req, res) => {

    const camposObrigatorios = ['nome', 'cnpj', 'telefone', 'email','insumos'];
    const faltando = camposObrigatorios.find(campo => !req.body[campo]);

    if(faltando){
        return res.status(400).json({error: `O campo ${faltando} é obrigatório.`});
    }

    const id = fornecedores.length + 1;
    const novoFornecedor ={
        id: id,
        nome: req.body.nome,
        cnpj: req.body.cnpj,
        telefone: req.body.telefone,
        email: req.body.email,
        insumos: req.body.insumos
    };
    fornecedores.push(novoFornecedor);
    res.status(201).json(novoFornecedor);
});

router.put('/:id', (req, res) => {

    const fornecedorId = parseInt(req.params.id);
    const fornecedor = fornecedores.find(f => f.id === fornecedorId);

    if(!fornecedor){
        return res.status(404).json({error: 'Fornecedor não encontrado.'});
    }

    fornecedor.nome = req.body.nome || fornecedor.nome;
    fornecedor.cnpj = req.body.cnpj || fornecedor.cnpj;
    fornecedor.telefone = req.body.telefone || fornecedor.telefone;
    fornecedor.email = req.body.email || fornecedor.email;
    fornecedor.insumos = req.body.insumos || fornecedor.insumos;
    res.json(fornecedor);
});

router.delete('/:id', (req, res) => {
    const fornecedorId = parseInt(req.params.id);
    const index = fornecedores.findIndex(f => f.id === fornecedorId);
    
    if(index === -1){
        return res.status(404).json({error: 'Fornecedor não encontrado.'});
    }

    fornecedores.splice(index, 1);
    res.status(204).send();
});

export default router;