import pool from "../config/db";

export const obtenerUsuarioPorCorreo = async (usuario) => {
    const [rows] = await pool.query(`
        SELECT 
        nombreUsuario AS usuario,
        password 
        FROM usuarios
        WHERE usuario = ? 
        `[usuario]);
    return rows[0];
}