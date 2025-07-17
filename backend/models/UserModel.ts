import { prisma } from '@/lib/database/prisma';
import { User, UserCreateInput, UserUpdateInput } from '../types/user';
import bcrypt from "bcryptjs";
import { UserRole } from '@prisma/client';

export class UserModel {
  async findById(id: string): Promise<User | null> {
    return prisma.users.findUnique({ where: { id: Number(id) } }) as Promise<User | null>;
  }

  async findAll(): Promise<User[]> {
    return prisma.users.findMany() as Promise<User[]>;
  }

  async create(data: UserCreateInput): Promise<User> {
    // Ensure password is provided
    if (!data.password) {
      throw new Error("Password is required for user creation.");
    }
    
    data.password = await bcrypt.hash(data.password, 10);
    
    return prisma.users.create({ data: data as any }) as Promise<User>;
  }

  async update(id: string, data: UserUpdateInput): Promise<User> {
    return prisma.users.update({ where: { id: Number(id) }, data: data as any }) as Promise<User>;
  }

  async delete(id: string): Promise<User> {
    return prisma.users.delete({ where: { id: Number(id) } }) as Promise<User>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.users.findUnique({ where: { email } }) as Promise<User | null>;
  }
} 