import { Observable, Subject, Subscription, interval } from 'rxjs';

export class Enemies {
    private onEnemyKill$: Subject<number>;
    private onEnemyKillObservable: Observable<number>;
    private group!: Phaser.Physics.Arcade.Group;
    private subscription: Subscription;
    private canUpdate = true;
    public get onEnemyKill() {
        return this.onEnemyKillObservable;
    }

    constructor(private player: Phaser.Physics.Arcade.Image, private scene: Phaser.Scene) {
        this.onEnemyKill$ = new Subject<number>();
        this.onEnemyKillObservable = this.onEnemyKill$.asObservable();
        this.subscription = interval(300).subscribe(() => {
            this.canUpdate = true;
        })
    }

    create() {
        this.group = this.scene.physics.add.group();
    }

    addEnemy(x: number, y: number, texture: string, behaviour: Behaviour) {
        // replace with sprites
        const enemy = new Enemy(behaviour, this.scene, x, y, texture);
        this.group.add(enemy, true);
        enemy.setBounce(0.1, 0.1);
        enemy.setCollideWorldBounds(true);
    }

    addRandomTrackingEnemy(x: number, y: number, texture: string, velocity: number, angularVelocity: number, trackingVelocity: number, accuracy: number) {
        const behaviour = createTrackingRandomBehaviour(this.player, trackingVelocity, accuracy, velocity, angularVelocity);
        this.addEnemy(x, y, texture, behaviour);
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

    setBulletCollider(bullets: Phaser.GameObjects.Group) {
        const eliminationFunc: ArcadePhysicsCallback = (o1, o2) => {
            // both bullet and a enemy should be eliminated
            o1.setActive(false);
            o2.setActive(false);
            this.group.remove(o1);
            bullets.remove(o2);
            o1.destroy();
            o2.destroy();
            // All enemies yield 100 points
            this.onEnemyKill$.next(100);
        }
        this.scene.physics.add.collider(this.group, bullets, eliminationFunc);

        //TODO: The score can be calculated twice, fix it later
        this.scene.physics.add.overlap(this.group, bullets, eliminationFunc);
    }

    destroy() {
        this.subscription.unsubscribe();
    }
}

export type ControlledObject = Phaser.Physics.Arcade.Image;/* Phaser.GameObjects.Components.Transform & Phaser.Physics.Arcade.Components.Velocity
    & Phaser.Physics.Arcade.Components.Angular & Phaser.Physics.Arcade.Components.Acceleration;
{};*/

export type Behaviour = (behaviourObject: ControlledObject) => [ControlledObject];

export class Enemy extends Phaser.Physics.Arcade.Image {
    constructor(private behaviour: Behaviour,
        scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | integer) {
        super(scene, x, y, texture, frame);
    }

    public update() {
        this.behaviour(this);
    }
}

export const createRandomBehaviour = (velocity: number, baseAngularVelocity: number) => 
    (obj: ControlledObject) => randomBehaviour(velocity, baseAngularVelocity, obj);
export const createTrackingBehaviour = (objectToTrack: Phaser.GameObjects.Components.Transform, angularVelocity: number, accuracy: number) => 
    (obj: ControlledObject) => trackingBehaviour(objectToTrack, angularVelocity, accuracy, obj);

export const createTrackingRandomBehaviour = (objectToTrack: Phaser.GameObjects.Components.Transform, trackingAngularVelocity: number, trackingAccuracy: number,
    randomVelocity: number, randomAngularVelocity: number) => (compose(createTrackingBehaviour(objectToTrack, trackingAngularVelocity, trackingAccuracy), createRandomBehaviour(randomVelocity, randomAngularVelocity)))

function randomBehaviour(velocity: number, baseAngularVelocity: number, controlledObject: ControlledObject): [ControlledObject] {
    const currentVelocity = controlledObject.body.velocity;
    const currentVelocityAngle = Math.atan2(currentVelocity.y, currentVelocity.x);
    const dif = 2*(Math.random() - 0.5) * baseAngularVelocity
    const newAngle = currentVelocityAngle + dif;
    controlledObject.setVelocityX(velocity*Math.cos(newAngle));
    controlledObject.setVelocityY(velocity*Math.sin(newAngle));
    return [controlledObject];
}

function getAngleRadian(obj1: Phaser.GameObjects.Components.Transform, obj2: Phaser.GameObjects.Components.Transform) {
    var angleRadians = Math.atan2(obj2.y-obj1.y, obj2.x-obj1.x);
    return angleRadians;
}

function trackingBehaviour(objectToTrack: Phaser.GameObjects.Components.Transform, angularVelocity: number, accuracy: number, controllerObject: ControlledObject): [ControlledObject] {
    const newAngle = getAngleRadian(controllerObject, objectToTrack);
    if (Math.abs(newAngle - controllerObject.rotation) <= accuracy) {
        controllerObject.setAngularVelocity(0);
    } else {
    controllerObject.setAngularVelocity(newAngle - controllerObject.angle > 0 ? angularVelocity : -angularVelocity);
    }
    return [controllerObject];
}


export function plapply<T, U extends any[], K>(f: (t: T, ...u: U) => K, t: T) {
    return (...u: U) => f(t, ...u);
}
export function compose<T extends any[], U extends any[], K extends any[]>(f1: (...u: U) => K, f2: (...k: K) => T) : (...u: U) => T {
    return (...u: U) => f2(...f1(...u));
}