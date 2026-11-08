import { PrismaClient, Especie, Tamano, EstadoAnimal } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rocky = await prisma.animal.create({
    data: {
      nombre: 'Rocky',
      especie: Especie.PERRO,
      edadAproxMeses: 24,
      tamano: Tamano.MEDIANO,
      estadoSalud: 'Recuperado de desnutrición, vacunas al día',
      requierePatio: true,
      sociablePerros: true,
      sociableGatos: false,
      necesitaMedicacion: false,
      estado: EstadoAnimal.RESCATADO,
    },
  });

  const milo = await prisma.animal.create({
    data: {
      nombre: 'Milo',
      especie: Especie.GATO,
      edadAproxMeses: 12,
      tamano: Tamano.CHICO,
      estadoSalud: 'Tratamiento antibiótico por herida superficial',
      requierePatio: false,
      sociablePerros: false,
      sociableGatos: true,
      necesitaMedicacion: true,
      estado: EstadoAnimal.RESCATADO,
    },
  });

  console.log(`[OK] Creados exitosamente: ${rocky.nombre} (${rocky.id}) y ${milo.nombre} (${milo.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });