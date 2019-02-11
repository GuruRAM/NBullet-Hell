import { ControlledObject } from './enemies';
import { Subscription, interval } from 'rxjs';
import { Weapon } from './weapon';
import { compose } from '../utils';
import { GameObjects } from 'phaser';

export class Enemies {
    public group!: Phaser.Physics.Arcade.Group;
    private subscription: Subscription;
    private canUpdate = true;    
    constructor(private player: Phaser.Physics.Arcade.Image, private scene: Phaser.Scene) {
        this.subscription = interval(300).subscribe(() => {
            this.canUpdate = true;
        })
    }

    create() {
        this.group = this.scene.physics.add.group();
    }

    addEnemy(x: number, y: number, texture: string, scale: number = 1, behaviour: Behaviour = (obj, cleanup) => [obj, cleanup]) {
        // replace with sprites
        const enemy = new Enemy(behaviour, this.scene, x, y, texture);
        this.group.add(enemy, true);
        enemy.setScale(scale, scale);
        enemy.setSize(enemy.displayWidth, enemy.displayHeight);
        enemy.setBounce(0.1, 0.1);
        enemy.setCollideWorldBounds(true);
        return enemy;
    }

    addBoss() {
        const boss = new Boss(this.scene,
            this.scene.physics.world.bounds.centerX,
            this.scene.physics.world.bounds.centerY);
        this.group.add(boss, true);
        boss.setBounce(0, 0);
        boss.setCollideWorldBounds(true);
        return boss;
    }

    update() {
        let updateDone = false;
        for(let enemy of this.group.getChildren()) {
            const convertedEnemy = <Enemy>enemy;
            if (convertedEnemy.isBoss())
                convertedEnemy.update();
            else
            {
                if (this.canUpdate)
                {
                    convertedEnemy.update();
                    updateDone = true;
                }
            }
        }
        if (updateDone)
            this.canUpdate = false;
    }

    setCollider(collider: Phaser.GameObjects.Group) {
        this.scene.physics.add.collider(this.group, collider);
    }

    destroy() {
        this.subscription.unsubscribe();
    }

    isAlive() {
        return this.group.countActive() != 0;
    }
}

export type ControlledObject = Phaser.Physics.Arcade.Image;/* Phaser.GameObjects.Components.Transform & Phaser.Physics.Arcade.Components.Velocity
    & Phaser.Physics.Arcade.Components.Angular & Phaser.Physics.Arcade.Components.Acceleration;
{};*/

export type Behaviour = (behaviourObject: ControlledObject, cleanup: boolean) => [ControlledObject, boolean];

export class Enemy extends Phaser.Physics.Arcade.Image {
    protected health = 1;
    protected maxHealth = 1;

    public isBoss() { return false; }
    constructor(private behaviour: Behaviour = (obj, cleanup) => [obj, cleanup],
        scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | integer) {
        super(scene, x, y, texture, frame);
    }

    public update() {
        if (this.active && this.behaviour)
            this.behaviour(this, false);
    }

    public addBehaviour(behaviour: Behaviour) {
        if (this.behaviour == null)
            this.behaviour = behaviour;
        else
            this.behaviour = compose(this.behaviour, behaviour);
        return this;
    }

    public destroy(fromScene?: boolean) {
        super.destroy(fromScene);
        this.behaviour(null!, true);
    }

    public getScore(){
        return 100;
    }

    public getHealth() {
        return this.health;
    }

    public getMaxHealth() {
        return this.maxHealth;
    }

    public isFinished() {
        return this.health < 1;
    }

    public hitByBullet(playerBullet: GameObjects.GameObject,
        explosionWithSound: (explosionKey: string, soundKey: string, soundVolume: number, coordinates: [number, number]) => void) {
        this.health--;
        const bullet = playerBullet as Phaser.Physics.Arcade.Image;
        explosionWithSound('explosion', 'explosion', 0.3, [bullet.x, bullet.y]);
        if(this.isFinished()) {
            this.kill();
        }
    }

    protected kill() {
        this.destroy();
    }
}

export class Boss extends Enemy {
    protected health = 100;
    protected maxHealth = 100;
    private angularSpeed = 0.012;
    private weapon45!: Weapon;
    private weapon135!: Weapon;
    private weapon225!: Weapon;
    private weapon315!: Weapon;
    private mainWeapon!: Weapon;
    private weapons: Weapon[] = [];
    constructor(scene: Phaser.Scene, x: number, y: number, frame?: string | integer) {
        super(undefined, scene, x, y, 'boss', frame);
        const bulletConfig = {
            fireSound: {
                key: 'fire1',
                volume: 0.015
            },
            key: 'EnemyProjectile1',
            scale: 1,
            velocity: 600
        };
        this.weapon45 = new Weapon(this, 4, scene, bulletConfig, 1*Math.PI/4, 0.5);
        this.weapon45.create();
        this.weapon135 = new Weapon(this, 4, scene, bulletConfig, 3*Math.PI/4, 0.5);
        this.weapon135.create();
        this.weapon225 = new Weapon(this, 4, scene, bulletConfig, 5*Math.PI/4, 0.5);
        this.weapon225.create();
        this.weapon315 = new Weapon(this, 4, scene, bulletConfig, 7*Math.PI/4, 0.5);
        this.weapon315.create();
        this.mainWeapon = new Weapon(this, 6, scene, { ...bulletConfig, key: 'bossLaser' }, 0, 0.5);
        this.mainWeapon.create();

        this.weapons.push(this.weapon45);
        this.weapons.push(this.weapon135);
        this.weapons.push(this.weapon225);
        this.weapons.push(this.weapon315);
        this.weapons.push(this.mainWeapon);
    }

