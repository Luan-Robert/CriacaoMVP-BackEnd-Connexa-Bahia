const Grupo = require('../models/grupoModel');
const Notificacao = require('../models/notificacaoModel');
const Materia = require('../models/materiaModel');
const GrupoParticipante = require('../models/grupoParticipanteModel');

const criarGrupo = async (req, res) => {
    const { nome, materiaId, objetivo, local, limiteParticipantes, isPublico } = req.body;
    const criadorId = req.usuario.id; // Obtido do payload do JWT

    try {
        // 1. Validação da matéria
        const materia = await Materia.findById(materiaId);
        if (!materia) {
            return res.status(400).json({ error: 'Matéria não encontrada.' });
        }

        // 2. Criação do grupo
        const novoGrupo = await Grupo.create({
            nome,
            materiaId,
            objetivo,
            local,
            limiteParticipantes,
            isPublico,
            criadorId,
        });

        // Adiciona o criador como administrador do grupo
        await GrupoParticipante.addParticipant(novoGrupo.id, criadorId, 1, 'membro'); // 1 para admin, status de membro

        // 3. Criação da notificação
        await Notificacao.create({
            usuarioId: criadorId,
            mensagem: `Você criou o grupo: ${nome}`,
            tipo: 'novo_grupo',
            titulo: 'Novo Grupo Criado'
        });

        // 4. Resposta de sucesso
        res.status(201).json(novoGrupo);

    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar o grupo.' });
    }
};

const solicitarEntrada = async (req, res) => {
    const { groupId } = req.params;
    const usuarioId = req.usuario.id;

    try {
        const grupo = await Grupo.findById(groupId);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo não encontrado.' });
        }

        const numeroMembros = await Grupo.getNumeroMembros(groupId);
        if (numeroMembros >= grupo.limite_participantes) {
            return res.status(409).json({ error: 'O grupo já atingiu o limite de participantes.' });
        }

        if (grupo.is_publico) {
            await GrupoParticipante.addParticipant(groupId, usuarioId, 0, 'membro');
            res.status(200).json({ message: 'Você entrou no grupo com sucesso.', status: 'membro' });
        } else {
            await GrupoParticipante.addParticipant(groupId, usuarioId, 0, 'pendente');
            res.status(200).json({ message: 'Solicitação para entrar no grupo enviada com sucesso.', status: 'pendente' });
        }
    } catch (error) {
        console.error('Erro ao solicitar entrada no grupo:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao solicitar entrada no grupo.' });
    }
};

const listarGrupos = async (req, res) => {
    const { materia, local, objetivo } = req.query;

    try {
        const filtros = { materia, local, objetivo };
        const grupos = await Grupo.findAll(filtros);
        res.status(200).json(grupos);
    } catch (error) {
        console.error('Erro ao listar grupos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao listar grupos.' });
    }
};

const aprovarSolicitacao = async (req, res) => {
    const { grupoId, usuarioId } = req.params;
    try {
        const resultado = await Grupo.gerenciarMembro(grupoId, usuarioId, 'pendente', 'membro');
        if (!resultado) {
            return res.status(404).json({ message: 'Solicitação não encontrada ou já processada.' });
        }
        // notificarAprovacao(usuarioId, grupoId);
        res.status(200).json({ message: 'Usuário aprovado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao aprovar solicitação.' });
    }
};

const rejeitarSolicitacao = async (req, res) => {
    const { grupoId, usuarioId } = req.params;
    try {
        const resultado = await Grupo.gerenciarMembro(grupoId, usuarioId, 'pendente');
        if (!resultado) {
            return res.status(404).json({ message: 'Solicitação não encontrada ou já processada.' });
        }
        // notificarRejeicao(usuarioId, grupoId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao rejeitar solicitação.' });
    }
};

const removerMembro = async (req, res) => {
    const { grupoId, usuarioId } = req.params;
    try {
        const resultado = await Grupo.gerenciarMembro(grupoId, usuarioId, 'membro');
        if (!resultado) {
            return res.status(404).json({ message: 'Membro não encontrado no grupo.' });
        }
        // notificarRemocao(usuarioId, grupoId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover membro.' });
    }
};

