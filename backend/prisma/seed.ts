import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@patitasdelsur.org';

  const existingAdmin = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('AdminPatitas2026!', saltRounds);

    const admin = await prisma.usuario.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        nombre: 'Coordinador General - Patitas del Sur',
        telefono: '+5493510001122',
        rol: Rol.ADMIN,
      },
    });

    console.log(`[SEED] Usuario ADMIN creado exitosamente: ${admin.email}`);
  } else {
    console.log('[SEED] El usuario ADMIN ya existe en la base de datos.');
  }
}

main()
  .catch((e) => {
    console.error('[SEED ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });