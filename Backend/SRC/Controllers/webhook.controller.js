import { actualizarEstadoPorTelefono } from "../Models/citas.model.js";

const recibirRespuestaWhatsapp = async (req, res) => {
  const mensaje = String(req.body?.Body || '').trim().toLowerCase();
  const from = String(req.body?.From || '').trim();
  let telefono = from.replace(/^whatsapp:/i, '').replace(/\D/g, '');
  if (telefono.startsWith('52') && telefono.length > 10) {
    telefono = telefono.slice(-10);
  }

  if (!mensaje || !telefono) {
    return res.status(400).type('text/xml').send('<Response><Message>Solicitud invalida.</Message></Response>');
  }
  
  const nuevoEstado = mensaje.includes('confirmo') ? 'confirmada'
                     : mensaje.includes('cancelo') ? 'cancelada'
                     : null;

  if (nuevoEstado) {
    const resultado = await actualizarEstadoPorTelefono(telefono, nuevoEstado);
    console.log(`WhatsApp: ${resultado.affectedRows} cita(s) actualizada(s) para ${telefono}`);
  }

  res.type('text/xml').status(200).send('<Response></Response>');
};
export {
    recibirRespuestaWhatsapp
}
