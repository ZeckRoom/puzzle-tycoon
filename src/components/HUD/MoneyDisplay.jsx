// src/components/HUD/MoneyDisplay.jsx
import { useGameStore } from '../../store/gameStore';
import './MoneyDisplay.css';

export function MoneyDisplay() {
    const money = useGameStore((state) => state.money);
    const moneyPerSecond = useGameStore((state) => state.moneyPerSecond);
    const totalEarnings = useGameStore((state) => state.totalEarnings);

    const formatNumber = (num) => {
        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(0)}`;
    };

    return (
        <div className="money-display-container">
            <div className="money-main">
                <div className="money-label">Love Corp Balance</div>
                <div className="money-amount">{formatNumber(money)}</div>
            </div>

            <div className="money-stats">
                <div className="stat">
                    <span className="stat-label">$/seg</span>
                    <span className="stat-value">{formatNumber(moneyPerSecond)}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{formatNumber(totalEarnings)}</span>
                </div>
            </div>
        </div>
    );
}