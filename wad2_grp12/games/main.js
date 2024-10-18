// Game configuration object
const config = {
    type: Phaser.AUTO,                   // Phaser will use WebGL if available, else falls back to Canvas
    width: window.innerWidth,            // Set game width to full window width
    height: window.innerHeight,          // Set game height to full window height
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
    scene: [LoadingScene, CasualGameScene, ChemicalMatchingScene],  // Add all scenes to the Phaser game instance
};

// Initialize the Phaser game with the config
const game = new Phaser.Game(config);

// Optional: Handle resizing of the game window
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
