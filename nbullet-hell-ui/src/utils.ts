import { GameObjects } from "phaser";

export function plapply<T, U extends any[], K>(f: (t: T, ...u: U) => K, t: T) {
    return (...u: U) => f(t, ...u);
}
export function compose<T extends any[], U extends any[], K extends any[]>(f1: (...u: U) => K, f2: (...k: K) => T) : (...u: U) => T {
    return (...u: U) => f2(...f1(...u));
}

export function getMiddle(o1: GameObjects.GameObject, o2: GameObjects.GameObject): [number, number] {
    const b1 = <Phaser.Physics.Arcade.Image>o1;
    const b2 = <Phaser.Physics.Arcade.Image>o2;
    return [(b1.x + b2.x)/2, (b1.y + b1.y)/2];
}

const bottomPadding = 10;
const sidePadding = 10;
const radius = 50;
const invisibleExtension = 20;
export function getCircleAim(width: number, height: number) {
    return { x: width - sidePadding - radius, y: height - radius - bottomPadding, radius, invisibleExtension };
}

export function getCircleMovement(width: number, height: number) {
    return { x: sidePadding + radius, y: height - radius - bottomPadding, radius, invisibleExtension };
}

export function distance(x: number, y: number, x1: number, y1: number) {
    return Math.sqrt((x-x1)*(x-x1) + (y-y1)*(y-y1));
}