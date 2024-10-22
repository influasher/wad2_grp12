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
        // this.load.image('sodiumHydroxideBottleTilted', 'assets/images/sodium_hydroxide_bottle_tilted.png');
        // this.load.image('pouringStream', 'assets/images/pouring_stream.png');
    }

    create() {
        console.log('hi from lab game scene')
        console.log(this.scale.width) // 1280
        console.log(this.scale.height) // 639
        // Add background
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'labBackground').setOrigin(0.5).setDisplaySize(1250, 1000);

        // Add test tube (empty) to the scene
        this.testTube1 = this.add.image(380, 500, 'testTubeEmpty').setDisplaySize(90, 90);
        this.testTube2 = this.add.image(450, 500, 'testTubeEmpty').setDisplaySize(90, 90);

        // Add rack on the table
        this.add.image(1050, 400, 'rack').setDisplaySize(500, 500);

        // Add sodium hydroxide bottle and label
        const naohOriginalPos = { x: 1075, y: 365 };
        this.bottleNaOH = this.add.image(1075, 365, 'bottle').setDisplaySize(90, 90).setInteractive();
        this.bottleLabelNaOH = this.add.text(1040, 420, 'NaOH (aq)', { 
            fontSize: '16px', 
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            color: '#000',
            backgroundColor: '#e2e4e6',
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            } });
        this.input.setDraggable(this.bottleNaOH);

        // Add aqueous ammonia bottle and label
        const nh3OriginalPos = { x: 975, y: 350 };
        this.bottleNH3 = this.add.image(975, 350, 'bottle').setDisplaySize(90, 90).setInteractive();
        this.bottleLabelNH3 = this.add.text(940, 405, 'NH3 (aq)', { 
            fontSize: '16px', 
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            color: '#000',
            backgroundColor: '#e2e4e6',
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            } });
        this.input.setDraggable(this.bottleNH3);

        // Add instruction text
        this.instructionText = this.add.text(20, 20, 'Drag a bottle to the test tube to test for the cation.', {
            fontSize: '24px',
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            color: '#000',
            backgroundColor: '#e2e4e6',
            padding: {
                left: 5,
                right: 5,
                top: 5,
                bottom: 5
            }
        });

        // Dynamic label for holding bottle
        this.holdingText = this.add.text(20, 60, '', { 
            fontSize: '18px', 
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            color: '#000',
            backgroundColor: '#e2e4e6',
            padding: {
                left: 5,
                right: 5,
                top: 5,
                bottom: 5
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
