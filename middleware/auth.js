import jwt from 'jsonwebtoken';

export function verificarToken (req , res, next){

    const authHeader = req .headers.authorization;
    if (!authHeader){
        return res.status(401).json({error: 'token nao fornecido '})
    }

    const token = authHerder.split (' ')[1];

try{
    const payload = jwt.verify(token, 'chave_secreta_temporaria')
    req.usuario = payload
    next();
} catch(err){
    return res.status(401).json({error: 'token invalido ou expirado>'})
}
}

