const db = require('../db');

// Helper para transformar o db.all em Promise
const dbAll = (query, params) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};


const findAll = () => {
    return dbAll('SELECT id, nome FROM materias ORDER BY nome', []);
};

const findById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id, nome FROM materias WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
};

module.exports = {
    findAll,
    findById,
};
