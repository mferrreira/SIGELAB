
import { prisma } from "@/lib/database/prisma"
import Session from "../models/Session";
import { work_sessions } from "@prisma/client";


export interface ISessionRepository {
    findById(id: number): Promise<Session | null>;
    findAll(): Promise<Session[] | null>;
    findByUserId(userId: number): Promise<Session[] | null>;
    findActiveSessions(): Promise<Session[] | null>;
    create(session: Session): Promise<Session | null>;
    update(currentSession: Session, data: any): Promise<Session | null>;
    delete(id: number): Promise<Session | void>;
    findUserById(userId: number): Promise<{ id: number; name: string } | null>;
}

export default class SessionRepository implements ISessionRepository {

    async findById(id: number): Promise<Session | null> {
        let session = null;
        try {
            session = await prisma.work_sessions.findUnique({where: {id}});
            if(session)
                return Session.fromPrisma(session);
        } catch(e) {
            if(!session) 
                return null;
        }
        return null
    }

    async findAll(): Promise<Session[] | null> {
        const allSessions = await prisma.work_sessions.findMany();

        return allSessions.map( Session.fromPrisma );
    }

    async findByUserId(userId: number): Promise<Session[] | null> {
        const sessions = await prisma.work_sessions.findMany({where: {userId}})
        return sessions.map( Session.fromPrisma );
    }

    async findActiveSessions(): Promise<Session[] | null> {
        const activeSessions = await prisma.work_sessions.findMany({
            where: {endTime: null},
            include: {user: true},
        })

        return activeSessions.map( Session.fromPrisma )
    }

    async findSessionsByProjectLeader(leaderId: number) {

      const projects = await prisma.projects.findMany({ where: { createdBy: Number(leaderId) } });

      const projectIds = projects.map(p => p.id);

      const members = await prisma.project_members.findMany({ where: { projectId: { in: projectIds } } });
      const userIds = members.map(m => m.userId);

      return await prisma.work_sessions.findMany({ where: { userId: { in: userIds } } });
    }

    async update(session: Session): Promise<Session> {
    session.updatedAt = new Date();

    const saved = await prisma.work_sessions.update({
        where: { id: session.id },
        data: session.toPrisma(),
    });

    return Session.fromPrisma(saved);
    }

    async create(session: Session): Promise<Session> {
        const activeSession = await prisma.work_sessions.findFirst({
            where: {
                userId: session.userId,
                status: "active",
            }
        });

        if (activeSession) 
            return Session.fromPrisma(activeSession);

        if (!session.startTime)
            session.startTime = new Date()

        const data = session.toPrisma()
        const created = await prisma.work_sessions.create({ data })
        return Session.fromPrisma(created)

    }

    async delete(id: number): Promise<Session | void> {
        const deleted = await prisma.work_sessions.delete({ where: { id } });
        return Session.fromPrisma(deleted);
    }

    async findUserById(userId: number): Promise<{ id: number; name: string } | null> {
        const user = await prisma.users.findUnique({ 
            where: { id: userId },
            select: { id: true, name: true }
        });
        return user;
    }
}