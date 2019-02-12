import { BulletConfig } from "./configs";

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
        bullet.setScale(this.bulletConfig.scale, this.bulletConfig.scale);

        //TODO: Adjust player bullets body size and boss body size
        //const body: any = bullet.body;
        //body.setSize(bullet.displayWidth/this.bulletConfig.displayBodyRatio, bullet.displayHeight/this.bulletConfig.displayBodyRatio, true);
        
        //= bullet.displayWidth / 2;
        //bullet.displayHeight = bullet.displayHeight / 2;
        //bullet.body.

        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        bullet.setRotation(this.owner.rotation + this.rotationDif);

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