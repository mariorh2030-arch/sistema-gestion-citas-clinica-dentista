import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import pacientesRoutes from "./Routes/paciente.routes.js";
import citasRoutes from "./Routes/citas.routes.js";
import tratamientosRoutes from "./Routes/tratamientos.routes.js";
import autentificacion from "./Routes/auth.routes.js";
import usuariosRoutes from "./Routes/usuarios.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/api/pacientes", pacientesRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/tratamientos", tratamientosRoutes);
app.use("/api/autentificar", autentificacion);
app.use("/api/usuarios", usuariosRoutes);

app.use(express.static(path.join(__dirname, "../../Frontend")));

app.get("/", (req, res) => {
    res.send("API funcionando 🚀");
});

// endpoint de prueba
app.get("/ping", (req, res) => res.json({ ok: true }));

console.log("Rutas registradas: /api/tratamientos /api/usuarios");

export default app;

