const express = require('express');
const router = express.Router({ mergeParams: true });
const { upload, salvarAnexo } = require('../controllers/anexosController');
const { protegerRota, isGroupMember } = require('../middleware/authMiddleware');

// A rota agora usa o middleware de upload do multer antes do controlador final
router.post('/', protegerRota, upload, salvarAnexo);

module.exports = router;