// src/game/entities/Train.js
export class Train {
    constructor(scene, path, speed = 1) {
        this.scene = scene;
        this.path = path;
        this.speed = speed;
        this.t = 0;
        this.isRunning = false;
        this.earnings = 0;
        this.stationsPassed = new Set();

        // Crear sprite del tren
        this.sprite = scene.add.circle(0, 0, 12, 0xf1c40f);
        this.sprite.setStrokeStyle(3, 0xf39c12);

        // Efecto de humo
        this.particles = scene.add.particles(0, 0, 'particle', {
            speed: { min: 20, max: 40 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 600,
            frequency: 100,
            tint: 0x95a5a6
        });
        this.particles.stop();
    }

    start() {
        this.isRunning = true;
        this.t = 0;
        this.stationsPassed.clear();
        this.particles.start();
    }

    stop() {
        this.isRunning = false;
        this.particles.stop();
    }

    update(delta, addMoneyCallback) {
        if (!this.isRunning || this.path.length < 2) return;

        // Incrementar posición en el path (Catmull-Rom interpolation)
        this.t += (this.speed * delta) / 1000;

        if (this.t >= 1) {
            this.t = 0;
            this.stationsPassed.clear();
        }

        // Interpolación suave entre puntos
        const index = Math.floor(this.t * (this.path.length - 1));
        const nextIndex = (index + 1) % this.path.length;
        const localT = (this.t * (this.path.length - 1)) % 1;

        const current = this.path[index];
        const next = this.path[nextIndex];

        if (current && next) {
            // Interpolación lineal suave
            const x = current.x + (next.x - current.x) * localT;
            const y = current.y + (next.y - current.y) * localT;

            this.sprite.setPosition(x, y);
            this.particles.setPosition(x, y);

            // Detectar paso por estación
            this.checkStationPass(index, addMoneyCallback);
        }
    }

    checkStationPass(index, callback) {
        const key = `station_${index}`;
        if (this.stationsPassed.has(key)) return;

        const gridPos = this.path[index];
        if (!gridPos) return;

        // Aquí deberías verificar si la posición del grid es una estación
        // y llamar al callback con las ganancias
        this.stationsPassed.add(key);
    }

    updateSpeed(newSpeed) {
        this.speed = newSpeed;
    }

    updatePath(newPath) {
        this.path = newPath;
        this.t = 0;
        this.stationsPassed.clear();
    }

    destroy() {
        this.sprite.destroy();
        this.particles.destroy();
    }
}