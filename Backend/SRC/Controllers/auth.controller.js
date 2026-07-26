import { 
    obtenerUsuario 
} from "../Models/auth.model";


export const autentificarUsuario = async (req, res) => {
   try{
     const{ 
        usuario,
        password
        } = req.body;

        const getUsuario   = await obtenerUsuario(usuario);
        if(!getUsuario){
            return res.status(404).json({
                mensaje:  "Error usuario o contraseña incorrectos"
            });
        }

        if(password !== getUsuario.password ){
            return res.status(401).json({
                mensaje: "Error usuario o contraseña incorrectos"
            })
        }
        return res.status(200).json({
            mensaje: "Login Correcto"
        });
   } catch(error){
         console.error(error);
        return res.status(500).json({
            mensaje: "Error al obtener al usuario"
        });
   }
}