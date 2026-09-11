import pool from "../config/db.js";

const obtenerTratamientos = async () => {
    const [rows] = await pool.query("SELECT * FROM tratamientos");
    return rows;
}
export const obtenerTratamientoPorId = async (id) => {
    const [rows] = await pool.query(
        `SELECT duracion
         FROM tratamientos
         WHERE id = ?`,
        [id]
    );

    return rows;
}

const insertarTratamientos = async (nombre, descripcion, precio) =>{
    const [rows] = await pool.query(`INSERT INTO tratamientos
        (nombreTratamiento, descripcion, precio)
        VALUES (?, ?, ?)`,
        [nombre, descripcion, precio]);
    return rows;
}

const eliminarTratamientos = async (id) =>{
    const [rows] = await pool.query(`DELETE FROM tratamientos WHERE id = ?`, [id]);
    return rows;
}
const editarTratamientos = async (id, {nombre, descripcion, precio, duracion}) => {

    const [rows] = await pool.query(
        `UPDATE tratamientos 
        SET nombreTratamiento = ?, descripcion = ?, precio = ?, duracion = ? WHERE id = ?`,
        [nombre, descripcion, precio,duracion, id]);
    return rows;
}

export { insertarTratamientos, obtenerTratamientos, eliminarTratamientos, editarTratamientos };