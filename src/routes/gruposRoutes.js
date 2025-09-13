const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/gruposController');
const { protegerRota } = require('../middleware/authMiddleware');

// Rota para criar um novo grupo (protegida)
router.post('/', protegerRota, gruposController.criarGrupo);

module.exports = router;
