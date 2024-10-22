class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.checklists = {
            Titration: ["Beaker", "Bunsen Burner", "Test Tube"],
            QA: ["Thermometer", "Graduated Cylinder"],
            Electrochemistry: ["Scale", "Measuring Spoon"],
            Metals: ["Dropper", "Glass Stirring Rod"],
            teacherTable: ["Assignment", "Lab Report", "Lab Coat"] // Teacher's table checklist
        };
        this.currentTable = null; // Track the current table for showing popup
        this.inventory = []; // Inventory items the player currently has
    }

    preload() {
        this.load.image('backgroundTile', 'assets/images/background_blue.png');
        this.load.image('player', 'assets/images/ball_red_small.png');
        this.load.image('table', 'assets/images/table.png');
    }

    create() {
        // Add the background
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'backgroundTile').setOrigin(0, 0);
        this.player = this.physics.add.sprite(200, 200, 'player');
        this.tables = this.physics.add.staticGroup();

        // Add the teacher's table at the top of the screen
        let teacherTable = this.tables.create(this.scale.width / 2, 50, 'table').setScale(3,1.5).refreshBody();
        teacherTable.name = "teacherTable"; // Set the teacher's table name
        this.add.text(teacherTable.x, teacherTable.y, "Teacher's Table", { fontSize: '16px', color: '#000' }).setOrigin(0.5);

        // Add other tables (as before)
        const rows = 2;
    const cols = 2;
    const tableWidth = 100;  // Approximate width of a table
    const tableHeight = 100; // Approximate height of a table
    const horizontalSpacing = (this.scale.width - (cols * tableWidth)) / (cols + 1);
    const verticalSpacing = (this.scale.height - (rows * tableHeight)) / (rows + 1);

    // Define table names
    const tableNames = ["Titration", "QA", "Electrochemistry", "Metals"];

    let index = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Calculate positions for the tables
            let x = horizontalSpacing + (col * (tableWidth + horizontalSpacing)) + tableWidth / 2;
            let y = verticalSpacing + (row * (tableHeight + verticalSpacing)) + tableHeight / 2;

            // Create the table and set its name
            let table = this.tables.create(x, y, 'table').setScale(1.5).refreshBody();
            table.name = tableNames[index];
            index++;

            // Add text label for the table
            this.add.text(x, y, table.name, { fontSize: '16px', color: '#000' }).setOrigin(0.5);
        }
    }

        // Enable WASD keys
        this.keys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Create interaction text but make it invisible at first
        this.interactText = this.add.text(this.player.x, this.player.y - 50, 'Press ENTER to interact', {
            fontSize: '16px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setVisible(false); // Initially hidden

        // Add collider to detect when the player collides with a table
        this.physics.add.collider(this.player, this.tables, (player, table) => {
            this.currentTable = table; // Store reference to the current table
            this.interactText.setVisible(true); // Show the popup when near a table
        });

        // Show checklist on Enter key press
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.currentTable) {
                this.showChecklist(this.checklists[this.currentTable.name]); // Show checklist for the current table
            }
        });
    }

    update() {
        this.player.setVelocity(0);

        // Handle player movement
        if (this.keys.a.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.keys.d.isDown) {
            this.player.setVelocityX(200);
        }

        if (this.keys.w.isDown) {
            this.player.setVelocityY(-200);
        } else if (this.keys.s.isDown) {
            this.player.setVelocityY(200);
        }

        // Update text position above the player when colliding with a table
        this.interactText.setPosition(this.player.x, this.player.y - 50);

        // Check if the player is far enough from the table to hide the interaction text
        if (this.currentTable) {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentTable.x, this.currentTable.y);
            if (distance > 100) { // If player is more than 100 pixels away from the table
                this.interactText.setVisible(false); // Hide the interaction text
                this.currentTable = null; // Reset currentTable
            }
        }
    }

    showChecklist(items) {
        console.log('showChecklist called');

        // Create the checklist text, including ticks or crosses
        let checklistText = "Checklist:\n";
        items.forEach(item => {
            if (this.inventory.includes(item)) {
                checklistText += `✓ ${item}\n`; // Player has this item
            } else {
                checklistText += `✗ ${item}\n`; // Player doesn't have this item
            }
        });

        // Create the popup with the checklist
        let popup = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, checklistText, {
            fontSize: '18px',
            color: '#000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 20 },
            align: 'center',
            wordWrap: { width: this.scale.width - 40 }
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);

        // Only destroy the popup when the Escape key is pressed
        let escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escapeKey.on('down', () => {
            console.log('Escape pressed, closing popup');
            popup.destroy(); // Destroy the popup
        });
    }
}

