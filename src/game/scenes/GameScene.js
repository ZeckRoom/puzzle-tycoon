import Phaser from 'phaser';
import { TILE_TYPES, TILE_SELECTOR } from '../config/tiles';
import { PathValidator } from '../systems/PathValidator';
import { Train } from '../entities/Train';
import { useGameStore } from '../../store/gameStore.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.GRID_SIZE = 10;
    this.TILE_SIZE = 64;
    this.selectedTileType = 0;
  }
  
  preload() {
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
      graphics.moveTo(i * this.TILE_SIZE, 0);
      graphics.lineTo(i * this.TILE_SIZE, this.GRID_SIZE * this.TILE_SIZE);
      graphics.moveTo(0, i * this.TILE_SIZE);
      graphics.lineTo(this.GRID_SIZE * this.TILE_SIZE, i * this.TILE_SIZE);
    }
    
    graphics.strokePath();
    
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
    const depot = this.createTileSprite(0, 0, TILE_TYPES.DEPOT);
    this.tiles['0,0'] = { sprite: depot, tileData: TILE_TYPES.DEPOT };
  }
  
  createTileSprite(gridX, gridY, tileData) {
    const x = gridX * this.TILE_SIZE + this.TILE_SIZE / 2;
    const y = gridY * this.TILE_SIZE + this.TILE_SIZE / 2;
    
    const container = this.add.container(x, y);
    
    const cellBg = this.add.rectangle(0, 0, 
      this.TILE_SIZE * 0.95, 
      this.TILE_SIZE * 0.95, 
      0x8b7355, 0.3);
    cellBg.setStrokeStyle(1, 0x5a4a3a, 0.5);
    container.add(cellBg);
    
    const platform = this.add.rectangle(0, 0, 
      this.TILE_SIZE * 0.85, 
      this.TILE_SIZE * 0.85, 
      0x3d2817, 0.4);
    container.add(platform);
    
    // Dibujar vías mejoradas
    const rails = this.add.graphics();
    this.drawDetailedRails(rails, tileData);
    container.add(rails);
    
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
    
    container.setInteractive(
      new Phaser.Geom.Rectangle(-this.TILE_SIZE / 2, -this.TILE_SIZE / 2, this.TILE_SIZE, this.TILE_SIZE),
      Phaser.Geom.Rectangle.Contains
    );
    
    container.on('pointerover', () => container.setScale(1.05));
    container.on('pointerout', () => container.setScale(1));
    
    return container;
  }
  
  drawDetailedRails(graphics, tileData) {
    const r = this.TILE_SIZE * 0.35;
    const thickness = 4;
    const gap = 8;
    
    // Vías rectas horizontales
    if (tileData.connects.left && tileData.connects.right) {
      // Dos rieles paralelos
      graphics.fillStyle(0x4a4a4a, 1);
      graphics.fillRect(-r, -gap/2, r * 2, thickness);
      graphics.fillRect(-r, gap/2, r * 2, thickness);
      
      // Traviesas de madera
      for (let i = -r; i < r; i += 10) {
        graphics.fillStyle(0x6b4423, 1);
        graphics.fillRect(i - 2, -gap - 4, 6, gap * 2 + 8);
      }
    }
    
    // Vías rectas verticales
    if (tileData.connects.up && tileData.connects.down) {
      graphics.fillStyle(0x4a4a4a, 1);
      graphics.fillRect(-gap/2, -r, thickness, r * 2);
      graphics.fillRect(gap/2, -r, thickness, r * 2);
      
      for (let i = -r; i < r; i += 10) {
        graphics.fillStyle(0x6b4423, 1);
        graphics.fillRect(-gap - 4, i - 2, gap * 2 + 8, 6);
      }
    }
    
    // Curvas mejoradas con círculos de rieles
    if (tileData.connects.up && tileData.connects.right) {
      graphics.lineStyle(thickness, 0x4a4a4a, 1);
      graphics.beginPath();
      graphics.arc(r, -r, r - gap/2, Math.PI, Math.PI * 1.5, false);
      graphics.strokePath();
      graphics.beginPath();
      graphics.arc(r, -r, r + gap/2, Math.PI, Math.PI * 1.5, false);
      graphics.strokePath();
    }
    
    if (tileData.connects.up && tileData.connects.left) {
      graphics.lineStyle(thickness, 0x4a4a4a, 1);
      graphics.beginPath();
      graphics.arc(-r, -r, r - gap/2, Math.PI * 1.5, Math.PI * 2, false);
      graphics.strokePath();
      graphics.beginPath();
      graphics.arc(-r, -r, r + gap/2, Math.PI * 1.5, Math.PI * 2, false);
      graphics.strokePath();
    }
    
    if (tileData.connects.down && tileData.connects.right) {
      graphics.lineStyle(thickness, 0x4a4a4a, 1);
      graphics.beginPath();
      graphics.arc(r, r, r - gap/2, Math.PI * 0.5, Math.PI, false);
      graphics.strokePath();
      graphics.beginPath();
      graphics.arc(r, r, r + gap/2, Math.PI * 0.5, Math.PI, false);
      graphics.strokePath();
    }
    
    if (tileData.connects.down && tileData.connects.left) {
      graphics.lineStyle(thickness, 0x4a4a4a, 1);
      graphics.beginPath();
      graphics.arc(-r, r, r - gap/2, 0, Math.PI * 0.5, false);
      graphics.strokePath();
      graphics.beginPath();
      graphics.arc(-r, r, r + gap/2, 0, Math.PI * 0.5, false);
      graphics.strokePath();
    }
  }
  
  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      const gridX = Math.floor(pointer.x / this.TILE_SIZE);
      const gridY = Math.floor(pointer.y / this.TILE_SIZE);
      
      if (gridX < 0 || gridX >= this.GRID_SIZE || gridY < 0 || gridY >= this.GRID_SIZE) return;
      
      const key = `${gridX},${gridY}`;
      if (key === '0,0') return;
      
      // Eliminar tile con reembolso del 50%
      if (this.tiles[key]) {
        const tileData = this.tiles[key].tileData;
        const refund = Math.floor(tileData.cost * 0.5);
        
        this.tiles[key].sprite.destroy();
        delete this.tiles[key];
        useGameStore.getState().removeTile(gridX, gridY);
        useGameStore.getState().addMoney(refund);
        
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
      
      // Calcular distancia total del camino
      const pathDistance = this.calculatePathDistance(result.path);
      
      if (!this.train) {
        this.train = new Train(this, smoothPath, useGameStore.getState().trainSpeed);
        this.train.start();
      } else {
        this.train.updatePath(smoothPath);
      }
      
      useGameStore.getState().setTrainRunning(true);
      
      // Ganancias basadas en distancia y estaciones
      const baseEarnings = result.stations * 100;
      const distanceBonus = pathDistance * 10; // $10 por celda de distancia
      const totalEarnings = (baseEarnings + distanceBonus) * useGameStore.getState().multiplier;
      
      useGameStore.getState().updateMoneyPerSecond(totalEarnings);
      
    } else {
      if (this.train) {
        this.train.stop();
      }
      useGameStore.getState().setTrainRunning(false);
      useGameStore.getState().updateMoneyPerSecond(0);
    }
  }
  
  calculatePathDistance(path) {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i-1].x;
      const dy = path[i].y - path[i-1].y;
      distance += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.floor(distance);
  }
  
  createUI() {
    this.uiText = this.add.text(10, 10, '', { 
      fontSize: '12px', 
      backgroundColor: '#2c3e50', 
      padding: { x: 5, y: 3 } 
    });
    this.uiText.setDepth(100);
  }
  
  syncWithStore() {
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
      
      const currentSpeed = useGameStore.getState().trainSpeed;
      this.train.updateSpeed(currentSpeed);
    }
    
    const tileTypeName = TILE_SELECTOR[this.selectedTileType];
    const tileData = TILE_TYPES[tileTypeName];
    this.uiText.setText(`Selected: ${tileData.name}`);
  }
}