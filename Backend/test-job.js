import 'dotenv/config';

const { ejecutarRecordatorios } = await import('./SRC/Controllers/Recordatorio.controller.js');

try {
  await ejecutarRecordatorios();
  console.log('Prueba de recordatorios terminada.');
} catch (error) {
  console.error('La prueba de recordatorios fallo:', error);
  process.exitCode = 1;
} finally {
  process.exit();
}