import Phaser from 'phaser';
import { TILE_TYPES, TILE_SELECTOR } from '../config/tiles';
import { PathValidator } from '../systems/PathValidator';
import { Train } from '../entities/Train';
import { useGameStore } from '../../store/gameStore.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.GRID_SIZE = 10;  // ← CAMBIADO DE 8 A 10
    this.TILE_SIZE = 64;
    this.selectedTileType = 0;
  }
  
  init(data) {
    // Ya no necesitamos data.gameStore
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
    this.createPreview();
    this.createUI();
    
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
    
    // Fondo de la celda con efecto de profundidad
    const cellBg = this.add.rectangle(0, 0, 
      this.TILE_SIZE * 0.95, 
      this.TILE_SIZE * 0.95, 
      0x8b7355, 0.3);
    cellBg.setStrokeStyle(1, 0x5a4a3a, 0.5);
    container.add(cellBg);
    
    // Base del tile (plataforma)
    const platform = this.add.rectangle(0, 0, 
      this.TILE_SIZE * 0.85, 
      this.TILE_SIZE * 0.85, 
      0x3d2817, 0.4);
    container.add(platform);
    
    // Dibujar los rieles según el tipo
    const graphics = this.add.graphics();
    graphics.lineStyle(4, tileData.color, 1);
    
    const railOffset = this.TILE_SIZE * 0.35;
    const railThickness = 3;
    
    // Vías según tipo de conexión
    if (tileData.connects.left && tileData.connects.right) {
      // Horizontal: dos líneas paralelas
      graphics.fillStyle(0x4a4a4a, 1);
      graphics.fillRect(-railOffset, -3, railOffset * 2, railThickness);
      graphics.fillRect(-railOffset, 3, railOffset * 2, railThickness);
      
      // Traviesas (sleepers)
      for (let i = -railOffset; i < railOffset; i += 8) {
        graphics.fillStyle(0x5a3d2b, 1);
        graphics.fillRect(i, -6, 4, 12);
      }
    }
    
    if (tileData.connects.up && tileData.connects.down) {
      // Vertical: dos líneas paralelas
      graphics.fillStyle(0x4a4a4a, 1);
      graphics.fillRect(-3, -railOffset, railThickness, railOffset * 2);
      graphics.fillRect(3, -railOffset, railThickness, railOffset * 2);
      
      // Traviesas
      for (let i = -railOffset; i < railOffset; i += 8) {
        graphics.fillStyle(0x5a3d2b, 1);
        graphics.fillRect(-6, i, 12, 4);
      }
    }
    
    // Curvas con arco suave
    if (tileData.connects.up && tileData.connects.right) {
      graphics.lineStyle(railThickness, 0x4a4a4a, 1);
      graphics.beginPath();
      graphics.arc(railOffset, -railOffset, railOffset, Math.PI, Math.PI * 1.5, false);
      graphics.strokePath();
      
      graphics.beginPath();
      graphics.arc(railOffset - 6, -railOffset + 6, railOffset - 6, Math.PI, Math.PI * 1.5, false);
      graphics.strokePath();
    }
    
    if (tileData.connects.up && tileData.connects.left) {
      graphics.lineStyle(railThickness, 0x4a4a4a, 1);
      graphics.beginPath();
      graphics.arc(-railOffset, -railOffset, railOffset, Math.PI * 1.5, Math.PI * 2, false);
      graphics.strokePath();
      
      graphics.beginPath();
      graphics.arc(-railOffset + 6, -railOffset + 6, railOffset - 6, Math.PI * 1.5, Math.PI * 2, false);
      graphics.strokePath();
    }
    
    if (tileData.connects.down && tileData.connects.right) {
      graphics.lineStyle(railThickness, 0x4a4a4a, 1);
      graphics.beginPath();
      graphics.arc(railOffset, railOffset, railOffset, Math.PI * 0.5, Math.PI, false);
      graphics.strokePath();
      
      graphics.beginPath();
      graphics.arc(railOffset - 6, railOffset - 6, railOffset - 6, Math.PI * 0.5, Math.PI, false);
      graphics.strokePath();
    }
    
    if (tileData.connects.down && tileData.connects.left) {
      graphics.lineStyle(railThickness, 0x4a4a4a, 1);
      graphics.beginPath();
      graphics.arc(-railOffset, railOffset, railOffset, 0, Math.PI * 0.5, false);
      graphics.strokePath();
      
      graphics.beginPath();
      graphics.arc(-railOffset + 6, railOffset - 6, railOffset - 6, 0, Math.PI * 0.5, false);
      graphics.strokePath();
    }
    
    container.add(graphics);
    
    // Icono especial para estación
    if (tileData.id === 'station') {
      const stationBg = this.add.rectangle(0, 0, this.TILE_SIZE * 0.7, this.TILE_SIZE * 0.7, 0x27ae60);
      stationBg.setStrokeStyle(3, 0x2ecc71);
      container.add(stationBg);
      
      const icon = this.add.text(0, 0, '🏠', { fontSize: '28px' });
      icon.setOrigin(0.5);
      container.add(icon);
    }
    
    if (tileData.id === 'depot') {
      const depotBg = this.add.rectangle(0, 0, this.TILE_SIZE * 0.7, this.TILE_SIZE * 0.7, 0x3498db);
      depotBg.setStrokeStyle(3, 0x2980b9);
      container.add(depotBg);
      
      const icon = this.add.text(0, 0, '🏭', { fontSize: '28px' });
      icon.setOrigin(0.5);
      container.add(icon);
    }
    
    // Hover effect
    container.setInteractive(
      new Phaser.Geom.Rectangle(-this.TILE_SIZE / 2, -this.TILE_SIZE / 2, this.TILE_SIZE, this.TILE_SIZE),
      Phaser.Geom.Rectangle.Contains
    );
    
    container.on('pointerover', () => {
      container.setScale(1.05);
    });
    
    container.on('pointerout', () => {
      container.setScale(1);
    });
    
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
        useGameStore.getState().removeTile(gridX, gridY);
        this.validateAndUpdatePath();
        return;
      }
      
      // Colocar nuevo tile
      const tileTypeName = TILE_SELECTOR[this.selectedTileType];
      const tileData = TILE_TYPES[tileTypeName];
      
      const success = useGameStore.getState().placeTile(gridX, gridY, tileTypeName, tileData.cost);
      
      if (success) {
        const sprite = this.createTileSprite(gridX, gridY, tileData);
        this.tiles[key] = { sprite, tileData };
        this.validateAndUpdatePath();
      }
    });
  }
  
  createPreview() {
    // Preview fantasma que sigue al cursor
    this.previewContainer = this.add.container(0, 0);
    this.previewContainer.setAlpha(0.6);
    this.previewContainer.setDepth(1000);
    this.previewContainer.setVisible(false);
    
    this.updatePreview();
    
    this.input.on('pointermove', (pointer) => {
      const gridX = Math.floor(pointer.x / this.TILE_SIZE);
      const gridY = Math.floor(pointer.y / this.TILE_SIZE);
      
      if (gridX >= 0 && gridX < this.GRID_SIZE && gridY >= 0 && gridY < this.GRID_SIZE) {
        const x = gridX * this.TILE_SIZE + this.TILE_SIZE / 2;
        const y = gridY * this.TILE_SIZE + this.TILE_SIZE / 2;
        
        this.previewContainer.setPosition(x, y);
        this.previewContainer.setVisible(true);
      } else {
        this.previewContainer.setVisible(false);
      }
    });
  }
  
  updateSelectedTile(tileIndex) {
    this.selectedTileType = tileIndex;
    this.updatePreview();
  }
  
  updatePreview() {
    this.previewContainer.removeAll(true);
    
    const tileTypeName = TILE_SELECTOR[this.selectedTileType];
    const tileData = TILE_TYPES[tileTypeName];
    
    const tempSprite = this.createTileSprite(0, 0, tileData);
    this.previewContainer.add(tempSprite);
  }
  
  validateAndUpdatePath() {
    const validator = new PathValidator(this.GRID_SIZE, this.tiles);
    const result = validator.validateLoop(0, 0);
    
    if (result.valid) {
      const smoothPath = validator.generateSmoothPath(result, this.TILE_SIZE);
      
      if (!this.train) {
        this.train = new Train(this, smoothPath, useGameStore.getState().trainSpeed);
        this.train.start();
      } else {
        this.train.updatePath(smoothPath);
      }
      
      useGameStore.getState().setTrainRunning(true);
      
      // Calcular ganancias por segundo
      const earnings = result.stations * 100 * useGameStore.getState().multiplier;
      useGameStore.getState().updateMoneyPerSecond(earnings);
      
    } else {
      if (this.train) {
        this.train.stop();
      }
      useGameStore.getState().setTrainRunning(false);
      useGameStore.getState().updateMoneyPerSecond(0);
    }
  }
  
  createUI() {
    // UI mínima en Phaser (ya tenemos React para el resto)
    this.uiText = this.add.text(
      10, 10,
      '',
      { fontSize: '12px', backgroundColor: '#2c3e50', padding: { x: 5, y: 3 } }
    );
    this.uiText.setDepth(100);
  }
  
  syncWithStore() {
    // Cargar tiles desde el store
    const storedTiles = useGameStore.getState().tiles;
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
        useGameStore.getState().addMoney(amount);
      });
      
      // Actualizar velocidad del tren
      const currentSpeed = useGameStore.getState().trainSpeed;
      this.train.updateSpeed(currentSpeed);
    }
    
    // Actualizar UI
    const tileTypeName = TILE_SELECTOR[this.selectedTileType];
    const tileData = TILE_TYPES[tileTypeName];
    this.uiText.setText(`Selected: ${tileData.name}`);
  }
}