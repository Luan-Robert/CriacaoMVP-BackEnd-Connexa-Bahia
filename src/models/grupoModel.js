const db = require('../db');

const create = (grupoData) => {
    const { nome, materiaId, objetivo, local, limiteParticipantes, isPublico, criadorId } = grupoData;
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO grupos (nome, materia_id, objetivo, local, limite_participantes, is_publico, criador_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [nome, materiaId, objetivo, local, limiteParticipantes, isPublico, criadorId], function (err) {
            if (err) {
                reject(err);
            } else {
                findById(this.lastID).then(resolve).catch(reject);
            }
        });
    });
};

const findById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM grupos WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const findAll = (filtros) => {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT 
                g.id, 
                g.nome, 
                m.nome as materia, 
                g.local, 
                g.objetivo, 
                (g.limite_participantes - (SELECT COUNT(*) FROM membros_grupos mg WHERE mg.grupo_id = g.id)) as vagas_disponiveis, 
                g.limite_participantes as total_vagas,
                g.criado_em as data_criacao
            FROM grupos g
            JOIN materias m ON g.materia_id = m.id
            WHERE (g.limite_participantes - (SELECT COUNT(*) FROM membros_grupos mg WHERE mg.grupo_id = g.id)) > 0
        `;

        const params = [];
        const conditions = [];

        if (filtros.materia) {
            conditions.push('m.nome LIKE ?');
            params.push(`%${filtros.materia}%`);
        }
        if (filtros.local) {
            conditions.push('g.local LIKE ?');
            params.push(`%${filtros.local}%`);
        }
        if (filtros.objetivo) {
            conditions.push('g.objetivo LIKE ?');
            params.push(`%${filtros.objetivo}%`);
        }

        if (conditions.length > 0) {
            sql += ' AND ' + conditions.join(' AND ');
        }

        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const isUserAdmin = (grupoId, usuarioId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT criador_id FROM grupos WHERE id = ?';
        db.get(sql, [grupoId], (err, row) => {
            if (err) {
                return reject(err);
            }
            if (!row) {
                return resolve(false); // Grupo não encontrado
            }
            resolve(row.criador_id === usuarioId);
        });
    });
};

const gerenciarMembro = (grupoId, usuarioId, statusAtual, novoStatus) => {
    return new Promise((resolve, reject) => {
        let sql, params;
        if (novoStatus) {
            sql = 'UPDATE grupo_membros SET status = ? WHERE grupo_id = ? AND usuario_id = ? AND status = ?';
            params = [novoStatus, grupoId, usuarioId, statusAtual];
        } else {
            sql = 'DELETE FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ? AND status = ?';
            params = [grupoId, usuarioId, statusAtual];
        }

        db.run(sql, params, function(err) {
            if (err) {
                return reject(err);
            }
            if (this.changes === 0) {
                return resolve(null); // Nenhum registro afetado
            }
            resolve({ changes: this.changes });
        });
    });
};

const softDeleteMensagem = (grupoId, mensagemId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE mensagens SET excluida = 1, data_exclusao = CURRENT_TIMESTAMP WHERE id = ? AND grupo_id = ?';
        db.run(sql, [mensagemId, grupoId], function(err) {
            if (err) {
                return reject(err);
            }
            if (this.changes === 0) {
                return resolve(null); // Mensagem não encontrada ou não pertence ao grupo
            }
            resolve({ changes: this.changes });
        });
    });
};

const buscaAvancada = (params) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT g.id, g.nome, m.nome as materia, g.local, 
                        (SELECT COUNT(*) FROM grupo_membros gm WHERE gm.grupo_id = g.id) as numeroParticipantes, 
                        g.nivel_atividade as nivelAtividade, g.criado_em as dataCriacao 
                 FROM grupos g 
                 JOIN materias m ON g.materia_id = m.id`;
        const queryParams = [];
        const conditions = [];

        if (params.nome) { conditions.push('g.nome LIKE ?'); queryParams.push(`%${params.nome}%`); }
        if (params.id) { conditions.push('g.id = ?'); queryParams.push(params.id); }
        if (params.materia) { conditions.push('m.nome LIKE ?'); queryParams.push(`%${params.materia}%`); }
        if (params.local) { conditions.push('g.local LIKE ?'); queryParams.push(`%${params.local}%`); }

        if (conditions.length > 0) { sql += ' WHERE ' + conditions.join(' AND '); }

        const orderByMapping = {
            popularidade: 'numeroParticipantes DESC',
            nivel_atividade: 'nivelAtividade DESC',
            data_criacao: 'dataCriacao DESC'
        };
        if (params.ordenarPor && orderByMapping[params.ordenarPor]) {
            sql += ` ORDER BY ${orderByMapping[params.ordenarPor]}`;
        }

        sql += ' LIMIT ?';
        queryParams.push(params.limite);

        db.all(sql, queryParams, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

const createMensagem = (grupoId, usuarioId, texto) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO mensagens (grupo_id, usuario_id, texto) VALUES (?, ?, ?)';
        db.run(sql, [grupoId, usuarioId, texto], function(err) {
            if (err) return reject(err);
            db.get('SELECT * FROM mensagens WHERE id = ?', [this.lastID], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    });
};

const getMensagensPorGrupo = (grupoId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM mensagens WHERE grupo_id = ? ORDER BY criado_em ASC';
        db.all(sql, [grupoId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const isUserMember = (grupoId, usuarioId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT 1 FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ? AND status = \'membro\'';
        db.get(sql, [grupoId, usuarioId], (err, row) => {
            if (err) return reject(err);
            resolve(!!row);
        });
    });
};

module.exports = {
    create,
    findById,
    findAll,
    isUserAdmin,
    gerenciarMembro,
    softDeleteMensagem,
    buscaAvancada,
    createMensagem,
    getMensagensPorGrupo,
    isUserMember,
};