class MonsterEliminationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MonsterEliminationScene' });
    }

    preload() {
        // Load assets
        this.load.image('background', 'assets/images/background.png');
        this.load.image('playerMonster', 'assets/images/player_monster.png');
        this.load.image('acidicMonster', 'assets/images/acidic_monster.png');
        this.load.image('basicMonster', 'assets/images/basic_monster.png');
        this.load.image('metallicMonster', 'assets/images/metallic_monster.png');
        this.load.image('carbonateMonster', 'assets/images/carbonate_monster.png');
        this.load.image('healthBar', 'assets/images/health_bar.png');
        this.load.image('sodiumHydroxide', 'assets/images/sodium_hydroxide.png');
        this.load.image('hydrochloricAcid', 'assets/images/hydrochloric_acid.png');
        this.load.image('water', 'assets/images/water.png');
        this.load.image('heat', 'assets/images/heat.png');
        this.load.image('attackEffect', 'assets/images/attack_effect.png');
    }

    create() {
        // Add background
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'background').setOrigin(0.5).setDisplaySize(this.scale.width, this.scale.height);

        // Create player and enemy monsters
        this.playerMonster = this.add.sprite(200, this.scale.height / 2, 'playerMonster').setScale(0.5);
        this.enemyMonster = this.add.sprite(this.scale.width - 200, this.scale.height / 2, 'acidicMonster').setScale(0.5);

        // Create health bars
        this.playerHealthBar = this.add.sprite(200, this.scale.height / 4, 'healthBar').setScale(0.5);
        this.enemyHealthBar = this.add.sprite(this.scale.width - 200, this.scale.height / 4, 'healthBar').setScale(0.5);

        // Initial health values
        this.playerHealth = 100;
        this.enemyHealth = 100;

        // Display health as text for now (optional)
        this.playerHealthText = this.add.text(150, this.scale.height / 4 - 50, 'Player Health: 100', { fontSize: '16px', fill: '#fff' });
        this.enemyHealthText = this.add.text(this.scale.width - 350, this.scale.height / 4 - 50, 'Enemy Health: 100', { fontSize: '16px', fill: '#fff' });

        // Chemical options for the player to choose from
        this.createChemicalButtons();

        // Randomly set the enemy monster type
        this.randomizeEnemyMonster();
    }

    createChemicalButtons() {
        // Create clickable chemical buttons
        const chemicals = [
            { name: 'Sodium Hydroxide', image: 'sodiumHydroxide', action: this.useSodiumHydroxide.bind(this) },
            { name: 'Hydrochloric Acid', image: 'hydrochloricAcid', action: this.useHydrochloricAcid.bind(this) },
            { name: 'Water', image: 'water', action: this.useWater.bind(this) },
            { name: 'Heat', image: 'heat', action: this.useHeat.bind(this) }
        ];

        chemicals.forEach((chemical, index) => {
            const button = this.add.sprite(100 + index * 120, this.scale.height - 100, chemical.image).setInteractive().setScale(0.2);
            button.on('pointerdown', chemical.action);
        });
    }

    randomizeEnemyMonster() {
        const monsterTypes = ['acidicMonster', 'basicMonster', 'metallicMonster', 'carbonateMonster'];
        const randomType = Phaser.Utils.Array.GetRandom(monsterTypes);
        this.enemyMonster.setTexture(randomType);
        this.currentMonsterType = randomType; // Store the current monster type
    }

    useSodiumHydroxide() {
        if (this.currentMonsterType === 'acidicMonster') {
            this.dealDamageToEnemy(30); // Sodium hydroxide is effective against acidic monsters
        } else {
            this.damagePlayer(10); // Wrong chemical reduces player health
        }
    }

    useHydrochloricAcid() {
        if (this.currentMonsterType === 'basicMonster') {
            this.dealDamageToEnemy(30); // Hydrochloric acid is effective against basic monsters
        } else {
            this.damagePlayer(10); // Wrong chemical reduces player health
        }
    }

    useWater() {
        if (this.currentMonsterType === 'metallicMonster') {
            this.dealDamageToEnemy(30); // Water is effective against metallic monsters
        } else {
            this.damagePlayer(10); // Wrong chemical reduces player health
        }
    }

    useHeat() {
        if (this.currentMonsterType === 'carbonateMonster') {
            this.dealDamageToEnemy(30); // Heat is effective against carbonate monsters
        } else {
            this.damagePlayer(10); // Wrong chemical reduces player health
        }
    }

    dealDamageToEnemy(amount) {
        this.enemyHealth -= amount;
        this.enemyHealthText.setText(`Enemy Health: ${this.enemyHealth}`);
        this.showAttackEffect();
        if (this.enemyHealth <= 0) {
            this.enemyDefeated();
        }
    }

    damagePlayer(amount) {
        this.playerHealth -= amount;
        this.playerHealthText.setText(`Player Health: ${this.playerHealth}`);
        if (this.playerHealth <= 0) {
            this.playerDefeated();
        }
    }

    showAttackEffect() {
        // Show a quick attack effect (optional animation)
        const attackEffect = this.add.sprite(this.enemyMonster.x, this.enemyMonster.y, 'attackEffect').setScale(0.5);
        this.tweens.add({
            targets: attackEffect,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                attackEffect.destroy();
            }
        });
    }

    enemyDefeated() {
        // Logic for defeating the enemy (restart, show victory message, etc.)
        this.enemyMonster.setTint(0xff0000); // Example of showing defeat
        this.time.delayedCall(2000, () => {
            this.scene.restart(); // Restart the battle with a new enemy
        });
    }

    playerDefeated() {
        // Logic for when the player's monster is defeated (game over, restart, etc.)
        this.playerMonster.setTint(0xff0000); // Example of showing defeat
        this.time.delayedCall(2000, () => {
            this.scene.restart(); // Restart the battle
        });
    }
}
