const db = require('../db');

const create = (notificacaoData) => {
    const { usuarioId, mensagem } = notificacaoData;
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO notificacoes (usuario_id, mensagem) VALUES (?, ?)';
        db.run(sql, [usuarioId, mensagem], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, ...notificacaoData });
            }
        });
    });
};

module.exports = {
    create,
};