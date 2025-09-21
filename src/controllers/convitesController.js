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
    const convidadoPorId = req.user.id; // ID do usuário autenticado
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
            const conviteData = {
                grupo_id: groupId,
                convidado_por_id: convidadoPorId,
                convidado_id: usuarioIdConvidado,
                status: 'pendente'
            };
            
            const novoConvite = await conviteModel.create(conviteData);
            // Aqui você poderia adicionar uma lógica para notificar o usuário convidado.

            return res.status(201).json({ 
                mensagem: 'Convite enviado com sucesso.',
                convite: novoConvite
            });
        } 
        // b) Convite por link
        else {
            const token = crypto.randomBytes(20).toString('hex');
            let dataExpiracao = null;

            if (expiraEmHoras) {
                dataExpiracao = new Date();
                dataExpiracao.setHours(dataExpiracao.getHours() + parseInt(expiraEmHoras, 10));
            }

            const conviteData = {
                grupo_id: groupId,
                convidado_por_id: convidadoPorId,
                token: token,
                data_expiracao: dataExpiracao,
                status: 'pendente'
            };

            await conviteModel.create(conviteData);
            
            // A base da URL deve ser configurada via variáveis de ambiente
            const baseUrl = process.env.API_BASE_URL || `http://${req.headers.host}`;
            const linkConvite = `${baseUrl}/api/convites/aceitar/${token}`;

            return res.status(201).json({ linkConvite });
        }

    } catch (error) {
        console.error('Erro ao criar convite:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao processar o convite.' });
    }
}

module.exports = {
    criarConvite,
};
