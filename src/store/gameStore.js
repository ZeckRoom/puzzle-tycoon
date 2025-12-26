import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGameStore = create(
    persist(
        (set, get) => ({
            // Economy
            money: 500,
            moneyPerSecond: 0,
            totalEarnings: 0,

            // Grid & Tiles
            gridSize: 8,
            tiles: {},

            // Train
            trainSpeed: 1,
            trainLevel: 1,
            isTrainRunning: false,

            // Upgrades & Multipliers
            multiplier: 1,
            managers: [],

            // Campaign
            currentLevel: 1,
            mode: 'free', // 'free' | 'campaign'

            // Timestamps
            lastSave: Date.now(),

            // Actions
            addMoney: (amount) => set((state) => {
                const earned = amount * state.multiplier;
                return {
                    money: state.money + earned,
                    totalEarnings: state.totalEarnings + earned
                };
            }),

            placeTile: (x, y, type, cost) => {
                const state = get();
                if (state.money >= cost) {
                    set({
                        tiles: { ...state.tiles, [`${x},${y}`]: type },
                        money: state.money - cost
                    });
                    return true;
                }
                return false;
            },

            removeTile: (x, y) => set((state) => {
                const newTiles = { ...state.tiles };
                delete newTiles[`${x},${y}`];
                return { tiles: newTiles };
            }),

            setTrainRunning: (running) => set({ isTrainRunning: running }),

            buyUpgrade: (cost, upgradeFn) => {
                const state = get();
                if (state.money >= cost) {
                    upgradeFn(set, get);
                    set({ money: state.money - cost });
                    return true;
                }
                return false;
            },

            upgradeTrainSpeed: () => set((state) => ({
                trainSpeed: state.trainSpeed + 0.5,
                trainLevel: state.trainLevel + 1
            })),

            upgradeMultiplier: () => set((state) => ({
                multiplier: state.multiplier + 0.5
            })),

            hireManager: (manager) => set((state) => ({
                managers: [...state.managers, manager],
                multiplier: state.multiplier * manager.bonus
            })),

            // Offline earnings calculation
            calculateOfflineEarnings: () => {
                const state = get();
                const now = Date.now();
                const lastSave = state.lastSave || now;
                const secondsAway = Math.min((now - lastSave) / 1000, 86400); // Cap at 24h

                const offlineEarnings = secondsAway * state.moneyPerSecond;

                if (offlineEarnings > 0) {
                    set({
                        money: state.money + offlineEarnings,
                        totalEarnings: state.totalEarnings + offlineEarnings,
                        lastSave: now
                    });
                    return offlineEarnings;
                }

                set({ lastSave: now });
                return 0;
            },

            updateMoneyPerSecond: (value) => set({ moneyPerSecond: value }),

            setMode: (mode) => set({ mode }),

            resetGame: () => set({
                money: 100,
                tiles: {},
                trainSpeed: 1,
                trainLevel: 1,
                multiplier: 1,
                managers: [],
                isTrainRunning: false
            })
        }),
        {
            name: 'lovecorp-puzzle-tycoon',
            version: 1
        }
    )
);
