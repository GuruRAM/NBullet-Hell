import Phaser from "phaser"
import { Weapon } from "./weapon";
import { Enemies } from "./enemies";


export class MainScene extends Phaser.Scene {
    protected cursor: Phaser.Input.Keyboard.CursorKeys = null!;
    protected player: Phaser.Physics.Arcade.Image = null!;
    protected lasers: (Phaser.Physics.Arcade.Image | null)[] = [];
    protected weapon!: Weapon;
    protected enemies!: Enemies;
    preload() {
        this.load.image('background', process.env.PUBLIC_URL + '/assets/background.png');
        this.load.image('ground', process.env.PUBLIC_URL + '/assets/platform.png');
        this.load.image('bomb', process.env.PUBLIC_URL + '/assets/bomb.png');
        this.load.image('starfighter', process.env.PUBLIC_URL + '/assets/starfighter.png');
        this.load.image('laser', process.env.PUBLIC_URL + '/assets/laser.png');
    }

    create() {
        this.add.image(400, 300, 'background');
        this.add.group()
        const platforms = this.physics.add.staticGroup();

        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        this.player = this.physics.add.image(256, 256, 'starfighter');
        this.player.setScale(0.1, 0.1);
        this.player.setBounce(0.1, 0.1);
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, platforms);
        this.weapon = new Weapon(this.player, 5, 'laser', this);
        this.weapon.create();
        this.weapon.setCollider(platforms);

        this.enemies = new Enemies(this.player, this);
        this.enemies.create();
        this.enemies.addRandomTrackingEnemy(200, 200, 'bomb', 150, 3, 2, 0.01);
        this.enemies.addRandomTrackingEnemy(100, 100, 'bomb', 300, 3, 2, 0.01);
        this.enemies.setCollider(platforms);
        this.enemies.setBulletCollider(this.weapon.group);
    }

    update() {
        const cursor = this.input.keyboard.createCursorKeys();
        const space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
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

        if (space.isDown) {
            this.weapon.fire();
        }

        this.weapon.update();
        this.enemies.update();
    }
}