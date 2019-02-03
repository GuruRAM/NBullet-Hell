export class Weapon {
    public group!: Phaser.Physics.Arcade.Group;
    private currentInterval = 0;
    constructor(private owner: Phaser.Physics.Arcade.Image, private fireInterval: number, private imageKey: string, private scene: Phaser.Scene, private scale: number = 1) {
    }

    private cleanBullets = callEveryEveryN(1000, () => {
        //clean group bullets
        const bullets = this.group.children.getArray();
        bullets.forEach(bullet => {
            this.group.remove(bullet);
            bullet.setActive(false);
            bullet.destroy();
        });
    })

    create() {
        this.group = this.scene.physics.add.group();
    }

    fire() {
        if (this.currentInterval <= 0) {
            this.currentInterval = this.fireInterval;
            this.innerFire();
        }
    }

    //+5 armor
    innerFire() {
        const x = this.owner.x + this.owner.displayHeight * Math.sin(this.owner.rotation);
        const y = this.owner.y - this.owner.displayHeight * Math.cos(this.owner.rotation);
        const bullet = new Phaser.Physics.Arcade.Image(this.scene, x, y, this.imageKey);
        this.group.add(bullet, true);
        bullet.setScale(this.scale, this.scale);
        bullet.setSize(bullet.displayWidth, bullet.displayHeight);
        bullet.setAngle(this.owner.angle);

        const baseVelocity = 500;
        const baseAccelerration = 1000;

        bullet.setVelocityX(baseVelocity * Math.sin(bullet.rotation));
        bullet.setVelocityY(-(baseVelocity * Math.cos(bullet.rotation)));
        bullet.setAccelerationX(baseAccelerration * Math.sin(bullet.rotation));
        bullet.setAccelerationY(-(baseAccelerration * Math.cos(bullet.rotation)));
    }

    update() {
        this.currentInterval = Math.max(0, this.currentInterval - 1);
        this.cleanBullets();
    }

    setCollider(collider: Phaser.GameObjects.Group) {
        const onHit: ArcadePhysicsCallback = (o1, o2) => {
            const bullet = collider.contains(o1) ? o2 : o1;
            bullet.setActive(false);
            this.group.remove(bullet);
            bullet.destroy();
        }
        this.scene.physics.add.collider(this.group, collider, onHit);
        this.scene.physics.add.overlap(this.group, collider, onHit);
    }

    destroy() {
        this.group.destroy(true);
    }
}

export const callEveryEveryN = (n: number, func: () => void) => {
    if (n < 1) throw new Error('n cannot be lower then 1');

    let counter = 1;
    return () => {
        if (counter == 1) {
            counter = n;
            func();
        } else {
            counter--;
        }
    }
}