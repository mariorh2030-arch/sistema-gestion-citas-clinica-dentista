import express from "express";
import { 
    agendarCita, 
    getCitas, 
    deleteCita, 
    getCitasById, 
    putCita,
    putEstadoCita
} from "../Controllers/citas.controller.js";
import { verificarToken } from "../Middleware/auth.middleware.js";
const router = express.Router();
export default router;

router.post("/",verificarToken, agendarCita);
router.get("/",verificarToken, getCitas);
router.get("/:id",verificarToken, getCitasById);
router.delete("/:id",verificarToken, deleteCita);
router.put("/:id",verificarToken, putCita);
router.patch("/:id/estado", verificarToken, putEstadoCita);