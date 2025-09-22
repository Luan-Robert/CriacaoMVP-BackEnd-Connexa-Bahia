require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Cria o diretório de uploads se ele não existir
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Diretório de uploads criado em: ${uploadsDir}`);
}

// Importação das rotas
const usuariosRoutes = require('./routes/usuariosRoutes');
const materiasRoutes = require('./routes/materiasRoutes');
const gruposRoutes = require('./routes/gruposRoutes');
const convitesRoutes = require('./routes/convitesRoutes');
const anexosRoutes = require('./routes/anexosRoutes');

const http = require('http');
const initWebSocket = require('./websocket');

const app = express();
const server = http.createServer(app);
const io = initWebSocket(server);
app.set('io', io);

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Registro das rotas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api', convitesRoutes);
app.use('/api/grupos/:groupId/anexos', anexosRoutes);

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Iniciar o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});