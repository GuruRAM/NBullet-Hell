import { ControlledObject } from './enemies';
import { Weapon } from './weapon';
import { compose } from '../utils';
import { GameObjects } from 'phaser';
import { BulletType, OnFireEvent } from './configs';
import { EffectsManager } from './effectsManager';

export const onEnemyKilled = "onEnemyKilled";
export class Enemies {
    public group!: Phaser.Physics.Arcade.Group;
    private subscription: Phaser.Time.TimerEvent;
    private canUpdate = true;    
    constructor(private effectsManager: EffectsManager, private scene: Phaser.Scene) {
        this.subscription = this.scene.time.addEvent(
            {
                loop: true,
                delay: 300,
                callback: () => this.canUpdate = true
            });
    }

    create() {
        this.group = this.scene.physics.add.group();
    }

    addEnemy(x: number, y: number, health: number, texture: string, scale: number = 1, behaviour: Behaviour = (obj, cleanup) => [obj, cleanup]) {
        // replace with sprites
        const enemy = new Enemy(behaviour, this.scene, this.effectsManager, x, y, health, texture);
        this.group.add(enemy, true);
        enemy.setScale(scale, scale);
        enemy.setBounce(0.1, 0.1);
        enemy.setCollideWorldBounds(true);
        return enemy;
    }

    addBoss(x: number, y: number, startRotatePosition: number,
        angularSpeed: number, health: number) {
        const boss = new Boss(this.scene, this.effectsManager, x, y, angularSpeed, health);
        boss.rotation = startRotatePosition;
        this.group.add(boss, true);
        boss.body.setCircle(boss.height/2, boss.width/2 - boss.height/2, 0);
        boss.body.updateCenter();
        boss.setCollideWorldBounds(true);
        boss.showHealth();
        return boss;
    }

    update() {
        let updateDone = false;
        for(let enemy of this.group.getChildren()) {
            const convertedEnemy = <Enemy>enemy;
            if (convertedEnemy.isBoss()) {
                convertedEnemy.update();
                (<Boss>convertedEnemy).resizeHealth();
            }
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
        this.subscription.destroy();
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
    protected maxHealth: number;
    public isBoss() { return false; }
    constructor(private behaviour: Behaviour = (obj, cleanup) => [obj, cleanup],
        scene: Phaser.Scene, private effectsManager: EffectsManager, x: number, y: number,
        protected health: number,
        texture: string, frame?: string | integer) {
        super(scene, x, y, texture, frame);
        this.maxHealth = health;
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

    public resizeHealth() {
    }

    public hitByBullet(playerBullet: GameObjects.GameObject) {
        const bullet = playerBullet as Phaser.Physics.Arcade.Image;
        this.effectsManager.playSoundFireEnemy();
        this.effectsManager.playAnimationCraftExplosion(bullet.x, bullet.y);
        this.health--;
        this.resizeHealth();
        if(this.isFinished()) {
            this.scene.events.emit(onEnemyKilled, this.getScore());
            this.kill();
        }
    }

    protected kill() {
        this.destroy();
    }
}

export class Boss extends Enemy {
    private weapon45!: Weapon;
    private weapon135!: Weapon;
    private weapon225!: Weapon;
    private weapon315!: Weapon;
    private mainWeapon!: Weapon;
    private weapons: Weapon[] = [];
    constructor(scene: Phaser.Scene, effectsManager: EffectsManager, x: number, y: number, private angularSpeed: number, protected health: number, frame?: string | integer) {
        super(undefined, scene, effectsManager, x, y, health, 'boss', frame);
        const bulletConfig = {
            key: 'EnemyProjectile1',
            scale: 1,
            velocity: 600,
            bulletType: BulletType.RoundBullet,
            onFireEvent: OnFireEvent.OnBossFire
        };
        this.weapon45 = new Weapon(this, 50, scene, bulletConfig, 1*Math.PI/4, 0.5);
        this.weapon45.create();
        this.weapon135 = new Weapon(this, 50, scene, bulletConfig, 3*Math.PI/4, 0.5);
        this.weapon135.create();
        this.weapon225 = new Weapon(this, 50, scene, bulletConfig, 5*Math.PI/4, 0.5);
        this.weapon225.create();
        this.weapon315 = new Weapon(this, 75, scene, bulletConfig, 7*Math.PI/4, 0.5);
        this.weapon315.create();
        this.mainWeapon = new Weapon(this, 100, scene, { ...bulletConfig, key: 'bossLaser', bulletType: BulletType.RectangleBullet }, 0, 0.5);
        this.mainWeapon.create();
        this.mainWeapon.interceptable = false;
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
        });
    }

    public destroy(fromScene?: boolean) {
        super.destroy(fromScene);
    }

    public getScore() {
        return 2000;
    }

    protected kill() {
        this.resizeHealth();
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

    public getWeapons() {
        return [...this.weapons];
    }

    public isBoss() { return true; }

    private healthBar: Phaser.GameObjects.Image | undefined;

    public showHealth() {
        this.healthBar = this.scene.add.image(0, 0, "ground");
        this.healthBar.setBlendMode(Phaser.BlendModes.ADD);
        this.healthBar.setScale(1, 0.3);
        this.healthBar.rotation = Math.PI/2;
        this.resizeHealth();
    }

    public resizeHealth() {
        if (!this.healthBar)
            return;

        const centerX = this.body.center.x;
        const centerY = this.body.center.y;

        const ratio = this.getHealth() / this.getMaxHealth();
        this.healthBar.displayWidth = ratio * this.height;
        this.healthBar.x = centerX + this.width / 2;// - (this.healthBar.width * ratio - this.healthBar.displayWidth)/2;
        this.healthBar.y = centerY + this.height / 2 - this.healthBar.displayWidth / 2;
    }
}