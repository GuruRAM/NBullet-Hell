import { BulletConfig, BulletType } from "../configs";

export class Weapon {
    public interceptable = true;
    public group!: Phaser.Physics.Arcade.Group;

    private isActive = true;
    private isReloading = false;
    constructor(private owner: Phaser.Physics.Arcade.Image, private fireInterval: number, 
        private scene: Phaser.Scene, private bulletConfig: BulletConfig, private rotationDif = 0, private startPositionRatio: number = 1) {
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
        if (!this.isActive || this.isReloading)
            return;
        this.innerFire();
        this.isReloading = true;
        this.reload();
    }

    reload() {
        if (this.fireInterval <= 0)
        {
            this.isReloading = false;
            return;
        }

        const event = this.scene.time.addEvent({
            delay: this.fireInterval,
            callback: () => {
                this.isReloading = false;
                event.destroy();
            }
        });
    }

    //+5 armor
    innerFire() {
        const bulletOffset = (this.owner.displayHeight + this.owner.displayWidth)/2;
        const x = this.owner.x + this.startPositionRatio * (bulletOffset * Math.sin(this.owner.rotation + this.rotationDif));
        const y = this.owner.y - this.startPositionRatio * (bulletOffset * Math.cos(this.owner.rotation + this.rotationDif));
        const bullet = new Phaser.Physics.Arcade.Image(this.scene, x, y, this.bulletConfig.key);
        this.group.add(bullet, true);
        const rotation = this.owner.rotation + this.rotationDif;
        if (this.bulletConfig.bulletType == BulletType.RoundBullet) {
            const radius = (bullet.body.width + bullet.body.height)/4;
            const displayBodyRatio = 0.75;
            //TODO: calculate a proper offset;
            bullet.body.setCircle(radius*displayBodyRatio, radius*(1-displayBodyRatio), radius*(1-displayBodyRatio));
            bullet.body.updateCenter();
        } else if (this.bulletConfig.bulletType == BulletType.TrailBullet) {
            const radius = bullet.width / 2;
            const displayBodyRatio = 0.5;
            const adjustedRadius = radius * displayBodyRatio;
            bullet.body.setCircle(adjustedRadius,
                adjustedRadius + 0.75*radius*Math.sin(rotation),
                adjustedRadius/2 + 0.75*radius*(1 - Math.cos(rotation)));
            bullet.body.updateCenter();
        } else if (this.bulletConfig.bulletType == BulletType.RectangleBullet) {
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

        this.scene.events.emit(this.bulletConfig.onFireEvent, bullet);
    }

    destroy() {
        this.isActive = false;
        //TODO: destroy weapon
    }
}