import Phaser from 'phaser';


export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.checklists = {
            QA: ["NaOH (aq)", "NH3 (aq)", "Test Tube"],
            Titration: ["Thermometer", "Graduated \nCylinder"],
            Organic: ["Scale", "Measuring \nSpoon"],
            Metals: ["Dropper", "Glass \nStirring \nRod"]
        };
        this.currentTable = null; // Track the current table for showing popup
        this.inventory = []; // Inventory items the player currently has
        this.teacherInventory = ["NaOH (aq)", "NH3 (aq)", "Test Tube"]; // Items in the teacher's table
    }

    preload() {
        this.load.image('backgroundTile', '/assets/images/floorTile.png');
        // this.load.image('player', '/assets/images/ball_red_small.png');
        this.load.spritesheet('playerIdle', '/assets/images/playerIdle.png', {
            frameWidth: 16,  // Width of each frame
            frameHeight: 24  // Height of each frame (assuming 16x16 for each individual frame)
        });
        
        this.load.spritesheet('playerRun', '/assets/images/playerRun.png', {
            frameWidth: 16, // Set frame width as needed (adjust if different)
            frameHeight: 24 // Set frame height as needed (adjust if different)
        });

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
        this.load.image('backButton', 'assets/images/backButton.png'); // Add your back button image

        this.load.spritesheet('labIcons', '/assets/images/LabIcons.png', {
            frameWidth: 16, // Width of one inventory block
            frameHeight: 16
        });
        this.load.image('soundOnButton', '/assets/images/soundOn.png');  // Sound on button image
        this.load.image('soundOffButton', '/assets/images/soundOff.png');  // Sound off button image
        this.load.image('soundOnButton', 'assets/images/soundOn.png');  // Sound on button image
        this.load.image('soundOffButton', 'assets/images/soundOff.png');  // Sound off button image

        // load audio
        this.load.audio('glassClick', 'assets/audio/glassClick.wav');  // click sound

    }

    create() {
        // Add the background
        if (!this.game.backgroundMusic) {
            // Create the background music if it doesn't already exist
            this.game.backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
            this.game.backgroundMusic.play();
        } 
        
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'backgroundTile').setOrigin(0, 0);
        // this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'player');
        // Idle facing right
        this.anims.create({
            key: 'idle_right',
            frames: this.anims.generateFrameNumbers('playerIdle', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        // Idle facing forward
        this.anims.create({
            key: 'idle_forward',
            frames: this.anims.generateFrameNumbers('playerIdle', { start: 6, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        // Idle facing left
        this.anims.create({
            key: 'idle_left',
            frames: this.anims.generateFrameNumbers('playerIdle', { start: 12, end: 17 }),
            frameRate: 10,
            repeat: -1
        });

        // Idle facing backward
        this.anims.create({
            key: 'idle_backward',
            frames: this.anims.generateFrameNumbers('playerIdle', { start: 18, end: 23 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'run_right',
            frames: this.anims.generateFrameNumbers('playerRun', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
    
        // Running facing forward
        this.anims.create({
            key: 'run_backward',
            frames: this.anims.generateFrameNumbers('playerRun', { start: 6, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
    
        // Running facing left
        this.anims.create({
            key: 'run_left',
            frames: this.anims.generateFrameNumbers('playerRun', { start: 12, end: 17 }),
            frameRate: 10,
            repeat: -1
        });
    
        // Running facing backward
        this.anims.create({
            key: 'run_forward',
            frames: this.anims.generateFrameNumbers('playerRun', { start: 18, end: 23 }),
            frameRate: 10,
            repeat: -1
        });

        this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'playerIdle');
        this.player.setScale(2);

        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height); // Set world bounds to screen size

        this.player.setCollideWorldBounds(true); // Prevents the player from moving out of the screen


        // Set the initial animation to "idle_forward" to start facing front
        this.player.play('idle_forward');

        // Update loop for handling key input
        this.input.keyboard.on('keydown', (event) => {
            if (this.keys.d.isDown) {
                this.player.play('run_right', true);
                this.player.setVelocityX(200);
            } else if (this.keys.a.isDown) {
                this.player.play('run_left', true);
                this.player.setVelocityX(-200);
            } else if (this.keys.w.isDown) {
                this.player.play('run_backward', true);
                this.player.setVelocityY(-200);
            } else if (this.keys.s.isDown) {
                this.player.play('run_forward', true);
                this.player.setVelocityY(200);
            }
        });

        // Handle stopping and idle animation when keys are released
        this.input.keyboard.on('keyup', (event) => {
            this.player.setVelocity(0);

            if (!this.keys.d.isDown && event.code === 'KeyD') {
                this.player.play('idle_right');
            } else if (!this.keys.a.isDown && event.code === 'KeyA') {
                this.player.play('idle_left');
            } else if (!this.keys.s.isDown && event.code === 'KeyS') {
                this.player.play('idle_backward');
            } else if (!this.keys.w.isDown && event.code === 'KeyW') {
                this.player.play('idle_forward');
            }
        });

        // Initialize the flag to allow movement
        this.canMove = true;
        this.tables = this.physics.add.staticGroup();
        this.createMusicToggleButton();
        // Add the teacher's table at the top of the screen
        let teacherTable = this.tables.create(this.scale.width / 2, 50, 'table').setScale(2,1).refreshBody();
        teacherTable.name = "teacherTable"; // Set the teacher's table name
        this.add.text(teacherTable.x, teacherTable.y, "Teacher's Table", { fontSize: '16px', color: '#000' }).setOrigin(0.5);

        const padding = this.scale.width / 30 ; // Padding from the screen edges
        const xLeft = padding;
        const yBottom = this.scale.height - padding;

        const backButton = this.add.sprite(this.scale.width * 0.04, this.scale.height * 0.06, 'backButton')
        .setInteractive()
        .setScale(0.1)  // Adjust the size of the button
        .on('pointerdown', () => {
            this.sound.play('glassClick');
            this.scene.start('LoadingScene');  // Switch back to LoadingScene when clicked
        });

        // Add WASD keys in a cross formation in the bottom-left corner
        this.add.image(xLeft + 40, yBottom - 60, 'w').setScale(1).setOrigin(0); // W key above
        this.add.image(xLeft + 5, yBottom - 20, 'a').setScale(1).setOrigin(0); // A key to the left
        this.add.image(xLeft + 40, yBottom - 20, 's').setScale(1).setOrigin(0); // S key in the center
        this.add.image(xLeft + 75, yBottom - 20, 'd').setScale(1).setOrigin(0); // D key to the right
        this.add.text(xLeft + 120, yBottom - 20, 'Move Around', {
            fontSize: '15px',
            fontWeight: 'Bold',
            fill: '#fff',
            padding: { x: 10, y: 5 }
        }).setOrigin(0);

        // Add the I key for inventory, positioned slightly above the WASD keys
        this.add.image(xLeft + 300, yBottom - 20, 'i').setScale(1).setOrigin(0); // I key for inventory
        this.add.text(xLeft + 340, yBottom - 20, 'Open Inventory', {
            fontSize: '15px',
            fontWeight: 'Bold',
            fill: '#fff',
            padding: { x: 10, y: 5 }
        }).setOrigin(0);

        const positions = [
            { x: this.scale.width * 0.25, y: this.scale.height * 0.35 },
            { x: this.scale.width * 0.75, y: this.scale.height * 0.35},
            { x: this.scale.width * 0.25, y:  this.scale.height * 0.65 },
            { x: this.scale.width * 0.75, y: this.scale.height * 0.65 }
        ];
        // Define table names
        const tableNames = ["QA", "Titration", "Organic", "Metals"];

        // let i = 0;

        tableNames.forEach((tableName, index) => {
            console.log(tableName)
            const { x, y } = positions[index];

            let table = this.tables.create(x, y, 'table').setScale(1.75).refreshBody();
            console.log(table);
            table.body.setSize(table.displayWidth, table.displayHeight);
            table.name = tableName;
            this.add.text(x, y, tableName, { fontSize: `${this.scale.width * 0.02}px`, color: '#000' }).setOrigin(0.5);
            // i ++
        });

        let groupLength = this.tables.getLength();
        console.log('Number of items in the group:', groupLength);

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
            console.log(`table ${table}`)
            this.currentTable = table; // Store reference to the current table
            this.interactText.setVisible(true); // Show the popup when near a table
        });

        // Show checklist on Enter key press
        this.input.keyboard.on('keydown-ENTER', () => {
            this.sound.play('glassClick');
            if (this.currentTable.name == 'teacherTable'){
                this.showTeacherInventory();
            }
            else{
                console.log('currenttablename')
                console.log(this.currentTable.name);
                console.log(this.checklists[this.currentTable.name])
                this.showChecklist(this.checklists[this.currentTable.name]); // Show checklist for the current table
            }
        });

        this.input.keyboard.on('keydown-I', () => { 
            this.sound.play('glassClick');
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
        overlay.fillStyle(0x000000, 0.70); // Black with 65% opacity
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
                        this.sound.play('glassClick');
                        this.addItemToPlayerInventory(item); // Add the clicked item to player's inventory
                        itemIcon.destroy(); // Remove the icon from the UI
                        this.hideItemName(); 
                        this.teacherInventory.splice(index, 1); // Remove the item from the teacher's inventory
                    });
    
                    inventoryItems.push(itemIcon);
                }
            });
    
            // Instruction text telling the user how to close the inventory
            let instructionText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + inventorySlots.displayHeight / 2 + 25, 'Press ESC to close', {
                fontSize: '15px',
                color: '#ffffff',
                padding: { x: 10, y: 10 }
            }).setOrigin(0.5);

            let hint = this.add.text(this.cameras.main.centerX + inventorySlots.displayWidth - 15, this.cameras.main.centerY , 'Click on the items \nyou need to add them \nto your inventory', {
                fontSize: '15px',
                color: '#ffffff',  // White text color
                padding: { x: 10, y: 10 }
            }).setOrigin(0.5);
    
            // Allow closing the inventory by pressing the Escape key
            let escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            escapeKey.on('down', () => {
                this.sound.play('glassClick');
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
            overlay.fillStyle(0x000000, 0.70); // Black with 65% opacity
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
                            this.sound.play('glassClick');
                            this.addItemToTeacherInventory(item); // Add the clicked item to player's inventory
                            itemIcon.destroy(); // Remove the icon from the UI
                            this.hideItemName(); 
                            this.inventory.splice(index, 1); // Remove the item from the teacher's inventory
                        });
        
                        inventoryItems.push(itemIcon);
                    }
                });
        
                // Instruction text telling the user how to close the inventory
                let instructionText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + inventorySlots.displayHeight / 2 + 25, 'Press ESC to close', {
                    fontSize: '15px',
                    color: '#ffffff',
                    padding: { x: 10, y: 10 }
                }).setOrigin(0.5);
    
                let hint = this.add.text(this.cameras.main.centerX + inventorySlots.displayWidth - 15, this.cameras.main.centerY , 'Click on the items \nto remove them from \nyour inventory', {
                    fontSize: '15px',
                    color: '#ffffff',  // White text color
                    padding: { x: 10, y: 10 }
                }).setOrigin(0.5);
        
                // Allow closing the inventory by pressing the Escape key
                let escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
                escapeKey.on('down', () => {
                    this.sound.play('glassClick');
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
            overlay.fillStyle(0x000000, 0.70);  // Black with 65% opacity
            overlay.fillRect(0, 0, this.scale.width, this.scale.height);  // Cover the whole screen
        
            // Create the clipboard image in the center of the screen
            let clipboard = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'clipboard')
                .setOrigin(0.5)
                .setScale(0.50,0.50);  // Adjust the scale of the clipboard as necessary
        
            // Position variables for checklist items on the clipboard
            let startX = this.cameras.main.centerX - clipboard.displayWidth/4;  // Starting X position for the index and item text
            let startY = this.cameras.main.centerY - clipboard.displayHeight/4; // Starting Y position for the first item
            let spacingY = 40;  // Vertical space between each item
            let iconX = this.cameras.main.centerX + clipboard.displayWidth/4; // X position for the tick/cross, aligned to the right
    
            let checklistItems = [];
    
            items.forEach((item, index) => {
                // Create the index and item text
                let itemText = this.add.text(startX, startY + (index * spacingY), `${index + 1}. ${item}`, {
                    fontSize: '13px',
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
                fontSize: '15px',
                color: '#ffffff',  // White text color
                // backgroundColor: '#000000',  // Optional: black background for text
                padding: { x: 10, y: 10 }
            }).setOrigin(0.5);

            let hint = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + clipboard.displayHeight / 2 + 20, 'Hint: You can get missing items from the teacher\'s table', {
                fontSize: '15px',
                color: '#ffffff',  // White text color
                // backgroundColor: '#000000',  // Optional: black background for text
                padding: { x: 10, y: 10 }
            }).setOrigin(0.5);

            this.checkInventoryForChecklist();
            
            checklistItems.push(overlay, clipboard, instructionText, hint);  // Add overlay, clipboard, and instruction text to the array
            // Allow closing the checklist by pressing the Escape key
            let escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            escapeKey.on('down', () => {
                this.sound.play('glassClick')
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
            const buttonScale = 0.1 // Adjust scale as needed
            const legitLabButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'button')
                .setInteractive().setScale(buttonScale)
                .on('pointerdown', () => {
                    this.sound.play('glassClick')
                    console.log(this.currentTable.name);
                    this.scene.start(this.currentTable.name); // Change to the next scene
                })
                .on('pointerover', () => this.bloomButton(legitLabButton, buttonScale))
                .on('pointerout', () => this.resetButton(legitLabButton, buttonScale))
                .on('pointerup', () => {
                    this.scene.start(this.currentTable.name); // For iPad interaction
                });

            const buttonText = this.add.text(legitLabButton.x, legitLabButton.y, 'Start Game', { 
                fontSize: '10px', 
                color: '#000000',
            }).setOrigin(0.5);

            let escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            escapeKey.on('down', () => {
                this.sound.play('glassClick');
                console.log('Escape pressed, closing button');
                legitLabButton.destroy();
                buttonText.destroy();
            });

            
        }

        bloomButton(button, buttonScale) {
            button.setScale(buttonScale + 0.02); // Scale up the button
            button.setTint(0xdddddd); // Change color for effect (optional)
        }
    
        resetButton(button, buttonScale) {
            button.setScale(buttonScale); // Scale back down
            button.clearTint(); // Reset the color
        }

        createMusicToggleButton() {
            let isMusicOn = this.game.backgroundMusic.isPlaying;
            let texture = '';
            if(this.game.backgroundMusic.isPlaying){
                texture = 'soundOnButton';
            } else{
                texture = 'soundOffButton';
            }
    
            let button = this.add.sprite(this.scale.width * 0.96, this.scale.height * 0.06, texture).setInteractive().setScale(0.13);
    
            button.on('pointerdown', () => {
                if (isMusicOn) {
                    this.game.backgroundMusic.pause(); // Pause the existing music
                    isMusicOn = false;
                    button.setTexture('soundOffButton');
                } else {
                    this.game.backgroundMusic.resume(); // Resume the existing music
                    isMusicOn = true;
                    button.setTexture('soundOnButton');
                }
            });
        }
        

        
    }

