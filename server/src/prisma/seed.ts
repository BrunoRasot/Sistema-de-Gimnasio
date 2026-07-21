import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHasheada = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.upsert({
    where: { dni: '00000000' },
    update: {
      email: 'bdbr230311@gmail.com',
      password: passwordHasheada,
    },
    create: {
      nombreUsuario: 'admin',
      email: 'bdbr230311@gmail.com',
      password: passwordHasheada,
      rol: 'ADMIN',
      dni: '00000000',
    },
  });

  console.log('Usuario Administrador creado o actualizado exitosamente:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });