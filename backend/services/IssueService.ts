import { Issue, IssueStatus, IssuePriority } from '../models/Issue';
import { IssueRepository } from '../repositories/IssueRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from './HistoryService';

export class IssueService {
    private userRepo?: UserRepository;
    private historyService?: HistoryService;

    constructor(
        private issueRepo: IssueRepository,
        userRepo?: UserRepository,
        historyService?: HistoryService
    ) {
        this.userRepo = userRepo;
        this.historyService = historyService;
    }


    async create(data: any): Promise<Issue> {  
        if (!data.title || !data.title.trim()) {
            throw new Error("Título do issue é obrigatório");
        }
        if (!data.description || !data.description.trim()) {
            throw new Error("Descrição do issue é obrigatória");
        }
        if (!data.reporterId) {
            throw new Error("Reporter do issue é obrigatório");
        }

        const validPriorities: IssuePriority[] = ['low', 'medium', 'high', 'urgent'];
        if (data.priority && !validPriorities.includes(data.priority)) {
            throw new Error("Prioridade inválida");
        }

        const issue = Issue.create({
            title: data.title.trim(),
            description: data.description.trim(),
            priority: data.priority || 'medium',
            category: data.category || null,
            reporterId: data.reporterId,
            assigneeId: data.assigneeId || null,
            status: 'in_progress'
        });

        return await this.issueRepo.create(issue);
    }

    async findById(id: number): Promise<Issue | null> {
        return await this.issueRepo.findById(id);
    }

    async findAll(): Promise<Issue[]> {
        return await this.issueRepo.findAll();
    }

    async update(id: number, data: any): Promise<Issue> {
        const currentIssue = await this.issueRepo.findById(id);
        if (!currentIssue) {
            throw new Error("Issue não encontrado");
        }

        if (data.title !== undefined) {
            currentIssue.updateTitle(data.title);
        }
        if (data.description !== undefined) {
            currentIssue.updateDescription(data.description);
        }
        if (data.priority !== undefined) {
            currentIssue.updatePriority(data.priority);
        }
        if (data.category !== undefined) {
            currentIssue.updateCategory(data.category);
        }

        return await this.issueRepo.update(currentIssue);
    }

    async delete(id: number): Promise<void> {
        const issue = await this.issueRepo.findById(id);
        if (!issue) {
            throw new Error("Issue não encontrado");
        }

        await this.issueRepo.delete(id);
    }

    async assignIssue(issueId: number, assigneeId: number): Promise<Issue> {
        const issue = await this.issueRepo.findById(issueId);
        if (!issue) {
            throw new Error("Issue não encontrado");
        }

        if (this.userRepo) {
            const assignee = await this.userRepo.findById(assigneeId);
            if (!assignee) {
                throw new Error("Usuário não encontrado");
            }
        }

        const oldData = issue.toJSON();
        issue.assignTo(assigneeId);
        const updatedIssue = await this.issueRepo.update(issue);

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('ISSUE', issueId, issueId, oldData, updatedIssue.toJSON());
        }

        return updatedIssue;
    }

    async unassignIssue(issueId: number): Promise<Issue> {
        const issue = await this.issueRepo.findById(issueId);
        if (!issue) {
            throw new Error("Issue não encontrado");
        }

        const oldData = issue.toJSON();
        issue.unassign();
        const updatedIssue = await this.issueRepo.update(issue);

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('ISSUE', issueId, issueId, oldData, updatedIssue.toJSON());
        }

        return updatedIssue;
    }

    async startProgress(issueId: number): Promise<Issue> {
        const issue = await this.issueRepo.findById(issueId);
        if (!issue) {
            throw new Error("Issue não encontrado");
        }

        const oldData = issue.toJSON();
        issue.startProgress();
        const updatedIssue = await this.issueRepo.update(issue);

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('ISSUE', issueId, issueId, oldData, updatedIssue.toJSON());
        }

        return updatedIssue;
    }

    async resolveIssue(issueId: number, resolution?: string): Promise<Issue> {
        const issue = await this.issueRepo.findById(issueId);
        if (!issue) {
            throw new Error("Issue não encontrado");
        }

        const oldData = issue.toJSON();
        issue.resolve();
        
        if (resolution) {
            issue.setResolution(resolution);
        }

        const updatedIssue = await this.issueRepo.update(issue);

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('ISSUE', issueId, issueId, oldData, updatedIssue.toJSON());
        }

        return updatedIssue;
    }

    async closeIssue(issueId: number): Promise<Issue> {
        const issue = await this.issueRepo.findById(issueId);
        if (!issue) {
            throw new Error("Issue não encontrado");
        }

        const oldData = issue.toJSON();
        issue.close();
        const updatedIssue = await this.issueRepo.update(issue);

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('ISSUE', issueId, issueId, oldData, updatedIssue.toJSON());
        }

        return updatedIssue;
    }

    async reopenIssue(issueId: number): Promise<Issue> {
        const issue = await this.issueRepo.findById(issueId);
        if (!issue) {
            throw new Error("Issue não encontrado");
        }

        const oldData = issue.toJSON();
        issue.reopen();
        const updatedIssue = await this.issueRepo.update(issue);

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('ISSUE', issueId, issueId, oldData, updatedIssue.toJSON());
        }

        return updatedIssue;
    }

    async searchIssues(query: {
        status?: any;
        priority?: any;
        category?: string;
        reporterId?: number;
        assigneeId?: number;
        search?: string;
    }): Promise<Issue[]> {
        return await this.issueRepo.findByStatus(query.status);
    }
}