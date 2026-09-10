import cron from 'node-cron';
import { enviarRecordatorio } from '../Models/whatsappServices.model.js';
import {
  obtenerCitasProximas24h,
  marcarRecordatorioEnviado
} from '../Models/citas.model.js';

const ejecutarRecordatorios = async () => {
  const citas = await obtenerCitasProximas24h();

  for (const cita of citas) {
    try {
      const mensaje = await enviarRecordatorio(
        cita.telefono,
        cita.nombre,
        cita.fecha,
        cita.hora
      );
      await marcarRecordatorioEnviado(cita.id);
      console.log(`Recordatorio enviado para cita ${cita.id}: ${mensaje.sid}`);
    } catch (error) {
      console.error(`No se pudo enviar el recordatorio de la cita ${cita.id}:`, error.message);
    }
  }
};

cron.schedule('0 8 * * *', ejecutarRecordatorios, {
  timezone: process.env.CRON_TIMEZONE || 'America/Mexico_City'
});

export { ejecutarRecordatorios };
