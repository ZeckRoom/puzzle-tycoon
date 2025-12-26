import { useState } from 'react';
import './MainMenu.css';

export function MainMenu({ onSelectMode }) {
  const [hoveredMode, setHoveredMode] = useState(null);

  return (
    <div className="main-menu">
      <div className="menu-background">
        <div className="railway-tracks"></div>
      </div>

      <div className="menu-content">
        <div className="menu-header">
          <div className="menu-logo">
            <div className="logo-icon">🚂</div>
            <h1 className="menu-title">
              <span className="title-love">LOVE</span>
              <span className="title-corp">CORP</span>
            </h1>
            <p className="menu-subtitle">Puzzle Tycoon Railway</p>
          </div>
        </div>

        <div className="menu-options">
          <button
            className={`menu-button mode-free ${hoveredMode === 'free' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredMode('free')}
            onMouseLeave={() => setHoveredMode(null)}
            onClick={() => onSelectMode('free')}
          >
            <div className="button-icon">🌍</div>
            <div className="button-content">
              <h2>Free Mode</h2>
              <p>Build your railway empire without limits</p>
              <span className="button-hint">Starting funds: $500</span>
            </div>
            <div className="button-arrow">▶</div>
          </button>

          <button
            className={`menu-button mode-campaign ${hoveredMode === 'campaign' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredMode('campaign')}
            onMouseLeave={() => setHoveredMode(null)}
            onClick={() => onSelectMode('campaign')}
          >
            <div className="button-icon">📚</div>
            <div className="button-content">
              <h2>Campaign Mode</h2>
              <p>Complete puzzles and unlock new features</p>
              <span className="button-hint">10 challenging levels</span>
            </div>
            <div className="button-arrow">▶</div>
          </button>
        </div>

        <div className="menu-footer">
          <p className="version">v1.0.0</p>
          <p className="credits">Made with ❤️ by Love Corp</p>
        </div>
      </div>
    </div>
  );
}