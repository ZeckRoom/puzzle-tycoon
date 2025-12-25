// src/components/HUD/TrainStatus.jsx
import { useGameStore } from '../../store/gameStore';
import './TrainStatus.css';

export function TrainStatus() {
    const isRunning = useGameStore((state) => state.isTrainRunning);
    const trainSpeed = useGameStore((state) => state.trainSpeed);
    const trainLevel = useGameStore((state) => state.trainLevel);

    return (
        <div className="train-status">
            <div className="status-indicator">
                <div className={`status-light ${isRunning ? 'active' : 'inactive'}`} />
                <span>{isRunning ? 'Tren en marcha' : 'Tren detenido'}</span>
            </div>

            <div className="train-info">
                <div className="info-item">
                    <span className="icon">🚂</span>
                    <span>Nivel {trainLevel}</span>
                </div>
                <div className="info-item">
                    <span className="icon">⚡</span>
                    <span>Velocidad {trainSpeed.toFixed(1)}x</span>
                </div>
            </div>
        </div>
    );
}