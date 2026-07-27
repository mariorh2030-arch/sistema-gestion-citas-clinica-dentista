import pool from "../config/db.js";

export const obtenerUsuario = async (usuario, password) => {
    const [rows] = await pool.query(
        `
        SELECT
            nombreUsuario AS usuario,
            password
        FROM usuarios
        WHERE nombreUsuario = ?
        `,
        [usuario, password]
    );

    return rows[0];
}