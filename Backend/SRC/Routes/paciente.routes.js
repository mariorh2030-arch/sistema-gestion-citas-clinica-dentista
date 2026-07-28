import express from "express";
import {getPacientes} from "../Controllers/pacientes.controller.js";
import { postPacientes } from "../Controllers/pacientes.controller.js";
import { deletePacientes } from "../Controllers/pacientes.controller.js";
import { putPacientes } from "../Controllers/pacientes.controller.js";
import { verificarToken } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verificarToken, getPacientes);
router.post("/", verificarToken, postPacientes);
router.delete("/:id", verificarToken, deletePacientes);
router.put("/:id", verificarToken, putPacientes);

export default router;