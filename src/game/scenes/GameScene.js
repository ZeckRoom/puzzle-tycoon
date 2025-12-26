import Phaser from 'phaser';
import { TILE_TYPES, TILE_SELECTOR } from '../config/tiles';
import { useGameStore } from '../../store/gameStore.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.GRID_SIZE = 10;
    this.TILE_SIZE = 64;
    this.selectedTileType = 0;
    this.trains = []; // Array para manejar múltiples trenes simultáneos
  }

  create() {
    this.tiles = {};
    
    this.createBackground();
    this.createDepot();
    this.setupInput();
    this.createPreview();
    
    // Sincronizar con React al inicio
    this.syncWithStore();
  }

  createBackground() {
    // Fondo base color papel
    this.add.rectangle(320, 320, 640, 640, 0xe8dcc4).setDepth(-2);
    
    // Grid estilo plano técnico tenue
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x8b6f47, 0.2);

    for (let i = 0; i <= this.GRID_SIZE; i++) {
      graphics.moveTo(i * this.TILE_SIZE, 0);
      graphics.lineTo(i * this.TILE_SIZE, 640);
      graphics.moveTo(0, i * this.TILE_SIZE);
      graphics.lineTo(640, i * this.TILE_SIZE);
    }
    graphics.strokePath();
  }

  createDepot() {
    const depot = this.createTileSprite(0, 0, TILE_TYPES.DEPOT);
    this.tiles['0,0'] = { sprite: depot, tileData: TILE_TYPES.DEPOT };
  }

  createTileSprite(gridX, gridY, tileData) {
    const x = gridX * this.TILE_SIZE + this.TILE_SIZE / 2;
    const y = gridY * this.TILE_SIZE + this.TILE_SIZE / 2;
    const container = this.add.container(x, y);

    // 1. Base de tierra/balasto
    const base = this.add.rectangle(0, 0, 64, 64, 0xdcd0b4);
    container.add(base);

    // 2. Rieles y Traviesas
    const graphics = this.add.graphics();
    this.drawPerfectRails(graphics, tileData);
    container.add(graphics);

    // 3. Iconos Especiales
    if (tileData.id === 'station') {
        const house = this.add.text(0, 0, '🏠', { fontSize: '30px' }).setOrigin(0.5);
        container.add(house);
    } else if (tileData.id === 'depot') {
        const factory = this.add.text(0, 0, '🏭', { fontSize: '30px' }).setOrigin(0.5);
        container.add(factory);
    }

    container.setSize(64, 64);
    return container;
  }

  drawPerfectRails(g, data) {
    const c = data.connects;
    const railSpacing = 12; // Distancia del centro a cada riel
    const railWidth = 6;
    const sleeperColor = 0x5d4037; // Marrón oscuro madera
    const railColor = 0x546e7a; // Gris metal azulado

    // --- RECTAS ---
    if (c.left && c.right) {
        // Horizontal: Solo 3 traviesas bien espaciadas
        g.fillStyle(sleeperColor, 1);
        g.fillRect(-20, -8, 6, 16);
        g.fillRect(0, -8, 6, 16);
        g.fillRect(20, -8, 6, 16);
        
        // Rieles horizontales
        g.fillStyle(railColor, 1);
        g.fillRect(-32, -railSpacing - railWidth/2, 64, railWidth);
        g.fillRect(-32, railSpacing - railWidth/2, 64, railWidth);
    }
    else if (c.up && c.down) {
        // Vertical: Solo 3 traviesas
        g.fillStyle(sleeperColor, 1);
        g.fillRect(-8, -20, 16, 6);
        g.fillRect(-8, 0, 16, 6);
        g.fillRect(-8, 20, 16, 6);
        
        // Rieles verticales
        g.fillStyle(railColor, 1);
        g.fillRect(-railSpacing - railWidth/2, -32, railWidth, 64);
        g.fillRect(railSpacing - railWidth/2, -32, railWidth, 64);
    }
    // --- CURVAS ---
    else {
        // Determinar cuadrante y ángulos
        let pCenterX, pCenterY, pStart, pEnd;
        
        if (c.up && c.right) { 
            pCenterX = 32; pCenterY = -32; 
            pStart = 90; pEnd = 180;
        }
        if (c.right && c.down) {
            pCenterX = 32; pCenterY = 32;
            pStart = 180; pEnd = 270;
        }
        if (c.down && c.left) {
            pCenterX = -32; pCenterY = 32;
            pStart = 270; pEnd = 360;
        }
        if (c.left && c.up) {
            pCenterX = -32; pCenterY = -32;
            pStart = 0; pEnd = 90;
        }

        const startRad = Phaser.Math.DegToRad(pStart);
        const endRad = Phaser.Math.DegToRad(pEnd);

        // Traviesas en curva (radiales, simplificadas como círculos pequeños para evitar matemáticas complejas de rotación de rectángulos en canvas básico)
        g.fillStyle(sleeperColor, 1);
        for(let a = pStart + 15; a < pEnd; a += 30) {
            const rad = Phaser.Math.DegToRad(a);
            const dist = 32; // Radio medio del tile
            const sx = pCenterX + Math.cos(rad) * dist;
            const sy = pCenterY + Math.sin(rad) * dist;
            g.fillCircle(sx, sy, 4); 
        }

        // Rieles curvos (Interior y Exterior)
        g.lineStyle(railWidth, railColor, 1);
        g.beginPath();
        g.arc(pCenterX, pCenterY, 32 - railSpacing, startRad, endRad);
        g.strokePath();

        g.beginPath();
        g.arc(pCenterX, pCenterY, 32 + railSpacing, startRad, endRad);
        g.strokePath();
    }
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
        const gridX = Math.floor(pointer.x / this.TILE_SIZE);
        const gridY = Math.floor(pointer.y / this.TILE_SIZE);
        
        if (gridX < 0 || gridX >= this.GRID_SIZE || gridY < 0 || gridY >= this.GRID_SIZE) return;
        
        const key = `${gridX},${gridY}`;
        if (key === '0,0') return; // Prohibido tocar deposito

        // 1. ELIMINAR TILE (con reembolso)
        if (this.tiles[key]) {
            const tileData = this.tiles[key].tileData;
            
            // Efecto visual y lógica
            this.tiles[key].sprite.destroy();
            delete this.tiles[key];
            
            useGameStore.getState().removeTile(gridX, gridY);
            
            // Reembolso 50%
            const refund = Math.floor(tileData.cost / 2);
            useGameStore.getState().addMoney(refund);
            
            this.showFloatingText(gridX, gridY, `+$${refund}`, '#2ecc71'); // Texto verde
            this.checkPathValidity();
            return;
        }

        // 2. CONSTRUIR TILE
        const tileTypeName = TILE_SELECTOR[this.selectedTileType];
        const tileData = TILE_TYPES[tileTypeName];
        const success = useGameStore.getState().placeTile(gridX, gridY, tileTypeName, tileData.cost);

        if (success) {
            const sprite = this.createTileSprite(gridX, gridY, tileData);
            this.tiles[key] = { sprite, tileData };
            
            this.showFloatingText(gridX, gridY, `-$${tileData.cost}`, '#e74c3c'); // Texto rojo
            this.checkPathValidity();
        }
    });
  }

  showFloatingText(gx, gy, text, color) {
    const txt = this.add.text(
        gx * 64 + 32, gy * 64, text, 
        { fontSize: '20px', fontStyle: 'bold', color: color, stroke: '#fff', strokeThickness: 4 }
    ).setOrigin(0.5);
    
    this.tweens.add({
        targets: txt,
        y: txt.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => txt.destroy()
    });
  }

  // --- LÓGICA DE TREN (Despacho Manual) ---
  
  dispatchTrain() {
    const path = this.calculatePath();
    if (!path || path.length < 2) return; // Necesita al menos 2 puntos para moverse

    const startX = path[0].x;
    const startY = path[0].y;
    
    // Contenedor visual del tren
    const trainContainer = this.add.container(startX, startY);
    const sprite = this.add.text(0,0, '🚂', {fontSize: '36px'}).setOrigin(0.5);
    trainContainer.add(sprite);
    
    // Velocidad: Base 0.05 (lento) * Multiplicador de mejoras (1 a 5)
    const storeSpeed = useGameStore.getState().trainSpeed; 
    const realSpeed = 0.05 * storeSpeed; 

    this.trains.push({ 
        obj: trainContainer, 
        path: path, 
        progress: 0, 
        pathIndex: 0, 
        finished: false,
        speed: realSpeed 
    });
  }

  checkPathValidity() {
    // Verificar si hay suficientes tiles conectados para habilitar el botón
    const path = this.calculatePath();
    if (window.setDispatchReady) {
        window.setDispatchReady(!!(path && path.length > 1));
    }
  }

  calculatePath() {
    // Pathfinding Básico: Sigue tiles adyacentes conectados desde el depot
    // En el futuro, esto debería usar A* real y verificar conexiones de tiles específicas
    
    if (Object.keys(this.tiles).length < 2) return null;
    
    // Obtener todos los puntos centrales de los tiles existentes
    const points = [];
    Object.keys(this.tiles).forEach(k => {
        const [kx, ky] = k.split(',').map(Number);
        points.push({x: kx*64+32, y: ky*64+32, gx: kx, gy: ky});
    });
    
    // Algoritmo "Nearest Neighbor" para ordenar los puntos y simular un camino continuo
    // Empezamos siempre en 0,0 (Depot)
    const startPoint = points.find(p => p.gx === 0 && p.gy === 0) || points[0];
    const sortedPath = [startPoint];
    const remaining = points.filter(p => p !== startPoint);
    
    let current = startPoint;
    
    // Intentamos construir una cadena de adyacentes
    while(remaining.length > 0) {
        let nearestIdx = -1;
        // Solo buscamos vecinos directos (distancia Manhattan = 1)
        
        for(let i=0; i<remaining.length; i++) {
            const p = remaining[i];
            const dist = Math.abs(p.gx - current.gx) + Math.abs(p.gy - current.gy);
            
            // Si es vecino directo, lo conectamos
            if(dist === 1) {
                nearestIdx = i;
                break; // Encontramos el siguiente eslabón
            }
        }
        
        if (nearestIdx !== -1) {
            current = remaining[nearestIdx];
            sortedPath.push(current);
            remaining.splice(nearestIdx, 1);
        } else {
            // Camino roto o bifurcación no manejada por este algoritmo simple
            break; 
        }
    }
    
    // Solo retornamos si hay un camino válido de al menos 2 pasos
    return sortedPath.length > 1 ? sortedPath : null;
  }

  update(time, delta) {
    // Actualizar todos los trenes activos
    for (let i = this.trains.length - 1; i >= 0; i--) {
        const t = this.trains[i];
        if (t.finished) continue;

        // Avance basado en delta time para suavidad (60fps target)
        t.progress += t.speed * (delta / 16.6); 

        // Cambio de segmento
        if (t.progress >= 1) {
            t.progress = 0;
            t.pathIndex++;
            
            // Fin del trayecto
            if (t.pathIndex >= t.path.length - 1) {
                t.finished = true;
                this.trainArrival(t.obj, t.path.length);
                this.trains.splice(i, 1);
                continue;
            }
        }

        // Interpolación Lineal (Lerp) entre el punto actual y el siguiente
        const p1 = t.path[t.pathIndex];
        const p2 = t.path[t.pathIndex + 1];
        
        t.obj.x = p1.x + (p2.x - p1.x) * t.progress;
        t.obj.y = p1.y + (p2.y - p1.y) * t.progress;
        
        // Rotar tren hacia la dirección de movimiento
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        t.obj.setRotation(angle);
    }
  }

  trainArrival(trainObj, distance) {
    // Pago: Distancia recorrida * $20 * Multiplicador de mejoras
    const payment = distance * 20 * useGameStore.getState().multiplier;
    useGameStore.getState().addMoney(payment);
    
    // Feedback visual flotante
    this.showFloatingText(Math.floor(trainObj.x/64), Math.floor(trainObj.y/64), `+$${payment}`, '#f1c40f');
    
    // Eliminar tren
    trainObj.destroy();
  }
  
  // --- MÉTODOS DE PREVIEW (Sin cambios lógicos, solo necesarios para React) ---
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
  
  updateSelectedTile(i) {
    this.selectedTileType = i;
    this.updatePreview();
  }
  
  updatePreview() {
    this.previewContainer.removeAll(true);
    const tileTypeName = TILE_SELECTOR[this.selectedTileType];
    const tileData = TILE_TYPES[tileTypeName];
    const tempSprite = this.createTileSprite(0, 0, tileData);
    this.previewContainer.add(tempSprite);
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
    this.checkPathValidity();
  }
}