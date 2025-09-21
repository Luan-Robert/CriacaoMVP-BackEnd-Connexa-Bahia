const express = require('express');
const router = express.Router();
const convitesController = require('../controllers/convitesController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware hipotético para verificar se o usuário é membro do grupo.
// Você precisará implementar esta função.
const isGroupMember = (req, res, next) => {
    // Lógica para verificar a associação ao grupo aqui...
    // Ex: const isMember = await grupoModel.isUserMember(req.user.id, req.params.groupId);
    // if (isMember) { next(); } else { res.status(403).send('Acesso negado.'); }
    console.log('Placeholder para middleware isGroupMember');
    next(); // Por enquanto, permite a passagem
};

// Rota para criar um convite para um grupo
// POST /api/grupos/:groupId/convites
router.post(
    '/grupos/:groupId/convites',
    authMiddleware,      // 1. Protege a rota, garantindo que o usuário está logado
    isGroupMember,       // 2. Garante que o usuário logado é membro do grupo
    convitesController.criarConvite // 3. Executa o controlador para criar o convite
);

module.exports = router;
