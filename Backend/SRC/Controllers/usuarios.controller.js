import bcrypt from "bcrypt";
import {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    insertarUsuario,
    eliminarUsuario,
    editarUsuario
} from "../Models/usuarios.model.js";
const rolesValidos = [
    "Administrador",
    "Recepcionista"
];
const getUsuarios = async (req, res) => {
    try {
        const usuarios = await obtenerUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener los usuarios" });
    }
};

const postUsuarios = async (req, res) => {
    try {
        const { nombreUsuario, password, rol } = req.body;

        if (
            !nombreUsuario?.trim() ||
            !password?.trim() ||
            !rol?.trim()
        ) {
            return res.status(400).json({ mensaje: "Completa usuario, contraseña y rol" });
        }

        if(nombreUsuario.trim().length < 3 ){
            return res.status(400).json({ 
                mensaje: "El nombre de usuario debe de tener mas de 3 caracteres" 
            });
        }

        if(password.trim().length < 8) {
            return res.status(400).json({ 
                mensaje: "La contraseña debe de tener mas de 8 caracteres" 
            });
        }

        const nombreLimpio = nombreUsuario.trim();
        const rolLimpio = rol.trim();

        if(!rolesValidos.includes(rolLimpio)){
            return res.status(400).json({ 
                mensaje: "Rol invalido" 
            });
        }


        const passwordHash = await bcrypt.hash(password, 10);
        const resultado = await insertarUsuario(nombreLimpio, passwordHash, rolLimpio);

        if (resultado.affectedRows === 0) {
            return res.status(400).json({ mensaje: "No se pudo crear el usuario" });
        }

        res.status(201).json({ mensaje: "Usuario creado correctamente", usuarioId: resultado.insertId });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ mensaje: "El nombre de usuario ya existe" });
        }

        res.status(500).json({ mensaje: "Error al crear el usuario" });
    }
};

const deleteUsuarios = async (req, res) => {
    try {
        const { id } = req.params;
        if(isNaN(id)){
            return res.status(400).json({
                mensaje:"ID inválido"
            });
        }
        const response = await eliminarUsuario(id);

        if (response.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "No se pudo eliminar el usuario" });
    }
};

const putUsuarios = async (req, res) => {
    try {
        const { id } = req.params;
        
        if(isNaN(id)){
            return res.status(400).json({
                mensaje:"ID inválido"
            });
        }
        const { nombreUsuario, password, rol } = req.body;

        const usuarioActual = await obtenerUsuarioPorId(id);

        if (!usuarioActual) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
        if(nombreUsuario && nombreUsuario.trim().length < 3 ){
            return res.status(400).json({ 
                mensaje: "El nombre de usuario debe de tener mas de 3 caracteres" 
            });
        }

        if(password && password.trim().length < 8) {
            return res.status(400).json({ 
                mensaje: "La contraseña debe de tener mas de 8 caracteres" 
            });
        }
        const nombreLimpio = nombreUsuario?.trim() || usuarioActual.nombreUsuario;
        const rolLimpio = rol?.trim() || usuarioActual.rol;

        if(!rolesValidos.includes(rolLimpio)){
            return res.status(400).json({ 
                mensaje: "Rol invalido" 
            });
        }
        let passwordHash = usuarioActual.password;

        if (password && password.trim() !== "") {
            passwordHash = await bcrypt.hash(password, 10);
        }

        const response = await editarUsuario(id, {
            nombreUsuario: nombreLimpio,
            passwordHash,
            rol: rolLimpio
        });

        if (response.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json({ mensaje: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ mensaje: "El nombre de usuario ya existe" });
        }

        res.status(500).json({ mensaje: "No se pudo editar el usuario" });
    }
};

export { getUsuarios, postUsuarios, deleteUsuarios, putUsuarios };
