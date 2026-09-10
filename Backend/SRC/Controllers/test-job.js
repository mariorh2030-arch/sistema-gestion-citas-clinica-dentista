// test-job.js (archivo nuevo, temporal, solo para pruebas)
import { ejecutarRecordatorios } from "./Recordatorio.controller.js";
ejecutarRecordatorios().then(() => console.log('Listo')).catch(console.error);