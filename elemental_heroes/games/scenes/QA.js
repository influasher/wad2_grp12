class QA extends Phaser.Scene {
    constructor() {
        super({ key: 'QA' });
    }

    preload() {
        // Load assets
        this.load.image('labBackground', 'assets/images/labBackground.png');
        this.load.image('testTubeEmpty', 'assets/images/colourlessSolution.png');
        this.load.image('testTubePrecipitateRed', 'assets/images/redPrecipitate.png');
        this.load.image('testTubePrecipitateBlue', 'assets/images/lightBluePrecipitate.png');
        this.load.image('testTubePrecipitateGreen', 'assets/images/greenPrecipitate.png');
        this.load.image('testTubePrecipitateWhite', 'assets/images/whitePrecipitate.png');
        this.load.image('testTubeSolutionDarkBlue', 'assets/images/darkBlueSolution.png'); // Dark blue solution for NH3 excess in blue test tube
        this.load.image('testTubeSolutionColorless', 'assets/images/colourlessSolution.png'); // Colorless solution for white test tubes with excess
        this.load.image('bottle', 'assets/images/bottle.png');
        this.load.image('rack', 'assets/images/rack.png');
        this.load.image('exitButton', 'assets/images/exitButton.png');
        this.load.image('resetButton', 'assets/images/resetButton.png'); // Reset button image
        this.load.image('soundOnButton', 'assets/images/soundOn.png');  // Sound on button image
        this.load.image('soundOffButton', 'assets/images/soundOff.png');  // Sound off button image

        // audio load
        this.load.audio('glassClick', 'assets/audio/glassClick.wav');  // click sound
        this.load.audio('errorClick', 'assets/audio/errorClick.wav');  // error sound
        this.load.audio('resetClick', 'assets/audio/resetClick.wav');  // reset sound
        this.load.image('pouringStream', 'assets/images/pouringBottle.png');


    }

    create() {
        // Background setup
        const bg = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'labBackground').setOrigin(0.5);
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        this.createMusicToggleButton();

        const exitButton = this.add.sprite(this.scale.width * 0.83, this.scale.height * 0.05, 'exitButton')
            .setInteractive()
            .setScale(0.16)
            .on('pointerdown', () => {
                this.sound.play('glassClick');
                this.scene.start('GameScene')})
            .on('pointerover', () => exitButton.setTint(0xAAAAAA))
            .on('pointerout', () => exitButton.clearTint());

        const baseTextStyle = {
            fontFamily: 'Courier New, monospace',
            color: '#000',
            backgroundColor: '#e2e4e6',
            padding: { x: this.scale.width * 0.005,
                y: this.scale.height * 0.006 }
        };

        this.add.image(this.scale.width * 0.80, this.scale.height * 0.55, 'rack').setScale(this.scale.width * 0.00085);

        // Add test tubes
        this.testTubes = [
            this.add.image(this.scale.width * 0.35, this.scale.height * 0.7, 'testTubeEmpty').setScale(this.scale.width * 0.0007).setInteractive({ dropZone: true }),
            this.add.image(this.scale.width * 0.45, this.scale.height * 0.7, 'testTubeEmpty').setScale(this.scale.width * 0.0007).setInteractive({ dropZone: true }),
            this.add.image(this.scale.width * 0.55, this.scale.height * 0.7, 'testTubeEmpty').setScale(this.scale.width * 0.0007).setInteractive({ dropZone: true })
        ];

        // Precipitate colors and randomization
        const precipitateColors = [
            'testTubePrecipitateRed',
            'testTubePrecipitateBlue',
            'testTubePrecipitateGreen',
            'testTubePrecipitateWhite'
        ];
        const shuffledColors = Phaser.Utils.Array.Shuffle(precipitateColors);
        this.testTubeColors = shuffledColors.slice(0, 3);

        // Set states to track precipitate and excess solution
        this.precipitateFormed = [false, false, false];
        this.excessAdded = [false, false, false];
        this.addedSolution = [null, null, null];  // Tracks whether NaOH or NH3 was added first

        // Add bottles and labels (NaOH, NH3)
        const naohOriginalPos = { x: this.scale.width * 0.75, y: this.scale.height * 0.47 };
        const nh3OriginalPos = { x: this.scale.width * 0.83, y: this.scale.height * 0.49 };

        this.bottleNaOH = this.add.image(naohOriginalPos.x, naohOriginalPos.y, 'bottle').setScale(this.scale.width * 0.00175).setInteractive();
        this.bottleLabelNaOH = this.add.text(this.scale.width * 0.7, this.scale.height * 0.55, 'NaOH (aq)', { 
            ...baseTextStyle, fontSize: `${this.scale.width * 0.015}px`
            });

        this.bottleNH3 = this.add.image(nh3OriginalPos.x, nh3OriginalPos.y, 'bottle').setScale(this.scale.width * 0.00175).setInteractive();
        this.bottleLabelNH3 = this.add.text(this.scale.width * 0.8, this.scale.height * 0.57, 'NH3 (aq)', { 
            ...baseTextStyle, fontSize: `${this.scale.width * 0.015}px`
            });

        // Instruction Text
        this.instructionText = this.add.text(this.scale.width * 0.03, this.scale.height * 0.03, 'Drag a bottle to the test tube\nto test for the cation.', { 
            ...baseTextStyle, fontSize: `${this.scale.width * 0.025}px`
            });

        // Add reset buttons under each test tube
        this.resetButtons = this.testTubes.map((testTube, index) => {
            return this.add.sprite(testTube.x, testTube.y + 70, 'resetButton')
                .setScale(0.1)
                .setInteractive()
                .on('pointerdown', () => {
                    this.resetTestTube(index); 
                    this.sound.play('resetClick');});
        });

        // Handle dragging and dropping
        this.input.setDraggable(this.bottleNaOH);
        this.input.setDraggable(this.bottleNH3);

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (gameObject === this.bottleNaOH) {
                gameObject.setPosition(naohOriginalPos.x, naohOriginalPos.y);
            } else if (gameObject === this.bottleNH3) {
                gameObject.setPosition(nh3OriginalPos.x, nh3OriginalPos.y);
            }
            this.sound.play('glassClick');
        });

        this.input.on('drop', (pointer, gameObject, dropZone) => {
            const testTubeIndex = this.testTubes.indexOf(dropZone);
            if (testTubeIndex !== -1) {
                const bottleName = this.getBottleName(gameObject);
                this.playPouringAnimation(testTubeIndex, gameObject);

                // Check if excess has already been added
                if (this.excessAdded[testTubeIndex]) {
                    this.instructionText.setText('Excess already added.');
                    this.sound.play('errorClick');
                }
                // Check if wrong solution is being added
                else if (this.precipitateFormed[testTubeIndex]) {
                    if (this.addedSolution[testTubeIndex] !== bottleName) {
                        this.showWrongExcessMessage(testTubeIndex, bottleName);
                        this.sound.play('errorClick');
                    } else {
                        this.addExcessSolution(testTubeIndex, bottleName);
                    }
                } else {
                    this.addPrecipitateToTestTube(testTubeIndex, bottleName);
                }
            }
        });
    }

    getBottleName(bottle) {
        if (bottle === this.bottleNaOH) return 'Sodium Hydroxide';
        if (bottle === this.bottleNH3) return 'Aqueous Ammonia';
        return 'Unknown';
    }

    // Logic for adding precipitate based on test tube color and bottle used
    addPrecipitateToTestTube(testTubeIndex, bottleName) {
        const selectedColor = this.testTubeColors[testTubeIndex];
        if (!this.precipitateFormed[testTubeIndex]) {
            this.testTubes[testTubeIndex].setTexture(selectedColor);
            this.precipitateFormed[testTubeIndex] = true;
            this.addedSolution[testTubeIndex] = bottleName;

            if (selectedColor === 'testTubePrecipitateBlue') {
                this.instructionText.setText('Blue precipitate formed.');
            } else if (selectedColor === 'testTubePrecipitateRed') {
                this.instructionText.setText('Red precipitate formed.');
            } else if (selectedColor === 'testTubePrecipitateGreen') {
                this.instructionText.setText('Green precipitate formed.');
            } else if (selectedColor === 'testTubePrecipitateWhite') {
                this.instructionText.setText('White precipitate formed.');
            }
        }
    }

    // Logic for adding excess solution
    addExcessSolution(testTubeIndex, bottleName) {
        const selectedColor = this.testTubeColors[testTubeIndex];
        this.excessAdded[testTubeIndex] = true;

        if (selectedColor === 'testTubePrecipitateBlue') {
            if (bottleName === 'Sodium Hydroxide') {
                this.instructionText.setText('Excess NaOH added. Blue precipitate remains.');
            } else if (bottleName === 'Aqueous Ammonia') {
                this.testTubes[testTubeIndex].setTexture('testTubeSolutionDarkBlue');
                this.instructionText.setText('Excess NH3 added. Dark blue solution formed.');
            }
        } else if (selectedColor === 'testTubePrecipitateRed') {
            this.instructionText.setText('Excess added. Red precipitate remains.');
        } else if (selectedColor === 'testTubePrecipitateGreen') {
            this.instructionText.setText('Excess added. Green precipitate remains.');
        } else if (selectedColor === 'testTubePrecipitateWhite') {
            if (bottleName === 'Sodium Hydroxide') {
                this.testTubes[testTubeIndex].setTexture('testTubeSolutionColorless');
                this.instructionText.setText('Excess NaOH added. Colorless solution formed.');
            } else {
                this.instructionText.setText('Excess NH3 added. White precipitate remains.');
            }
        }
    }

    // Show error message for wrong excess solution
    showWrongExcessMessage(testTubeIndex, bottleName) {
        if (this.addedSolution[testTubeIndex] === 'Sodium Hydroxide') {
            this.instructionText.setText('You can only add Sodium Hydroxide in excess.');
        } else if (this.addedSolution[testTubeIndex] === 'Aqueous Ammonia') {
            this.instructionText.setText('You can only add Aqueous Ammonia in excess.');
        }
    }

    // Reset the test tube back to empty
    resetTestTube(testTubeIndex) {
        this.testTubes[testTubeIndex].setTexture('testTubeEmpty');
        this.precipitateFormed[testTubeIndex] = false;
        this.excessAdded[testTubeIndex] = false;
        this.addedSolution[testTubeIndex] = null;
        this.instructionText.setText('Test tube reset.');
    }
    
    // Create the pouring animation function
    playPouringAnimation(testTubeIndex, bottle) {
        console.log('pouring')
        const testTube = this.testTubes[testTubeIndex];
    
        // Create the pouring stream
        const pouringStream = this.add.image(testTube.x+20, testTube.y-60, 'pouringStream').setScale(1);
    
        // Animate the pouring (move the stream downwards towards the test tube and fade it out)
        this.tweens.add({
            targets: pouringStream,
            x: testTube.x,  // Move to the x position of the test tube
            y: testTube.y - 50,  // Move down near the top of the test tube
            alpha: { from: 1, to: 0 },  // Fade out the stream
            duration: 2000,  // Adjust timing for a smooth pour
            onComplete: () => {
                pouringStream.destroy();  // Remove the stream after animation
                this.addPrecipitateToTestTube(testTubeIndex, this.getBottleName(bottle));  // Call function to add precipitate
            }
        });
    }
    

    createMusicToggleButton() {
        // Initially show the "sound on" button
        let isMusicOn = true;
        let button = this.add.sprite(this.scale.width * 0.96, this.scale.height * 0.05, 'soundOnButton').setInteractive().setScale(0.13);

        // Add click handler for toggling the music on/off
        button.on('pointerdown', () => {
            if (isMusicOn) {
                backgroundMusic.pause();  // Pause the music
                console.log('music paused')
                isMusicOn = false;
                button.setTexture('soundOffButton');  // Switch to "sound off" button image
            } else {
                backgroundMusic.resume();  // Resume the music
                isMusicOn = true;
                button.setTexture('soundOnButton');  // Switch back to "sound on" button image
            }
        }).on('pointerover', () => button.setTint(0xAAAAAA))
        .on('pointerout', () => button.clearTint());;
    }
}
