const express = require('express');
const router = express.Router();
const materiasController = require('../controllers/materiasController');
const { protegerRota } = require('../middleware/authMiddleware');

// A rota GET / é protegida pelo middleware de autenticação
router.get('/', protegerRota, materiasController.listarMaterias);

module.exports = router;
