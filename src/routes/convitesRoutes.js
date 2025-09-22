const express = require('express');
const router = express.Router();
const { criarConvite, listarConvitesPendentes, responderConvite } = require('../controllers/convitesController');
const { protegerRota, isGroupMember } = require('../middleware/authMiddleware');

// Rota para criar um convite para um grupo
// POST /api/grupos/:groupId/convites
router.post(
    '/grupos/:groupId/convites',
    protegerRota,
    isGroupMember,
    criarConvite
);

// Rota para o usuário logado ver seus convites pendentes
// GET /api/convites/pendentes
router.get('/convites/pendentes', protegerRota, listarConvitesPendentes);

// Rota para aceitar ou recusar um convite
// POST /api/convites/:id/responder
router.post('/convites/:id/responder', protegerRota, responderConvite);

module.exports = router;
