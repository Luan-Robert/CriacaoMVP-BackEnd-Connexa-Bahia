const db = require('../db');

const findAll = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT id, nome FROM materias ORDER BY nome', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
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