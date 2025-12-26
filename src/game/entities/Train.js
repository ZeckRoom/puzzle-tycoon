export class Train {
  constructor(scene, path, speed = 1) {
    this.scene = scene;
    this.path = path;
    this.speed = speed * 50; // Velocidad en píxeles por segundo
    this.currentIndex = 0;
    this.progress = 0;
    this.isRunning = false;
    this.earningsTimer = 0;
    this.earningsInterval = 5000; // Ganar cada 5 segundos
    
    // Crear sprite del tren
    this.sprite = scene.add.text(path[0].x, path[0].y, '🚂', {
      fontSize: '32px'
    });
    this.sprite.setOrigin(0.5);
    this.sprite.setDepth(100);
    
    // Efecto de humo
    this.smokeEmitter = scene.add.particles(0, 0, 'particle', {
      speed: { min: 20, max: 40 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 500,
      frequency: 100,
      tint: 0x888888,
      blendMode: 'ADD'
    });
    this.smokeEmitter.stop();
  }
  
  start() {
    this.isRunning = true;
    this.smokeEmitter.start();
  }
  
  stop() {
    this.isRunning = false;
    this.smokeEmitter.stop();
  }
  
  updatePath(newPath) {
    this.path = newPath;
    this.currentIndex = 0;
    this.progress = 0;
  }
  
  updateSpeed(newSpeed) {
    this.speed = newSpeed * 50;
  }
  
  update(delta, onEarning) {
    if (!this.isRunning || this.path.length < 2) return;
    
    // Movimiento del tren
    const deltaSeconds = delta / 1000;
    const currentPoint = this.path[this.currentIndex];
    const nextPoint = this.path[(this.currentIndex + 1) % this.path.length];
    
    const dx = nextPoint.x - currentPoint.x;
    const dy = nextPoint.y - currentPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.progress += (this.speed * deltaSeconds) / distance;
    
    if (this.progress >= 1) {
      this.progress = 0;
      this.currentIndex = (this.currentIndex + 1) % this.path.length;
    }
    
    // Interpolación de posición
    const newX = currentPoint.x + dx * this.progress;
    const newY = currentPoint.y + dy * this.progress;
    
    this.sprite.setPosition(newX, newY);
    
    // Rotación del tren según dirección
    const angle = Math.atan2(dy, dx);
    this.sprite.setRotation(angle);
    
    // Actualizar partículas de humo
    this.smokeEmitter.setPosition(newX - Math.cos(angle) * 15, newY - Math.sin(angle) * 15);
    
    // Sistema de ganancias
    this.earningsTimer += delta;
    if (this.earningsTimer >= this.earningsInterval) {
      this.earningsTimer = 0;
      const earnings = Math.floor(100 * (this.speed / 50)); // Más dinero con más velocidad
      onEarning(earnings);
    }
  }
  
  destroy() {
    this.sprite.destroy();
    this.smokeEmitter.destroy();
  }
}