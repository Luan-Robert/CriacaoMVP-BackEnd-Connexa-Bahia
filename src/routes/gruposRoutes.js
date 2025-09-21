const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/gruposController');
const { protegerRota, isGroupAdmin, isGroupMember } = require('../middleware/authMiddleware');

router.get('/busca', protegerRota, gruposController.buscaAvancada);

// Rota para criar um novo grupo (protegida)
router.post('/', protegerRota, gruposController.criarGrupo);
router.get('/', protegerRota, gruposController.listarGrupos);

router.get('/:id', protegerRota, gruposController.getGrupoById);

// Exemplo de rota protegida pelo middleware isGroupAdmin
router.put('/:id/configuracoes', protegerRota, isGroupAdmin, gruposController.atualizarConfiguracoes);

router.get('/:grupoId/solicitacoes', protegerRota, isGroupAdmin, gruposController.getSolicitacoes);

router.get('/:grupoId/membros', protegerRota, isGroupAdmin, gruposController.getMembros);

// Rotas para gerenciamento de membros
router.put('/:grupoId/solicitacoes/:usuarioId/aprovar', protegerRota, isGroupAdmin, gruposController.aprovarSolicitacao);
router.put('/:grupoId/solicitacoes/:usuarioId/rejeitar', protegerRota, isGroupAdmin, gruposController.rejeitarSolicitacao);
router.delete('/:grupoId/membros/:usuarioId', protegerRota, isGroupAdmin, gruposController.removerMembro);

// Rota para excluir mensagem (soft delete)
router.delete('/:grupoId/mensagens/:mensagemId', protegerRota, isGroupAdmin, gruposController.excluirMensagem);

router.post('/:grupoId/mensagens', protegerRota, isGroupMember, gruposController.criarMensagem);

// Rota para buscar histórico de mensagens
router.get('/:grupoId/mensagens', protegerRota, gruposController.getMensagens);

// Rota para excluir um grupo
router.delete('/:groupId', protegerRota, isGroupAdmin, gruposController.excluirGrupo);

module.exports = router;