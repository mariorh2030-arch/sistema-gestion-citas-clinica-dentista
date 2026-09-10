import twilio from "twilio";

const obtenerClienteTwilio = () => {
  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Faltan TWILIO_SID o TWILIO_AUTH_TOKEN en .env');
  }

  return twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
};

const obtenerDestinoWhatsapp = (telefono) => {
  const numero = String(telefono).replace(/\D/g, '');
  const codigoPais = String(process.env.TWILIO_COUNTRY_CODE || '').replace(/\D/g, '');
  const numeroE164 = numero.length > 10 ? numero : `${codigoPais}${numero}`;

  if (!numeroE164 || numeroE164.length <= 10) {
    throw new Error('TWILIO_COUNTRY_CODE es obligatorio para teléfonos locales');
  }

  return `whatsapp:+${numeroE164}`;
};

const enviarRecordatorio = async (telefono, nombre, fecha, hora) => {
  return obtenerClienteTwilio().messages.create({
    from: 'whatsapp:+14155238886',
    to: obtenerDestinoWhatsapp(telefono),
    body: `Hola ${nombre}, te recordamos tu cita el ${fecha} a las ${hora}. Responde CONFIRMO o CANCELO.`
  });
};

export { enviarRecordatorio };