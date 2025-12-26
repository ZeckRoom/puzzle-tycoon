import { useEffect, useState } from 'react';
import './LoadingScreen.css';

export function LoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Simular carga progresiva
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Animación de puntos
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    return () => {
      clearInterval(interval);
      clearInterval(dotsInterval);
    };
  }, [onLoadComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="train-icon">🚂</div>
          <h1 className="game-title">
            <span className="title-love">LOVE</span>
            <span className="title-corp">CORP</span>
          </h1>
          <p className="game-subtitle">Puzzle Tycoon Railway</p>
        </div>

        <div className="loading-bar-container">
          <div className="loading-bar">
            <div 
              className="loading-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="loading-text">Loading{dots}</p>
          <p className="loading-percentage">{progress}%</p>
        </div>

        <div className="loading-hint">
          <p>💡 Tip: Connect stations to maximize profits!</p>
        </div>
      </div>

      <div className="loading-decoration">
        <div className="pixel-cloud cloud-1"></div>
        <div className="pixel-cloud cloud-2"></div>
        <div className="pixel-cloud cloud-3"></div>
      </div>
    </div>
  );
}