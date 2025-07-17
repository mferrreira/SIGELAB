import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'coordenador@lab.com';
  const password = await bcrypt.hash('123', 10);
  const name = 'Coordenador';
  const weekHours = 40;
  const role = 'COORDENADOR';

  const user = await prisma.users.upsert({
    where: { email },
    update: {
      password,
      roles: [role],
      status: 'active',
      name,
      weekHours,
    },
    create: {
      email,
      password,
      roles: [role],
      status: 'active',
      name,
      weekHours,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 