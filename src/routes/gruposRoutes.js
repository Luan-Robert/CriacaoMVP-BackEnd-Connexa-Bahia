const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/gruposController');
const { protegerRota, isGroupAdmin } = require('../middleware/authMiddleware');

// Rotas de Grupos
router.post('/', protegerRota, gruposController.criarGrupo);
router.get('/', gruposController.listarGrupos);
router.get('/busca', gruposController.buscaAvancada);
router.get('/:id', gruposController.getGrupoById);
router.put('/:id/configuracoes', protegerRota, isGroupAdmin, gruposController.atualizarConfiguracoes);
router.delete('/:id', protegerRota, isGroupAdmin, gruposController.excluirGrupo);

// Rotas de Membros e Solicitações
router.post('/:groupId/solicitar-entrada', protegerRota, gruposController.solicitarEntrada);
router.get('/:grupoId/membros', protegerRota, isGroupAdmin, gruposController.getMembros);
router.delete('/:grupoId/membros/:usuarioId', protegerRota, isGroupAdmin, gruposController.removerMembro);
router.get('/:grupoId/solicitacoes', protegerRota, isGroupAdmin, gruposController.getSolicitacoes);
router.put('/:grupoId/solicitacoes/:usuarioId/aprovar', protegerRota, isGroupAdmin, gruposController.aprovarSolicitacao);
router.put('/:grupoId/solicitacoes/:usuarioId/rejeitar', protegerRota, isGroupAdmin, gruposController.rejeitarSolicitacao);

// Rotas de Mensagens
router.post('/:grupoId/mensagens', protegerRota, gruposController.criarMensagem);
router.get('/:grupoId/mensagens', protegerRota, gruposController.getMensagens);
router.delete('/:grupoId/mensagens/:mensagemId', protegerRota, isGroupAdmin, gruposController.excluirMensagem);

module.exports = router;