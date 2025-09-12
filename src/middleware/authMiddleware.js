const jwt = require('jsonwebtoken');

const protegerRota = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || 'secreto_padrao';
        const decoded = jwt.verify(token, secret);

        // Anexa os dados do usuário decodificados ao objeto da requisição
        req.usuario = decoded;

        next(); // Passa para o próximo middleware ou rota
    } catch (error) {
        res.status(401).json({ message: 'Token inválido.' });
    }
};

module.exports = { protegerRota };
