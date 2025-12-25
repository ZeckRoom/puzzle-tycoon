// src/game/systems/PathValidator.js
export class PathValidator {
    constructor(gridSize, tiles) {
        this.gridSize = gridSize;
        this.tiles = tiles;
    }

    // Directions mapping
    static DIRECTIONS = {
        up: { x: 0, y: -1, opposite: 'down' },
        down: { x: 0, y: 1, opposite: 'up' },
        left: { x: -1, y: 0, opposite: 'right' },
        right: { x: 1, y: 0, opposite: 'left' }
    };

    validateLoop(startX, startY) {
        const visited = new Set();
        const path = [];
        let current = { x: startX, y: startY };
        let direction = 'right'; // Dirección inicial

        const maxSteps = this.gridSize * this.gridSize;
        let steps = 0;

        while (steps < maxSteps) {
            const key = `${current.x},${current.y}`;

            // Si volvimos al inicio y tenemos al menos 3 tiles, loop completo
            if (steps > 2 && current.x === startX && current.y === startY) {
                return { valid: true, path, stations: this.countStations(path) };
            }

            // Detectar bucles infinitos
            if (visited.has(key)) {
                return { valid: false, path: [], stations: 0 };
            }

            visited.add(key);
            path.push({ ...current });

            const tile = this.tiles[key];
            if (!tile) {
                return { valid: false, path: [], stations: 0 };
            }

            // Encontrar la siguiente dirección válida
            const nextDir = this.getNextDirection(tile, direction);
            if (!nextDir) {
                return { valid: false, path: [], stations: 0 };
            }

            // Moverse al siguiente tile
            const offset = PathValidator.DIRECTIONS[nextDir];
            current = {
                x: current.x + offset.x,
                y: current.y + offset.y
            };
            direction = nextDir;
            steps++;
        }

        return { valid: false, path: [], stations: 0 };
    }

    getNextDirection(tile, incomingDir) {
        const tileData = tile.tileData;
        if (!tileData || !tileData.connects) return null;

        const oppositeIn = PathValidator.DIRECTIONS[incomingDir].opposite;

        // Buscar la salida (debe ser diferente a la entrada)
        for (const [dir, connected] of Object.entries(tileData.connects)) {
            if (connected && dir !== oppositeIn) {
                return dir;
            }
        }

        return null;
    }

    countStations(path) {
        return path.filter(pos => {
            const tile = this.tiles[`${pos.x},${pos.y}`];
            return tile?.tileData?.id === 'station';
        }).length;
    }

    // Generar coordenadas para movimiento suave (Catmull-Rom)
    generateSmoothPath(validationResult, tileSize) {
        if (!validationResult.valid) return [];

        const points = validationResult.path.map(p => ({
            x: p.x * tileSize + tileSize / 2,
            y: p.y * tileSize + tileSize / 2
        }));

        // Cerrar el loop
        if (points.length > 0) {
            points.push({ ...points[0] });
        }

        return points;
    }
}