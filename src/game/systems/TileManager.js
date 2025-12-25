// src/game/systems/TileManager.js
export const TILE_TYPES = {
    STRAIGHT_H: {
        sprite: 'track_h',
        connects: { left: true, right: true },
        cost: 50
    },
    STRAIGHT_V: {
        sprite: 'track_v',
        connects: { up: true, down: true },
        cost: 50
    },
    CURVE_TR: {
        sprite: 'curve_tr',
        connects: { up: true, right: true },
        cost: 75
    },
    STATION: {
        sprite: 'station',
        connects: { left: true, right: true },
        earningsPerPass: 100
    }
};

export class TileManager {
    constructor(scene, store) {
        this.scene = scene;
        this.store = store;
    }

    validatePath() {
        // Implementar algoritmo de pathfinding
        // Verificar que los tiles conecten correctamente
        // Retornar array de posiciones para el tren
    }
}