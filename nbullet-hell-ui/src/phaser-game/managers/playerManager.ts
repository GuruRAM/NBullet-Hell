import { Player } from "../player";
import { Scene, GameObjects } from "phaser";
import { Weapon } from "../weapons/weapon";
import { BulletType, OnFireEvent } from "../configs";
import { getCircleMovement, getCircleAim, distance } from "../../utils";

export class PlayerManager {
    private playerVelocity = 250;
    //in radians
    private playerAngularVelocity = 3;
    private playerBulletVelocity = 600;

    private playerOriginalSize: [number, number] = [256, 256];
    private playerScale = 0.2;
    private bulletScale = 0.65;
    //in ms
    private fireInterval = 100;

    private invicible = false;
    constructor(private scene: Scene) {
    }

    public player!: Player;
    private playerBar!: Phaser.GameObjects.Image;

    private controlCircles!: Phaser.GameObjects.Graphics;

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
        this.resizePlayer();
        this.drawControlElements();

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

    public setInvicibility() {
        this.invicible = true;
    }

    public resizePlayer() {
        const width = this.scene.physics.world.bounds.width;
        let desiredWidth = Math.min(this.playerBar.width, 0.75 * width);
        let scaleRatio = desiredWidth / this.playerBar.width
        const healthRatio = this.player.getHealth()/this.player.getMaxHealth();
        this.playerBar.displayWidth = this.playerBar.width * healthRatio * scaleRatio;

        const centerX = this.scene.physics.world.bounds.centerX;
        const height = this.scene.physics.world.bounds.height;

        this.playerBar.x = centerX - (this.playerBar.width * scaleRatio - this.playerBar.displayWidth)/2;
        this.playerBar.y = height - 3 * this.playerBar.displayHeight;
        this.playerBar.setVisible(!this.invicible);
    }

    hitWithBullet(bulletObject: GameObjects.GameObject) {
        if (!this.invicible)
            this.player.hitWithBullet();
        this.resizePlayer();
    }

    updatePlayerControl(weaponActivated: boolean = true) {
        if (!this.player.active || this.handleTouch(weaponActivated))
            return;

        this.handleKeyboard(weaponActivated);
    }

    disablePlayer() {
        this.stopPlayer();
        this.player.weapon.group.getChildren()
            .forEach(i => (<Phaser.Physics.Arcade.Image>i).setVisible(false));
        this.player.setVisible(false);
        this.playerBar.setVisible(false);
        this.player.setActive(false);
        this.hideControlElements();
    }

    stopPlayer() {
        if (!this.player.body)
            return;
        this.player.setVelocity(0);
        this.player.setAngularVelocity(0);
    }
    enablePlayer() {
        this.player.weapon.group.toggleVisible();
        this.player.setVisible(true);
        this.playerBar.setVisible(true);
        this.player.setActive(true);
        this.player.weapon.group.getChildren()
            .forEach(i => (<Phaser.Physics.Arcade.Image>i).setVisible(true));
        this.drawControlElements();
        
    }

    private handleKeyboard(weaponActivated: boolean) {
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

        if (space.isDown && weaponActivated) {
            this.player.weapon.fire();
        }

        return true;
    }

    private handleTouch(weaponActivated: boolean) {
        if (!this.scene.input.manager.touch)
            return false;

        const pointers = this.scene.input.manager.pointers.filter(p => p && p.wasTouch && p.isDown);

        const height = this.scene.physics.world.bounds.height;
        const width = this.scene.physics.world.bounds.width;
        const mc = getCircleMovement(width, height);
        const ac = getCircleAim(width, height);
        const movementPointers: Phaser.Input.Pointer[] = [];
        const aimPointers: Phaser.Input.Pointer[] = [];

        pointers.forEach(p => {
            if (distance(mc.x, mc.y, p.x, p.y) <= mc.realRadius) {
                movementPointers.push(p);
            } else if (distance(ac.x, ac.y, p.x, p.y) <= ac.realRadius) {
                aimPointers.push(p);
            }
        });

        if (movementPointers.length > 0) {
            const p = movementPointers[0];
            let direction = new Phaser.Math.Vector2(p.x - mc.x, p.y - mc.y);
            const modifier = 0.3 + 0.7 * direction.length() / (mc.realRadius); 
            direction = direction.normalize();

            this.player.setVelocityX(this.playerVelocity * modifier * direction.x);
            this.player.setVelocityY(this.playerVelocity * modifier * direction.y);
        } else {
            this.player.setVelocity(0, 0);
        }

        if (aimPointers.length > 0) {
            const p = aimPointers[0];
            let direction = new Phaser.Math.Vector2(p.position.x - ac.x, p.position.y - ac.y);
            direction = direction.normalize();
            const rotation = Math.atan2(direction.y, direction.x);
            this.player.setRotation(rotation + Math.PI / 2);
            weaponActivated && this.player.weapon.fire();
        }

        return aimPointers.length > 0 || movementPointers.length > 0;
    }

    public drawControlElements() {
        if (!this.scene.input.manager.touch || !this.player || !this.player.visible)
            return;

        const width = this.scene.physics.world.bounds.width;
        const height = this.scene.physics.world.bounds.height;

        const mc = getCircleMovement(width, height);
        const ac = getCircleAim(width, height);

        const movementCircle = new Phaser.Geom.Circle(mc.x, mc.y, mc.radius);
        const aimCircle = new Phaser.Geom.Circle(ac.x, ac.y, ac.radius);

        if (this.controlCircles)
            this.controlCircles.destroy();
        this.controlCircles = this.scene.add.graphics({ fillStyle: { color: 0x808080, alpha: 0.3 } });
        this.controlCircles.fillCircleShape(movementCircle);
        this.controlCircles.fillCircleShape(aimCircle);
    }

    public hideControlElements() {
        if (this.controlCircles)
            this.controlCircles.destroy();
    }
 }