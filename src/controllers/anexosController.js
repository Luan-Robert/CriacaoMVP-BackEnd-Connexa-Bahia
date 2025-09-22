const multer = require('multer');
const path = require('path');

// Configuração de armazenamento em disco
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // TODO: Criar o diretório se não existir
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filtro de tipo de arquivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Tipo de arquivo não suportado. Use JPEG, PNG ou PDF.'), false);
};

// Middleware de upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
}).single('anexo');

// Controlador para lidar com o pós-upload
const salvarAnexo = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    // Constrói a URL do arquivo salvo
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // TODO: Salvar a URL e informações do anexo no banco de dados, associado à mensagem/grupo

    res.status(200).json({ url: url, tipo: req.file.mimetype });
};

module.exports = {
    upload, // Exporta o middleware
    salvarAnexo, // Exporta o controlador
};