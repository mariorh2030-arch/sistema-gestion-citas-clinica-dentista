import twilio from 'twilio';
import { actualizarEstadoPorTelefono, marcarRecordatorioEnviado } from "../Models/citas.model.js";
import { obtenerDestinoWhatsapp, obtenerContextoRespuesta } from '../Models/whatsappServices.model.js';

const responder = (res, texto = '') => {
  const respuesta = new twilio.twiml.MessagingResponse();
  if (texto) respuesta.message(texto);
  return res.type('text/xml').status(200).send(respuesta.toString());
};

const recibirRespuestaWhatsapp = async (req, res) => {
  const webhookUrl = process.env.TWILIO_WEBHOOK_URL;
  if (!webhookUrl || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_SID) {
    return res.sendStatus(503);
  }
  if (!req.is('application/x-www-form-urlencoded')) return res.sendStatus(415);
  const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
  let firmaValida = false;
  try {
    firmaValida = twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN,
      req.get('X-Twilio-Signature') || '', `${webhookUrl}${query}`, req.body || {});
  } catch {
    return res.sendStatus(403);
  }
  if (!firmaValida || req.body.AccountSid !== process.env.TWILIO_SID) return res.sendStatus(403);

  try {
    if (req.query.citaId !== undefined) {
      const { citaId, fecha, hora } = req.query;
      const estado = req.body.MessageStatus;
      if (!/^\d+$/.test(String(citaId)) || !Number.isSafeInteger(Number(citaId)) || Number(citaId) <= 0 ||
          typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
          typeof hora !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hora) ||
          !/^(?:SM|MM)[0-9a-f]{32}$/i.test(req.body.MessageSid || '')) return res.sendStatus(400);
      await marcarRecordatorioEnviado(Number(citaId), estado, fecha, `${hora}:00`);
      console.log(`WhatsApp cita ${citaId}: ${estado}, codigo: ${req.body.ErrorCode || 'ninguno'}`);
      return responder(res);
    }

    // Ignorar notificaciones generales de entrega: no son respuestas del paciente.
    if (!req.body.Body && !req.body.ButtonPayload) return responder(res);
    const from = String(req.body.From || '');
    const to = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
    if (!/^whatsapp:\+/i.test(from) || req.body.To !== to) return res.sendStatus(400);
    let telefono;
    try {
      const destino = obtenerDestinoWhatsapp(from);
      telefono = destino.slice(-10);
      // Los pacientes del formulario usan diez digitos del pais configurado.
      if (obtenerDestinoWhatsapp(telefono) !== destino) return res.sendStatus(400);
    } catch {
      return res.sendStatus(400);
    }
    const mensaje = String(req.body.ButtonPayload || req.body.Body || '').trim().toLowerCase();
    const nuevoEstado = ['confirmo', 'confirm'].includes(mensaje) ? 'Confirmada'
      : ['cancelo', 'cancel'].includes(mensaje) ? 'Cancelada' : null;
    if (!nuevoEstado) return responder(res);
    const contexto = req.body.OriginalRepliedMessageSid
      ? await obtenerContextoRespuesta(req.body.OriginalRepliedMessageSid, from, to) : null;
    const resultado = await actualizarEstadoPorTelefono(telefono, nuevoEstado, contexto);
    if (resultado.ambiguo) {
      return responder(res, 'Tienes varias citas. Responde directamente al recordatorio de la cita que deseas confirmar o cancelar.');
    }
    if (!resultado.affectedRows) return responder(res);
    console.log(`WhatsApp: ${resultado.affectedRows} cita actualizada a ${nuevoEstado}`);
    return responder(res);
  } catch (error) {
    console.error('No se pudo procesar el webhook de WhatsApp:', error.message);
    return res.sendStatus(500);
  }
};
export {
    recibirRespuestaWhatsapp
}
