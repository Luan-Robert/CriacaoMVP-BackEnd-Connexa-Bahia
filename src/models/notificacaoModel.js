const db = require('../db');

// Helper para transformar callbacks do SQLite em Promises
const dbRun = (query, params) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            resolve(this); // 'this' contém lastID e changes
        });
    });
};

const create = async (notificacaoData) => {
    const { usuarioId, tipo, mensagem, referenciaId } = notificacaoData;
    const result = await dbRun(
        'INSERT INTO notificacoes (usuario_id, tipo, mensagem, referencia_id) VALUES (?, ?, ?, ?)',
        [usuarioId, tipo, mensagem, referenciaId]
    );
    return { id: result.lastID, ...notificacaoData };
};

module.exports = {
    create,
};
