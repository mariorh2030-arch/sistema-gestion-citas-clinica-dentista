import express from "express";
import { getUsuarios, postUsuarios, deleteUsuarios, putUsuarios } from "../Controllers/usuarios.controller.js";

const router = express.Router();

router.get("/", getUsuarios);
router.post("/", postUsuarios);
router.delete("/:id", deleteUsuarios);
router.put("/:id", putUsuarios);

export default router;
