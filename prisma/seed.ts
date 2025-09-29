import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { key: 'COORDENADOR', email: 'coordenador@lab.com', name: 'Coordenador', weekHours: 40 },
    { key: 'GERENTE', email: 'gerente@lab.com', name: 'Gerente', weekHours: 40 },
    { key: 'LABORATORISTA', email: 'laboratorista@lab.com', name: 'Laboratorista', weekHours: 40 },
    { key: 'PESQUISADOR', email: 'pesquisador@lab.com', name: 'Pesquisador', weekHours: 40 },
    { key: 'GERENTE_PROJETO', email: 'gerente_projeto@lab.com', name: 'Gerente de Projeto', weekHours: 40 },
    { key: 'COLABORADOR', email: 'colaborador@lab.com', name: 'Colaborador', weekHours: 20 },
  ];
  const password = await bcrypt.hash('123', 10);

  const createdUsers = [];
  for (const role of roles) {
    const user = await prisma.users.upsert({
      where: { email: role.email },
      update: {
        password,
        roles: [role.key as any],
        status: 'active',
        name: role.name,
        weekHours: role.weekHours,
      },
      create: {
        email: role.email,
        password,
        roles: [role.key as any],
        status: 'active',
        name: role.name,
        weekHours: role.weekHours,
      },
    });
    createdUsers.push(user);
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

  // Schedules (for coordenador user if exists)
  const coordenador = createdUsers.find(u => u.email === 'coordenador@lab.com');
  if (coordenador) {
    await prisma.user_schedules.createMany({
      data: [
        { userId: coordenador.id, dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
        { userId: coordenador.id, dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
      ],
      skipDuplicates: true,
    });

    // Work sessions (for coordenador)
    await prisma.work_sessions.createMany({
      data: [
        { userId: coordenador.id, userName: 'Coordenador', activity: 'Reunião', status: 'completed', startTime: new Date(), endTime: new Date(), duration: 60 },
        { userId: coordenador.id, userName: 'Coordenador', activity: 'Pesquisa', status: 'active', startTime: new Date() },
      ],
      skipDuplicates: true,
    });

    // Projects (for coordenador)
    const projects = await prisma.projects.createMany({
      data: [
        {
          name: 'Sistema de Gestão de Laboratório',
          description: 'Desenvolvimento de um sistema completo para gestão de laboratório de pesquisa',
          createdAt: new Date().toISOString(),
          createdBy: coordenador.id,
          leaderId: coordenador.id,
          status: 'active',
          links: [
            { label: 'GitHub', url: 'https://github.com/lab/sistema-gestao' },
            { label: 'Documentação', url: 'https://docs.lab.com' }
          ]
        },
        {
          name: 'Pesquisa em IA',
          description: 'Projeto de pesquisa em inteligência artificial aplicada',
          createdAt: new Date().toISOString(),
          createdBy: coordenador.id,
          leaderId: createdUsers.find(u => u.email === 'pesquisador@lab.com')?.id,
          status: 'active',
          links: [
            { label: 'Repositório', url: 'https://github.com/lab/ia-research' }
          ]
        },
        {
          name: 'Automação de Processos',
          description: 'Automação de processos administrativos do laboratório',
          createdAt: new Date().toISOString(),
          createdBy: coordenador.id,
          leaderId: createdUsers.find(u => u.email === 'gerente@lab.com')?.id,
          status: 'on_hold',
          links: []
        }
      ],
      skipDuplicates: true,
    });

    // Add members to projects
    const createdProjects = await prisma.projects.findMany({
      where: { createdBy: coordenador.id }
    });

    for (const project of createdProjects) {
      // Add all users as members to all projects
      for (const user of createdUsers) {
        await prisma.project_members.upsert({
          where: {
            projectId_userId: {
              projectId: project.id,
              userId: user.id
            }
          },
          update: {},
          create: {
            projectId: project.id,
            userId: user.id,
            roles: user.roles
          }
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 