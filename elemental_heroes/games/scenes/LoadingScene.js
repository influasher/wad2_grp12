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
        const buttonScale = this.scale.width * 0.00045;
        console.log(this.scale.width)
        // Add background
        // this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'startBackground').setOrigin(0.5).setDisplaySize(this.scale.width, this.scale.height);
        const bg = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'startBackground').setOrigin(0.5);
            // Determine the scale factor for the background to cover the full screen while preserving aspect ratio
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY); // Use the larger scale factor to ensure it covers the entire canvas

        bg.setScale(scale);
        console.log('hi from loading scene')
        // Add title text
        this.add.text(this.scale.width * 0.5, this.scale.height * 0.25 , 'Welcome to Elemental Heroes!', {
            fontSize: `${this.scale.width * 0.055}px`,
            color: '#000000',
            // fontStyle: 'strong',
            backgroundColor: '#82a5f1',
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
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
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            padding: {
                x: this.scale.width * 0.03, // Padding based on canvas size
                y: this.scale.height * 0.04
            }
        }).setOrigin(0.5);

        // Create Legitimate Lab button
        const legitLabButton = this.add.sprite(this.scale.width * 0.25, this.scale.height * 0.70, 'button')
            .setInteractive().setScale(buttonScale)
            .on('pointerdown', () => {
                this.scene.start('LabGameScene'); // Change to the LabGameScene
            })
            .on('pointerover', () => this.bloomButton(legitLabButton, buttonScale))
            .on('pointerout', () => this.resetButton(legitLabButton, buttonScale))
            .on('pointerup', () => {
                // for ipad interaction
                this.scene.start('LabGameScene'); // Change to the LabGameScene
            });;

        this.add.text(legitLabButton.x, legitLabButton.y, 'Lab Skills Training', { 
            fontSize: `${this.scale.width * 0.025}px`, 
            color: '#000000',
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', 
            })
            .setOrigin(0.5);

        // Create Casual Games button
        const casualGamesButton = this.add.sprite(this.scale.width * 0.75, this.scale.height * 0.70, 'button')
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
            fontSize: `${this.scale.width * 0.025}px`, 
            color: '#000000',
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', 
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
}
