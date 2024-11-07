import Phaser from 'phaser';
import { updateScores } from '../updateGame.js';

export class ChemicalMatchingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChemicalMatchingScene' });
    }

    preload() {
        // Load assets for elements and card background
        this.load.image('woodenBackground', 'assets/images/woodenTable.jpg'); // Background for the scene
        this.load.image('card', 'assets/images/card.png'); // Single card image
        this.load.image('potassium', 'assets/elements/potassium.png');
        this.load.image('neon', 'assets/elements/neon.png');
        this.load.image('gold', 'assets/elements/gold.png');
        this.load.image('chlorine', 'assets/elements/chlorine.png');
        this.load.image('iron', 'assets/elements/iron.png');
        this.load.image('copper', 'assets/elements/copper.png');
        this.load.image('astatine', 'assets/elements/astatine.png');
        this.load.image('bromine', 'assets/elements/bromine.png');
        this.load.image('backButton', 'assets/images/backButton.png'); // Add your back button image
        this.load.image('restartButton', 'assets/images/restartButton.png'); // Add your back button image
        this.load.image('exitButton', 'assets/images/exitButton.png'); // Add your back button image
        this.load.audio('glassClick', 'assets/audio/glassClick.wav');  // click sound
        this.load.image('clipboard','/assets/images/clipboard.png');
        this.load.image('button', 'assets/images/button.png');
        this.load.image('catMascot', 'assets/images/catMascot.png');
        
    }

    create() {
        if (this.game.backgroundMusic) {
            this.game.backgroundMusic.stop();  // Stop the music
            this.game.backgroundMusic = null;  // Clear the reference to allow music to restart later
        }

        const bg = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'woodenBackground').setOrigin(0.5);
        // Determine the scale factor for the background to cover the full screen while preserving aspect ratio
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY); // Use the larger scale factor to ensure it covers the entire canvas

        bg.setScale(scale);

        this.showInstructions();

    }

    initializeGameElements(){

        const backButton = this.add.sprite(this.scale.width * 0.03, this.scale.height * 0.055, 'backButton')
        .setInteractive()
        .setScale(0.1)  // Adjust the size of the button
        .on('pointerdown', () => {
            this.sound.play('glassClick');
            this.scene.start('CasualGameScene');  // Switch back to LoadingScene when clicked
        });

    // Optionally, you can change the button's appearance when hovering or clicking
        backButton.on('pointerover', () => backButton.setTint(0xAAAAAA));  // Change color on hover
        backButton.on('pointerout', () => backButton.clearTint());  // Reset color on hover out
        
        // Initialize score and timer
    
        this.score = 0;
        this.timeRemaining = 30; // 30 seconds for the game

        // Display score text
        this.scoreText = this.add.text(this.scale.width * 0.065, this.scale.height * 0.03, 'Score: 0', {
            fontSize: `${this.scale.width * 0.03}px`,
            color: '#000',
            fontFamily: 'Georgia, serif',
        });

        // Display timer text
        this.timerText = this.add.text(this.scale.width * 0.83, this.scale.height * 0.03, `Time: ${this.timeRemaining}`, {
            fontSize: `${this.scale.width * 0.03}px`,
            color: '#000',
            fontFamily: 'Georgia, serif',
        });

                // Set up a full list of element properties with additional elements
        const allElementProperties = [
            { element: 'potassium', property: 'K', type: 'Chemical Formula:' },
            { element: 'neon', property: 'Noble Gas', type: 'Chemical Property:' },
            { element: 'gold', property: 'Au', type: 'Chemical Formula:' },
            { element: 'chlorine', property: 'Greenish-yellow\ngas', type: 'Chemical Property:' },
            { element: 'iron', property: 'Metallic', type: 'Physical Property:' },
            { element: 'copper', property: 'Red brown\nsolid', type: 'Physical Property:' },
            { element: 'astatine', property: 'Radioactive', type: 'Physical Property:' },
            { element: 'bromine', property: 'Group 17\nelement', type: 'Chemical Property:' },
        ];

        // Randomly select 5 elements from the full list
        const shuffledElements = Phaser.Utils.Array.Shuffle(allElementProperties);
        const elementProperties = shuffledElements.slice(0, 4); // Get 4 random elements

        // Set up the draggable elements based on the randomly selected ones
        const elements = elementProperties.map((prop, index) => {
            const xPosition = this.scale.width * (0.25 + index * 0.15); // Adjust positions dynamically
            console.log(index)
            return { name: prop.element, x: xPosition, y: this.scale.height * 0.2 };
        });

        elements.forEach((elementData) => {
            const element = this.add.image(elementData.x, elementData.y, elementData.name)
                .setScale(0.55)
                .setInteractive();
            this.input.setDraggable(element);

            element.originalX = elementData.x;
            element.originalY = elementData.y;

            element.on('pointerdown', () => {
                element.setScale(1.1); // Scale up on select
            });

            element.on('pointerup', () => {
                element.setScale(0.55); // Reset scale
            });
        });

        // Add dragging functionality
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (!this.gameOver) {
                gameObject.x = dragX;
                gameObject.y = dragY;
            }
        });

        // Position cards with properties
        const cardPositions = [
            { x: this.scale.width / 4, y: this.scale.height * 0.5 },
            { x: (3 * this.scale.width) / 4, y: this.scale.height * 0.5 },
            { x: this.scale.width / 4, y: this.scale.height * 0.8 },
            { x: (3 * this.scale.width) / 4, y: this.scale.height * 0.8},
        ];

        elementProperties.forEach((prop, index) => {
            const pos = cardPositions[index % cardPositions.length];
        
            // Add card background
            const card = this.add.image(pos.x, pos.y, 'card')
                .setDisplaySize(250, 150)
                .setOrigin(0.5)
                .setInteractive();
        
            // Add property text to each card
            const typeText = this.add.text(pos.x, pos.y - 20, prop.type, {
                fontSize: `${this.scale.width * 0.025}px`,
                color: '#000',
                fontFamily: 'Georgia, serif',
                align: 'center'
            }).setOrigin(0.5);
        
            const propertyText = this.add.text(pos.x, pos.y + 20, prop.property, {
                fontSize: `${this.scale.width * 0.025}px`,
                color: '#000',
                fontFamily: 'Georgia, serif',
                align: 'center'
            }).setOrigin(0.5);
        
            // Define drop zone for each card
            const dropZone = this.add.zone(pos.x, pos.y, 250, 150)
                .setRectangleDropZone(250, 150)
                .setData('element', prop.element);
        
            // Add card and zone to the same position
            card.setDataEnabled();
            card.data.set('element', prop.element);
        });

        this.correctMatches = 0; // Initialize a counter for correct matches
        
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            // Check if the match is correct
            if (dropZone.getData('element') === gameObject.texture.key) {
                // Correct match: position at bottom-right of the card
                gameObject.setPosition(dropZone.x + 95, dropZone.y + 45).setScale(0.25);
                gameObject.setDepth(1); // Ensure it appears on top`
                gameObject.disableInteractive(); // Disable dragging for correct match
                this.correctMatches++;
                this.resultText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Correct!', {
                    fontSize: `${this.scale.width * 0.05}px`,
                    color: '#00ff00',
                    fontFamily: 'Georgia, serif',
                }).setOrigin(0.5);
                
                this.updateScore(10);

                        // Check if all matches are correct
                if (this.correctMatches === elements.length) {
                    this.endGame();
                }
            } else {
                // Incorrect match: return to original position
                gameObject.setPosition(gameObject.originalX, gameObject.originalY).setScale(0.8);
                this.resultText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Wrong!', {
                    fontSize: `${this.scale.width * 0.05}px`,
                    color: '#ff0000',
                    fontFamily: 'Georgia, serif',
                }).setOrigin(0.5);
                
                this.updateScore(-5);
            }

            // Fade out the result text after 1 second
            this.time.delayedCall(1000, () => {
                if (this.resultText) this.resultText.destroy();
            });
        });
        

        // Timer countdown
        this.timerEvent = this.time.addEvent({
            delay: 1000,                // Run every second
            callback: this.updateTimer,
            callbackScope: this,
            loop: true,
        });
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    updateTimer() {
        this.timeRemaining -= 1;
        this.timerText.setText(`Time: ${this.timeRemaining}`);

        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.timerText.setText('Time: 0');
            this.endGame();
        }
    }

    async endGame() {
        const overlay = this.add.graphics().setDepth(1);
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, this.scale.width, this.scale.height);
        this.timerEvent.remove(); // Stop the timer
        // Display game over message and final score
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 70, `Game Over\nGreat Job!\nFinal Score: ${this.score}`, {
            fontSize: '32px',
            color: '#000',
            fontFamily: 'Georgia, serif',
            align: 'center',
            backgroundColor: '#ffffff',
            padding: {
                x: 5,
                y: 5,
            }
        }).setOrigin(0.5).setDepth(10);
        
        this.gameOver = true; // Set game over flag

        const additionalScore = this.score; // Replace with your score calculation logic

        const success = await updateScores(additionalScore);
        if (success) {
          console.log('Score updated successfully');
        } else {
          console.error('Failed to update the score');
        }
    

        const exitButton = this.add.sprite(this.scale.width * 0.5, this.scale.height * 0.65, 'exitButton')
        .setInteractive()
        .setDepth(10)
        .setScale(0.1)  // Adjust the size of the button
        .on('pointerdown', () => {
            this.sound.play('glassClick');
            this.scene.start('CasualGameScene');  // Switch back to CasualGameScene when clicked
        });

        exitButton.on('pointerover', () => exitButton.setTint(0xAAAAAA));  // Change color on hover
        exitButton.on('pointerout', () => exitButton.clearTint());  // Reset color on hover out

        const restartButton = this.add.sprite(this.scale.width * 0.5, this.scale.height * 0.75, 'restartButton')
        .setInteractive()
        .setDepth(10)
        .setScale(0.1)  // Adjust the size of the button
        .on('pointerdown', () => {
            this.gameOver = false; // Reset the game over flag
            this.scene.restart();  // Restart the game scene
        });

        restartButton.on('pointerover', () => restartButton.setTint(0xAAAAAA));  // Change color on hover
        restartButton.on('pointerout', () => restartButton.clearTint());  // Reset color on hover out
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
            .setScale(1.5,1);

    
        // Add instruction text
        const instructionText = this.add.text(this.cameras.main.centerX,
            this.cameras.main.centerY - instructionBox.displayHeight * 0.3, 
            "Welcome to Chemical Matching!\n\nI am Felix Chemicus, and here's how to play my game:\n\n1. You have 30 seconds to match all \nthe elements to the card that best \ndescribes the element!\n\n2. For every correct match, you will \nbe awarded with 10 points.\n\n3. For every wrong match, you will be \ndeducted 5 points.\n\nAre you ready?", 
            {
                fontSize: `${this.scale.width * 0.018}px`,
                color: '#000',
                align: 'left',
                wordWrap: { width: instructionBox.width - 40 }
            }
        ).setOrigin(0.5, 0);



    
        let buttonScale = 0.25;
        const buttonY = this.cameras.main.centerY + instructionBox.displayHeight / 2 - 90;
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
            mascot.destroy(); // Remove the mascot image
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
