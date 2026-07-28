import pool from "../config/db.js";

export const obtenerUsuario = async (usuario) => {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            nombreUsuario AS usuario,
            password,
            rol
        FROM usuarios
        WHERE nombreUsuario = ?
        `,
        [usuario]
    );

    return rows[0];
}