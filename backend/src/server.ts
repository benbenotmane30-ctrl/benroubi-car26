import 'dotenv/config';
import { app } from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Benroubi Car API — Port ${PORT}`);
  console.log(`📧 Destinataire emails : ${env.DEST_EMAIL}`);
  console.log(`🌍 Frontend autorisé  : ${env.FRONTEND_URL}`);
  console.log(`🛠️  Admin autorisé     : ${env.ADMIN_URL}`);
  console.log(`👤 Admin user        : ${env.ADMIN_USER}`);
});
