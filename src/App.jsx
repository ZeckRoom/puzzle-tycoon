// src/App.jsx
import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { GameCanvas } from './components/GameCanvas.jsx';
import { MoneyDisplay } from './components/HUD/MoneyDisplay.jsx';
import { TrainStatus } from './components/HUD/TrainStatus.jsx';
import { Shop } from './components/Shop/Shop.jsx';

import './App.css';

function App() {
    const [showOfflineEarnings, setShowOfflineEarnings] = useState(false);
    const [offlineAmount, setOfflineAmount] = useState(0);
    const calculateOfflineEarnings = useGameStore((state) => state.calculateOfflineEarnings);

    useEffect(() => {
        // Calcular ganancias offline al cargar
        const earnings = calculateOfflineEarnings();
        if (earnings > 0) {
            setOfflineAmount(earnings);
            setShowOfflineEarnings(true);
            setTimeout(() => setShowOfflineEarnings(false), 5000);
        }

        // Guardar cada 30 segundos
        const saveInterval = setInterval(() => {
            useGameStore.getState().calculateOfflineEarnings();
        }, 30000);

        return () => clearInterval(saveInterval);
    }, []);

    const formatNumber = (num) => {
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(0)}`;
    };

    return (
        <div className="app-container">
            {/* Offline Earnings Popup */}
            {showOfflineEarnings && (
                <div className="offline-popup">
                    <h3>¡Bienvenido de vuelta!</h3>
                    <p>Ganaste {formatNumber(offlineAmount)} mientras estabas fuera</p>
                </div>
            )}

            {/* Header */}
            <header className="app-header">
                <div className="logo">
                    <h1>LOVE CORP</h1>
                    <span className="subtitle">Puzzle Tycoon</span>
                </div>
                <MoneyDisplay />
            </header>

            {/* Main Content */}
            <div className="main-content">
                {/* Game Canvas */}
                <div className="game-section">
                    <TrainStatus />
                    <GameCanvas />
                    <div className="controls-hint">
                        <span>💡 Click para colocar vías</span>
                        <span>ESPACIO para cambiar tipo</span>
                        <span>Click en vía existente para eliminar</span>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="sidebar">
                    <Shop />
                </aside>
            </div>
        </div>
    );
}

export default App
