// src/components/Shop/Shop.jsx
import { useGameStore } from '../../store/gameStore';
import { UpgradeCard } from './UpgradeCard';
import './Shop.css';

export function Shop() {
    const money = useGameStore((state) => state.money);
    const trainLevel = useGameStore((state) => state.trainLevel);
    const multiplier = useGameStore((state) => state.multiplier);
    const buyUpgrade = useGameStore((state) => state.buyUpgrade);
    const upgradeTrainSpeed = useGameStore((state) => state.upgradeTrainSpeed);
    const upgradeMultiplier = useGameStore((state) => state.upgradeMultiplier);

    const upgrades = [
        {
            id: 'speed',
            title: 'Motor Mejorado',
            description: 'Aumenta la velocidad del tren +0.5x',
            cost: 100 * Math.pow(1.5, trainLevel),
            icon: '⚡',
            onBuy: () => buyUpgrade(100 * Math.pow(1.5, trainLevel), upgradeTrainSpeed),
            level: trainLevel
        },
        {
            id: 'multiplier',
            title: 'Gerente de Marketing',
            description: 'Aumenta todas las ganancias +50%',
            cost: 500 * Math.pow(2, Math.floor(multiplier)),
            icon: '💼',
            onBuy: () => buyUpgrade(500 * Math.pow(2, Math.floor(multiplier)), upgradeMultiplier),
            level: Math.floor(multiplier * 2)
        },
        {
            id: 'automation',
            title: 'Sistema Automático',
            description: 'Las estaciones generan dinero pasivamente',
            cost: 2000,
            icon: '🤖',
            onBuy: () => { },
            level: null
        }
    ];

    return (
        <div className="shop-container">
            <h3 className="shop-title">Mejoras de Love Corp</h3>
            <div className="upgrades-list">
                {upgrades.map((upgrade) => (
                    <UpgradeCard
                        key={upgrade.id}
                        {...upgrade}
                        canAfford={money >= upgrade.cost}
                    />
                ))}
            </div>
        </div>
    );
}
