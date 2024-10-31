import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.checklists = {
            QA: ["NaOH (aq)", "NH3 (aq)", "Test Tube"],
            Titration: ["Thermometer", "Graduated Cylinder"],
            Electrochemistry: ["Scale", "Measuring Spoon"],
            Metals: ["Dropper", "Glass Stirring Rod"]
        };
        this.currentTable = null; // Track the current table for showing popup
        this.inventory = []; // Inventory items the player currently has
        this.teacherInventory = ["NaOH (aq)", "NH3 (aq)", "Test Tube"]; // Items in the teacher's table
    }

    preload() {
        this.load.image('backgroundTile', '/assets/images/background_blue.png');
        this.load.image('player', '/assets/images/ball_red_small.png');
        this.load.image('table', '/assets/images/table.png');
        this.load.image('clipboard','/assets/images/clipboard.png');
        this.load.image('tick', '/assets/images/tick.png');
        this.load.image('cross', '/assets/images/cross.png');
        this.load.image('inventorySlots', '/assets/images/InventorySlots.png');
        this.load.image('w','/assets/images/w.png');
        this.load.image('a','/assets/images/a.png');
        this.load.image('s','/assets/images/s.png');
        this.load.image('d','/assets/images/d.png');
        this.load.image('i','/assets/images/i.png');

        // Fixed the issue with loading spritesheet
        this.load.spritesheet('labIcons', '/assets/images/LabIcons.png', {
            frameWidth: 16, // Width of one inventory block
            frameHeight: 16
        });
        this.load.image('soundOnButton', '/assets/images/soundOn.png');  // Sound on button image
        this.load.image('soundOffButton', '/assets/images/soundOff.png');  // Sound off button image
    }

    create() {
        // Add the background
            let backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
            backgroundMusic.play();
        
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'backgroundTile').setOrigin(0, 0);
        this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'player');
        // Initialize the flag to allow movement
        this.canMove = true;
        this.tables = this.physics.add.staticGroup();
        this.createMusicToggleButton();
        // Add the teacher's table at the top of the screen
        let teacherTable = this.tables.create(this.scale.width / 2, 70, 'table').setScale(3,1.5).refreshBody();
        teacherTable.name = "teacherTable"; // Set the teacher's table name
        this.add.text(teacherTable.x, teacherTable.y, "Teacher's Table", { fontSize: '16px', color: '#000' }).setOrigin(0.5);

        const padding = 20; // Padding from the screen edges
        const xLeft = padding;
        const yBottom = this.scale.height - padding;

        // Add WASD keys in a cross formation in the bottom-left corner
        this.add.image(xLeft + 40, yBottom - 80, 'w').setScale(1).setOrigin(0); // W key above
        this.add.image(xLeft, yBottom - 40, 'a').setScale(1).setOrigin(0); // A key to the left
        this.add.image(xLeft + 40, yBottom - 40, 's').setScale(1).setOrigin(0); // S key in the center
        this.add.image(xLeft + 80, yBottom - 40, 'd').setScale(1).setOrigin(0); // D key to the right
        this.add.text(xLeft + 120, yBottom - 40, 'Move Around', {
            fontSize: '20px',
            fontWeight: 'Bold',
            fill: '#000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0);

        // Add the I key for inventory, positioned slightly above the WASD keys
        this.add.image(xLeft + 300, yBottom - 40, 'i').setScale(1).setOrigin(0); // I key for inventory
        this.add.text(xLeft + 340, yBottom - 40, 'Open Inventory', {
            fontSize: '20px',
            fontWeight: 'Bold',
            fill: '#000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0);

        // Add other tables (as before)
        const rows = 2;
        const cols = 2;
        const tableWidth = 100;  // Approximate width of a table
        const tableHeight = 1; // Approximate height of a table
        const horizontalSpacing = (this.scale.width - (cols * tableWidth)) / (cols + 1);
        const verticalSpacing = (this.scale.height - (rows * tableHeight)) / (rows + 1);

        // Define table names
        const tableNames = [ "QA", "Titration", "Electrochemistry", "Metals"];

        let index = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Calculate positions for the tables
                let x = horizontalSpacing + (col * (tableWidth + horizontalSpacing)) + tableWidth / 2;
                let y = verticalSpacing + (row * (tableHeight + verticalSpacing)) + tableHeight;

                // Create the table and set its name
                let table = this.tables.create(x, y, 'table').setScale(1.5).refreshBody();
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
                // Row 1
                { x: -75, y: -75 },
                { x: -25, y: -75 },
                { x: 25, y: -75 },
                { x: 75, y: -75 },
                // Row 2
                { x: -75, y: -25 },
                { x: -25, y: -25 },
                { x: 25, y: -25 },
                { x: 75, y: -25 },
                // Row 3
                { x: -75, y: 25 },
                { x: -25, y: 25 },
                { x: 25, y: 25 },
                { x: 75, y: 25 },
                // Row 4
                { x: -75, y: 75 },
                { x: -25, y: 75 },
                { x: 25, y: 75 },
                { x: 75, y: 75 }
            ];
    
            let inventoryItems = [];
    
            // Loop through teacher's inventory and add items as icons
            this.teacherInventory.forEach((item, index) => {
                if (index < slotPositions.length) {
                    let slotPos = slotPositions[index];
    
                    // Create the sprite for the inventory item (adjust the frame index)
                    let itemIcon = this.add.sprite(this.cameras.main.centerX + slotPos.x, this.cameras.main.centerY + slotPos.y, 'labIcons', this.getFrameIndex(item)).setScale(1.5);
                    
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

            let hint = this.add.text(this.cameras.main.centerX + inventorySlots.displayWidth + 50, this.cameras.main.centerY , 'Click on the items \nyou need to add them \nto your inventory', {
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
                    // Row 1
                    { x: -75, y: -75 },
                    { x: -25, y: -75 },
                    { x: 25, y: -75 },
                    { x: 75, y: -75 },
                    // Row 2
                    { x: -75, y: -25 },
                    { x: -25, y: -25 },
                    { x: 25, y: -25 },
                    { x: 75, y: -25 },
                    // Row 3
                    { x: -75, y: 25 },
                    { x: -25, y: 25 },
                    { x: 25, y: 25 },
                    { x: 75, y: 25 },
                    // Row 4
                    { x: -75, y: 75 },
                    { x: -25, y: 75 },
                    { x: 25, y: 75 },
                    { x: 75, y: 75 }
                ];
        
                let inventoryItems = [];
        
                // Loop through player's inventory and add items as icons
                this.inventory.forEach((item, index) => {
                    if (index < slotPositions.length) {
                        let slotPos = slotPositions[index];
                        // Create the sprite for the inventory item (adjust the frame index)
                        let itemIcon = this.add.sprite(this.cameras.main.centerX + slotPos.x, this.cameras.main.centerY + slotPos.y, 'labIcons', this.getFrameIndex(item)).setScale(1.5);
                        
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
                "Test Tube": 0,
                "NaOH (aq)": 1,
                "NH3 (aq)": 2,
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
                .setScale(1,0.75);  // Adjust the scale of the clipboard as necessary
        
            // Position variables for checklist items on the clipboard
            let startX = this.cameras.main.centerX - clipboard.displayWidth / 2 + 120;  // Starting X position for the index and item text
            let startY = this.cameras.main.centerY - clipboard.displayHeight / 2 + 70; // Starting Y position for the first item
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
                    console.log('Player has ' + item)
                    icon = this.add.image(iconX, startY + (index * spacingY) + 15, 'tick').setScale(0.2).setOrigin(0.5);
                } else {
                    // Show cross image
                    console.log('Player does not have ' + item)
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

            this.checkInventoryForChecklist();
            
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

        // Function to check if the player's inventory matches the checklist
        checkInventoryForChecklist() {
            console.log('Checking');
            if (this.currentTable && this.checklists[this.currentTable.name]) {
                // Check if all items in the checklist are in the player's inventory
                const checklist = this.checklists[this.currentTable.name];
                const hasAllItems = checklist.every(item => this.inventory.includes(item));

                if (hasAllItems) {
                    this.showPlayButton(); // Show the button if all items are present
                }
            }
        }

        // Function to display the play button
        showPlayButton() {
            console.log('Game button');
            const buttonScale = 0.2 // Adjust scale as needed
            const legitLabButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 130, 'button')
                .setInteractive().setScale(buttonScale)
                .on('pointerdown', () => {
                    console.log(this.currentTable.name);
                    this.scene.start(this.currentTable.name); // Change to the next scene
                })
                .on('pointerover', () => this.bloomButton(legitLabButton, buttonScale))
                .on('pointerout', () => this.resetButton(legitLabButton, buttonScale))
                .on('pointerup', () => {
                    this.scene.start(this.currentTable.name); // For iPad interaction
                });

            const buttonText = this.add.text(legitLabButton.x, legitLabButton.y, 'Start Game', { 
                fontSize: '15px', 
                color: '#000000',
            }).setOrigin(0.5);

            let escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            escapeKey.on('down', () => {
                console.log('Escape pressed, closing button');
                legitLabButton.destroy();
                buttonText.destroy();
            });

            
        }

        bloomButton(button, buttonScale) {
            button.setScale(buttonScale + 0.05); // Scale up the button
            button.setTint(0xdddddd); // Change color for effect (optional)
        }
    
        resetButton(button, buttonScale) {
            button.setScale(buttonScale); // Scale back down
            button.clearTint(); // Reset the color
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
            });
        }

        
    }

