const sqlite3 = require('sqlite3').verbose();

// O arquivo do banco de dados será criado na pasta src/database
const DB_PATH = 'src/database/connexa.sqlite';

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

        // Cria a tabela de matérias e insere dados de exemplo
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS materias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL UNIQUE
            )`);

            const materias = ['Cálculo I', 'Algoritmos e Estrutura de Dados', 'Física I', 'Química Geral', 'Geometria Analítica'];
            const stmt = db.prepare("INSERT OR IGNORE INTO materias (nome) VALUES (?)");
            materias.forEach(materia => stmt.run(materia));
            stmt.finalize();
        });

        // Cria a tabela de grupos
        db.run(`CREATE TABLE IF NOT EXISTS grupos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            materia_id INTEGER NOT NULL,
            criador_id INTEGER NOT NULL,
            criado_em TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (materia_id) REFERENCES materias(id),
            FOREIGN KEY (criador_id) REFERENCES usuarios(id)
        )`);

        // Cria a tabela de notificações
        db.run(`CREATE TABLE IF NOT EXISTS notificacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            tipo TEXT NOT NULL, -- Ex: 'grupo_criado', 'mensagem_nova'
            mensagem TEXT NOT NULL,
            referencia_id INTEGER, -- ID do grupo, mensagem, etc.
            lida INTEGER DEFAULT 0, -- 0 para não lida, 1 para lida
            criado_em TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )`);
    }
});

module.exports = db;