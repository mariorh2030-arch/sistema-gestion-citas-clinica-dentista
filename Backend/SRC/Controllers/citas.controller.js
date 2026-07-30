import { 
    obtenerPacientePorTelefono, 
    insertarCita, 
    obtenerCita, 
    eliminarCita,
    obtenerCitaPorId,
    editarCita, 
    actualizarEstado,
    obtenerCitasDelDia
 } from "../Models/citas.model.js";
import { eliminarPaciente, insertarPacientes } from "../Models/paciente.model.js";
import { 
    obtenerTratamientos, 
    obtenerTratamientoPorId
 } from "../Models/tratamientos.model.js";

const validarEmail = (email) => {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validarTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/\D/g, "");
    return /^\d{10}$/.test(telefonoLimpio);
};
const convertirHorasAMinutos = (hora) => {
    const [h, m] = hora.split(":");
    return Number(h) * 60 + Number(m);
}
export const getCitas = async (req, res) => {
    try{
        const citas = await obtenerCita();
        res.status(200).json(citas);
    } catch(error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al obtener las citas"
        });
    }
}
export const getCitasById = async (req, res) => {
    try{
        const { id } = req.params;
        const citasPorId = await obtenerCitaPorId(id);
        res.status(200).json(citasPorId);
    } catch(error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al obtener las citas"
        });
    }
}

export const agendarCita = async (req, res) => {
    try{
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const { 
            nombre,
            apellidos,
            telefono,
            correo,
            fechaNacimiento, 
            tratamientoId, 
            hora, 
            fecha 
        } = req.body
        if (
            !nombre?.trim() ||
            !apellidos?.trim() ||
            !telefono?.trim() ||
            !fechaNacimiento?.trim() ||
            !hora?.trim() ||
            !fecha?.trim() ||
            !tratamientoId
        ) {
            return res.status(400).json({
                mensaje: "No se permiten campos vacíos"
            });
        }
        if(!validarEmail(correo))
        {
            return res.status(400).json({
                mensaje: "Correo no valido"
            });
        }
        if(!validarTelefono(telefono))
        {
            return res.status(400).json({
                mensaje: "El teléfono debe tener 10 dígitos."
            });
        }
        const duracionNueva = await obtenerTratamientoPorId(tratamientoId)

        if (
            duracionNueva.length === 0
        ) {
            return res.status(404).json({
                mensaje: "Tratamiento no encontrado."
            });
        }
        const horaNuevaInicio = convertirHorasAMinutos(hora);
        const horaNuevaFin = horaNuevaInicio + duracionNueva[0].duracion;
        const horaApertura = convertirHorasAMinutos("9:00");
        const horaCierre = convertirHorasAMinutos("18:00");

        const fechaCita = new Date(fecha);

        if (fechaCita < hoy) {
            return res.status(400).json({
                mensaje:"No puedes registrar citas en fechas pasadas."
            });
        }
        
        if (
            horaNuevaInicio < horaApertura || 
            horaNuevaFin > horaCierre
        ){
            return res.status(400).json({
            mensaje:
            "La cita está fuera del horario de atención."
        });
        }

        const paciente = await obtenerPacientePorTelefono(telefono);
        let pacienteId;
        

        if(paciente.length > 0){
            pacienteId = paciente[0].id;
        } else if(paciente.length === 0) {
            

            const nuevoPaciente = await insertarPacientes(
                nombre,
                apellidos,
                telefono,
                correo,
                fechaNacimiento
            )
            pacienteId = nuevoPaciente.insertId;

        }

        const citasExistentes = await obtenerCitasDelDia(fecha)

        if (citasExistentes.length === 0){
            await insertarCita(
                pacienteId,
                tratamientoId,
                fecha,
                hora
            )
            return res.status(201).json({
                mensaje: "cita registrada correctamente"
            });
        }
        for (const cita of citasExistentes){
            const horaExistenteInicio = convertirHorasAMinutos(cita.hora);
            const horaExistenteFin = horaExistenteInicio + cita.duracion;

            
            if (
                horaNuevaInicio < horaExistenteFin && 
                horaNuevaFin > horaExistenteInicio
            ) {
                return res.status(409).json({
                mensaje: "Ese horario no está disponible."
            });
            }
        }

        await insertarCita(
            pacienteId,
            tratamientoId,
            fecha,
            hora
        )
        return res.status(201).json({
            mensaje: "cita registrada correctamente"
        });

        } catch(error) {
            console.error(error);
            res.status(500).json({
                mensaje:"No se pudo editar al paciente"
            });
        }
    } 
    export const deleteCita = async (req, res) =>{
        try{
            const id = req.params.id;
            const response = await eliminarCita(id);

            if (response.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Cita no encontrada"
                });
            }
            res.status(200).json(response);
        } catch(error) {
            console.error(error);
            res.status(500).json({
                mensaje:"No se pudo editar al paciente"
            });

        }
}
export const putCita = async (req, res) => {
    try{
        const { id } = req.params;
        const {
            tratamientoId,
            fecha,
            hora
        } = req.body;

        if (
            !hora?.trim() ||
            !fecha?.trim() ||
            !tratamientoId
        ) {
            return res.status(400).json({
                mensaje: "No se permiten campos vacíos"
            });
        }

        const response = await editarCita(id, {
            tratamientoId, 
            fecha, 
            hora
        })

        if(response.affectedRows === 0){
            return res.status(404).json({
                mensaje: "Paciente no encontrado"
            });
        }

        res.status(200).json(response);
    } catch(error) {
        console.error(error);
        res.status(500).json({
            mensaje:"No se pudo editar al paciente"
        });
    }
}

export const putEstadoCita = async (req, res) => {
    try{
        const {id} = req.params
        const {estado} = req.body

        const response = await actualizarEstado(id, estado);

        if(response.affectedRows === 0)
        {
            return res.status(404).json({
                mensaje: "Paciente no encontrado"
            });
        }

        res.status(200).json(response);
    } catch(error) {
        console.error(error);
        res.status(500).json({
            mensaje:"No se pudo editar al paciente"
        });
    }
}
