export class ObjectWithHealth extends Phaser.Physics.Arcade.Image {
    protected health: number = 1;
    protected maxHealth: number = 1;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | integer) {
        super(scene, x, y, texture, frame);
    }
    setHealth(health: number, maxHealth: number) {
        this.health = health;
        this.maxHealth = maxHealth;
    }
    getHealth() {
        return this.health;
    }
    getMaxHealth() {
        return this.maxHealth;
    }
    hitWithBullet() {
        this.health--;
    }
    isFinished() {
        return this.health < 1;
    }
}