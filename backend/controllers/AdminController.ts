import { UserController } from './UserController';
import { validateRoles } from '@/lib/utils/utils';
import { prisma } from '@/lib/database/prisma';
import { UserRole } from '@prisma/client';

export class AdminController extends UserController {
  async approveUser(id: number) {
    return await super.approveUser(id);
  }

  async rejectUser(id: number) {
    return await super.rejectUser(id);
  }

  async assignRole(id: string, roles: string[]) {
    const roleValidation = validateRoles(roles);
    if (!roleValidation.valid) {
      throw new Error(roleValidation.error);
    }
    const user = await prisma.users.update({
      where: { id: Number(id) },
      data: { roles: roles as UserRole[] },
    });
    return user;
  }

  async removeUser(id: string) {
    return prisma.users.delete({ where: { id: Number(id) } });
  }
} 