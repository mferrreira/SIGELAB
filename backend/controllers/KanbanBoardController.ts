import { KanbanBoardModel } from '../models/KanbanBoardModel';

export class KanbanBoardController {
  private kanbanBoardModel = new KanbanBoardModel();

  async getBoard(id: number) {
    return this.kanbanBoardModel.findById(id);
  }

  async getAllBoards() {
    return this.kanbanBoardModel.findAll();
  }

  async createBoard(data: any) {
    return this.kanbanBoardModel.create(data);
  }

  async updateBoard(id: number, data: any) {
    return this.kanbanBoardModel.update(id, data);
  }

  async deleteBoard(id: number) {
    return this.kanbanBoardModel.delete(id);
  }
} 