import Phaser from 'phaser';
 
 export class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });

    }

    preload() {
        // Load assets for start screen if needed (e.g., background images, button sprites)
        this.load.image('startBackground', '/assets/images/startBackground.jpg');
        this.load.image('button', '/assets/images/button.png');
        this.load.image('soundOnButton', '/assets/images/soundOn.png');  // Sound on button image
        this.load.image('soundOffButton', '/assets/images/soundOff.png');  // Sound off button image
        this.load.audio('glassClick', '/assets/audio/glassClick.wav');  // click sound
        if (!this.game.backgroundMusic) {
            this.load.audio('backgroundMusic', 'assets/audio/loadingMusic.wav')
            }

    }
    

    create() {

        if (!this.game.backgroundMusic) {
            this.game.backgroundMusic = this.sound.add('backgroundMusic', {
                loop: true,
                volume: 0.5
            });
            this.game.backgroundMusic.play();
        }

        const buttonScale = this.scale.width * 0.00045;
        console.log(this.scale.width)
        // Add background
        // this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'startBackground').setOrigin(0.5).setDisplaySize(this.scale.width, this.scale.height);
        const bg = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'startBackground').setOrigin(0.5);
            // Determine the scale factor for the background to cover the full screen while preserving aspect ratio
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY); // Use the larger scale factor to ensure it covers the entire canvas
        const fontFam = 'Roboto, "Goudy Bookletter 1911", Times, serif';
        bg.setScale(scale);
        console.log('hi from loading scene')
        this.createMusicToggleButton();
        // Add title text
        this.add.text(this.scale.width * 0.5, this.scale.height * 0.25 , 'Welcome to Elemental Odyssey!', {
            fontSize: `${this.scale.width * 0.05}px`,
            color: '#000000',
            // fontStyle: 'strong',
            backgroundColor: '#82a5f1',
            fontStyle: 'bold',
            // fontFamily: fontFam,
            padding: {
                x: this.scale.width * 0.03, // Padding based on canvas size
                y: this.scale.height * 0.04
            }
        }).setOrigin(0.5);

        this.add.text(this.scale.width * 0.5, this.scale.height * 0.45, 'What would you like to do today?', {
            fontSize: `${this.scale.width * 0.035}px`,
            color: '#000000',
            // fontStyle: 'strong',
            backgroundColor: '#56d2d4',
            fontStyle: 'bold',
            // fontFamily: fontFam,
            padding: {
                x: this.scale.width * 0.03, // Padding based on canvas size
                y: this.scale.height * 0.04
            }
        }).setOrigin(0.5);

        // Create Legitimate Lab button
        const legitLabButton = this.add.sprite(this.scale.width * 0.25, this.scale.height * 0.70, 'button')
            .setInteractive().setScale(buttonScale)
            .on('pointerdown', () => {
                this.sound.play('glassClick');
                this.scene.start('GameScene'); // Change to the LabGameScene
            })
            .on('pointerover', () => this.bloomButton(legitLabButton, buttonScale))
            .on('pointerout', () => this.resetButton(legitLabButton, buttonScale))
            .on('pointerup', () => {
                // for ipad interaction
                this.scene.start('GameScene'); // Change to the LabGameScene
            });;

        this.add.text(legitLabButton.x, legitLabButton.y, 'Lab Skills Training', { 
            fontSize: `${this.scale.width * 0.025}px`, 
            color: '#000000',
            fontStyle: 'bold',
            // fontFamily: fontFam, 
            })
            .setOrigin(0.5);

        // Create Casual Games button
        const casualGamesButton = this.add.sprite(this.scale.width * 0.75, this.scale.height * 0.70, 'button')
            .setInteractive().setScale(buttonScale)
            .on('pointerdown', () => {
                this.sound.play('glassClick');
                this.scene.start('CasualGameScene'); // Change to the CasualGameMenuScene
            })
            .on('pointerover', () => this.bloomButton(casualGamesButton, buttonScale))
            .on('pointerout', () => this.resetButton(casualGamesButton, buttonScale))
            .on('pointerup', () => {
                // for ipad interaction
                this.scene.start('CasualGameScene'); // Change to the LabGameScene
            });

        this.add.text(casualGamesButton.x, casualGamesButton.y, 'Curiosity Corner', { 
            fontSize: `${this.scale.width * 0.025}px`, 
            color: '#000000',
            fontStyle: 'bold',
            // fontFamily: fontFam, 
            })
            .setOrigin(0.5);

    }


    bloomButton(button, buttonScale) {
        button.setScale(buttonScale * 1.1); // Scale up the button
        button.setTint(0xdddddd); // Change color for effect (optional)
    }

    resetButton(button, buttonScale) {
        button.setScale(buttonScale); // Scale back down
        button.clearTint(); // Reset the color
    }

    createMusicToggleButton() {
        // Initially show the "sound on" button
        let isMusicOn = this.game.backgroundMusic.isPlaying;
        let texture = '';
        if(this.game.backgroundMusic.isPlaying){
            texture = 'soundOnButton';
        } else{
            texture = 'soundOffButton';
        }

        let button = this.add.sprite(this.scale.width * 0.96, this.scale.height * 0.06, texture).setInteractive().setScale(0.13);

        
        // Add click handler for toggling the music on/off
        button.on('pointerdown', () => {
            if (isMusicOn) {
                this.game.backgroundMusic?.pause();  // Pause the music
                console.log('music paused')
                isMusicOn = false;
                button.setTexture('soundOffButton');  // Switch to "sound off" button image
            } else {
                this.game.backgroundMusic?.resume();  // Resume the music
                isMusicOn = true;
                button.setTexture('soundOnButton');  // Switch back to "sound on" button image
            }
        });
    }
}
