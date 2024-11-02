import Phaser from 'phaser';
import { LoadingScene } from './scenes/LoadingScene';
import { GameScene } from './scenes/GameScene';
import { QA } from './scenes/QA';
import { CasualGameScene } from './scenes/CasualGameScene';
import { ChemicalMatchingScene } from './scenes/ChemicalMatchingScene';

let game; // Declare game variable in outer scope

export function initializeGame() {
    // Game configuration object
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: '600px',
        height: '400px',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [LoadingScene, GameScene, QA, CasualGameScene, ChemicalMatchingScene]
    };

    game = new Phaser.Game(config); // Initialize the game only once
    
    game.backgroundMusic = null;

    return game; // Return the game instance
}
