import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const usersData = [
    { email: 'coordenador@lab.com', roles: ['COORDENADOR'], name: 'Coordenador', weekHours: 40 },
    { email: 'gerente@lab.com', roles: ['GERENTE'], name: 'Gerente', weekHours: 40 },
    { email: 'laboratorista@lab.com', roles: ['LABORATORISTA'], name: 'Laboratorista', weekHours: 40 },
    { email: 'pesquisador@lab.com', roles: ['PESQUISADOR'], name: 'Pesquisador', weekHours: 40 },
    { email: 'gerente_projeto@lab.com', roles: ['GERENTE_PROJETO'], name: 'Gerente de Projeto', weekHours: 40 },
    { email: 'colaborador@lab.com', roles: ['COLABORADOR'], name: 'Colaborador', weekHours: 20 },
  ];

  for (const user of usersData) {
    await prisma.users.upsert({
      where: { email: user.email },
      update: {
        roles: user.roles as any,
        name: user.name,
        weekHours: user.weekHours,
        status: 'active',
      },
      create: {
        email: user.email,
        roles: user.roles as any,
        name: user.name,
        weekHours: user.weekHours,
        status: 'active',
      },
    });
  }

  await prisma.$disconnect();
}

main(); 