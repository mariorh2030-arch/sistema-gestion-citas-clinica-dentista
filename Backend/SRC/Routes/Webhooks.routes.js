// webhook.routes.js (nuevo archivo)
import express from "express";
import { recibirRespuestaWhatsapp } from "../Controllers/webhook.controller.js";
const router = express.Router();
router.post("/whatsapp", recibirRespuestaWhatsapp);
export default router;