export class UserPoints {
    constructor(
        private points: number = 0,
        private completedTasks: number = 0
    ) {}

    addPoints(points: number): void {
        // Permitir valores negativos para penalizações
        this.points += points;
        
        // Garantir que o total não fique negativo (mínimo 0)
        if (this.points < 0) {
            this.points = 0;
        }
    }

    /**
     * Aplica penalização permitindo que os pontos finais sejam negativos
     * Usado para penalizações por atraso em tasks
     */
    applyPenalty(points: number): void {
        this.points += points; // Permite valores negativos finais
    }

    removePoints(points: number): void {
        if (points < 0) {
            throw new Error("Pontos não podem ser negativos");
        }
        if (this.points < points) {
            throw new Error("Usuário não possui pontos suficientes");
        }
        this.points -= points;
    }

    setPoints(points: number): void {
        if (points < 0) {
            throw new Error("Pontos não podem ser negativos");
        }
        this.points = points;
    }

    incrementCompletedTasks(): void {
        this.completedTasks += 1;
    }

    setCompletedTasks(count: number): void {
        if (count < 0) {
            throw new Error("Número de tarefas não pode ser negativo");
        }
        this.completedTasks = count;
    }

    // Getters
    getPoints(): number {
        return this.points;
    }

    getCompletedTasks(): number {
        return this.completedTasks;
    }

    getPointsLevel(): string {
        if (this.points >= 10000) return 'Lenda';
        if (this.points >= 5000) return 'Mestre';
        if (this.points >= 2000) return 'Expert';
        if (this.points >= 1000) return 'Avançado';
        if (this.points >= 500) return 'Intermediário';
        if (this.points >= 100) return 'Iniciante';
        return 'Novato';
    }

    hasEnoughPoints(requiredPoints: number): boolean {
        return this.points >= requiredPoints;
    }
}

