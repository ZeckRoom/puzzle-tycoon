import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from '../game/scenes/GameScene';

export function GameCanvas() {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    
    const config = {
      type: Phaser.WEBGL,
      parent: containerRef.current,
      width: 640,
      height: 640,
      backgroundColor: '#ecf0f1',
      scale: {
        mode: Phaser.Scale.NONE,  // ← Sin auto-escala
        autoCenter: Phaser.Scale.NO_CENTER
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      },
      scene: [GameScene]
    };
    
    gameRef.current = new Phaser.Game(config);
    gameRef.current.scene.start('GameScene');
    
    // Exponer globalmente para comunicación React ↔ Phaser
    window.phaserGame = gameRef.current;
    
    return () => {
      if (gameRef.current) {
        window.phaserGame = null;
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="game-canvas-container"
    />
  );
}