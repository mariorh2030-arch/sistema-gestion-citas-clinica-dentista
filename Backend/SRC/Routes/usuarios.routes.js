import express from "express";
import { getUsuarios, postUsuarios, deleteUsuarios, putUsuarios } from "../Controllers/usuarios.controller.js";
import { verificarToken } from "../Middleware/auth.middleware.js";
const router = express.Router();

router.get("/", verificarToken, getUsuarios);
router.post("/", verificarToken, postUsuarios);
router.delete("/:id", verificarToken, deleteUsuarios);
router.put("/:id", verificarToken, putUsuarios);

export default router;
