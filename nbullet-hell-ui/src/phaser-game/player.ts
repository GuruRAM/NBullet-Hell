import { Weapon } from "./weapons/weapon";
import { ObjectWithHealth } from "./objectWithHealth";

export class Player extends ObjectWithHealth {
    public weapon!: Weapon;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | integer) {
        super(scene, x, y, texture, frame);
    }
}