const Grupo = require('../models/grupoModel');
const Notificacao = require('../models/notificacaoModel');
const Materia = require('../models/materiaModel');

const criarGrupo = async (req, res) => {
    const { nome, descricao, materiaId } = req.body;
    const criadorId = req.usuario.id; // Obtido do token JWT

    // Validação de Dados
    if (!nome || !descricao || !materiaId) {
        return res.status(400).json({ message: 'Nome, descrição e ID da matéria são obrigatórios.' });
    }

    try {
        // Verificar se a materiaId existe
        const materiaExistente = await Materia.findById(materiaId);
        if (!materiaExistente) {
            return res.status(400).json({ message: 'MateriaId inválida. A matéria não existe.' });
        }

        // Lógica de Criação do Grupo
        const novoGrupo = await Grupo.create({
            nome,
            descricao,
            materiaId,
            criadorId,
        });

        // Criação de Notificação
        const novaNotificacao = await Notificacao.create({
            usuarioId: criadorId,
            tipo: 'grupo_criado',
            mensagem: `Você criou o grupo "${nome}" com sucesso!`,
            referenciaId: novoGrupo.id,
        });

        // Resposta de Sucesso
        res.status(201).json({ 
            message: 'Grupo criado com sucesso!', 
            grupo: novoGrupo, 
            notificacao: novaNotificacao 
        });

    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar grupo.' });
    }
};

module.exports = {
    criarGrupo,
};