    public update() {
        if (this.body)
            this.setVelocity(0);
        if (!this.active || this.isFinished()) return;
        this.setRotation(this.rotation + this.angularSpeed);
        this.weapons.forEach(weapon => {
            weapon.fire();
            weapon.update();
        });
    }

    public destroy(fromScene?: boolean) {
        super.destroy(fromScene);
    }

    public getScore() {
        return 2000;
    }

    protected kill() {
        this.setActive(false);
        this.setAngularVelocity(0);
        const event = this.scene.time.addEvent({
            repeat: 10,
            delay: 500,
            callback: () => {
                if (!this.body)
                    return;

                const x = Phaser.Math.RND.between(this.body.left, this.body.right);
                const y = Phaser.Math.RND.between(this.body.bottom, this.body.top);
                const explosion = this.scene.physics.add.sprite(x, y, "explosion1");
                explosion.play('explosion');
                const timer = this.scene.time.addEvent({
                    delay: 1000,
                    callback: () => {
                        timer.destroy();
                        explosion.destroy();
                    }
                });
                this.scene.sound.play('explosion', { volume: 2 });
                if (event.getProgress() >= event.getRepeatCount())
                    this.destroy();
            },
        });
    }

    public getWeaponGroups() {
        return this.weapons.map(item => item.group);
    }

    public isBoss() { return true; }
}

export const createRandomBehaviour = (velocity: number, baseAngularVelocity: number) => 
    (obj: ControlledObject, cleanup: boolean) => randomBehaviour(velocity, baseAngularVelocity, obj, cleanup);
export const createTrackingBehaviour = (objectToTrack: Phaser.GameObjects.Components.Transform, angularVelocity: number, accuracy: number) => 
    (obj: ControlledObject, cleanup: boolean) => trackingBehaviour(objectToTrack, angularVelocity, accuracy, obj, cleanup);
export const createRoundMovementBehaviour = (velocity: number, angularAcceleration: number) => 
    (obj: ControlledObject, cleanup: boolean) => roundMovementBehaviour(velocity, angularAcceleration, obj, cleanup);

export const createTrackingRandomBehaviour = (objectToTrack: Phaser.GameObjects.Components.Transform, trackingAngularVelocity: number, trackingAccuracy: number,
    randomVelocity: number, randomAngularVelocity: number) => (compose(createTrackingBehaviour(objectToTrack, trackingAngularVelocity, trackingAccuracy), createRandomBehaviour(randomVelocity, randomAngularVelocity)))

export function createEnemyFiringBehaviour(weaponFactory: () => Weapon) : Behaviour {
    const weapon = weaponFactory();
    return (obj: ControlledObject, cleanup: boolean) : [ControlledObject, boolean] => {
        if (cleanup) {
            weapon.destroy();
            return [obj, cleanup];
        }
        weapon.fire();
        weapon.update();
        return [obj, cleanup];
    }
}

function randomBehaviour(velocity: number, baseAngularVelocity: number, controlledObject: ControlledObject, cleanup: boolean): [ControlledObject, boolean] {
    if (!cleanup) {
        const currentVelocity = controlledObject.body.velocity;
        const currentVelocityAngle = Math.atan2(currentVelocity.y, currentVelocity.x);
        const dif = 2*(Math.random() - 0.5) * baseAngularVelocity
        const newAngle = currentVelocityAngle + dif;
        controlledObject.setVelocityX(velocity*Math.cos(newAngle));
        controlledObject.setVelocityY(velocity*Math.sin(newAngle));
    }
    return [controlledObject, cleanup];
}

function getAngleRadian(obj1: Phaser.GameObjects.Components.Transform, obj2: Phaser.GameObjects.Components.Transform) {
    var angleRadians = Math.atan2(obj2.y-obj1.y, obj2.x-obj1.x);
    return angleRadians;
}

//TODO: Not optimal tracking, replace with the optimal solution
function trackingBehaviour(objectToTrack: Phaser.GameObjects.Components.Transform, angularVelocity: number, accuracy: number, controllerObject: ControlledObject, cleanup: boolean): [ControlledObject, boolean] {
    if (!cleanup) {
        const newAngle = (getAngleRadian(controllerObject, objectToTrack) + 2 * Math.PI) % (2*Math.PI);
        const currentAngle = (controllerObject.rotation + 3 * Math.PI/2) % (2*Math.PI);
        const dif = (newAngle - currentAngle) % (2*Math.PI);
        if (Math.abs(dif) <= accuracy) {
            controllerObject.setAngularVelocity(0);
        } else {
            controllerObject.setAngularVelocity((180 / Math.PI) * (dif > 0 ? angularVelocity : -angularVelocity));
        }
    }
    return [controllerObject, cleanup];
}

function roundMovementBehaviour(velocity: number, angularAcceleration: number, controllerObject: ControlledObject, cleanup: boolean): [ControlledObject, boolean] {
    if (!cleanup) {
        const velocityAngle = controllerObject.body.velocity.angle();
        const accelerationAngle = velocityAngle + Math.PI / 2;
        if (controllerObject.body.velocity.length() - velocity < 0.01) {
            controllerObject.setVelocity(velocity * Math.cos(velocityAngle),
            velocity * Math.sin(velocityAngle));
        }
        controllerObject.setAcceleration(angularAcceleration*Math.cos(accelerationAngle),
            angularAcceleration*Math.sin(accelerationAngle));
    }
    return [controllerObject, cleanup];
}