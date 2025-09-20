import { IssueService } from '../services/IssueService';
import { IssueRepository } from '../repositories/IssueRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from '../services/HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';
import { Issue } from '../models/Issue';

export class IssueController {
    private issueService: IssueService;

    constructor() {
        const issueRepo = new IssueRepository();
        const userRepo = new UserRepository();
        const historyRepo = new HistoryRepository();
        const historyService = new HistoryService(historyRepo, userRepo);
        this.issueService = new IssueService(issueRepo, userRepo, historyService);
    }

    // Issue CRUD operations
    async getIssue(id: number): Promise<Issue | null> {
        return await this.issueService.findById(id);
    }

    async getAllIssues(): Promise<Issue[]> {
        return await this.issueService.findAll();
    }

    async createIssue(data: any): Promise<Issue> {
        return await this.issueService.create(data);
    }

    async updateIssue(id: number, data: any): Promise<Issue> {
        return await this.issueService.update(id, data);
    }

    async deleteIssue(id: number): Promise<void> {
        return await this.issueService.delete(id);
    }

    // Issue workflow operations (used by API)
    async assignIssue(issueId: number, assigneeId: number): Promise<Issue> {
        return await this.issueService.assignIssue(issueId, assigneeId);
    }

    async unassignIssue(issueId: number): Promise<Issue> {
        return await this.issueService.unassignIssue(issueId);
    }

    async startProgress(issueId: number): Promise<Issue> {
        return await this.issueService.startProgress(issueId);
    }

    async resolveIssue(issueId: number, resolution?: string): Promise<Issue> {
        return await this.issueService.resolveIssue(issueId, resolution);
    }

    async closeIssue(issueId: number): Promise<Issue> {
        return await this.issueService.closeIssue(issueId);
    }

    async reopenIssue(issueId: number): Promise<Issue> {
        return await this.issueService.reopenIssue(issueId);
    }

    // Search method (used by API)
    async searchIssues(query: {
        status?: any;
        priority?: any;
        category?: string;
        reporterId?: number;
        assigneeId?: number;
        search?: string;
    }): Promise<Issue[]> {
        return await this.issueService.searchIssues(query);
    }
}