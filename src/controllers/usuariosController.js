
const db = require('../db');
const bcrypt = require('bcrypt');
const { enviarEmailConfirmacao } = require('../email');

// Helper para transformar callbacks do SQLite em Promises
const dbGet = (query, params) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
};

const dbRun = (query, params) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) { // Usar 'function' para ter acesso ao 'this'
            if (err) reject(err);
            resolve(this); // 'this' contém lastID e changes
        });
    });
};

const cadastrarUsuario = async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        return res.status(403).json({ message: 'Você já está logado.' });
    }

    const { nomeCompleto, email, senha, ra, curso, periodo, faculdade } = req.body;

    if (!nomeCompleto || !email || !senha || !ra || !curso || !periodo || !faculdade) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // 1. Verificar se o e-mail já está cadastrado
        const usuarioExistente = await dbGet('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarioExistente) {
            return res.status(409).json({ message: 'E-mail já cadastrado.' });
        }

        // 2. Validar a senha
        const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!senhaRegex.test(senha)) {
            return res.status(400).json({ message: 'A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial.' });
        }

        // 3. Gerar hash da senha
        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(senha, salt);

        // 4. Inserir o novo usuário
        const result = await dbRun(
            'INSERT INTO usuarios (nome_completo, email, senha_hash, ra, curso, periodo, faculdade) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nomeCompleto, email, senha_hash, ra, curso, periodo, faculdade]
        );

        // Buscar o usuário recém-criado para retornar na resposta
        const novoUsuario = await dbGet('SELECT id, nome_completo, email, ra, curso, periodo, faculdade FROM usuarios WHERE id = ?', [result.lastID]);

        // 5. Enviar e-mail de confirmação
        await enviarEmailConfirmacao(novoUsuario.email, novoUsuario.nome_completo);

        // 6. Retornar sucesso
        res.status(201).json({ message: 'Usuário cadastrado com sucesso! Um e-mail de confirmação foi enviado.', usuario: novoUsuario });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const jwt = require('jsonwebtoken');

const loginUsuario = async (req, res) => {
    // 1. Validação Inicial
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // 2. Busca do Usuário
        const usuario = await dbGet('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // 3. Verificação da Senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 4. Geração do Token JWT
        const payload = {
            id: usuario.id,
            nome: usuario.nome_completo,
        };

        const secret = process.env.JWT_SECRET || 'secreto_padrao';

        const token = jwt.sign(payload, secret, { expiresIn: '1h' });

        // 5. Resposta com o Token
        res.status(200).json({ token: token });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const getPerfil = async (req, res) => {
    // O middleware 'protegerRota' já validou o token e anexou os dados do usuário ao req.usuario
    // Apenas buscamos os dados mais recentes do banco de dados para garantir que estejam atualizados
    try {
        const usuario = await dbGet('SELECT id, nome_completo, email, ra, curso, periodo, faculdade FROM usuarios WHERE id = ?', [req.usuario.id]);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    getPerfil,
};
