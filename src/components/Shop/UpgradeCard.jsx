// src/components/Shop/UpgradeCard.jsx
import './UpgradeCard.css';

export function UpgradeCard({ title, description, cost, icon, onBuy, canAfford, level }) {
    return (
        <div className={`upgrade-card ${!canAfford ? 'disabled' : ''}`}>
            <div className="upgrade-icon">{icon}</div>
            <div className="upgrade-content">
                <h4 className="upgrade-title">{title}</h4>
                <p className="upgrade-description">{description}</p>
                {level && <span className="upgrade-level">Nivel {level}</span>}
            </div>
            <button
                className="upgrade-button"
                onClick={onBuy}
                disabled={!canAfford}
            >
                ${cost.toLocaleString()}
            </button>
        </div>
    );
}