import "dotenv/config";
import app from "./app.js";
import pool from "./config/db.js"

import "./Controllers/Recordatorio.controller.js";

const PORT = process.env.PORT || 3000;

try {
    const connection = await pool.getConnection();
    console.log("✅ Conectado a MySQL");
    connection.release();
} catch (error) {
    console.error("❌ Error al conectar con MySQL");
}

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});