import cron from 'node-cron';
import { enviarRecordatorio, formatearFechaCita } from '../Models/whatsappServices.model.js';
import {
  obtenerCitasSinRecordatorio,
  obtenerCitaPorId,
  reservarRecordatorio,
  marcarRecordatorioEnviado
} from '../Models/citas.model.js';

const enviarRecordatorioCita = async (id) => {
  const [cita] = await obtenerCitaPorId(id);
  if (!cita) return;
  const fecha = formatearFechaCita(cita.fecha);
  if (!await reservarRecordatorio(cita.id, fecha, cita.hora)) return;
  try {
    const mensaje = await enviarRecordatorio(
      cita.telefono,
      cita.nombre,
      cita.fecha,
      cita.hora,
      cita.id
    );
    await marcarRecordatorioEnviado(cita.id, mensaje.status, fecha, cita.hora);
    console.log(`Recordatorio de cita ${cita.id}: ${mensaje.sid}, estado Twilio: ${mensaje.status}`);
  } catch (error) {
    // Un timeout puede ocurrir despues de que Twilio acepto el mensaje:
    // se conserva la reserva para no enviar dos recordatorios.
    if ((!error.code || Number.isInteger(error.code)) && (!error.status || error.status < 500)) {
      await marcarRecordatorioEnviado(cita.id, 'failed', fecha, cita.hora);
    }
    console.error(`No se pudo enviar el recordatorio de la cita ${cita.id}:`, error.message);
  }
};

let ejecutando = false;
const ejecutarRecordatorios = async () => {
  if (ejecutando) return;
  ejecutando = true;
  try {
    const citas = await obtenerCitasSinRecordatorio();
    for (const cita of citas) {
      await enviarRecordatorioCita(cita.id);
    }
  } catch (error) {
    console.error('No se pudieron procesar los recordatorios:', error.message);
  } finally {
    ejecutando = false;
  }
};

cron.schedule('* * * * *', ejecutarRecordatorios, {
  timezone: process.env.CRON_TIMEZONE || 'America/Mexico_City'
});

export { ejecutarRecordatorios, enviarRecordatorioCita };
