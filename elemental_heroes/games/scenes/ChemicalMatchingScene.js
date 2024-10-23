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
        this.load.image('backButton', 'assets/images/backButton.png'); // Add your back button image
        this.load.image('restartButton', 'assets/images/restartButton.png'); // Add your back button image
        this.load.image('exitButton', 'assets/images/exitButton.png'); // Add your back button image
    }

    create() {

        // this.add.image(this.scale.width / 2, this.scale.height / 2, 'woodenbackground').setOrigin(0.5).setDisplaySize(this.scale.width, this.scale.height);

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
            this.scene.start('CasualGameScene');  // Switch back to LoadingScene when clicked
        });

    // Optionally, you can change the button's appearance when hovering or clicking
            backButton.on('pointerover', () => backButton.setTint(0xAAAAAA));  // Change color on hover
            backButton.on('pointerout', () => backButton.clearTint());  // Reset color on hover out
        
        // Initialize score and timer
    
        this.score = 0;
        this.timeRemaining = 60; // 60 seconds for the game

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

        // Set up the element properties
        const elementProperties = [
            { element: 'potassium', property: 'K', type: 'Chemical Formula' },
            { element: 'neon', property: 'Noble Gas', type: 'Chemical Property' },
            { element: 'gold', property: 'Soft, malleable', type: 'Physical Property' },
            { element: 'chlorine', property: 'Cl', type: 'Chemical Formula' },
            { element: 'iron', property: 'Metallic', type: 'Physical Property' },
        ];

        // Set up the draggable elements
        const elements = [
            { name: 'potassium', x: this.scale.width * 0.1, y: this.scale.height * 0.2 },
            { name: 'neon', x: this.scale.width * 0.25, y: this.scale.height * 0.2 },
            { name: 'gold', x: this.scale.width * 0.4, y: this.scale.height * 0.2 },
            { name: 'chlorine', x: this.scale.width * 0.55, y: this.scale.height * 0.2 },
            { name: 'iron', x: this.scale.width * 0.7, y: this.scale.height * 0.2 },
        ];

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
        
        // Drop event listener
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            if (dropZone.getData('element') === gameObject.texture.key) {
                // Correct match
                gameObject.x = dropZone.x;
                gameObject.y = dropZone.y;
                gameObject.setTint(0x00ff00); // Highlight in green
                this.updateScore(10); // Add points for correct match
            } else {
                // Incorrect match
                gameObject.setTint(0xff0000); // Highlight in red
                this.updateScore(-5); // Deduct points for incorrect match
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
            align: 'center'
        }).setOrigin(0.5);

        // Stop all interactive events
        this.input.enabled = false;

        // Optionally, restart the scene after a delay or navigate to a main menu
        // this.time.delayedCall(3000, () => {
        //     this.scene.start('MainMenuScene'); // Change this to your main menu scene key
        // });
    }
}
