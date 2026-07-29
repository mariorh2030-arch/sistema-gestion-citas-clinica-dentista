import { 
    obtenerUsuario 
} from "../Models/auth.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const autentificarUsuario = async (req, res) => {
   try{
     const{ 
        usuario,
        password
    } = req.body;

    if(!usuario?.trim() || !password?.trim()){
        return res.status(400).json({
            mensaje: "Usuario y contraseña son obligatorios."
        });
    }
    
    const getUsuario   = await obtenerUsuario(usuario);
    if(!getUsuario){
        return res.status(404).json({
            mensaje:  "Error usuario o contraseña incorrectos"
        });
    }
    

    const coincide = await bcrypt.compare(password, getUsuario.password);
    if(!coincide){
        return res.status(401).json({
            mensaje: "Error usuario o contraseña incorrectos"
        })
    }
    const payload = {
        id: getUsuario.id,
        usuario: getUsuario.usuario,
        rol: getUsuario.rol
    }
    
    const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
        expiresIn: "2h"
    }
)
    return res.status(200).json({
        mensaje: "Login Correcto",
        token
    });
   } catch(error){
         console.error(error);
        return res.status(500).json({
            mensaje: "Error al obtener al usuario"
        });
   }
}