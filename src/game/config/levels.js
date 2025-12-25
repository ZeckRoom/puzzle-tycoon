// src/game/config/levels.js
export const CAMPAIGN_LEVELS = [
    {
        id: 1,
        name: "Primera Ruta",
        description: "Conecta el depósito con una estación",
        gridSize: 5,
        startingMoney: 200,
        obstacles: [],
        goal: {
            type: 'money',
            target: 1000
        },
        reward: {
            money: 500,
            unlocks: ['CURVE_TR', 'CURVE_TL']
        }
    },
    {
        id: 2,
        name: "Cruce de Caminos",
        description: "Construye un circuito con 2 estaciones",
        gridSize: 6,
        startingMoney: 500,
        obstacles: [
            { x: 2, y: 2, type: 'rock' },
            { x: 3, y: 3, type: 'rock' }
        ],
        goal: {
            type: 'stations',
            target: 2
        },
        reward: {
            money: 1000,
            unlocks: ['CURVE_BR', 'CURVE_BL']
        }
    },
    {
        id: 3,
        name: "Eficiencia Máxima",
        description: "Gana $5,000 con máximo 10 vías",
        gridSize: 7,
        startingMoney: 1000,
        obstacles: [],
        maxTiles: 10,
        goal: {
            type: 'money',
            target: 5000
        },
        reward: {
            money: 2500,
            multiplier: 1.5
        }
    },
    {
        id: 4,
        name: "El Laberinto",
        description: "Navega entre obstáculos",
        gridSize: 8,
        startingMoney: 2000,
        obstacles: [
            { x: 2, y: 1, type: 'mountain' },
            { x: 3, y: 3, type: 'mountain' },
            { x: 5, y: 2, type: 'lake' },
            { x: 5, y: 5, type: 'lake' }
        ],
        goal: {
            type: 'stations',
            target: 4
        },
        reward: {
            money: 5000,
            trainSpeed: 2
        }
    },
    {
        id: 5,
        name: "Industrialización",
        description: "Crea un imperio ferroviario",
        gridSize: 10,
        startingMoney: 5000,
        obstacles: [],
        goal: {
            type: 'money_per_second',
            target: 100
        },
        reward: {
            money: 10000,
            unlocks: ['free_mode']
        }
    }
];