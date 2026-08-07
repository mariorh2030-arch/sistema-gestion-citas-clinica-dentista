import pool from "../config/db.js";

const obtenerPacientePorTelefono = async (telefono) => {
    const [rows] = await pool.query("SELECT id FROM pacientes WHERE telefono = ?", [telefono]);
    return rows;
}

const obtenerCita = async () => {
    const [rows] = await pool.query(
        `SELECT 
        c.id,
        p.nombre,
        p.apellidos,
        p.telefono,
        t.nombreTratamiento as tratamiento,
        c.fecha,
        c.hora,
        c.estado
        FROM citas c
        INNER JOIN pacientes p
            ON c.pacienteId = p.id
        INNER JOIN tratamientos t
            ON c.tratamientoId = t.id 
        ORDER BY c.fecha DESC;`
    )
    return rows;
}
const obtenerCitaPorId = async (id) => {
    const [rows] = await pool.query(
        `SELECT
            c.id,
            c.pacienteId,
            p.nombre,
            p.apellidos,
            p.telefono,
            p.correo,
            p.fechaNacimiento,
            c.tratamientoId,
            t.nombreTratamiento AS tratamiento,
            c.fecha,
            c.hora,
            c.estado
        FROM citas c
        INNER JOIN pacientes p ON c.pacienteId = p.id
        INNER JOIN tratamientos t ON c.tratamientoId = t.id
        WHERE c.id = ?`,
        [id]
    );
    return rows;
}
const obtenerCitasDelDia = async (fecha) => {
    const [rows] = await pool.query(
        `SELECT 
        c.hora,
        t.nombreTratamiento AS nombreT,
        t.duracion
        FROM citas c
        INNER JOIN tratamientos t ON c.tratamientoId = t.id
        WHERE c.fecha = ?`,
        [fecha]
    );
    return rows;
}


const insertarCita = async (
    pacienteId,
    tratamientoId,
    fecha,
    hora
) => {
    const [rows] = await pool.query(
        `INSERT INTO citas
        (pacienteId, tratamientoId, fecha, hora, estado)
        VALUES (?, ?, ?, ?, ?)`,
        [
            pacienteId,
            tratamientoId,
            fecha,
            hora,
            "Pendiente"
        ]
    );

    return rows;
}

const editarCita = async (id, cita) => {
    const {
        tratamientoId,
        fecha, 
        hora
    } = cita;

    const [rows] = await pool.query(`UPDATE citas
        SET tratamientoId = ?, fecha = ?, hora = ?
        WHERE id = ?`,
        [
            tratamientoId,
            fecha,
            hora,
            id
        ]
    );
    return rows;
}
const actualizarEstado = async (id, estado) => {
    const [rows] = await pool.query(
        `UPDATE citas 
        SET estado = ? 
        WHERE id = ?`,
        [
            estado, 
            id
        ]
    );
    return rows;
}

const eliminarCita = async (id) =>{
    const [rows] = await pool.query(`DELETE FROM citas WHERE id = ?`, [id]);
    return rows;
}



export { 
    obtenerPacientePorTelefono, 
    insertarCita, 
    obtenerCita, 
    eliminarCita, 
    obtenerCitaPorId, 
    editarCita, 
    actualizarEstado,
    obtenerCitasDelDia
}
