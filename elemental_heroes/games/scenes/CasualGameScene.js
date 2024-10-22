class CasualGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CasualGameScene' });
    }

    preload() {
        // Load any necessary assets, such as background images
        this.load.image('background', 'assets/images/start_background.jpg'); // Background for the scene
    }

    create() {
        console.log('hi from casual game scene');
        
        // Add a background
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'background').setOrigin(0.5).setDisplaySize(this.scale.width, this.scale.height);
        
        // Title text
        this.add.text(this.scale.width / 2, 50, 'Curiosity Corner', {
            fontSize: '50px',
            color: '#000',
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
        }).setOrigin(0.5);

        // Array of game titles and associated scenes
        const games = [
            { title: 'Chemical Matching', scene: 'ChemicalMatchingScene' },
            { title: 'Monster Elimination', scene: 'MonsterEliminationScene' },
            { title: 'Environmental Cleanup', scene: 'EnvironmentalCleanupScene' },
            { title: 'Fourth Game', scene: 'FourthScene' }
        ];

        const cardWidth = 400;
        const cardHeight = 200;
        const cornerRadius = 20; // Radius for rounded corners

        // Manually set each card’s position based on your specifications
        const positions = [
            { x: this.scale.width / 4, y: this.scale.height / 4+ 40 },
            { x: (3 * this.scale.width) / 4, y: this.scale.height / 4 + 40},
            { x: this.scale.width / 4, y: (3 * this.scale.height) / 4 },
            { x: (3 * this.scale.width) / 4, y: (3 * this.scale.height) / 4 }
        ];

        // Create each card with rounded corners at the specified position
        games.forEach((game, index) => {
            const { x, y } = positions[index];

            // Create a Graphics object for rounded rectangle
            const cardGraphics = this.add.graphics();
            cardGraphics.fillStyle(0x66ccff, 1);
            cardGraphics.lineStyle(2, 0x000000, 1);
            cardGraphics.fillRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, cornerRadius);
            cardGraphics.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, cornerRadius);
            cardGraphics.setInteractive(new Phaser.Geom.Rectangle(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);

            // Make card interactive
            cardGraphics.on('pointerover', () => {
                cardGraphics.clear();
                cardGraphics.fillStyle(0x99ccff, 1);
                cardGraphics.fillRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, cornerRadius);
                cardGraphics.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, cornerRadius);
            });

            cardGraphics.on('pointerout', () => {
                cardGraphics.clear();
                cardGraphics.fillStyle(0x66ccff, 1);
                cardGraphics.fillRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, cornerRadius);
                cardGraphics.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, cornerRadius);
            });

            cardGraphics.on('pointerdown', () => {
                this.scene.start(game.scene);
            });

            // Add title text inside the rectangle
            this.add.text(x, y, game.title, {
                fontSize: '24px',
                color: '#000',
                fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            }).setOrigin(0.5);
        });
    }
}
