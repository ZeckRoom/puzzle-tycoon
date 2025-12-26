import { useState } from 'react';
import './SaveSlotSelector.css';

export function SaveSlotSelector({ mode, onSelectSlot, onBack }) {
  const [showNameInput, setShowNameInput] = useState(null);
  const [newSaveName, setNewSaveName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const STORAGE_KEY = `lovecorp_saves_${mode}`;

  const getSaves = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { slot1: null, slot2: null, slot3: null };
  };

  const [saves, setSaves] = useState(getSaves());

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount}`;
  };

  const handleCreateSave = (slotId) => {
    if (!newSaveName.trim()) {
      alert('Please enter a save name!');
      return;
    }

    const newSave = {
      name: newSaveName.trim(),
      created: Date.now(),
      lastPlayed: Date.now(),
      money: 500,
      totalEarnings: 0,
      playtime: 0
    };

    const updatedSaves = { ...saves, [slotId]: newSave };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaves));
    setSaves(updatedSaves);
    setShowNameInput(null);
    setNewSaveName('');
    
    // Cargar el save recién creado
    onSelectSlot(slotId, newSave);
  };

  const handleLoadSave = (slotId, saveData) => {
    // Actualizar lastPlayed
    const updatedSave = { ...saveData, lastPlayed: Date.now() };
    const updatedSaves = { ...saves, [slotId]: updatedSave };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaves));
    
    onSelectSlot(slotId, updatedSave);
  };

  const handleDeleteSave = (slotId) => {
    const updatedSaves = { ...saves, [slotId]: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaves));
    setSaves(updatedSaves);
    setShowDeleteConfirm(null);
  };

  const renderSlot = (slotId, slotNumber) => {
    const saveData = saves[slotId];

    if (!saveData) {
      return (
        <div key={slotId} className="save-slot empty-slot">
          <div className="slot-header">
            <h3>Slot {slotNumber}</h3>
            <span className="empty-badge">Empty</span>
          </div>
          
          {showNameInput === slotId ? (
            <div className="name-input-container">
              <input
                type="text"
                className="save-name-input"
                placeholder="Enter save name..."
                value={newSaveName}
                onChange={(e) => setNewSaveName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSave(slotId)}
                autoFocus
                maxLength={20}
              />
              <div className="input-buttons">
                <button 
                  className="btn-confirm"
                  onClick={() => handleCreateSave(slotId)}
                >
                  ✓ Create
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setShowNameInput(null);
                    setNewSaveName('');
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="create-save-btn"
              onClick={() => setShowNameInput(slotId)}
            >
              <span className="btn-icon">+</span>
              <span>New Save</span>
            </button>
          )}
        </div>
      );
    }

    return (
      <div key={slotId} className="save-slot filled-slot">
        <div className="slot-header">
          <h3>Slot {slotNumber}</h3>
          <button 
            className="delete-btn"
            onClick={() => setShowDeleteConfirm(slotId)}
            title="Delete save"
          >
            🗑️
          </button>
        </div>

        <div className="save-info">
          <h4 className="save-name">{saveData.name}</h4>
          
          <div className="save-stats">
            <div className="stat-item">
              <span className="stat-label">💰 Money:</span>
              <span className="stat-value">{formatMoney(saveData.money)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">📊 Total:</span>
              <span className="stat-value">{formatMoney(saveData.totalEarnings)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🕐 Playtime:</span>
              <span className="stat-value">{Math.floor(saveData.playtime / 60)}m</span>
            </div>
          </div>

          <div className="save-dates">
            <p className="date-info">Created: {formatDate(saveData.created)}</p>
            <p className="date-info">Last played: {formatDate(saveData.lastPlayed)}</p>
          </div>
        </div>

        {showDeleteConfirm === slotId ? (
          <div className="delete-confirm">
            <p>Delete this save?</p>
            <div className="confirm-buttons">
              <button 
                className="btn-delete-confirm"
                onClick={() => handleDeleteSave(slotId)}
              >
                Yes, delete
              </button>
              <button 
                className="btn-delete-cancel"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="load-save-btn"
            onClick={() => handleLoadSave(slotId, saveData)}
          >
            ▶ Load Save
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="save-slot-selector">
      <div className="selector-background">
        <div className="railway-tracks"></div>
      </div>

      <div className="selector-content">
        <div className="selector-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <div className="header-title">
            <h1>
              {mode === 'free' ? '🌍 Free Mode' : '📚 Campaign Mode'}
            </h1>
            <p>Select or create a save slot</p>
          </div>
        </div>

        <div className="slots-container">
          {renderSlot('slot1', 1)}
          {renderSlot('slot2', 2)}
          {renderSlot('slot3', 3)}
        </div>
      </div>
    </div>
  );
}