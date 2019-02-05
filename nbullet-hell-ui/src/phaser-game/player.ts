export class Player extends Phaser.Physics.Arcade.Image {
    private health: number = 1;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | integer) {
        super(scene, x, y, texture, frame);
    }
    setHealth(health: number) {
        this.health = health;
    }
    getHealth() {
        return this.health;
    }
    hitWithBullet() {
        this.health--;
    }
    isFinished() {
        return this.health < 1;
    }
}