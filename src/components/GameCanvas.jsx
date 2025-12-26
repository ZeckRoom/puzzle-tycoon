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
      width: 512,
      height: 512,
      backgroundColor: '#ecf0f1',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
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
    gameRef.current.scene.start('GameScene');  // ← Sin parámetros
    
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="game-canvas-container"
      style={{
        border: '4px solid #f1c40f',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}
    />
  );
}