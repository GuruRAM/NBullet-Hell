import Phaser from "phaser"


export class MainScene extends Phaser.Scene {
    protected cursor: Phaser.Input.Keyboard.CursorKeys = null!;
    protected player: Phaser.Physics.Arcade.Image = null!;
    protected lasers: (Phaser.Physics.Arcade.Image | null)[] = [];
    protected weapon!: Weapon;
    preload() {
        this.load.image('background', process.env.PUBLIC_URL + '/assets/background.png');
        this.load.image('ground', process.env.PUBLIC_URL + '/assets/platform.png');
        this.load.image('star', process.env.PUBLIC_URL + '/assets/star.png');
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
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, platforms);
        this.weapon = new Weapon(this.player, 5, 'laser', this);
        this.weapon.create();
        this.weapon.setCollider(platforms);
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
    }
}

class Weapon {
    private group!: Phaser.Physics.Arcade.Group;
    private currentInterval = 0;
    constructor(private owner: Phaser.Physics.Arcade.Image, private fireInterval: number, private imageKey: string, private scene: Phaser.Scene) {
    }

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
        callEveryEveryN(1000, () => {
            //clean group bullets
            const bullets = this.group.children.getArray();
            bullets.forEach(bullet => {
                this.group.remove(bullet);
                bullet.setActive(false);
                bullet.destroy();
            });
        })
    }

    setCollider(collider: Phaser.GameObjects.Group) {
        this.scene.physics.add.collider(this.group, collider, (o1, o2) => {
            const bullet = collider.contains(o1) ? o2 : o1;
            bullet.setActive(false);
            this.group.remove(bullet);
            bullet.destroy();
        });

        this.scene.physics.add.overlap(this.group, collider, (o1, o2) => {
            const bullet = collider.contains(o1) ? o2 : o1;
            bullet.setActive(false);
            this.group.remove(bullet);
            bullet.destroy();
        });
    }
}

const callEveryEveryN = (n: number, func: () => void) => {
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