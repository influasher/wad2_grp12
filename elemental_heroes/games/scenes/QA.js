import Phaser from 'phaser';

export class QA extends Phaser.Scene {
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
        this.load.image('pouringStream', 'assets/images/pouringBottle.png');
        this.load.image('clipboard','/assets/images/clipboard.png');
        this.load.image('button', 'assets/images/button.png');
        this.load.image('catMascot', 'assets/images/catMascot.png');




        // audio load
        this.load.audio('glassClick', 'assets/audio/glassClick.wav');  // click sound
        this.load.audio('errorClick', 'assets/audio/errorClick.wav');  // error sound
        this.load.audio('resetClick', 'assets/audio/resetClick.wav');  // reset sound


    }

    create() {
        const bg = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'labBackground').setOrigin(0.5);
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        if (this.game.backgroundMusic) {
            this.game.backgroundMusic.stop();  // Stop the music
            this.game.backgroundMusic = null;  // Clear the reference to allow music to restart later
        }
        this.showInstructions();
        
    }

    initializeGameElements(){
        const exitButton = this.add.sprite(this.scale.width * 0.95, this.scale.height * 0.05, 'exitButton')
            .setInteractive()
            .setScale(0.1)
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

    showInstructions() {
        console.log('show instructions called')
        // Create a semi-transparent background for the popup
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.65);
        overlay.fillRect(0, 0, this.scale.width, this.scale.height);

    
        // Add a background box for the instructions
        const instructionBox = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'clipboard')
            .setOrigin(0.5)
            .setScale(1.5, 1);

    
        // Add instruction text
        const instructionText = this.add.text(this.cameras.main.centerX,
            this.cameras.main.centerY - instructionBox.displayHeight / 3, 
            "Welcome to Lab Skills Training [QA]!\n\nI am Felix Chemicus, and here's how to play my game:\n\n1. Drag and drop NaOH and NH3 bottles \nonto test tubes.\n\n2. Observe the reactions and note the \nprecipitate formed.\n\n3. Use the reset button to clear a \ntest tube.\n\nAre you ready?", 
            {
                fontSize: `${this.scale.width * 0.018}px`,
                color: '#000',
                align: 'left',
                wordWrap: { width: instructionBox.width - 40 }
            }
        ).setOrigin(0.5, 0);

    
        let buttonScale = 0.25;
        const buttonY = this.cameras.main.centerY + instructionBox.displayHeight * 0.3;
        // Add start button image
        const startButtonImage = this.add.image(this.cameras.main.centerX, buttonY, 'button')
        .setInteractive()
        .setScale(buttonScale); // Adjust scale as needed

        // Add text over the start button
        const startButtonText = this.add.text(this.cameras.main.centerX,
            buttonY, "Let's go!", {
            fontSize: `${this.scale.width * 0.025}px`,
            color: '#000',
            align: 'center'
        }).setOrigin(0.5);

        startButtonImage.on('pointerover', () => {
            startButtonImage.setScale(buttonScale + 0.05); // Scale up on hover
        });
        startButtonImage.on('pointerout', () => {
            startButtonImage.setScale(buttonScale); // Scale back down on hover out
        });

        // Add interactivity to the start button image
        startButtonImage.on('pointerdown', () => {
            overlay.destroy(); // Remove the overlay
            instructionBox.destroy(); // Remove the instruction box
            mascot.destroy();
            instructionText.destroy(); // Remove the instruction text
            startButtonImage.destroy(); // Remove the start button image
            startButtonText.destroy(); // Remove the start button text
            this.sound.play('glassClick'); // Optional sound effect
    
            // Call the function to initialize game elements
            this.initializeGameElements();
        });

        const mascot = this.add.image(this.scale.width * 0.85, this.scale.height * 0.7, 'catMascot')
        .setOrigin(0.5)
        .setDepth(1)
        .setScale(1);  
        
    }
    

}
