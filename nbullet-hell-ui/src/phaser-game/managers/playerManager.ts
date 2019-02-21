import { Player } from "../player";
import { Scene, GameObjects } from "phaser";
import { Weapon } from "../weapons/weapon";
import { BulletType, OnFireEvent } from "../configs";

export class PlayerManager {
    private playerVelocity = 250;
    //in radians
    private playerAngularVelocity = 3;
    private playerBulletVelocity = 600;

    private playerOriginalSize: [number, number] = [256, 256];
    private playerScale = 0.2;
    private bulletScale = 0.65;
    private volume = 0.1;
    //in ms
    private fireInterval = 100;
    constructor(private scene: Scene) {
    }

    public player!: Player;
    private playerBar!: Phaser.GameObjects.Image;

    public createPlayer(x: number = 0, y: number = 0, health: number): Player {
        const player = new Player(this.scene, this.playerOriginalSize[0], this.playerOriginalSize[1], 'starfighter');
        player.setHealth(health, health);
        player.setScale(this.playerScale);
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
        this.playerBar.setBlendMode(Phaser.BlendModes.ADD);
        //TODO: create a bar component
        this.playerBar.setScale(1, 0.3);
        this.resize();

        this.player.weapon = new Weapon(this.player, this.fireInterval, this.scene, {
            key: 'MegaLaser',
            scale: this.bulletScale,
            velocity: this.playerBulletVelocity,
            onFireEvent: OnFireEvent.OnPlayerFire,
            bulletType: BulletType.TrailBullet
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

    hitWithBullet(bulletObject: GameObjects.GameObject) {
        this.player.hitWithBullet();
        this.resize();
    }

    updatePlayerControl(allowToFire = true) {
        const cursor = this.scene.input.keyboard.createCursorKeys();
        const space = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        const keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        const keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        const keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        if (cursor.left!.isDown)
        {
            this.player.setAngle(this.player.angle - this.playerAngularVelocity);
        }
        else if (cursor.right!.isDown)
        {
            this.player.setAngle(this.player.angle + this.playerAngularVelocity);
        }

        if (cursor.up!.isDown) {
            this.player.setVelocityX(this.playerVelocity * Math.sin(this.player.rotation));
            this.player.setVelocityY(-this.playerVelocity * Math.cos(this.player.rotation));
        } else if (cursor.down!.isDown) {
            this.player.setVelocityX(-this.playerVelocity * Math.sin(this.player.rotation));
            this.player.setVelocityY(this.playerVelocity * Math.cos(this.player.rotation));
        } else {
            if (keyA!.isDown)
            {
                this.player.setVelocityX(-this.playerVelocity);
            }
            else if (keyD!.isDown)
            {
                this.player.setVelocityX(this.playerVelocity);
            }
            else
            {
                this.player.setVelocityX(0);
            }
        
            if (keyW!.isDown)
            {
                this.player.setVelocityY(-this.playerVelocity);
            }
            else if (keyS!.isDown)
            {
                this.player.setVelocityY(this.playerVelocity);
            }
            else
            {
                this.player.setVelocityY(0);
            }
        }

        if (allowToFire && space.isDown) {
            this.player.weapon.fire();
        }
    }
}