import { BulletConfig, BulletType } from "./configs";

export class Weapon {
    public interceptable = true;
    public group!: Phaser.Physics.Arcade.Group;
    private currentInterval = 0;
    private isActive = true;
    constructor(private owner: Phaser.Physics.Arcade.Image, private fireInterval: number, 
        private scene: Phaser.Scene, private bulletConfig: BulletConfig, private rotationDif = 0, private startScale: number = 1) {
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
        const x = this.owner.x + this.startScale * (this.owner.displayHeight * Math.sin(this.owner.rotation + this.rotationDif));
        const y = this.owner.y - this.startScale * (this.owner.displayHeight * Math.cos(this.owner.rotation + this.rotationDif));
        const bullet = new Phaser.Physics.Arcade.Image(this.scene, x, y, this.bulletConfig.key);
        this.group.add(bullet, true);
        const rotation = this.owner.rotation + this.rotationDif;
        if (this.bulletConfig.bulletType == BulletType.RoundBullet) {
            const radius = (bullet.body.width + bullet.body.height)/4;
            const displayBodyRatio = 0.75;
            //TODO: calculate a proper offset;
            bullet.body.setCircle(radius*displayBodyRatio, radius*(1-displayBodyRatio), radius*(1-displayBodyRatio));
            bullet.body.updateCenter();
        } else if (this.bulletConfig.bulletType == BulletType.PlayerBullet) {
            const radius = bullet.width / 2;
            const displayBodyRatio = 0.5;
            const adjustedRadius = radius * displayBodyRatio;
            bullet.body.setCircle(adjustedRadius,
                adjustedRadius + 0.75*radius*Math.sin(rotation),
                adjustedRadius/2 + 0.75*radius*(1 - Math.cos(rotation)));
            bullet.body.updateCenter();
        } else if (this.bulletConfig.bulletType == BulletType.BossMainBullet) {
            //heightRatio: 0.65
            //widthRatio: 0.42
            const bodyWidth = bullet.width * 0.42;
            const bodyHeight = bullet.height * 0.65;

            const actualWidth = bodyWidth + (bodyHeight - bodyWidth) * Math.abs(Math.sin(rotation));
            const actualHeight = bodyHeight + (bodyWidth - bodyHeight)*(1 - Math.abs(Math.cos(rotation)));

            const body = bullet.body as any;
            body.setSize(actualWidth, actualHeight, true);
            bullet.body.updateCenter();
        }
        bullet.setScale(this.bulletConfig.scale, this.bulletConfig.scale);

        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        bullet.setRotation(rotation);

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