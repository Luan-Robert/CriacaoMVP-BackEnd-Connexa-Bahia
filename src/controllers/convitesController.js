const conviteModel = require('../models/conviteModel');
const grupoModel = require('../models/grupoModel');
const crypto = require('crypto');

/**
 * Cria um novo convite para um grupo, seja diretamente para um usuário ou via link.
 * @param {import('express').Request} req - O objeto de requisição do Express.
 * @param {import('express').Response} res - O objeto de resposta do Express.
 */
async function criarConvite(req, res) {
    const { groupId } = req.params;
    console.log("CHEGOU ATE AQUI ", groupId);
        const criadorId = req.usuario.id; // ID do usuário autenticado
        console.log("Usuarioid ", criadorId);
        const { usuarioIdConvidado, expiraEmHoras } = req.body;
    
        try {
            // 1. Verificar se o grupo está cheio
            const grupo = await grupoModel.findById(groupId);
            if (!grupo) {
                return res.status(404).json({ error: 'Grupo não encontrado.' });
            }
    
            const numeroMembros = await grupoModel.getNumeroMembros(groupId);
            if (numeroMembros >= grupo.limite_participantes) {
                return res.status(409).json({ error: 'O grupo já atingiu o limite de participantes.' });
            }
    
            // 2. Lógica condicional para criar convite
            // a) Convite direto para um usuário
            if (usuarioIdConvidado) {
                const novoConvite = await conviteModel.createConviteDireto(criadorId, usuarioIdConvidado, groupId);
                // Aqui você poderia adicionar uma lógica para notificar o usuário convidado.
    
                return res.status(201).json({ 
                    mensagem: 'Convite enviado com sucesso.',
                    convite: novoConvite
                });
            } 
            // b) Convite por link
            else {
                const dataExpiracao = expiraEmHoras ? new Date(Date.now() + expiraEmHoras * 3600000) : null;
                const novoConvite = await conviteModel.createConviteLink(criadorId, groupId, dataExpiracao);
                
                // A base da URL deve ser configurada via variáveis de ambiente
                const baseUrl = process.env.API_BASE_URL || `http://${req.headers.host}`;
                const linkConvite = `${baseUrl}/api/convites/aceitar/${novoConvite.token}`;
    
                return res.status(201).json({ linkConvite });
            }    } catch (error) {
        console.error('Erro ao criar convite:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao processar o convite.' });
    }
}

module.exports = {
    criarConvite,
};
