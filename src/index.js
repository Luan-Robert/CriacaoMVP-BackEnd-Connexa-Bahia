require('dotenv').config();
const express = require('express');

// Importação das rotas
const usuariosRoutes = require('./routes/usuariosRoutes');
const materiasRoutes = require('./routes/materiasRoutes');
const gruposRoutes = require('./routes/gruposRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Registro das rotas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/grupos', gruposRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
