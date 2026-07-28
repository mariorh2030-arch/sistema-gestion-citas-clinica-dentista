import express from "express";
import { getTratamientos } from "../Controllers/tratamientos.controller.js";
import { postTratamientos } from "../Controllers/tratamientos.controller.js";
import { deleteTratamientos } from "../Controllers/tratamientos.controller.js";
import { putTratamientos } from "../Controllers/tratamientos.controller.js";
import { verificarToken } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verificarToken, getTratamientos);
router.post("/", verificarToken, postTratamientos);
router.delete("/:id", verificarToken, deleteTratamientos);
router.put("/:id", verificarToken, putTratamientos);

export default router;
