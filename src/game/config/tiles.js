// src/game/config/tiles.js
export const TILE_TYPES = {
    STRAIGHT_H: {
        id: 'straight_h',
        name: 'Vía Horizontal',
        cost: 50,
        connects: { left: true, right: true },
        rotation: 0,
        color: 0xf39c12
    },
    STRAIGHT_V: {
        id: 'straight_v',
        name: 'Vía Vertical',
        cost: 50,
        connects: { up: true, down: true },
        rotation: 90,
        color: 0xf39c12
    },
    CURVE_TR: {
        id: 'curve_tr',
        name: 'Curva ↱',
        cost: 75,
        connects: { up: true, right: true },
        rotation: 0,
        color: 0xe67e22
    },
    CURVE_TL: {
        id: 'curve_tl',
        name: 'Curva ↰',
        cost: 75,
        connects: { up: true, left: true },
        rotation: 270,
        color: 0xe67e22
    },
    CURVE_BR: {
        id: 'curve_br',
        name: 'Curva ↳',
        cost: 75,
        connects: { down: true, right: true },
        rotation: 90,
        color: 0xe67e22
    },
    CURVE_BL: {
        id: 'curve_bl',
        name: 'Curva ↲',
        cost: 75,
        connects: { down: true, left: true },
        rotation: 180,
        color: 0xe67e22
    },
    STATION: {
        id: 'station',
        name: 'Estación',
        cost: 200,
        connects: { left: true, right: true },
        earningsPerPass: 100,
        color: 0x27ae60
    },
    DEPOT: {
        id: 'depot',
        name: 'Depósito',
        cost: 0,
        connects: { left: true, right: true, up: true, down: true },
        color: 0x3498db
    }
};

export const TILE_SELECTOR = [
    'STRAIGHT_H',
    'STRAIGHT_V',
    'CURVE_TR',
    'CURVE_TL',
    'CURVE_BR',
    'CURVE_BL',
    'STATION'
];  