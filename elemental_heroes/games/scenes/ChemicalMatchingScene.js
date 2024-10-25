class ChemicalMatchingScene extends Phaser.Scene {
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

        
    }

    create() {
        if (backgroundMusic) {
            backgroundMusic.stop();  // Stop the music
            backgroundMusic = null;  // Clear the reference to allow music to restart later
        }

        const bg = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'woodenBackground').setOrigin(0.5);
        // Determine the scale factor for the background to cover the full screen while preserving aspect ratio
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY); // Use the larger scale factor to ensure it covers the entire canvas

        bg.setScale(scale);

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
        this.timeRemaining = 5; // 60 seconds for the game

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
            { element: 'potassium', property: 'K', type: 'Chemical Formula' },
            { element: 'neon', property: 'Noble Gas', type: 'Chemical Property' },
            { element: 'gold', property: 'Very unreactive', type: 'Physical Property' },
            { element: 'chlorine', property: 'Diatomic Gas', type: 'Chemical Property' },
            { element: 'iron', property: 'Metallic', type: 'Physical Property' },
            { element: 'copper', property: 'Red brown', type: 'Physical Property' },
            { element: 'astatine', property: 'Radioactive', type: 'Physical Property' },
            { element: 'bromine', property: 'Br', type: 'Chemical Formula' },
        ];

        // Randomly select 5 elements from the full list
        const shuffledElements = Phaser.Utils.Array.Shuffle(allElementProperties);
        const elementProperties = shuffledElements.slice(0, 4); // Get 5 random elements

        // Set up the draggable elements based on the randomly selected ones
        const elements = elementProperties.map((prop, index) => {
            const xPosition = this.scale.width * (0.25 + index * 0.15); // Adjust positions dynamically
            console.log(index)
            return { name: prop.element, x: xPosition, y: this.scale.height * 0.2 };
        });

        elements.forEach((elementData) => {
            const element = this.add.image(elementData.x, elementData.y, elementData.name)
                .setScale(0.8)
                .setInteractive();
            this.input.setDraggable(element);

            element.on('pointerdown', () => {
                element.setScale(1.1); // Scale up on select
            });

            element.on('pointerup', () => {
                element.setScale(1); // Reset scale
            });
        });

        // Add dragging functionality
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
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
            }).setOrigin(0.5);
        
            const propertyText = this.add.text(pos.x, pos.y + 20, prop.property, {
                fontSize: `${this.scale.width * 0.025}px`,
                color: '#000',
                fontFamily: 'Georgia, serif',
            }).setOrigin(0.5);
        
            // Define drop zone for each card
            const dropZone = this.add.zone(pos.x, pos.y, 250, 150)
                .setRectangleDropZone(250, 150)
                .setData('element', prop.element);
        
            // Add card and zone to the same position
            card.setDataEnabled();
            card.data.set('element', prop.element);
        });
        
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            gameObject.setOrigin(0, 0);
            const cardWidth = 250;  // Assuming the card width is 250
            const cardHeight = 150; // Assuming the card height is 150
            const imageWidth = gameObject.displayWidth;
            const imageHeight = gameObject.displayHeight;

            // Set position to bottom-right of the card with some padding (e.g., 10px from the bottom and right)
            const offsetX = (cardWidth / 2) - imageWidth - 5; // Adjust to position from the right
            const offsetY = (cardHeight / 2) - imageHeight - 15; // Adjust to position from the bottom

            // Set the position to be at the bottom-right of the card
            gameObject.setPosition(dropZone.x + offsetX, dropZone.y + offsetY).setScale(0.5); // Position at bottom-right
            gameObject.setDepth(1); // Ensure the image appears on top of the card
            

            // Remove any previous result text
            if (this.resultText) {
                this.resultText.destroy();
            }
        
            // Check if the match is correct
            if (dropZone.getData('element') === gameObject.texture.key) {
                // Correct match
                gameObject.x = dropZone.x;
                gameObject.y = dropZone.y;
        
                // Display "Correct!" text
                this.resultText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Correct!', {
                    fontSize: `${this.scale.width * 0.05}px`,
                    color: '#00ff00',
                    fontFamily: 'Georgia, serif',
                }).setOrigin(0.5);
        
                // Fade out the text after 1 second
                this.time.delayedCall(1000, () => {
                    this.resultText.destroy();
                });
        
                // Add points for the correct match
                this.updateScore(10);
            } else {
                // Display "Wrong!" text
                this.resultText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Wrong!', {
                    fontSize: `${this.scale.width * 0.05}px`,
                    color: '#ff0000',
                    fontFamily: 'Georgia, serif',
                }).setOrigin(0.5);
        
                // Fade out the text after 1 second
                this.time.delayedCall(1000, () => {
                    this.resultText.destroy();
                });
        
                // Deduct points for the incorrect match
                this.updateScore(-5);
            }
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

    endGame() {
        // Display game over message and final score
        this.add.text(this.scale.width / 2, this.scale.height / 2, `Game Over\nFinal Score: ${this.score}`, {
            fontSize: '32px',
            color: '#000',
            fontFamily: 'Georgia, serif',
            align: 'center',
            backgroundColor: '#ffffff',
        }).setOrigin(0.5);

        const exitButton = this.add.sprite(this.scale.width * 0.5, this.scale.height * 0.65, 'exitButton')
        .setInteractive()
        .setScale(0.15)  // Adjust the size of the button
        .on('pointerdown', () => {
            this.sound.play('glassClick');
            this.scene.start('CasualGameScene');  // Switch back to CasualGameScene when clicked
        });

        exitButton.on('pointerover', () => exitButton.setTint(0xAAAAAA));  // Change color on hover
        exitButton.on('pointerout', () => exitButton.clearTint());  // Reset color on hover out

        const restartButton = this.add.sprite(this.scale.width * 0.5, this.scale.height * 0.75, 'restartButton')
        .setInteractive()
        .setScale(0.15)  // Adjust the size of the button
        .on('pointerdown', () => {
            this.scene.start('ChemicalMatchingScene');  // Switch back to LoadingScene when clicked
        });

        restartButton.on('pointerover', () => restartButton.setTint(0xAAAAAA));  // Change color on hover
        restartButton.on('pointerout', () => restartButton.clearTint());  // Reset color on hover out
    }
}
