import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Economy
      money: 500,
      moneyPerSecond: 0,
      totalEarnings: 0,
      
      // Train
      trainSpeed: 1,
      trainRunning: false,
      
      // Upgrades
      multiplier: 1,
      
      // Grid
      tiles: {
        '0,0': 'DEPOT'
      },
      
      // Game Mode
      mode: 'free', // 'free' o 'campaign'
      currentLevel: 0,
      
      // Offline earnings
      lastOnline: Date.now(),
      sessionStart: Date.now(),
      
      // Actions
      addMoney: (amount) => set((state) => ({
        money: state.money + amount,
        totalEarnings: state.totalEarnings + amount
      })),
      
      spendMoney: (amount) => {
        const state = get();
        if (state.money >= amount) {
          set({ money: state.money - amount });
          return true;
        }
        return false;
      },
      
      placeTile: (x, y, tileType, cost) => {
        const state = get();
        if (state.money >= cost) {
          set({
            tiles: { ...state.tiles, [`${x},${y}`]: tileType },
            money: state.money - cost
          });
          return true;
        }
        return false;
      },
      
      removeTile: (x, y) => {
        const key = `${x},${y}`;
        if (key === '0,0') return; // No permitir eliminar el depósito
        
        const state = get();
        const newTiles = { ...state.tiles };
        delete newTiles[key];
        set({ tiles: newTiles });
      },
      
      setTrainRunning: (running) => set({ trainRunning: running }),
      
      updateMoneyPerSecond: (amount) => set({ moneyPerSecond: amount }),
      
      buyUpgrade: (upgradeName, cost, effect) => {
        const state = get();
        if (state.money >= cost) {
          set({
            money: state.money - cost,
            [upgradeName]: state[upgradeName] + effect
          });
          return true;
        }
        return false;
      },
      
      buySpeedUpgrade: (cost, speedIncrease) => {
        const state = get();
        if (state.money >= cost) {
          set({
            money: state.money - cost,
            trainSpeed: state.trainSpeed + speedIncrease
          });
          return true;
        }
        return false;
      },
      
      buyMultiplierUpgrade: (cost, multiplierIncrease) => {
        const state = get();
        if (state.money >= cost) {
          set({
            money: state.money - cost,
            multiplier: state.multiplier + multiplierIncrease
          });
          return true;
        }
        return false;
      },
      
      setMode: (mode) => set({ mode }),
      
      setLevel: (level) => set({ currentLevel: level }),
      
      calculateOfflineEarnings: () => {
        const state = get();
        const now = Date.now();
        const timeAway = Math.floor((now - state.lastOnline) / 1000); // segundos
        
        if (timeAway > 60 && state.trainRunning) {
          const maxOfflineTime = 3600; // 1 hora máximo
          const actualTime = Math.min(timeAway, maxOfflineTime);
          const earnings = Math.floor((state.moneyPerSecond * actualTime) * 0.5); // 50% de eficiencia offline
          
          if (earnings > 0) {
            set({
              money: state.money + earnings,
              totalEarnings: state.totalEarnings + earnings,
              lastOnline: now
            });
            return earnings;
          }
        }
        
        set({ lastOnline: now });
        return 0;
      },
      
      // Métodos para el sistema de saves
      loadFromSlot: (slotData) => {
        set({
          money: slotData.money || 500,
          totalEarnings: slotData.totalEarnings || 0,
          tiles: slotData.tiles || { '0,0': 'DEPOT' },
          trainRunning: slotData.trainRunning || false,
          moneyPerSecond: slotData.moneyPerSecond || 0,
          trainSpeed: slotData.trainSpeed || 1,
          multiplier: slotData.multiplier || 1,
          currentLevel: slotData.currentLevel || 0,
          sessionStart: Date.now(),
          lastOnline: Date.now()
        });
      },
      
      getCurrentSaveData: () => {
        const state = get();
        const playtime = Math.floor((Date.now() - state.sessionStart) / 1000);
        
        return {
          money: state.money,
          totalEarnings: state.totalEarnings,
          tiles: state.tiles,
          trainRunning: state.trainRunning,
          moneyPerSecond: state.moneyPerSecond,
          trainSpeed: state.trainSpeed,
          multiplier: state.multiplier,
          currentLevel: state.currentLevel,
          playtime: playtime
        };
      },
      
      resetGame: () => {
        set({
          money: 500,
          moneyPerSecond: 0,
          totalEarnings: 0,
          trainSpeed: 1,
          trainRunning: false,
          multiplier: 1,
          tiles: { '0,0': 'DEPOT' },
          currentLevel: 0,
          sessionStart: Date.now(),
          lastOnline: Date.now()
        });
      }
    }),
    {
      name: 'lovecorp-game-storage',
      partialize: (state) => ({
        // Solo guardar estos campos en localStorage (para compatibilidad)
        lastOnline: state.lastOnline
      })
    }
  )
);