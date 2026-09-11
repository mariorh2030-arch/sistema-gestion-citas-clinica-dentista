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
        (pacienteId, tratamientoId, fecha, hora, estado, recordatorio)
        VALUES (?, ?, ?, ?, ?, ?)` ,
        [
            pacienteId,
            tratamientoId,
            fecha,
            hora,
            "Pendiente",
            0
        ]
    );

    // El fallo de WhatsApp no debe convertir una cita ya guardada en un error de registro.
    void import('../Controllers/Recordatorio.controller.js')
        .then(({ enviarRecordatorioCita }) => enviarRecordatorioCita(rows.insertId))
        .catch(error => console.error(`Recordatorio de cita ${rows.insertId}:`, error.message));
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

 const obtenerCitasSinRecordatorio = async () => {
    const [rows] = await pool.query(`
            SELECT c.id, p.telefono, p.nombre, c.fecha, c.hora
            FROM citas c
            INNER JOIN pacientes p ON c.pacienteId = p.id
            WHERE TIMESTAMP(c.fecha, c.hora) >= NOW()
            AND LOWER(c.estado) = 'pendiente' AND c.recordatorio = 0
            ORDER BY c.fecha, c.hora, c.id
            LIMIT 100
    `);
    return rows;
  }
// 0: por enviar; -1: en tramite; 1: entregado; -2: fallo conocido.
// La reserva atomica evita duplicados entre el registro de la cita y el cron.
const reservarRecordatorio = async (id, fecha, hora) => {
    const [resultado] = await pool.query(`UPDATE citas SET recordatorio = -1
        WHERE id = ? AND fecha = ? AND hora = ? AND recordatorio = 0
        AND LOWER(estado) = 'pendiente' AND TIMESTAMP(fecha, hora) >= NOW()`, [id, fecha, hora]);
    return resultado.affectedRows === 1;
};

const marcarRecordatorioEnviado = async (id, estado, fecha, hora) => {
    if (!['delivered', 'read', 'failed', 'undelivered', 'canceled'].includes(estado)) return;
    const entregado = ['delivered', 'read'].includes(estado);
    await pool.query(`UPDATE citas SET recordatorio = ?
        WHERE id = ? AND fecha = ? AND hora = ? AND recordatorio IN (-1, -2)`,
        [entregado ? 1 : -2, id, fecha, hora]);
};

const actualizarEstadoPorTelefono = async (telefono, nuevoEstado, contexto = null) => {
    if (!/^\d{10}$/.test(telefono) || !['Confirmada', 'Cancelada'].includes(nuevoEstado)) {
        throw new Error('Telefono o estado de cita invalido');
    }
    const conexion = await pool.getConnection();
    try {
        await conexion.beginTransaction();
        const parametros = [telefono];
        if (contexto) parametros.push(contexto.fecha, `${contexto.hora}:00`);
        // Se incluyen estados finales para que repetir una respuesta no afecte otra cita.
        const [citas] = await conexion.query(`SELECT c.id, c.estado
            FROM citas c INNER JOIN pacientes p ON c.pacienteId = p.id
            WHERE RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(p.telefono,
                '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 10) = ?
            AND TIMESTAMP(c.fecha, c.hora) >= NOW() AND c.recordatorio IN (-1, 1)
            ${contexto ? 'AND c.fecha = ? AND c.hora = ?' : ''}
            ORDER BY c.fecha, c.hora, c.id LIMIT 2 FOR UPDATE`, parametros);
        if (citas.length !== 1) {
            await conexion.commit();
            return { affectedRows: 0, ambiguo: citas.length > 1 };
        }
        const [resultado] = await conexion.query(`UPDATE citas SET estado = ?, recordatorio = 1
            WHERE id = ? AND LOWER(estado) = 'pendiente'`, [nuevoEstado, citas[0].id]);
        await conexion.commit();
        return resultado;
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
};
export { 
    obtenerPacientePorTelefono, 
    insertarCita, 
    obtenerCita, 
    eliminarCita, 
    obtenerCitaPorId, 
    editarCita, 
    actualizarEstado,
    obtenerCitasDelDia,
    obtenerCitasSinRecordatorio,
    reservarRecordatorio,
    marcarRecordatorioEnviado,
    actualizarEstadoPorTelefono
}
