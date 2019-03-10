import { GameObjects, Scene } from "phaser";

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

const maxRadius = 100;
const extension = 0.4;
export function getCircleAim(width: number, height: number) {
    const radius = getSize(Math.min(height, width));
    return { x: width - radius.realRadius, y: height - radius.realRadius, ...radius };
}

export function getCircleMovement(width: number, height: number) {
    const radius = getSize(Math.min(height, width));
    return { x: radius.realRadius, y: height - radius.realRadius, ...radius };
}

function getSize(dimension: number) {
    let radius = maxRadius;
    let realRadius = radius + radius * extension;
    if (dimension * 0.25 < realRadius) {
        realRadius = dimension * 0.25;
        radius = realRadius / (1 + extension);
    }

    return { radius, realRadius }
}

export function distance(x: number, y: number, x1: number, y1: number) {
    return Math.sqrt((x-x1)*(x-x1) + (y-y1)*(y-y1));
}

export function sceneChangeEffect(scene: Scene, duration: number, call: () => void = () => {}) {
    const camera = scene.cameras.main;
    camera.flash(duration, 0, 0, 0, true);
    scene.time.addEvent({
        delay: 0.8 * duration,
        callback: () => { call(); }
    });
}

export function getTextWidth(worldWidth: number) {
    let ratio = 2;
    if (worldWidth / ratio < 300) {
        ratio = 1.1;
    }
    return worldWidth / ratio;
}