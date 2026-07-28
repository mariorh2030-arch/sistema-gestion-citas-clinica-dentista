import jwt from  "jsonwebtoken";


export const verificarToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if(!authHeader)
    {
        return res.status(401).json({
            mensaje: "Token requerido"
        });
    }

    const partes = authHeader.split(" ");

    if(partes[0] !== "Bearer" || !partes[1]){
        return res.status(401).json({
            mensaje: "Token inválido o expirado"
        });
    }

    try {
        const token = partes[1];
        const usuario = jwt.verify(token, process.env.JWT_SECRET);


        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({
            mensaje: "Token inválido o expirado"
        });
    }
}