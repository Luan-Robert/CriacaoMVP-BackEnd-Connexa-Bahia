const express = require('express');
const router = express.Router();
const convitesController = require('../controllers/convitesController');
const { protegerRota, isGroupMember } = require('../middleware/authMiddleware');

// Rota para criar um convite para um grupo
// POST /api/grupos/:groupId/convites
router.post(
    '/grupos/:groupId/convites',
    protegerRota,      // 1. Protege a rota, garantindo que o usuário está logado
    isGroupMember,       // 2. Garante que o usuário logado é membro do grupo
    convitesController.criarConvite // 3. Executa o controlador para criar o convite
);

module.exports = router;
