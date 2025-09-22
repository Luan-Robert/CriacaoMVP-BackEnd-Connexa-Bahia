const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { protegerRota } = require('../middleware/authMiddleware');

// Rotas públicas
router.post('/cadastro', usuariosController.cadastrarUsuario);
router.post('/login', usuariosController.loginUsuario);

// Rota privada - Exemplo de uso do middleware
router.get('/perfil', protegerRota, usuariosController.getPerfil);

// Rota para buscar usuário por email
router.get('/email/:email', protegerRota, usuariosController.findUserByEmail);

// Rota para buscar os grupos do usuário
router.get('/meus-grupos', protegerRota, usuariosController.getGruposDoUsuario);

module.exports = router;
