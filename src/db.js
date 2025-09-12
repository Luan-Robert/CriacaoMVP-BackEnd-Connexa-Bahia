const sqlite3 = require('sqlite3').verbose();

// O arquivo do banco de dados será criado na raiz do projeto
const DB_PATH = 'connexa.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Cria a tabela de usuários se ela não existir
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_completo TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL,
            ra TEXT NOT NULL,
            curso TEXT,
            periodo TEXT,
            faculdade TEXT,
            criado_em TEXT DEFAULT (datetime('now','localtime'))
        )`);
    }
});

module.exports = db;