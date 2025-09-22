const { dbGet, dbAll, dbRun } = require('../db');

// Adicionar participante a um grupo
const addParticipant = async (grupoId, usuarioId, isAdmin = 0, status = 'membro') => {
    const result = await dbRun(
        'INSERT INTO grupo_participantes (grupo_id, usuario_id, is_admin, status) VALUES (?, ?, ?, ?)',
        [grupoId, usuarioId, isAdmin, status]
    );
    return { id: result.lastID, grupoId, usuarioId, isAdmin, status };
};

// Remover participante de um grupo
const removeParticipant = async (grupoId, usuarioId) => {
    const result = await dbRun(
        'DELETE FROM grupo_participantes WHERE grupo_id = ? AND usuario_id = ?',
        [grupoId, usuarioId]
    );
    return result.changes > 0;
};

// Listar participantes de um grupo
const getParticipantsByGroup = (grupoId) => {
    return dbAll(`
        SELECT 
            gp.id,
            gp.grupo_id,
            gp.usuario_id,
            gp.data_entrada,
            gp.is_admin,
            u.nome_completo,
            u.email,
            u.curso,
            u.periodo
        FROM grupo_participantes gp
        JOIN usuarios u ON gp.usuario_id = u.id
        WHERE gp.grupo_id = ?
        ORDER BY gp.is_admin DESC, gp.data_entrada ASC
    `, [grupoId]);
};

// Listar grupos de um usuário
const getGroupsByUser = (usuarioId) => {
    return dbAll(`
        SELECT 
            gp.id as participacao_id,
            gp.data_entrada,
            gp.is_admin,
            g.id as grupo_id,
            g.nome as grupo_nome,
            g.descricao,
            g.objetivo,
            g.local,
            m.nome as materia,
            (g.limite_participantes - (SELECT COUNT(*) FROM grupo_participantes mg WHERE mg.grupo_id = g.id)) as vagas_disponiveis, 
            g.limite_participantes as total_vagas,
            g.is_publico
        FROM grupo_participantes gp
        JOIN grupos g ON gp.grupo_id = g.id
        JOIN materias m ON g.materia_id = m.id
        WHERE gp.usuario_id = ?
        ORDER BY gp.data_entrada DESC
    `, [usuarioId]);
};

// Verificar se usuário é participante de um grupo
const isParticipant = async (grupoId, usuarioId) => {
    const result = await dbGet(
        'SELECT id FROM grupo_participantes WHERE grupo_id = ? AND usuario_id = ?',
        [grupoId, usuarioId]
    );
    return !!result;
};

// Verificar se usuário é administrador de um grupo
const isAdmin = async (grupoId, usuarioId) => {
    const result = await dbGet(
        'SELECT is_admin FROM grupo_participantes WHERE grupo_id = ? AND usuario_id = ?',
        [grupoId, usuarioId]
    );
    return result ? result.is_admin === 1 : false;
};

// Promover usuário a administrador
const promoteToAdmin = async (grupoId, usuarioId) => {
    const result = await dbRun(
        'UPDATE grupo_participantes SET is_admin = 1 WHERE grupo_id = ? AND usuario_id = ?',
        [grupoId, usuarioId]
    );
    return result.changes > 0;
};

// Rebaixar administrador para membro comum
const demoteFromAdmin = async (grupoId, usuarioId) => {
    const result = await dbRun(
        'UPDATE grupo_participantes SET is_admin = 0 WHERE grupo_id = ? AND usuario_id = ?',
        [grupoId, usuarioId]
    );
    return result.changes > 0;
};

module.exports = {
    addParticipant,
    removeParticipant,
    getParticipantsByGroup,
    getGroupsByUser,
    isParticipant,
    isAdmin,
    promoteToAdmin,
    demoteFromAdmin,
};