const excluirMensagem = async (req, res) => {
    const { grupoId, mensagemId } = req.params;

    try {
        const resultado = await Grupo.softDeleteMensagem(grupoId, mensagemId);

        if (!resultado) {
            return res.status(404).json({ message: 'Mensagem não encontrada ou não pertence ao grupo.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir mensagem:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir a mensagem.' });
    }
};

const buscaAvancada = async (req, res) => {
    const { nome, id, materia, local, ordenarPor, limite } = req.query;

    const validOrderBy = ['popularidade', 'nivel_atividade', 'data_criacao'];
    if (ordenarPor && !validOrderBy.includes(ordenarPor)) {
        return res.status(400).json({ message: "Valor inválido para 'ordenarPor'. Use 'popularidade', 'nivel_atividade' ou 'data_criacao'." });
    }

    const limiteFinal = Math.min(parseInt(limite, 10) || 10, 50);

    try {
        const grupos = await Grupo.buscaAvancada({ nome, id, materia, local, ordenarPor, limite: limiteFinal });
        res.status(200).json({ grupos });
    } catch (error) {
        console.error('Erro na busca avançada:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const getMensagens = async (req, res) => {
    const { grupoId } = req.params;

    try {
        const mensagens = await Grupo.getMensagensPorGrupo(grupoId);
        res.status(200).json(mensagens);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const { dbRun } = require('../db');

const excluirGrupo = async (req, res) => {
    const { id } = req.params; // Corrigido de groupId para id

    try {
        // O ON DELETE CASCADE cuidará das tabelas dependentes.
        // Apenas precisamos deletar o grupo principal.
        const result = await Grupo.removeById(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Grupo não encontrado.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir grupo:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao excluir o grupo.' });
    }
};

const getGrupoById = async (req, res) => {
    const { id } = req.params;

    try {
        const grupo = await Grupo.findById(id);
        if (!grupo) {
            return res.status(404).json({ message: 'Grupo não encontrado.' });
        }
        res.status(200).json(grupo);
    } catch (error) {
        console.error('Erro ao buscar grupo por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const atualizarConfiguracoes = async (req, res) => {
    const { id } = req.params;
    const { nome, objetivo, local } = req.body;

    try {
        await Grupo.update(id, { nome, objetivo, local });
        res.status(200).json({ message: 'Configurações do grupo atualizadas com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar configurações do grupo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const getSolicitacoes = async (req, res) => {
    const { grupoId } = req.params;

    try {
        const solicitacoes = await Grupo.getPendingRequests(grupoId);
        res.status(200).json(solicitacoes);
    } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const getMembros = async (req, res) => {
    const { grupoId } = req.params;

    try {
        const membros = await Grupo.getMembers(grupoId);
        res.status(200).json(membros);
    } catch (error) {
        console.error('Erro ao buscar membros:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const criarMensagem = async (req, res) => {
    const { grupoId } = req.params;
    const { texto, anexo_url, tipo } = req.body;
    const usuarioId = req.usuario.id;

    // Garante que haja conteúdo, seja texto ou anexo
    if (!texto && !anexo_url) {
        return res.status(400).json({ message: 'A mensagem precisa ter um conteúdo.' });
    }

    try {
        // Se for um anexo sem texto, usamos um placeholder para o conteúdo
        const conteudo = texto || 'Anexo';
        const tipoMensagem = tipo || 'texto';

        const novaMensagem = await Grupo.createMensagem(grupoId, usuarioId, conteudo, tipoMensagem, anexo_url);
        
        // Emitir a nova mensagem para o grupo via WebSocket
        req.app.get('io').to(grupoId).emit('nova_mensagem', novaMensagem);
        
        res.status(201).json(novaMensagem);
    } catch (error) {
        console.error('Erro ao criar mensagem:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

module.exports = {
    criarGrupo,
    solicitarEntrada,
    listarGrupos,
    aprovarSolicitacao,
    rejeitarSolicitacao,
    removerMembro,
    excluirMensagem,
    buscaAvancada,
    getMensagens,
    excluirGrupo,
    getGrupoById,
    atualizarConfiguracoes,
    getSolicitacoes,
    getMembros,
    criarMensagem,
};