const gameContainer = document.getElementById('game-container');
const containerWidth = gameContainer.clientWidth;
const containerHeight = gameContainer.clientHeight;

// Game configuration object
const config = {
    type: Phaser.AUTO, // Phaser will use WebGL if available, else falls back to Canvas
    parent: 'game-container',                   
    width: containerWidth,            // Set game width to full window width
    height: containerHeight,          // Set game height to full window height
    scale: {
        mode: Phaser.Scale.FIT,          // Scale the game to fit the screen
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game both horizontally and vertically
    },
    physics: {
        default: 'arcade',               // Use arcade physics for simplicity
        arcade: {
            gravity: { y: 0 },           // Disable gravity as it’s not needed in a top-down game
            debug: false                 // Set to true if you need to see collision boxes for debugging
        }
    },
    scene: [LoadingScene, CasualGameScene, ChemicalMatchingScene, LabGameScene],  // Add all scenes to the Phaser game instance
};

// Initialize the Phaser game with the config
const game = new Phaser.Game(config);

game.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
    const width = gameSize.width;
    const height = gameSize.height;

    // Example: Reposition and resize game objects
    if (game.scene.scenes.length > 0) {
        game.scene.scenes.forEach(scene => {
            if (scene.scale) {
                scene.children.list.forEach(child => {
                    if (child.isGameObject && child.setPosition && child.setDisplaySize) {
                        // Reposition and resize game objects relatively
                        child.setPosition(child.x / game.scale.baseSize.width * width, child.y / game.scale.baseSize.height * height);
                        child.setDisplaySize(child.displayWidth / game.scale.baseSize.width * width, child.displayHeight / game.scale.baseSize.height * height);
                    }
                });
            }
        });
    }
});

// Optional: Handle resizing of the game window
window.addEventListener('resize', () => {
    const newContainerWidth = gameContainer.clientWidth;
    const newContainerHeight = gameContainer.clientHeight;
    game.scale.resize(newContainerWidth, newContainerHeight);
});
