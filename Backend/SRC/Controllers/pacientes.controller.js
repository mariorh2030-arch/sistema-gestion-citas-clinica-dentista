import { obtenerPacientes } from "../Models/paciente.model.js";
import { insertarPacientes } from "../Models/paciente.model.js";
import { eliminarPaciente } from "../Models/paciente.model.js";
import { editarPaciente } from "../Models/paciente.model.js";

const validarEmail = (email) => {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validarTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/\D/g, "");
    return /^\d{10}$/.test(telefonoLimpio);
};


const getPacientes = async (req, res) => {
    try{
        const pacientes = await obtenerPacientes();

        res.status(200).json(pacientes);


    } catch (error){

        res.status(500).json({
            mensaje: "Error al obtener los pacientes"
        });

    }
}

const postPacientes = async (req, res) => {

    try {

        const {
            nombre,
            apellidos,
            telefono,
            correo,
            fechaNacimiento
        } = req.body;

        if (
            !nombre?.trim() ||
            !apellidos?.trim() ||
            !telefono?.trim() ||
            !fechaNacimiento?.trim()
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
        const resultado = await insertarPacientes(
            nombre,
            apellidos,
            telefono,
            correo,
            fechaNacimiento
        );
        if(resultado.affectedRows === 0){
            return res.status(404).json({
                mensaje: "Paciente no encontrado"
            });
        }
        res.status(201).json(resultado);

    } catch(error){

        console.log(error);

        res.status(500).json({
            mensaje:"Error al insertar paciente"
        });

    }

}

const deletePacientes = async (req, res) => {
    try{
        const id = req.params.id;
        
        if(isNaN(id)){
            return res.status(400).json({
                mensaje:"ID inválido"
            });
        }

        const response = await eliminarPaciente(id);

        if (response.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Paciente no encontrado"
        });

        res.status(200).json(response);
    }

    } catch(error) {
        console.error(error);
        res.status(500).json({
            mensaje:"No se pudo eliminar al paciente"
        });
    }
}
const putPacientes = async (req, res) => {
    try{
        const { id } = req.params;
        if(isNaN(id)){
            return res.status(400).json({
                mensaje:"ID inválido"
            });
        }
        const  {
            nombre,
            apellidos,
            telefono,
            correo,
            fechaNacimiento
        } = req.body
        if(!validarEmail(correo)){
            return res.status(400).json({
                mensaje: "Correo no valido"
            });
        }
        if(!validarTelefono(telefono)){
            return res.status(400).json({
                mensaje: "El teléfono debe tener 10 dígitos."
            });
        }

        const response = await editarPaciente(id, {
            nombre,
            apellidos,
            telefono,
            correo,
            fechaNacimiento
        });

        if(response.affectedRows === 0){
            return res.status(404).json({
                mensaje: "Paciente no encontrado"
            });
        }

        res.status(200).json(response);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje:"No se pudo editar al paciente"
        });
    }
}
export { getPacientes, postPacientes, deletePacientes, putPacientes }