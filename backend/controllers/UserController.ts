import { UserModel } from '../models/UserModel';
import { UserCreateInput, UserUpdateInput } from '../types/user';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from "bcryptjs";
import { validateEmail, validateRole } from '@/lib/utils/utils';
import { prisma } from "@/lib/database/prisma";
import { parseTimeToMinutes, validateTimeOrder, validateRequiredFields } from '@/lib/utils/utils';

export class UserController {
  public userModel = new UserModel();

  async getUser(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const user = await this.userModel.findById(id as string);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  }

  async getAllUsers(req: NextApiRequest, res: NextApiResponse) {
    const users = await this.userModel.findAll();
    return res.json(users);
  }

  async createUser(req: NextApiRequest, res: NextApiResponse) {
    const data: UserCreateInput = req.body;
    const user = await this.userModel.create(data);
    return res.status(201).json(user);
  }

  async updateUser(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const data: UserUpdateInput = req.body;
    const user = await this.userModel.update(id as string, data);
    return res.json(user);
  }

  async deleteUser(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    await this.userModel.delete(id as string);
    return res.status(204).end();
  }

  async updateUserStatus(id: string, action: 'approve' | 'reject') {
    const status = action === 'approve' ? 'active' : 'rejected';
    return this.userModel.update(id, { status });
  }

  async addPoints(id: string, points: number) {
    const user = await this.userModel.findById(id);
    if (!user) throw new Error('Usuário não encontrado');
    const newPoints = (user.points || 0) + points;
    return this.userModel.update(id, { points: newPoints });
  }
}