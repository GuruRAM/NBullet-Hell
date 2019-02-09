import { BulletConfig } from "./configs";

export class Weapon {
    public group!: Phaser.Physics.Arcade.Group;
    private currentInterval = 0;
    private isActive = true;
    constructor(private owner: Phaser.Physics.Arcade.Image, private fireInterval: number, 
        private scene: Phaser.Scene, private bulletConfig: BulletConfig) {
    }

    create() {
        this.group = this.scene.physics.add.group();
        //TODO: Move to a global handler
        this.scene.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
            if (this.group.contains(body.gameObject)) {
                const bullet = body.gameObject;
                this.group.remove(bullet);
                bullet.destroy();
            }
        });
    }

    fire() {
        if (!this.isActive)
            return;
        if (this.currentInterval <= 0) {
            this.currentInterval = this.fireInterval;
            this.innerFire();
        }
    }

    //+5 armor
    innerFire() {
        const x = this.owner.x + this.owner.displayHeight * Math.sin(this.owner.rotation);
        const y = this.owner.y - this.owner.displayHeight * Math.cos(this.owner.rotation);
        const bullet = new Phaser.Physics.Arcade.Image(this.scene, x, y, this.bulletConfig.key);
        bullet.setScale(this.bulletConfig.scale, this.bulletConfig.scale);
        this.group.add(bullet, true);
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        bullet.setAngle(this.owner.angle);

        const baseVelocity = this.bulletConfig.velocity;

        bullet.setVelocityX(baseVelocity * Math.sin(bullet.rotation));
        bullet.setVelocityY(-(baseVelocity * Math.cos(bullet.rotation)));

        //No acceleration for now
        const baseAccelerration = 0;
        bullet.setAccelerationX(baseAccelerration * Math.sin(bullet.rotation));
        bullet.setAccelerationY(-(baseAccelerration * Math.cos(bullet.rotation)));

        if (this.bulletConfig.fireSound) {
            const music = this.scene.sound.add(this.bulletConfig.fireSound.key, { volume: this.bulletConfig.fireSound.volume });
            music.play();
        }
    }

    update() {
        this.currentInterval = Math.max(0, this.currentInterval - 1);
    }

    destroy() {
        this.isActive = false;
        //TODO: destroy weapon
    }
}