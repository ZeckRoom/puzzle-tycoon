// src/components/Campaign/CampaignLevel.jsx
import { useGameStore } from '../../store/gameStore';
import { CAMPAIGN_LEVELS } from '../../game/config/levels';
import './CampaignLevel.css';

export function CampaignLevel() {
    const currentLevel = useGameStore((state) => state.currentLevel);
    const money = useGameStore((state) => state.money);
    const setMode = useGameStore((state) => state.setMode);

    const level = CAMPAIGN_LEVELS[currentLevel - 1];

    if (!level) {
        return (
            <div className="campaign-complete">
                <h2>🎉 ¡Campaña Completada!</h2>
                <p>Has desbloqueado el Modo Libre</p>
                <button onClick={() => setMode('free')}>
                    Ir al Modo Libre
                </button>
            </div>
        );
    }

    const progress = level.goal.type === 'money'
        ? (money / level.goal.target) * 100
        : 0;

    return (
        <div className="campaign-level">
            <div className="level-header">
                <h3>Nivel {level.id}: {level.name}</h3>
                <p>{level.description}</p>
            </div>

            <div className="level-goal">
                <div className="goal-label">Objetivo</div>
                <div className="goal-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <span className="progress-text">
                        {level.goal.type === 'money' && `$${money.toLocaleString()} / $${level.goal.target.toLocaleString()}`}
                        {level.goal.type === 'stations' && `Estaciones: ${level.goal.target}`}
                        {level.goal.type === 'money_per_second' && `${level.goal.target}/seg`}
                    </span>
                </div>
            </div>

            {level.obstacles.length > 0 && (
                <div className="level-obstacles">
                    <span>⚠️ Obstáculos en el mapa</span>
                </div>
            )}

            {level.maxTiles && (
                <div className="level-constraint">
                    <span>🎯 Máximo {level.maxTiles} vías</span>
                </div>
            )}
        </div>
    );
}