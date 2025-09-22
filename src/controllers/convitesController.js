const conviteModel = require('../models/conviteModel');
const grupoModel = require('../models/grupoModel');
const GrupoParticipante = require('../models/grupoParticipanteModel');

async function criarConvite(req, res) {
    const { groupId } = req.params;
    const criadorId = req.usuario.id;
    const { usuarioIdConvidado, expiraEmHoras } = req.body;

    try {
        const grupo = await grupoModel.findById(groupId);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo não encontrado.' });
        }

        const numeroMembros = await grupoModel.getNumeroMembros(groupId);
        if (numeroMembros >= grupo.limite_participantes) {
            return res.status(409).json({ error: 'O grupo já atingiu o limite de participantes.' });
        }

        if (usuarioIdConvidado) {
            const novoConvite = await conviteModel.createConviteDireto(criadorId, usuarioIdConvidado, groupId);
            return res.status(201).json({ 
                mensagem: 'Convite enviado com sucesso.',
                convite: novoConvite
            });
        } else {
            const dataExpiracao = expiraEmHoras ? new Date(Date.now() + expiraEmHoras * 3600000) : null;
            const novoConvite = await conviteModel.createConviteLink(criadorId, groupId, dataExpiracao);
            const baseUrl = process.env.API_BASE_URL || `http://${req.headers.host}`;
            const linkConvite = `${baseUrl}/api/convites/aceitar/${novoConvite.token}`;
            return res.status(201).json({ linkConvite });
        }
    } catch (error) {
        console.error('Erro ao criar convite:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao processar o convite.' });
    }
}

async function listarConvitesPendentes(req, res) {
    const usuarioId = req.usuario.id;
    try {
        const convites = await conviteModel.findConvitesRecebidos(usuarioId, 'PENDENTE');
        res.status(200).json(convites);
    } catch (error) {
        console.error('Erro ao listar convites pendentes:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

async function responderConvite(req, res) {
    const { id } = req.params;
    const { acao } = req.body; // 'aceitar' ou 'recusar'
    const usuarioId = req.usuario.id;

    try {
        const convite = await conviteModel.findById(id);
        if (!convite || convite.convidado_id !== usuarioId) {
            return res.status(404).json({ error: 'Convite não encontrado ou não pertence a este usuário.' });
        }

        if (acao === 'aceitar') {
            await conviteModel.aceitarConvite(id, usuarioId);
            await GrupoParticipante.addParticipant(convite.grupo_id, usuarioId, 0, 'membro');
            res.status(200).json({ message: 'Convite aceito com sucesso.' });
        } else if (acao === 'recusar') {
            await conviteModel.recusarConvite(id, usuarioId);
            res.status(200).json({ message: 'Convite recusado com sucesso.' });
        } else {
            res.status(400).json({ error: 'Ação inválida.' });
        }
    } catch (error) {
        console.error('Erro ao responder convite:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

module.exports = {
    criarConvite,
    listarConvitesPendentes,
    responderConvite,
};
