export class UserHours {
    constructor(
        private weekHours: number = 0,
        private currentWeekHours: number = 0
    ) {}

    addWeekHours(hours: number): void {
        if (hours < 0) {
            throw new Error("Horas não podem ser negativas");
        }
        this.weekHours += hours;
        this.currentWeekHours += hours;
    }

    setWeekHours(hours: number): void {
        if (hours < 0) {
            throw new Error("Horas não podem ser negativas");
        }
        this.weekHours = hours;
    }

    setCurrentWeekHours(hours: number): void {
        if (hours < 0) {
            throw new Error("Horas não podem ser negativas");
        }
        this.currentWeekHours = hours;
    }

    resetCurrentWeekHours(): void {
        this.currentWeekHours = 0;
    }

    getWeekHours(): number {
        return this.weekHours;
    }

    getCurrentWeekHours(): number {
        return this.currentWeekHours;
    }

    getHoursProgress(): number {
        if (this.weekHours === 0) return 0;
        return (this.currentWeekHours / this.weekHours) * 100;
    }

    hasCompletedWeekHours(): boolean {
        return this.currentWeekHours >= this.weekHours;
    }

    getRemainingHours(): number {
        return Math.max(0, this.weekHours - this.currentWeekHours);
    }
}

