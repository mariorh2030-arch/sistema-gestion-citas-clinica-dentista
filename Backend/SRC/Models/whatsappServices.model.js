import twilio from "twilio";

const obtenerClienteTwilio = () => {
  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Faltan TWILIO_SID o TWILIO_AUTH_TOKEN en .env');
  }

  return twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN, { timeout: 15000 });
};

const obtenerDestinoWhatsapp = (telefono) => {
  const entrada = String(telefono || '').replace(/^whatsapp:/i, '').trim();
  if (!/^[+\d\s().-]+$/.test(entrada)) {
    throw new Error('Telefono de WhatsApp invalido');
  }
  const numero = entrada.replace(/\D/g, '');
  const codigoPais = String(process.env.TWILIO_COUNTRY_CODE || '').replace(/\D/g, '');
  if (numero.length < 10 || (numero.length === 10 && !codigoPais)) {
    throw new Error('Se requieren 10 digitos y TWILIO_COUNTRY_CODE para telefonos locales');
  }
  let numeroE164 = numero.length > 10 ? numero : `${codigoPais}${numero}`;

  // El identificador de WhatsApp mexicano observado en Twilio usa +521.
  if (/^52\d{10}$/.test(numeroE164)) {
    numeroE164 = `521${numeroE164.slice(2)}`;
  }
  if (!/^[1-9]\d{10,14}$/.test(numeroE164)) {
    throw new Error('Telefono internacional de WhatsApp invalido');
  }

  return `whatsapp:+${numeroE164}`;
};

// Plantilla preaprobada del Sandbox documentada en el quickstart de Twilio.
const PLANTILLA_CITAS_SANDBOX = 'HXb5b62575e6e4ff6129ad7c8efe1f983e';
let colaEnvios = Promise.resolve();
let ultimoEnvio = 0;
const obtenerPlantilla = async (cliente) => {
  const remitente = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  const sandbox = remitente === 'whatsapp:+14155238886';
  const sid = process.env.TWILIO_CONTENT_SID || (sandbox ? PLANTILLA_CITAS_SANDBOX : '');
  if (!/^HX[0-9a-f]{32}$/i.test(sid)) {
    throw new Error('Configura TWILIO_CONTENT_SID con una plantilla de citas aprobada');
  }
  if (sandbox) {
    if (sid !== PLANTILLA_CITAS_SANDBOX) {
      throw new Error('El Sandbox requiere su plantilla preaprobada de citas; elimina TWILIO_CONTENT_SID para usarla');
    }
    return { sid, fechaVariable: '1', horaVariable: '2' };
  }
  const [plantilla, aprobacion] = await Promise.all([
    cliente.content.v1.contents(sid).fetch(),
    cliente.content.v1.contents(sid).approvalFetch().fetch()
  ]);
  if (aprobacion.whatsapp?.status !== 'approved') {
    throw new Error(`La plantilla de WhatsApp no esta aprobada: ${aprobacion.whatsapp?.status || 'sin aprobacion'}`);
  }
  const variables = plantilla.variables || {};
  if ('date' in variables && 'time' in variables) return { sid, fechaVariable: 'date', horaVariable: 'time' };
  if ('1' in variables && '2' in variables) return { sid, fechaVariable: '1', horaVariable: '2' };
  throw new Error('La plantilla de citas debe tener variables date/time o 1/2 para fecha y hora');
};

const formatearFechaCita = (fecha) => {
  if (fecha instanceof Date && !Number.isNaN(fecha.getTime())) {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha))) throw new Error('Fecha de cita invalida');
  return String(fecha);
};

const enviarRecordatorio = async (telefono, nombre, fecha, hora, citaId) => {
  // Debe ser la URL publica exacta configurada en Twilio, terminada en /whatsapp.
  const webhookUrl = process.env.TWILIO_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('Falta TWILIO_WEBHOOK_URL (https://sandbar-energize-observant.ngrok-free.dev/whatsapp)');
  const callback = new URL(webhookUrl);
  if (callback.protocol !== 'https:' || callback.search || callback.hash || callback.username || callback.password) {
    throw new Error('TWILIO_WEBHOOK_URL debe ser HTTPS, sin credenciales, parametros ni fragmentos');
  }
  const fechaCita = formatearFechaCita(fecha);
  const horaCita = String(hora).slice(0, 5);
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horaCita) || !Number.isSafeInteger(Number(citaId)) || Number(citaId) <= 0) {
    throw new Error('Hora o identificador de cita invalido');
  }
  callback.searchParams.set('citaId', String(citaId));
  callback.searchParams.set('fecha', fechaCita);
  callback.searchParams.set('hora', horaCita);
  const cliente = obtenerClienteTwilio();
  const plantilla = await obtenerPlantilla(cliente);
  const parametros = {
    from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
    to: obtenerDestinoWhatsapp(telefono),
    contentSid: plantilla.sid,
    contentVariables: JSON.stringify({ [plantilla.fechaVariable]: fechaCita, [plantilla.horaVariable]: horaCita }),
    statusCallback: callback.toString()
  };
  const envio = colaEnvios.then(async () => {
    // Compartir el limite entre el cron y los envios al registrar una cita.
    const espera = Math.max(0, 3100 - (Date.now() - ultimoEnvio));
    if (espera) await new Promise(resolve => setTimeout(resolve, espera));
    ultimoEnvio = Date.now();
    return cliente.messages.create(parametros);
  });
  colaEnvios = envio.catch(() => {});
  return envio;
};

const obtenerContextoRespuesta = async (sid, from, to) => {
  if (!/^(?:SM|MM)[0-9a-f]{32}$/i.test(sid)) throw new Error('Referencia de mensaje invalida');
  const original = await obtenerClienteTwilio().messages(sid).fetch();
  if (original.direction !== 'outbound-api' ||
      obtenerDestinoWhatsapp(original.to) !== obtenerDestinoWhatsapp(from) ||
      original.from !== to) {
    throw new Error('El mensaje original no corresponde a esta conversacion');
  }
  // Las variables date/time se envian en formato estable, sin depender del idioma.
  const fecha = original.body?.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
  const hora = original.body?.match(/\b(?:[01]\d|2[0-3]):[0-5]\d\b/)?.[0];
  if (!fecha || !hora) throw new Error('No se pudo identificar la cita del mensaje original');
  return { fecha, hora };
};

export { enviarRecordatorio, obtenerDestinoWhatsapp, obtenerContextoRespuesta, formatearFechaCita };
