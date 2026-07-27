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
    
    const passwordHash = await bcrypt.hash(password, 10);
    const getUsuario   = await obtenerUsuario(usuario, passwordHash);
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