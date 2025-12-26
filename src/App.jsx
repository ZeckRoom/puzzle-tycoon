import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore.js';
import { LoadingScreen } from './components/LoadingScreen.jsx';
import { MainMenu } from './components/MainMenu.jsx';
import { SaveSlotSelector } from './components/SaveSlotSelector/SaveSlotSelector.jsx';
import { GameCanvas } from './components/GameCanvas.jsx';
import { MoneyDisplay } from './components/HUD/MoneyDisplay.jsx';
import { TrainStatus } from './components/HUD/TrainStatus.jsx';
import { Shop } from './components/Shop/Shop.jsx';
import { TilePicker } from './components/TilePicker/TilePicker.jsx';
import { TILE_SELECTOR } from './game/config/tiles';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showSaveSelector, setShowSaveSelector] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedTile, setSelectedTile] = useState(TILE_SELECTOR[0]);
  
  const [showOfflineEarnings, setShowOfflineEarnings] = useState(false);
  const [offlineAmount, setOfflineAmount] = useState(0);
  
  const money = useGameStore((state) => state.money);
  const calculateOfflineEarnings = useGameStore((state) => state.calculateOfflineEarnings);
  const setMode = useGameStore((state) => state.setMode);
  
  useEffect(() => {
    // Calcular ganancias offline solo cuando el juego inicie
    if (gameStarted) {
      const earnings = calculateOfflineEarnings();
      if (earnings > 0) {
        setOfflineAmount(earnings);
        setShowOfflineEarnings(true);
        setTimeout(() => setShowOfflineEarnings(false), 5000);
      }
    }
    
    // Guardar cada 30 segundos
    const saveInterval = setInterval(() => {
      useGameStore.getState().calculateOfflineEarnings();
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, [gameStarted, calculateOfflineEarnings]);
  
  // Auto-guardar el progreso en el slot actual
  useEffect(() => {
    if (gameStarted && currentSlot && selectedMode) {
      const autoSaveInterval = setInterval(() => {
        const STORAGE_KEY = `lovecorp_saves_${selectedMode}`;
        const saves = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const currentSave = saves[currentSlot];
        
        if (currentSave) {
          const saveData = useGameStore.getState().getCurrentSaveData();
          saves[currentSlot] = {
            ...currentSave,
            ...saveData,
            lastPlayed: Date.now()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
        }
      }, 10000);
      
      return () => clearInterval(autoSaveInterval);
    }
  }, [gameStarted, currentSlot, selectedMode]);
  
  const handleLoadComplete = () => {
    setIsLoading(false);
    setShowMenu(true);
  };
  
  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
    setShowMenu(false);
    setShowSaveSelector(true);
  };
  
  const handleSelectSlot = (slotId, saveData) => {
    setCurrentSlot(slotId);
    useGameStore.getState().loadFromSlot(saveData);
    useGameStore.getState().setMode(selectedMode);
    setShowSaveSelector(false);
    setGameStarted(true);
  };
  
  const handleBackToMenu = () => {
    setShowSaveSelector(false);
    setShowMenu(true);
    setSelectedMode(null);
  };
  
  const handleSelectTile = (tileName) => {
    setSelectedTile(tileName);
    const tileIndex = TILE_SELECTOR.indexOf(tileName);
    // Comunicar a Phaser el cambio
    if (window.phaserGame?.scene?.scenes[0]) {
      window.phaserGame.scene.scenes[0].updateSelectedTile(tileIndex);
    }
  };
  
  const formatNumber = (num) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(0)}`;
  };
  
  if (isLoading) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} />;
  }
  
  if (showMenu) {
    return <MainMenu onSelectMode={handleSelectMode} />;
  }
  
  if (showSaveSelector) {
    return (
      <SaveSlotSelector 
        mode={selectedMode}
        onSelectSlot={handleSelectSlot}
        onBack={handleBackToMenu}
      />
    );
  }
  
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
            <span>💡 Select a rail type, then click to place</span>
            <span>Click existing rail to remove</span>
          </div>
        </div>
        
        {/* Sidebar */}
        <aside className="sidebar">
          <TilePicker 
            selectedTile={selectedTile}
            onSelectTile={handleSelectTile}
            money={money}
          />
          <Shop />
        </aside>
      </div>
    </div>
  );
}

export default App;