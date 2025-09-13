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

const create = async (grupoData) => {
    const { nome, descricao, materiaId, criadorId } = grupoData;
    const result = await dbRun(
        'INSERT INTO grupos (nome, descricao, materia_id, criador_id) VALUES (?, ?, ?, ?)',
        [nome, descricao, materiaId, criadorId]
    );
    return findById(result.lastID);
};

const findById = (id) => {
    return dbGet('SELECT id, nome, descricao, materia_id, criador_id, criado_em FROM grupos WHERE id = ?', [id]);
};

module.exports = {
    create,
    findById,
};
