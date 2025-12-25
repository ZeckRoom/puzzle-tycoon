// src/game/systems/IdleEconomySystem.js
export class IdleEconomySystem {
    constructor(gameStore) {
        this.store = gameStore;
        this.tickRate = 1000; // 1 segundo
        this.interval = null;
    }

    start() {
        if (this.interval) return;

        this.interval = setInterval(() => {
            this.tick();
        }, this.tickRate);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    tick() {
        const state = this.store.getState();

        if (state.isTrainRunning && state.moneyPerSecond > 0) {
            // Generar dinero pasivo
            const earnings = state.moneyPerSecond / (1000 / this.tickRate);
            this.store.getState().addMoney(earnings);
        }

        // Aplicar bonos de managers
        this.applyManagerBonuses();
    }

    applyManagerBonuses() {
        const state = this.store.getState();

        state.managers.forEach(manager => {
            if (manager.type === 'auto_collect') {
                // Auto-recolectar de estaciones
                const bonus = manager.level * 10;
                this.store.getState().addMoney(bonus);
            }
        });
    }

    calculateOfflineEarnings(timeAway) {
        const state = this.store.getState();

        // Cap offline earnings a 24 horas para balanceo
        const maxOfflineTime = 86400; // 24h en segundos
        const cappedTime = Math.min(timeAway, maxOfflineTime);

        // 50% de eficiencia offline (balanceo)
        const offlineMultiplier = 0.5;

        return cappedTime * state.moneyPerSecond * offlineMultiplier;
    }
}