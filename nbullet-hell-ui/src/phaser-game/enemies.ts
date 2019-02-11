import { ControlledObject } from './enemies';
import { Subject, Subscription, interval } from 'rxjs';
import { Weapon } from './weapon';
import { compose } from '../utils';

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

    update() {
        if (!this.canUpdate)
            return;

        this.canUpdate = false;
        for(let enemy of this.group.getChildren()) {
            (<Enemy>enemy).update();
        }
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
    public scorePoints: number = 100;
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