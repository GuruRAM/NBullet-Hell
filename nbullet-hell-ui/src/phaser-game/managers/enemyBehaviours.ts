import { ControlledObject, Behaviour } from "../enemies";
import { compose } from "../../utils";
import { Weapon } from "../weapons/weapon";

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


    /*
    const createRoundTrackingEnemy = (x: number, y: number) => {
        const enemy = this.enemies.addEnemy(x, y, 'enemy1', 0.2)
            .addBehaviour(createRoundMovementBehaviour(50, 20))
            .addBehaviour(createTrackingBehaviour(this.player, 2, 0.05));

        enemy.addBehaviour(createEnemyFiringBehaviour(enemy, 1, 'EnemyProjectile1', this, 3, (weapon) => {
        }));
    }*/