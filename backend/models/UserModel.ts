import { prisma } from '../../lib/prisma';
import { User, UserCreateInput, UserUpdateInput } from '../types/user';
import bcrypt from "bcryptjs";

export class UserModel {
  async findById(id: string): Promise<User | null> {
    return prisma.users.findUnique({ where: { id: Number(id) } });
  }

  async findAll(): Promise<User[]> {
    return prisma.users.findMany();
  }

  async create(data: UserCreateInput): Promise<User> {
    // Hash password if present
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return prisma.users.create({ data });
  }

  async update(id: string, data: UserUpdateInput): Promise<User> {
    return prisma.users.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string): Promise<User> {
    return prisma.users.delete({ where: { id: Number(id) } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.users.findUnique({ where: { email } });
  }
} 