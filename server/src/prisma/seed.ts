import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { passwordSeguraSchema } from '../schemas/index.js';

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordInicial = env.ADMIN_INITIAL_PASSWORD;
  const passwordValida = passwordSeguraSchema.safeParse(passwordInicial);
  if (!passwordValida.success) {
    throw new Error(`ADMIN_INITIAL_PASSWORD inválida: ${passwordValida.error.issues[0]?.message}`);
  }
  const passwordHasheada = await bcrypt.hash(passwordValida.data, 12);
  const datosAdmin = {
    nombres: 'Italo Bruno',
    apellidos: 'Ramos Sotomayor',
    dni: '72708899',
    email: 'bdbr230311@gmail.com',
    nombreUsuario: 'Bruno',
    password: passwordHasheada,
    rol: 'ADMIN' as const,
    cargo: 'Administrador',
    estadoLaboral: 'Activo' as const,
    estadoCuenta: 'Activa' as const,
    activo: true,
  };

  const coincidencias = await prisma.usuario.findMany({
    where: {
      OR: [
        { dni: datosAdmin.dni },
        { email: datosAdmin.email },
        { nombreUsuario: datosAdmin.nombreUsuario },
      ],
    },
  });

  const existente =
    coincidencias.find((usuario) => usuario.dni === datosAdmin.dni) ??
    coincidencias.find((usuario) => usuario.nombreUsuario === datosAdmin.nombreUsuario) ??
    coincidencias.find((usuario) => usuario.email === datosAdmin.email);

  const conflictos = coincidencias.filter((usuario) => usuario.id !== existente?.id);
  const conflictoNoArchivable = conflictos.find(
    (usuario) => usuario.activo || usuario.dni !== '00000000' || usuario.nombreUsuario !== 'admin',
  );
  if (conflictoNoArchivable) {
    throw new Error('Existen usuarios activos distintos con el DNI, correo o nombre solicitado.');
  }

  const admin = await prisma.$transaction(async (tx) => {
    for (const conflicto of conflictos) {
      await tx.usuario.update({
        where: { id: conflicto.id },
        data: {
          email: `admin-archivado-${conflicto.id}@invalid.local`,
          nombreUsuario: `admin-archivado-${conflicto.id}`,
        },
      });
    }

    const usuario = existente
      ? await tx.usuario.update({ where: { id: existente.id }, data: datosAdmin })
      : await tx.usuario.create({ data: datosAdmin });
    await tx.refreshToken.deleteMany({ where: { usuarioId: usuario.id } });
    return usuario;
  });

  console.log(`Administrador preparado correctamente: ${admin.nombreUsuario} (ID ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
