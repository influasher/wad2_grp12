import Phaser from 'phaser';


export class CasualGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CasualGameScene' });
    }

    preload() {
        // Load any necessary assets, such as background images
        this.load.image('background', 'assets/images/start_background.jpg'); // Background for the scene
        this.load.image('backButton', 'assets/images/backButton.png'); // Add your back button image
        this.load.image('button', 'assets/images/button.png');
        this.load.audio('glassClick', 'assets/audio/glassClick.wav');  // click sound


    }

    create() {
        if (!this.game.backgroundMusic) {
            // Create the background music if it doesn't already exist
            this.game.backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
            this.game.backgroundMusic.play();
        } 

        const buttonScale = this.scale.width * 0.0005;
        
        // background
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'background').setOrigin(0.5).setDisplaySize(this.scale.width, this.scale.height);
        
        const backButton = this.add.sprite(this.scale.width * 0.03, this.scale.height * 0.055, 'backButton')
        .setInteractive()
        .setScale(0.1)  // Adjust the size of the button
        .on('pointerdown', () => {
            this.sound.play('glassClick');
            this.scene.start('LoadingScene');  // Switch back to LoadingScene when clicked
        });

        this.createMusicToggleButton();
        // Title text
        this.add.text(this.scale.width / 2, 50, 'Curiosity Corner', {
            fontSize: '50px',
            color: '#000',
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
        }).setOrigin(0.5);

        // Array of game titles and associated scenes
        const games = [
            { title: 'Chemical Matching', scene: 'ChemicalMatchingScene' },
            { title: 'Monster Elimination\n[Coming Soon]', scene: 'MonsterEliminationScene' },
            { title: 'Environmental Cleanup\n[Coming Soon]', scene: 'EnvironmentalCleanupScene' },
            { title: 'Catalyst Clash\n[Coming Soon]', scene: 'FourthScene' }
        ];

        // Manually set each card’s position based on your specifications
        const positions = [
            { x: this.scale.width * 0.25, y: this.scale.height * 0.35 },
            { x: this.scale.width * 0.75, y: this.scale.height * 0.35},
            { x: this.scale.width * 0.25, y:  this.scale.height * 0.75 },
            { x: this.scale.width * 0.75, y: this.scale.height * 0.75 }
        ];

        games.forEach((game, index) => {
            const { x, y } = positions[index];

            // Add button sprite for the game
            const gameButton = this.add.sprite(x, y, 'button')
                .setScale(buttonScale)

                // Disable interactivity for "Coming Soon" games
            if (game.title.includes('[Coming Soon]')) {
                gameButton.setTint(0xAAAAAA); // Grey out the button
            } else {
                gameButton.setInteractive().on('pointerdown', () => {
                    this.sound.play('glassClick');
                    this.scene.start(game.scene);
                });
            }

            // Add hover effects
            gameButton.on('pointerover', () => {
                gameButton.setScale(buttonScale + 0.05); // Scale up on hover
            });
            gameButton.on('pointerout', () => {
                gameButton.setScale(buttonScale); // Scale back down on hover out
            });

            // Add title text inside the button
            this.add.text(x, y, game.title, {
                fontSize: `${this.scale.width * 0.03}px`,
                color: '#000',
                fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
                align: 'center',
            }).setOrigin(0.5);
        });
 
    }

    createMusicToggleButton() {
        let isMusicOn = this.game.backgroundMusic.isPlaying; // Track if the music is on
        console.log(isMusicOn)
        let texture = '';
        if(this.game.backgroundMusic.isPlaying){
            texture = 'soundOnButton';
        } else{
            texture = 'soundOffButton';
        }

        let button = this.add.sprite(this.scale.width * 0.96, this.scale.height * 0.06, texture).setInteractive().setScale(0.13);
    
        button.on('pointerdown', () => {
            if (isMusicOn) {
                this.game.backgroundMusic.pause(); // Pause the existing music
                isMusicOn = false;
                button.setTexture('soundOffButton');
            } else {
                this.game.backgroundMusic.resume(); // Resume the existing music
                isMusicOn = true;
                button.setTexture('soundOnButton');
            }
        });
    }
}
