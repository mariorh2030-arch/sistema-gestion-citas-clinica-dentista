import express from 'express';
import { 
    autentificarUsuario 
} from '../Controllers/auth.controller.js';

const router = express.Router();
export default router;
router.post("/", autentificarUsuario);