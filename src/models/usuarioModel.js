const db = require('../db');

// Helper para transformar callbacks do SQLite em Promises
const dbGet = (query, params) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
};

const dbRun = (query, params) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            resolve(this); // 'this' contém lastID e changes
        });
    });
};

const findByEmail = (email) => {
    return dbGet('SELECT * FROM usuarios WHERE email = ?', [email]);
};

const findById = (id) => {
    return dbGet('SELECT id, nome_completo, email, ra, curso, periodo, faculdade FROM usuarios WHERE id = ?', [id]);
};

const create = async (usuario) => {
    const { nomeCompleto, email, senha_hash, ra, curso, periodo, faculdade } = usuario;
    const result = await dbRun(
        'INSERT INTO usuarios (nome_completo, email, senha_hash, ra, curso, periodo, faculdade) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nomeCompleto, email, senha_hash, ra, curso, periodo, faculdade]
    );
    return findById(result.lastID);
};

module.exports = {
    findByEmail,
    findById,
    create,
};
