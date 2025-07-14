import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Users
  const roles = [
    'administrador_laboratorio',
    'laboratorista',
    'gerente_projeto',
    'voluntario',
  ];
  const password = await bcrypt.hash('123', 10);

  for (const role of roles) {
    await prisma.users.upsert({
      where: { email: `${role}@lab.com` },
      update: {
        password,
        role,
        status: 'active',
        name: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '),
        weekHours: 40,
      },
      create: {
        email: `${role}@lab.com`,
        password,
        role,
        status: 'active',
        name: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '),
        weekHours: 40,
      },
    });
  }

  // Rewards
  await prisma.rewards.createMany({
    data: [
      { name: 'Café', description: 'Uma xícara de café', price: 10, available: true },
      { name: 'Caneca', description: 'Caneca personalizada do laboratório', price: 50, available: true },
      { name: 'Camiseta', description: 'Camiseta do laboratório', price: 100, available: true },
    ],
    skipDuplicates: true,
  });

  // Schedules (for user 1)
  await prisma.user_schedules.createMany({
    data: [
      { userId: 1, dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
      { userId: 1, dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
    ],
    skipDuplicates: true,
  });

  // Work sessions (for user 1)
  await prisma.work_sessions.createMany({
    data: [
      { userId: 1, userName: 'Administrador Laboratorio', activity: 'Reunião', status: 'completed', startTime: new Date(), endTime: new Date(), duration: 60 },
      { userId: 1, userName: 'Administrador Laboratorio', activity: 'Pesquisa', status: 'active', startTime: new Date() },
    ],
    skipDuplicates: true,
  });

  console.log('Dummy data inserted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 