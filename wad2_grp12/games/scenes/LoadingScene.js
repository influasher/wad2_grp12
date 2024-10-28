class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        // Load assets for start screen if needed (e.g., background images, button sprites)
        this.load.image('startBackground', 'assets/images/start_background.jpg');
        this.load.image('button', 'assets/images/button.png');
    }
    

    create() {
        const buttonScale = 0.3
        // Add background
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'startBackground').setOrigin(0.5).setDisplaySize(this.scale.width, this.scale.height);
        console.log('hi from loading scene')
        // Add title text
        this.add.text(this.scale.width / 2, this.scale.height / 4, 'Welcome to Elemental Heroes!', {
            fontSize: '50px',
            color: '#000000',
            // fontStyle: 'strong',
            backgroundColor: '#82a5f1',
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            padding: {
                x: 30,
                y: 20
            }
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 4 + 150, 'What would you like to do today?', {
            fontSize: '25px',
            color: '#000000',
            // fontStyle: 'strong',
            backgroundColor: '#56d2d4',
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            padding: {
                x: 30,
                y: 20
            }
        }).setOrigin(0.5);

        // Create Legitimate Lab button
        const legitLabButton = this.add.sprite(this.scale.width / 4, this.scale.height / 4 * 3 - 50, 'button')
            .setInteractive().setScale(buttonScale)
            .on('pointerdown', () => {
                this.scene.start('GameScene'); // Change to the LabGameScene
            })
            .on('pointerover', () => this.bloomButton(legitLabButton, buttonScale))
            .on('pointerout', () => this.resetButton(legitLabButton, buttonScale))
            .on('pointerup', () => {
                // for ipad interaction
                this.scene.start('GameScene'); // Change to the LabGameScene
            });;

        this.add.text(legitLabButton.x, legitLabButton.y, 'Lab Skills Training', { 
            fontSize: '15px', 
            color: '#000000',
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', 
            })
            .setOrigin(0.5);

        // Create Casual Games button
        const casualGamesButton = this.add.sprite(this.scale.width / 4 * 3, this.scale.height / 4 * 3 - 50, 'button')
            .setInteractive().setScale(buttonScale)
            .on('pointerdown', () => {
                this.scene.start('CasualGameScene'); // Change to the CasualGameMenuScene
            })
            .on('pointerover', () => this.bloomButton(casualGamesButton, buttonScale))
            .on('pointerout', () => this.resetButton(casualGamesButton, buttonScale))
            .on('pointerup', () => {
                // for ipad interaction
                this.scene.start('CasualGameScene'); // Change to the LabGameScene
            });

        this.add.text(casualGamesButton.x, casualGamesButton.y, 'Curiosity Corner', { 
            fontSize: '15px', 
            color: '#000000',
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', 
            })
            .setOrigin(0.5);

    }

    
    bloomButton(button, buttonScale) {
        button.setScale(buttonScale + 0.1); // Scale up the button
        button.setTint(0xdddddd); // Change color for effect (optional)
    }

    resetButton(button, buttonScale) {
        button.setScale(buttonScale); // Scale back down
        button.clearTint(); // Reset the color
    }
}
