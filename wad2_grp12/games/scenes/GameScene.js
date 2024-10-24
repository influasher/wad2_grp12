class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.checklists = {
            Titration: ["Beaker", "Bunsen Burner", "Test Tube"],
            QA: ["Thermometer", "Graduated Cylinder"],
            Electrochemistry: ["Scale", "Measuring Spoon"],
            Metals: ["Dropper", "Glass Stirring Rod"]
        };
        this.currentTable = null; // Track the current table for showing popup
        this.inventory = []; // Inventory items the player currently has
        this.teacherInventory = ["Beaker", "Lab Report", "Lab Coat"]; // Items in the teacher's table
    }

    preload() {
        this.load.image('backgroundTile', 'assets/images/background_blue.png');
        this.load.image('player', 'assets/images/ball_red_small.png');
        this.load.image('table', 'assets/images/table.png');
        this.load.image('titration','assets/images/purifier.png');
        this.load.image('clipboard','assets/images/clipboard.png');
        this.load.image('tick', 'assets/images/tick.png');
        this.load.image('cross', 'assets/images/cross.png');
        this.load.image('inventorySlots', 'assets/images/InventorySlots.png');
        this.load.image('keyboards', 'assets/images/keyboards.png');

        // Fixed the issue with loading spritesheet
        this.load.spritesheet('labIcons', 'assets/images/LabIcons.png', {
            frameWidth: 16, // Width of one inventory block
            frameHeight: 16
        });
    }

    create() {
        // Add the background
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'backgroundTile').setOrigin(0, 0);
        this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'player');
        // Initialize the flag to allow movement
        this.canMove = true;
        this.tables = this.physics.add.staticGroup();

        // Add the teacher's table at the top of the screen
        let teacherTable = this.tables.create(this.scale.width / 2, 70, 'table').setScale(4,2).refreshBody();
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
                let y = verticalSpacing + (row * (tableHeight + verticalSpacing)) + tableHeight;

                // Create the table and set its name
                let table = this.tables.create(x, y, 'table').setScale(2).refreshBody();
                table.body.setSize(table.displayWidth, table.displayHeight);
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
            if (this.currentTable.name == 'teacherTable'){
                this.showTeacherInventory();
            }
            else{
                console.log(this.currentTable.name);
                this.showChecklist(this.checklists[this.currentTable.name]); // Show checklist for the current table
            }
        });

        this.input.keyboard.on('keydown-I', () => {
                this.showPlayerInventory();
            });
    }

    update() {
        if (!this.canMove) {
            // If movement is disabled, stop the player
            this.player.setVelocity(0);
            return;  // Skip the rest of the update loop
        }

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

    showTeacherInventory() {
        // Disable player movement while the inventory is open
        this.canMove = false;

        // Create a semi-transparent overlay (gray-out effect)
        let overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.65); // Black with 65% opacity
        overlay.fillRect(0, 0, this.scale.width, this.scale.height); // Cover the whole screen

        // Add inventory sprite to the center
                let inventorySlots = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'inventorySlots')
                .setOrigin(0.5)
                .setScale(3); // Adjust the scale as necessary
    
            // Position the items within the inventory slots
            // Difference between items in columns and rows = 50
            let slotPositions = [
                { x: -75, y: -75 },
                { x: -25, y: -25 },
                { x: 25, y: 25 }
            ];
    
            let inventoryItems = [];
    
            // Loop through teacher's inventory and add items as icons
            this.teacherInventory.forEach((item, index) => {
                if (index < slotPositions.length) {
                    let slotPos = slotPositions[index];
    
                    // Create the sprite for the inventory item (adjust the frame index)
                    let itemIcon = this.add.sprite(this.cameras.main.centerX + slotPos.x, this.cameras.main.centerY + slotPos.y, 'labIcons', this.getFrameIndex(item));
                    
                    itemIcon.setInteractive();
    
                    // Show item name on hover
                    itemIcon.on('pointerover', () => {
                        this.showItemName(item, itemIcon.x, itemIcon.y);
                    });
    
                    itemIcon.on('pointerout', () => {
                        this.hideItemName();
                    });
    
                    // Make the item clickable to add it to the player's inventory
                    itemIcon.on('pointerdown', () => {
                        this.addItemToPlayerInventory(item); // Add the clicked item to player's inventory
                        itemIcon.destroy(); // Remove the icon from the UI
                        this.hideItemName(); 
                        this.teacherInventory.splice(index, 1); // Remove the item from the teacher's inventory
                    });
    
                    inventoryItems.push(itemIcon);
                }
            });
    
            // Instruction text telling the user how to close the inventory
            let instructionText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + inventorySlots.displayHeight / 2 + 50, 'Press ESC to close', {
                fontSize: '20px',
                color: '#ffffff',
                padding: { x: 10, y: 10 }
            }).setOrigin(0.5);

            let hint = this.add.text(this.cameras.main.centerX + inventorySlots.displayWidth + 100, this.cameras.main.centerY , 'Click on the items you need \nto add them to your inventory', {
                fontSize: '20px',
                color: '#ffffff',  // White text color
                padding: { x: 10, y: 10 }
            }).setOrigin(0.5);
    
            // Allow closing the inventory by pressing the Escape key
            let escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            escapeKey.on('down', () => {
                overlay.destroy(); // Destroy the overlay
                inventorySlots.destroy(); // Destroy the inventory sprite
                instructionText.destroy(); // Destroy the instruction text
                hint.destroy();
                inventoryItems.forEach(item => item.destroy()); // Destroy all items in the inventory
                this.canMove = true; // Re-enable player movement
            });
        }

        showPlayerInventory() {
            // Disable player movement while the inventory is open
            this.canMove = false;
    
            // Create a semi-transparent overlay (gray-out effect)
            let overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.65); // Black with 65% opacity
            overlay.fillRect(0, 0, this.scale.width, this.scale.height); // Cover the whole screen
    
            // Add inventory sprite to the center
                    let inventorySlots = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'inventorySlots')
                    .setOrigin(0.5)
                    .setScale(3); // Adjust the scale as necessary
        
                // Position the items within the inventory slots
                // Difference between items in columns and rows = 50
                let slotPositions = [
                    { x: -75, y: -75 },
                    { x: -25, y: -25 },
                    { x: 25, y: 25 }
                ];
        
                let inventoryItems = [];
        
                // Loop through teacher's inventory and add items as icons
                this.inventory.forEach((item, index) => {
                    if (index < slotPositions.length) {
                        let slotPos = slotPositions[index];
        
                        // Create the sprite for the inventory item (adjust the frame index)
                        let itemIcon = this.add.sprite(this.cameras.main.centerX + slotPos.x, this.cameras.main.centerY + slotPos.y, 'labIcons', this.getFrameIndex(item));
                        
                        itemIcon.setInteractive();
        
                        // Show item name on hover
                        itemIcon.on('pointerover', () => {
                            this.showItemName(item, itemIcon.x, itemIcon.y);
                        });
        
                        itemIcon.on('pointerout', () => {
                            this.hideItemName();
                        });
        
                        // Make the item clickable to add it to the player's inventory
                        itemIcon.on('pointerdown', () => {
                            this.addItemToTeacherInventory(item); // Add the clicked item to player's inventory
                            itemIcon.destroy(); // Remove the icon from the UI
                            this.hideItemName(); 
                            this.inventory.splice(index, 1); // Remove the item from the teacher's inventory
                        });
        
                        inventoryItems.push(itemIcon);
                    }
                });
        
                // Instruction text telling the user how to close the inventory
                let instructionText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + inventorySlots.displayHeight / 2 + 50, 'Press ESC to close', {
                    fontSize: '20px',
                    color: '#ffffff',
                    padding: { x: 10, y: 10 }
                }).setOrigin(0.5);
    
                let hint = this.add.text(this.cameras.main.centerX + inventorySlots.displayWidth + 100, this.cameras.main.centerY , 'Click on the items to \nremove them from your inventory', {
                    fontSize: '20px',
                    color: '#ffffff',  // White text color
                    padding: { x: 10, y: 10 }
                }).setOrigin(0.5);
        
                // Allow closing the inventory by pressing the Escape key
                let escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
                escapeKey.on('down', () => {
                    overlay.destroy(); // Destroy the overlay
                    inventorySlots.destroy(); // Destroy the inventory sprite
                    instructionText.destroy(); // Destroy the instruction text
                    hint.destroy();
                    inventoryItems.forEach(item => item.destroy()); // Destroy all items in the inventory
                    this.canMove = true; // Re-enable player movement
                });
            }
    
        addItemToPlayerInventory(item) {
            if (!this.inventory.includes(item)) {
                this.inventory.push(item); // Add the item to the player's inventory
                console.log(`Added ${item} to player's inventory:`, this.inventory);
            }
        }

        addItemToTeacherInventory(item) {
            if (!this.teacherInventory.includes(item)) {
                this.teacherInventory.push(item); // Add the item to the player's inventory
                console.log(`Added ${item} to teacher's inventory:`, this.teacherInventory);
            }
        }
    
        getFrameIndex(item) {
            // Return the correct frame index based on the item name
            const itemFrames = {
                "Beaker": 0,
                "Lab Report": 1,
                "Lab Coat": 2,
                // Add other items and their frame indexes here
            };
            return itemFrames[item] !== undefined ? itemFrames[item] : 0;
        }
    
        showItemName(item, x, y) {
            // Create a text object to display the item name near the icon
            this.itemNameText = this.add.text(x, y - 20, item, {
                fontSize: '14px',
                color: '#fff',
                backgroundColor: '#000',
                padding: { x: 5, y: 5 }
            }).setOrigin(0.5);
        }
        
        hideItemName() {
            // Destroy the text object when the mouse moves away
            if (this.itemNameText) {
                this.itemNameText.destroy();
                this.itemNameText = null;
            }
        }
    
        showChecklist(items) {
            console.log('showChecklist called');
    
            // Disable player movement while the checklist is open
            this.canMove = false;
    
            // Create a semi-transparent overlay (gray-out effect)
            let overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.65);  // Black with 65% opacity
            overlay.fillRect(0, 0, this.scale.width, this.scale.height);  // Cover the whole screen
        
            // Create the clipboard image in the center of the screen
            let clipboard = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'clipboard')
                .setOrigin(0.5)
                .setScale(1);  // Adjust the scale of the clipboard as necessary
        
            // Position variables for checklist items on the clipboard
            let startX = this.cameras.main.centerX - clipboard.displayWidth / 2 + 120;  // Starting X position for the index and item text
            let startY = this.cameras.main.centerY - clipboard.displayHeight / 2 + 140; // Starting Y position for the first item
            let spacingY = 40;  // Vertical space between each item
            let iconX = this.cameras.main.centerX + clipboard.displayWidth / 2 - 120; // X position for the tick/cross, aligned to the right
    
            let checklistItems = [];
    
            items.forEach((item, index) => {
                // Create the index and item text
                let itemText = this.add.text(startX, startY + (index * spacingY), `${index + 1}. ${item}`, {
                    fontSize: '20px',
                    color: '#000',
                    align: 'left',
                    padding: { x: 5, y: 5 }
                }).setOrigin(0);
    
                checklistItems.push(itemText);  // Add to the array to destroy later
    
                // Add tick or cross image next to the item, aligned to the right side of the clipboard
                let icon;
                if (this.inventory.includes(item)) {
                    // Show tick image
                    icon = this.add.image(iconX, startY + (index * spacingY) + 15, 'tick').setScale(0.2).setOrigin(0.5);
                } else {
                    // Show cross image
                    icon = this.add.image(iconX, startY + (index * spacingY) + 15, 'cross').setScale(0.2).setOrigin(0.5);
                }
    
                checklistItems.push(icon);  // Add the tick/cross to the array to destroy later
            });
    
            // Instruction text telling the user how to close the popup
            let instructionText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + clipboard.displayHeight / 2 + 50, 'Press ESC to close', {
                fontSize: '20px',
                color: '#ffffff',  // White text color
                // backgroundColor: '#000000',  // Optional: black background for text
                padding: { x: 10, y: 10 }
            }).setOrigin(0.5);

            let hint = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + clipboard.displayHeight / 2 + 20, 'Hint: You can get missing items from the teacher\'s table', {
                fontSize: '20px',
                color: '#ffffff',  // White text color
                // backgroundColor: '#000000',  // Optional: black background for text
                padding: { x: 10, y: 10 }
            }).setOrigin(0.5);
    
            checklistItems.push(overlay, clipboard, instructionText, hint);  // Add overlay, clipboard, and instruction text to the array
    
            // Allow closing the checklist by pressing the Escape key
            let escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            escapeKey.on('down', () => {
                console.log('Escape pressed, closing popup');
    
                // Destroy only the items related to the checklist
                checklistItems.forEach(item => item.destroy());
    
                // Re-enable player movement when the checklist is closed
                this.canMove = true;
            });
        }
    }

