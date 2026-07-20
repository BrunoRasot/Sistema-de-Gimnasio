import 'dotenv/config';
import app from './app.js';
import { iniciarVerificadorMembresias } from './jobs/verificadorMembresias.js';

const PORT = process.env.PORT || 3000;
iniciarVerificadorMembresias();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});