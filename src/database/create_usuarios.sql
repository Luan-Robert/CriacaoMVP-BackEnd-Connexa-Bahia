-- Script de criação da tabela usuarios para SQLite
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    curso TEXT NOT NULL,
    semestre INTEGER NOT NULL,
    senha_hash TEXT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Script de criação da tabela materias
CREATE TABLE IF NOT EXISTS materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
);

-- Popula a tabela materias com exemplos
INSERT OR IGNORE INTO materias (nome) VALUES
    ('Cálculo I'),
    ('Algoritmos e Estrutura de Dados'),
    ('Física I'),
    ('Química Geral'),
    ('Geometria Analítica');

-- Script de criação da tabela grupos
CREATE TABLE IF NOT EXISTS grupos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    objetivo TEXT,
    local TEXT,
    limite_participantes INTEGER,
    is_publico BOOLEAN DEFAULT 1,
    criador_id INTEGER NOT NULL,
    materia_id INTEGER NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criador_id) REFERENCES usuarios(id),
    FOREIGN KEY (materia_id) REFERENCES materias(id)
);