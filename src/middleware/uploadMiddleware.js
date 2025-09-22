const multer = require('multer');

// Configuração do armazenamento em memória
const storage = multer.memoryStorage();

// Filtro de arquivos para aceitar apenas certos tipos (opcional, mas recomendado)
const fileFilter = (req, file, cb) => {
    // Exemplo: aceitar apenas imagens
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não suportado!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite de 5MB
    },
    // fileFilter: fileFilter // Descomente para ativar o filtro
});

module.exports = upload;