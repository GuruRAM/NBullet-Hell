import { MainScene } from "../main-scene";
import { OnFireEvent } from "../configs";

export class EffectsManager {
    private animBulletExplosion = 'explosion1';
    private animCraftExplosion = 'explosion';

    private soundFirePlayer = 'playerFire';
    private soundFireEnemy = 'enemyFire';
    private soundHit = 'bulletCollision';
    private soundExplosion = 'explosion';
    private soundLose = 'lose';
    private soundWin = 'win';
    private soundBackground = 'background';
    
    constructor(private scene: MainScene) {
        this.playSoundFireBoss = this.playSoundFireBoss.bind(this);
        this.playSoundFireEnemy = this.playSoundFireEnemy.bind(this);
        this.playSoundFirePlayer = this.playSoundFirePlayer.bind(this);
    }

    register() {
        this.scene.events.addListener(OnFireEvent.OnBossFire, this.playSoundFireBoss);
        this.scene.events.addListener(OnFireEvent.OnEnemyFire, this.playSoundFireEnemy);
        this.scene.events.addListener(OnFireEvent.OnPlayerFire, this.playSoundFirePlayer);

        this.createAnimations();
    }

    createAnimations() {
        this.scene.anims.create({
            key: this.animCraftExplosion,
            frames: this.scene.anims.generateFrameNumbers(this.animCraftExplosion, { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1,
        });

        this.scene.anims.create({
            key: this.animBulletExplosion,
            frames: this.scene.anims.generateFrameNumbers(this.animBulletExplosion, { start: 0, end: 14 }),
            frameRate: 24,
            repeat: -1
        });
    }

    private playAnimation(explosionKey: string, x: number, y: number, scale: number = 1) {
        const explosion = this.scene.physics.add.sprite(x, y, explosionKey);
        explosion.setScale(scale);
        explosion.play(explosionKey);
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                explosion.destroy();
            }
        });
    }

    public playAnimationBulletsHit(x: number, y: number) {
        this.playAnimation(this.animBulletExplosion, x, y, 0.5);
    }

    public playAnimationCraftExplosion(x: number, y: number) {
        this.playAnimation(this.animCraftExplosion, x, y);
    }

    public playSoundFirePlayer() {
        this.scene.sound.play(this.soundFirePlayer, {
            volume: 0.02
        });
    }

    public playSoundBackground() {
        this.scene.sound.play(this.soundBackground, {
            loop: true,
            volume: 0.1
        });
    }

    public playSoundFireEnemy() {
        this.scene.sound.play(this.soundFireEnemy, {
            volume: 0.01
        });
    }

    public playSoundFireBoss() {
        this.scene.sound.play(this.soundFireEnemy, {
            volume: 0.015
        });
    }

    public playSoundBulletHit() {
        this.scene.sound.play(this.soundHit, {
            volume: 0.3
        });
    }

    public playSoundExplosion() {
        this.scene.sound.play(this.soundExplosion, {
            volume: 0.3
        });
    }

    public playSoundBossExplosion() {
        this.scene.sound.play(this.soundExplosion, {
            volume: 2
        });
    }

    public playSoundLose() {
        this.scene.sound.play(this.soundLose, {
            volume: 0.1
        });
    }

    public playSoundWin() {
        this.scene.sound.play(this.soundWin, {
            volume: 0.1
        });
    }

    public loadResources() {
        this.scene.load.spritesheet(this.animCraftExplosion, process.env.PUBLIC_URL + '/assets/explosion.png', { frameWidth: 48, frameHeight: 48 });
        this.scene.load.spritesheet(this.animBulletExplosion, process.env.PUBLIC_URL + '/assets/explosion1.png', { frameWidth: 72, frameHeight: 72 });

        this.scene.load.audio(this.soundFirePlayer, process.env.PUBLIC_URL + '/assets/fire.mp3');
        this.scene.load.audio(this.soundFireEnemy, process.env.PUBLIC_URL + '/assets/fire1.mp3');
        this.scene.load.audio(this.soundHit, process.env.PUBLIC_URL + '/assets/hit.mp3');
        this.scene.load.audio(this.soundExplosion, process.env.PUBLIC_URL + '/assets/explosion.mp3');
        this.scene.load.audio(this.soundLose, process.env.PUBLIC_URL + '/assets/lose.mp3');
        this.scene.load.audio(this.soundBackground, process.env.PUBLIC_URL + '/assets/background.mp3');
        this.scene.load.audio(this.soundWin, process.env.PUBLIC_URL + '/assets/win.mp3');        
    }

    public destroy() {
        this.scene.events.removeListener(OnFireEvent.OnBossFire, this.playSoundFireBoss, this, false);
        this.scene.events.removeListener(OnFireEvent.OnEnemyFire, this.playSoundFireEnemy, this, false);
        this.scene.events.removeListener(OnFireEvent.OnPlayerFire, this.playSoundFirePlayer, this, false);
    }
}