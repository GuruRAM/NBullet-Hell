import { Player } from "./player";
import { Scene } from "phaser";
import { Weapon } from "./weapon";

export class PlayerManager {
    constructor(private scene: Scene) {
    }

    private player!: Player;
    private playerBar!: Phaser.GameObjects.Image;

    public createPlayer(x: number = 0, y: number = 0, health: number = 30): Player {
        const player = new Player(this.scene, 256, 256, 'starfighter');
        player.setHealth(health, health);
        player.setScale(0.2, 0.2);
        player.height = player.displayHeight;
        player.width = player.displayWidth;
        this.scene.sys.displayList.add(player);
        this.scene.physics.world.enable(player);
        player.setActive(true);
        player.setBounce(0.1, 0.1);
        player.setCollideWorldBounds(true);
        this.player = player;

        const playerBar = this.scene.add.image(x, y, "ground");
        this.playerBar = playerBar;
        this.playerBar.setScale(1, 0.3);
        this.resize();

        this.player.weapon = new Weapon(this.player, 5, this.scene, {
            key: 'MegaLaser',
            scale: 0.5,
            velocity: 600,
            fireSound: { key: 'fire', volume: 0.01 },
            displayBodyRatio: 2
        });
        this.player.weapon.create();

        return player;
    }

    public resize() {
        const healthRatio = this.player.getHealth()/this.player.getMaxHealth();
        this.playerBar.displayWidth = this.playerBar.width * healthRatio;

        const centerX = this.scene.physics.world.bounds.centerX;
        const height = this.scene.physics.world.bounds.height;

        this.playerBar.x = centerX - (this.playerBar.width - this.playerBar.displayWidth)/2;
        this.playerBar.y = height - 3 * this.playerBar.displayHeight;
    }

    updatePlayerControl(allowToFire = true) {
        const cursor = this.scene.input.keyboard.createCursorKeys();
        const space = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        const keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        const keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        const keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
        if (keyA!.isDown)
        {
            this.player.setVelocityX(-250);
        }
        else if (keyD!.isDown)
        {
            this.player.setVelocityX(250);
        }
        else
        {
            this.player.setVelocityX(0);
        }
    
        if (keyW!.isDown)
        {
            this.player.setVelocityY(-250);
        }
        else if (keyS!.isDown)
        {
            this.player.setVelocityY(250);
        }
        else
        {
            this.player.setVelocityY(0);
        }

        if (cursor.left!.isDown)
        {
            this.player.setAngle(this.player.angle - 3);
        }
        else if (cursor.right!.isDown)
        {
            this.player.setAngle(this.player.angle + 3);
        }

        if (allowToFire && space.isDown) {
            this.player.weapon.fire();
        }
    }
}