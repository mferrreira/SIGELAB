import { UserController } from './UserController';
import { validateRole } from '../../contexts/utils';
import { prisma } from '@/lib/prisma';

export class AdminController extends UserController {
  async approveUser(id: string) {
    const user = await prisma.users.update({
      where: { id: Number(id) },
      data: { status: 'active' },
    });
    return user;
  }

  async rejectUser(id: string) {
    const user = await prisma.users.update({
      where: { id: Number(id) },
      data: { status: 'rejected' },
    });
    return user;
  }

  async assignRole(id: string, role: string) {
    const roleValidation = validateRole(role);
    if (!roleValidation.valid) {
      throw new Error(roleValidation.error);
    }
    const user = await prisma.users.update({
      where: { id: Number(id) },
      data: { role },
    });
    return user;
  }

  async removeUser(id: string) {
    return prisma.users.delete({ where: { id: Number(id) } });
  }
} 