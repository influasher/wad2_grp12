class LabGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LabGameScene' });
    }

    preload() {
        // Load assets
        this.load.image('labBackground', 'assets/images/labBackground.png');
        this.load.image('testTubeEmpty', 'assets/images/emptyTestTube.png');
        this.load.image('testTubePrecipitateRed', 'assets/images/redTestTube.png');
        this.load.image('testTubePrecipitateBlue', 'assets/images/blueTestTube.png');
        this.load.image('bottle', 'assets/images/emptyBottle.png'); // Same image for both bottles
        this.load.image('rack', 'assets/images/rack.png');
        this.load.image('exitButton', 'assets/images/exitButton.png'); // Add your back button image

        // this.load.image('sodiumHydroxideBottleTilted', 'assets/images/sodium_hydroxide_bottle_tilted.png');
        // this.load.image('pouringStream', 'assets/images/pouring_stream.png');
    }

    create() {
        console.log('hi from lab game scene')
        console.log(this.scale.width) // 1280
        console.log(this.scale.height) // 639

        // Add background
        // this.add.image(this.scale.width / 2, this.scale.height / 2, 'labBackground').setOrigin(0.5).setDisplaySize(1250, 1000);
        const bg = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'labBackground').setOrigin(0.5);
        // Determine the scale factor for the background to cover the full screen while preserving aspect ratio
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY); // Use the larger scale factor to ensure it covers the entire canvas

        bg.setScale(scale);

        const exitButton = this.add.sprite(this.scale.width * 0.92, this.scale.height * 0.055, 'exitButton')
        .setInteractive()
        .setScale(0.1)  // Adjust the size of the button
        .on('pointerdown', () => {
            this.scene.start('LoadingScene');  // Switch back to LoadingScene when clicked
        });

    //   Optionally, you can change the button's appearance when hovering or clicking
            exitButton.on('pointerover', () => exitButton.setTint(0xAAAAAA));  // Change color on hover
            exitButton.on('pointerout', () => exitButton.clearTint());  // Reset color on hover out

        // Add test tube (empty) to the scene
        this.testTube1 = this.add.image(this.scale.width * 0.35 , this.scale.height * 0.7, 'testTubeEmpty').setScale(this.scale.width * 0.004);
        this.testTube2 = this.add.image(this.scale.width * 0.45 , this.scale.height * 0.7, 'testTubeEmpty').setScale(this.scale.width * 0.004);

        // Add rack on the table
        this.add.image(this.scale.width * 0.80, this.scale.height * 0.55, 'rack').setScale(this.scale.width * 0.00085);

        // Add sodium hydroxide bottle and label
        // const naohOriginalPos = { x: 1075, y: 365 };
        this.bottleNaOH = this.add.image(this.scale.width * 0.75, this.scale.height * 0.47 , 'bottle').setScale(this.scale.width * 0.0035).setInteractive();
        this.bottleLabelNaOH = this.add.text(this.scale.width * 0.7, this.scale.height * 0.55, 'NaOH (aq)', { 
            fontSize: `${this.scale.width * 0.015}px`, 
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            color: '#000',
            backgroundColor: '#e2e4e6',
            padding: {
                x: this.scale.width * 0.005,
                y: this.scale.height * 0.006
            } });
        this.input.setDraggable(this.bottleNaOH);

        // Add aqueous ammonia bottle and label
        // const nh3OriginalPos = { x: 975, y: 350 };
        this.bottleNH3 = this.add.image(this.scale.width * 0.83, this.scale.height * 0.49, 'bottle').setScale(this.scale.width * 0.0035).setInteractive();
        this.bottleLabelNH3 = this.add.text(this.scale.width * 0.8, this.scale.height * 0.57, 'NH3 (aq)', { 
            fontSize:`${this.scale.width * 0.015}px`, 
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            color: '#000',
            backgroundColor: '#e2e4e6',
            padding: {
                x: this.scale.width * 0.005,
                y: this.scale.height * 0.006
            } });
        this.input.setDraggable(this.bottleNH3);

        // Add instruction text
        this.instructionText = this.add.text(this.scale.width * 0.03, this.scale.height * 0.03, 'Drag a bottle to the test tube to test for the cation.', {
            fontSize: `${this.scale.width * 0.03}px`,
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            color: '#000',
            backgroundColor: '#e2e4e6',
            padding: {
                x: this.scale.width * 0.005,
                y: this.scale.height * 0.006
            }
        });

        // Dynamic label for holding bottle
        this.holdingText = this.add.text(this.scale.width * 0.03, this.scale.height * 0.1, '', { 
            fontSize: `${this.scale.width * 0.025}px`, 
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            color: '#000',
            backgroundColor: '#e2e4e6',
            padding: {
                x: this.scale.width * 0.005,
                y: this.scale.height * 0.006
            } });

        // Set test tube as a drop zone
        this.testTube1.setInteractive({ dropZone: true });
        this.testTube2.setInteractive({ dropZone: true });

        // State to track whether precipitate has formed
        this.precipitateFormed1 = false;
        this.precipitateFormed2 = false;

        // Handle drag and drop for the bottles
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            this.holdingText.setText(`Holding: ${this.getBottleName(gameObject)}`);
        });

        this.input.on('dragend', (pointer, gameObject) => {
            // Reset the position of the bottles after drag ends
            if (gameObject === this.bottleNaOH) {
                gameObject.x = naohOriginalPos.x;
                gameObject.y = naohOriginalPos.y;
            } else if (gameObject === this.bottleNH3) {
                gameObject.x = nh3OriginalPos.x;
                gameObject.y = nh3OriginalPos.y;
            }
            this.holdingText.setText('');
        });

        this.input.on('drop', (pointer, gameObject, dropZone) => {
            if (dropZone === this.testTube1) {
                const bottleName = this.getBottleName(gameObject);
                if (bottleName === 'Sodium Hydroxide') {
                    // Red precipitate for the first test tube
                    this.addSodiumHydroxideToTestTube(1);
                } else if (bottleName === 'Aqueous Ammonia') {
                    this.instructionText.setText('No visible reaction.');
                }
                
            } else if (dropZone === this.testTube2) {
                const bottleName = this.getBottleName(gameObject);
                if (bottleName === 'Sodium Hydroxide') {
                    // Blue precipitate for the second test tube
                    this.addSodiumHydroxideToTestTube(2);
                } else if (bottleName === 'Aqueous Ammonia') {
                    this.instructionText.setText('No visible reaction.');
                }
            }
        });
    }

    // Get the name of the bottle being dragged
    getBottleName(bottle) {
        if (bottle === this.bottleNaOH) return 'Sodium Hydroxide';
        if (bottle === this.bottleNH3) return 'Aqueous Ammonia';
        return 'Unknown';
    }

    // Sodium hydroxide reaction handling
    // addSodiumHydroxide() {
    //     if (!this.precipitateFormed) {
    //         this.bottleNaOH.setTexture('sodiumHydroxideBottleTilted');
    //         const stream = this.add.image(this.testTube.x, this.testTube.y - 50, 'pouringStream').setDisplaySize(30, 100);

    //         // Tween for pouring animation
    //         this.tweens.add({
    //             targets: stream,
    //             alpha: { from: 1, to: 0 },
    //             duration: 500,
    //             onComplete: () => {
    //                 stream.destroy();
    //                 this.testTube.setTexture('testTubePrecipitateRed');
    //                 this.instructionText.setText('Red-brown precipitate formed.');
    //                 this.precipitateFormed = true;
    //                 this.bottleNaOH.setTexture('bottle');
    //             }
    //         });
    //     } else {
    //         this.instructionText.setText('Excess sodium hydroxide added. Precipitate remains.');
    //     }
    // }

    addSodiumHydroxideToTestTube(testTubeNumber) {
        if (testTubeNumber === 1 && !this.precipitateFormed1) {
            // Red precipitate reaction in test tube 1
            this.bottleNaOH.setTexture('sodiumHydroxideBottleTilted');
            const stream = this.add.image(this.testTube1.x, this.testTube1.y - 50, 'pouringStream').setDisplaySize(30, 100);

            // Tween for pouring animation
            this.tweens.add({
                targets: stream,
                alpha: { from: 1, to: 0 },
                duration: 500,
                onComplete: () => {
                    stream.destroy();
                    this.testTube1.setTexture('testTubePrecipitateRed');
                    this.instructionText.setText('Red-brown precipitate formed in test tube 1.');
                    this.precipitateFormed1 = true;
                    this.bottleNaOH.setTexture('bottle');
                }
            });
        } else if (testTubeNumber === 2 && !this.precipitateFormed2) {
            // Blue precipitate reaction in test tube 2
            this.bottleNaOH.setTexture('sodiumHydroxideBottleTilted');
            const stream = this.add.image(this.testTube2.x, this.testTube2.y - 50, 'pouringStream').setDisplaySize(30, 100);

            // Tween for pouring animation
            this.tweens.add({
                targets: stream,
                alpha: { from: 1, to: 0 },
                duration: 500,
                onComplete: () => {
                    stream.destroy();
                    this.testTube2.setTexture('testTubePrecipitateBlue');
                    this.instructionText.setText('Blue precipitate formed in test tube 2.');
                    this.precipitateFormed2 = true;
                    this.bottleNaOH.setTexture('bottle');
                }
            });
        }
    }
}
