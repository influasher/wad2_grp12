import Phaser from 'phaser';
import { LoadingScene } from './scenes/LoadingScene';
import { GameScene } from './scenes/GameScene';
import { QA } from './scenes/QA';
import { CasualGameScene } from './scenes/CasualGameScene';
import { ChemicalMatchingScene } from './scenes/ChemicalMatchingScene';

let game; // Declare game variable in outer scope

export function initializeGame() {
    const gameContainer = document.getElementById('game-container');
    
    // Check if gameContainer exists to avoid undefined error
    if (!gameContainer) {
        console.error("Game container element not found.");
        return;
    }

    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;

    // Game configuration object
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: containerWidth,
        height: containerHeight,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: '600px',
            height: '400px'
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
    // Handle resizing
    game.scale.on('resize', (gameSize) => {
        const width = gameSize.width;
        const height = gameSize.height;
        
        game.scene.scenes.forEach(scene => {
            scene.children.list.forEach(child => {
                if (child.setPosition && child.setDisplaySize) {
                    child.setPosition(child.x / game.scale.baseSize.width * width, child.y / game.scale.baseSize.height * height);
                    child.setDisplaySize(child.displayWidth / game.scale.baseSize.width * width, child.displayHeight / game.scale.baseSize.height * height);
                }
            });
        });
    });

    window.addEventListener('resize', () => {
        const newContainerWidth = gameContainer.clientWidth;
        const newContainerHeight = gameContainer.clientHeight;
        game.scale.resize(newContainerWidth, newContainerHeight);
    });

    return game; // Return the game instance
}
