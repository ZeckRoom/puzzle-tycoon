import { useState } from 'react';
import { TILE_TYPES, TILE_SELECTOR } from '../../game/config/tiles';
import './TilePicker.css';

export function TilePicker({ selectedTile, onSelectTile, money }) {
  const [hoveredTile, setHoveredTile] = useState(null);

  const getTileIcon = (tileType) => {
    const icons = {
      'STRAIGHT_H': '━',
      'STRAIGHT_V': '┃',
      'CURVE_TR': '┗',
      'CURVE_TL': '┛',
      'CURVE_BR': '┏',
      'CURVE_BL': '┓',
      'STATION': '🏠'
    };
    return icons[tileType] || '?';
  };

  const canAfford = (cost) => money >= cost;

  return (
    <div className="tile-picker">
      <div className="picker-header">
        <h3>🛤️ Railway Parts</h3>
        <p className="picker-hint">Click to select, then place on grid</p>
      </div>

      <div className="tiles-grid">
        {TILE_SELECTOR.map((tileTypeName) => {
          const tileData = TILE_TYPES[tileTypeName];
          const isSelected = selectedTile === tileTypeName;
          const affordable = canAfford(tileData.cost);

          return (
            <button
              key={tileTypeName}
              className={`tile-card ${isSelected ? 'selected' : ''} ${!affordable ? 'disabled' : ''}`}
              onClick={() => affordable && onSelectTile(tileTypeName)}
              onMouseEnter={() => setHoveredTile(tileTypeName)}
              onMouseLeave={() => setHoveredTile(null)}
              disabled={!affordable}
            >
              <div className="tile-icon" style={{ color: `#${tileData.color.toString(16).padStart(6, '0')}` }}>
                {getTileIcon(tileTypeName)}
              </div>
              <div className="tile-info">
                <span className="tile-name">{tileData.name}</span>
                <span className={`tile-cost ${affordable ? '' : 'too-expensive'}`}>
                  ${tileData.cost}
                </span>
              </div>
              {isSelected && <div className="selected-indicator">✓</div>}
              {!affordable && <div className="locked-overlay">🔒</div>}
            </button>
          );
        })}
      </div>

      {hoveredTile && (
        <div className="tile-tooltip">
          <p className="tooltip-text">
            {TILE_TYPES[hoveredTile].id === 'station' 
              ? '💰 Generates $100 per train pass' 
              : '🛤️ Connect tracks to form a loop'}
          </p>
        </div>
      )}
    </div>
  );
}