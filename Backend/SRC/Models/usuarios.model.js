import pool from "../config/db.js";

const obtenerUsuarios = async () => {
    const [rows] = await pool.query("SELECT id, nombreUsuario, rol FROM usuarios ORDER BY id DESC");
    return rows;
};

const obtenerUsuarioPorId = async (id) => {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [id]);
    return rows[0];
};

const insertarUsuario = async (nombreUsuario, passwordHash, rol) => {
    const [rows] = await pool.query(
        "INSERT INTO usuarios (nombreUsuario, password, rol) VALUES (?, ?, ?)",
        [nombreUsuario, passwordHash, rol]
    );
    return rows;
};

const eliminarUsuario = async (id) => {
    const [rows] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
    return rows;
};

const editarUsuario = async (id, { nombreUsuario, passwordHash, rol }) => {
    const [rows] = await pool.query(
        "UPDATE usuarios SET nombreUsuario = ?, password = ?, rol = ? WHERE id = ?",
        [nombreUsuario, passwordHash, rol, id]
    );
    return rows;
};

export { obtenerUsuarios, obtenerUsuarioPorId, insertarUsuario, eliminarUsuario, editarUsuario };
