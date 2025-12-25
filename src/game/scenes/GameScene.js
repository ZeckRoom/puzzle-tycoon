// src/game/scenes/GameScene.js
import Phaser from 'phaser';
import { TILE_TYPES, TILE_SELECTOR } from '../config/tiles';
import { PathValidator } from '../systems/PathValidator';
import { Train } from '../entities/Train';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.GRID_SIZE = 8;
        this.TILE_SIZE = 64;
        this.selectedTileType = 0;
    }

    init(data) {
        this.gameStore = data.gameStore;
    }

    preload() {
        // Crear textura simple para partículas
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
    }

    create() {
        this.tiles = {};
        this.train = null;

        this.createGrid();
        this.createDepot();
        this.setupInput();
        this.createUI();

        // Sincronizar con Zustand store
        this.syncWithStore();
    }

    createGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xbdc3c7, 0.3);

        for (let i = 0; i <= this.GRID_SIZE; i++) {
            // Líneas verticales
            graphics.moveTo(i * this.TILE_SIZE, 0);
            graphics.lineTo(i * this.TILE_SIZE, this.GRID_SIZE * this.TILE_SIZE);

            // Líneas horizontales
            graphics.moveTo(0, i * this.TILE_SIZE);
            graphics.lineTo(this.GRID_SIZE * this.TILE_SIZE, i * this.TILE_SIZE);
        }

        graphics.strokePath();

        // Fondo con efecto blueprint
        const bg = this.add.rectangle(
            this.GRID_SIZE * this.TILE_SIZE / 2,
            this.GRID_SIZE * this.TILE_SIZE / 2,
            this.GRID_SIZE * this.TILE_SIZE,
            this.GRID_SIZE * this.TILE_SIZE,
            0xecf0f1,
            0.5
        );
        bg.setDepth(-1);
    }

    createDepot() {
        // Depósito en posición inicial (0,0)
        const depot = this.createTileSprite(0, 0, TILE_TYPES.DEPOT);
        this.tiles['0,0'] = { sprite: depot, tileData: TILE_TYPES.DEPOT };
    }

    createTileSprite(gridX, gridY, tileData) {
        const x = gridX * this.TILE_SIZE + this.TILE_SIZE / 2;
        const y = gridY * this.TILE_SIZE + this.TILE_SIZE / 2;

        const container = this.add.container(x, y);

        // Base del tile
        const base = this.add.rectangle(0, 0, this.TILE_SIZE * 0.9, this.TILE_SIZE * 0.9, tileData.color);
        base.setStrokeStyle(3, 0x2c3e50);
        container.add(base);

        // Indicadores de conexión
        if (tileData.connects) {
            const connSize = 8;
            if (tileData.connects.up) {
                container.add(this.add.rectangle(0, -this.TILE_SIZE / 2 + 5, connSize, 10, 0x2c3e50));
            }
            if (tileData.connects.down) {
                container.add(this.add.rectangle(0, this.TILE_SIZE / 2 - 5, connSize, 10, 0x2c3e50));
            }
            if (tileData.connects.left) {
                container.add(this.add.rectangle(-this.TILE_SIZE / 2 + 5, 0, 10, connSize, 0x2c3e50));
            }
            if (tileData.connects.right) {
                container.add(this.add.rectangle(this.TILE_SIZE / 2 - 5, 0, 10, connSize, 0x2c3e50));
            }
        }

        // Icono especial para estación
        if (tileData.id === 'station') {
            const icon = this.add.text(0, 0, '🏠', { fontSize: '24px' });
            icon.setOrigin(0.5);
            container.add(icon);
        }

        if (tileData.id === 'depot') {
            const icon = this.add.text(0, 0, '🏭', { fontSize: '24px' });
            icon.setOrigin(0.5);
            container.add(icon);
        }

        container.setInteractive(
            new Phaser.Geom.Rectangle(-this.TILE_SIZE / 2, -this.TILE_SIZE / 2, this.TILE_SIZE, this.TILE_SIZE),
            Phaser.Geom.Rectangle.Contains
        );

        return container;
    }

    setupInput() {
        // Click para colocar tiles
        this.input.on('pointerdown', (pointer) => {
            const gridX = Math.floor(pointer.x / this.TILE_SIZE);
            const gridY = Math.floor(pointer.y / this.TILE_SIZE);

            if (gridX < 0 || gridX >= this.GRID_SIZE || gridY < 0 || gridY >= this.GRID_SIZE) return;

            const key = `${gridX},${gridY}`;

            // No permitir sobrescribir el depósito
            if (key === '0,0') return;

            // Si ya existe un tile, eliminarlo
            if (this.tiles[key]) {
                this.tiles[key].sprite.destroy();
                delete this.tiles[key];
                this.gameStore.getState().removeTile(gridX, gridY);
                this.validateAndUpdatePath();
                return;
            }

            // Colocar nuevo tile
            const tileTypeName = TILE_SELECTOR[this.selectedTileType];
            const tileData = TILE_TYPES[tileTypeName];

            const success = this.gameStore.getState().placeTile(gridX, gridY, tileTypeName, tileData.cost);

            if (success) {
                const sprite = this.createTileSprite(gridX, gridY, tileData);
                this.tiles[key] = { sprite, tileData };
                this.validateAndUpdatePath();
            }
        });

        // Cambiar tipo de tile con teclado
        this.input.keyboard.on('keydown-SPACE', () => {
            this.selectedTileType = (this.selectedTileType + 1) % TILE_SELECTOR.length;
            this.updateTileSelector();
        });
    }

    validateAndUpdatePath() {
        const validator = new PathValidator(this.GRID_SIZE, this.tiles);
        const result = validator.validateLoop(0, 0);

        if (result.valid) {
            const smoothPath = validator.generateSmoothPath(result, this.TILE_SIZE);

            if (!this.train) {
                this.train = new Train(this, smoothPath, this.gameStore.getState().trainSpeed);
                this.train.start();
            } else {
                this.train.updatePath(smoothPath);
            }

            this.gameStore.getState().setTrainRunning(true);

            // Calcular ganancias por segundo
            const earnings = result.stations * 100 * this.gameStore.getState().multiplier;
            this.gameStore.getState().updateMoneyPerSecond(earnings);

        } else {
            if (this.train) {
                this.train.stop();
            }
            this.gameStore.getState().setTrainRunning(false);
            this.gameStore.getState().updateMoneyPerSecond(0);
        }
    }

    createUI() {
        // Selector de tiles
        this.tileSelector = this.add.text(
            10, 10,
            '',
            { fontSize: '16px', backgroundColor: '#2c3e50', padding: { x: 10, y: 5 } }
        );
        this.tileSelector.setDepth(100);
        this.updateTileSelector();
    }

    updateTileSelector() {
        const tileTypeName = TILE_SELECTOR[this.selectedTileType];
        const tileData = TILE_TYPES[tileTypeName];
        this.tileSelector.setText(`Tile: ${tileData.name} ($${tileData.cost}) [SPACE para cambiar]`);
    }

    syncWithStore() {
        // Cargar tiles desde el store
        const storedTiles = this.gameStore.getState().tiles;
        Object.entries(storedTiles).forEach(([key, typeName]) => {
            const [x, y] = key.split(',').map(Number);
            if (key !== '0,0') {
                const tileData = TILE_TYPES[typeName];
                const sprite = this.createTileSprite(x, y, tileData);
                this.tiles[key] = { sprite, tileData };
            }
        });

        this.validateAndUpdatePath();
    }

    update(time, delta) {
        if (this.train) {
            this.train.update(delta, (amount) => {
                this.gameStore.getState().addMoney(amount);
            });

            // Actualizar velocidad del tren
            const currentSpeed = this.gameStore.getState().trainSpeed;
            this.train.updateSpeed(currentSpeed);
        }
    }
}