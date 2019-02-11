import Phaser, { GameObjects } from "phaser"
import { Weapon } from "./weapon";
import { Enemies, createRandomBehaviour, createTrackingBehaviour, createEnemyFiringBehaviour, createRoundMovementBehaviour, Enemy } from "./enemies";
import { Player } from "./player";
import { timer } from "rxjs";
import { PlayerManager } from './playerManager';

export class MainScene extends Phaser.Scene {
    protected playerManager: PlayerManager = new PlayerManager(this);
    protected cursor: Phaser.Input.Keyboard.CursorKeys = null!;
    protected player: Player = null!;
    protected enemies!: Enemies;
    protected scoreText!: Phaser.GameObjects.Text;
    protected waveText!: Phaser.GameObjects.Text;
    protected score = 0;
    protected wave = 0;
    protected maxWave = 5;
    protected gameOver: Phaser.GameObjects.Text | null = null;
    protected continue: Phaser.GameObjects.Text | null = null;
    protected enemyWaves!: Phaser.Time.TimerEvent;
    protected gameStarted = timer(2000).subscribe(() => {
        this.isStarted = true;
    });
    protected isStarted = false;
    preload() {
        this.load.image('background', process.env.PUBLIC_URL + '/assets/background.png');
        this.load.image('ground', process.env.PUBLIC_URL + '/assets/platform.png');
        this.load.image('enemy1', process.env.PUBLIC_URL + '/assets/enemy1.png');
        this.load.image('starfighter', process.env.PUBLIC_URL + '/assets/starfighter.png');
        this.load.image('MegaLaser', process.env.PUBLIC_URL + '/assets/MegaLaser.png');
        this.load.image('EnemyProjectile1', process.env.PUBLIC_URL + '/assets/EnemyProjectile1.png');

        this.load.spritesheet('explosion', process.env.PUBLIC_URL + '/assets/explosion.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('explosion1', process.env.PUBLIC_URL + '/assets/explosion1.png', { frameWidth: 72, frameHeight: 72 });

        this.load.audio('fire', process.env.PUBLIC_URL + '/assets/fire.mp3');
        this.load.audio('fire1', process.env.PUBLIC_URL + '/assets/fire1.mp3');
        this.load.audio('hit', process.env.PUBLIC_URL + '/assets/hit.mp3');
        this.load.audio('explosion', process.env.PUBLIC_URL + '/assets/explosion.mp3');
        this.load.audio('lose', process.env.PUBLIC_URL + '/assets/lose.mp3');
        this.load.audio('background', process.env.PUBLIC_URL + '/assets/background.mp3');
        this.load.audio('win', process.env.PUBLIC_URL + '/assets/win.mp3');
    }

    create() {
        this.onKeydown = this.onKeydown.bind(this);
        this.sound.play('background', {
            loop: true,
            volume: 0.1
        });

        this.events.on('resize', () => {
            this.cameras.resize(this.sys.canvas.width, this.sys.canvas.height);
            this.physics.world.setBounds(0, 0, this.sys.canvas.width, this.sys.canvas.height, true, true, true, true);
            // this.cameras.main.setBounds(0, 0, width, height);
            this.resizeGameOverText();
            this.resizeWaveText();
            this.playerManager.resize();
        }, this);

        document.addEventListener("keydown", this.onKeydown);
        this.events.on('destroy', () => {
            document.removeEventListener("keydown", this.onKeydown);
        });
        this.add.image(0, 0, 'background');

        this.player = this.playerManager.createPlayer(this.physics.world.bounds.centerX,
            this.physics.world.bounds.centerY, 10);
        this.createAnimations();

        const createTrackingRandomEnemy = (x: number, y: number) => {
            const enemy = this.enemies.addEnemy(x, y, 'enemy1', 0.2)
                .addBehaviour(createRandomBehaviour(200, 0.5))
                .addBehaviour(createTrackingBehaviour(this.player, 2, 0.05));

            enemy.addBehaviour(createEnemyFiringBehaviour(() => {
                const weapon = new Weapon(enemy, 2, this, {
                    scale: 2,
                    velocity: 500,
                    fireSound: {
                        key: 'fire1',
                        volume: 0.01
                    },
                    key: 'EnemyProjectile1'
                });
                weapon.create();
                const playerHit = (p: GameObjects.GameObject, b: GameObjects.GameObject) => {
                    if (this.onPlayerBulletHit(p, b))
                        this.explosionWithSound('explosion', 'explosion', 0.3, p, b);
                };
                const bulletHit = (o1: GameObjects.GameObject,o2: GameObjects.GameObject) => {
                    if (this.onBulletBulletHit(o1, o2))
                        this.explosionWithSound('explosion1', 'hit', 0.3, o1, o2);
                };
                this.physics.add.collider(weapon.group, this.player, playerHit);
                this.physics.add.overlap(weapon.group, this.player, playerHit);

                this.physics.add.collider(this.player.weapon.group, weapon.group, bulletHit);
                this.physics.add.overlap(this.player.weapon.group, weapon.group, bulletHit);

                return weapon;
            }));
        }

        /*
        const createRoundTrackingEnemy = (x: number, y: number) => {
            const enemy = this.enemies.addEnemy(x, y, 'enemy1', 0.2)
                .addBehaviour(createRoundMovementBehaviour(50, 20))
                .addBehaviour(createTrackingBehaviour(this.player, 2, 0.05));

            enemy.addBehaviour(createEnemyFiringBehaviour(enemy, 1, 'EnemyProjectile1', this, 3, (weapon) => {
            }));
        }*/

        this.enemies = new Enemies(this.player, this);
        this.enemies.create();
        const createEnemies = () => {
            if (this.maxWave < this.wave)
                this.enemyWaves.destroy();
            // spawn enemies:
            for (let i = 0; i < Phaser.Math.RND.between(5, 10); i++) {
                createTrackingRandomEnemy(
                    Phaser.Math.RND.between(0, this.physics.world.bounds.width),
                    Phaser.Math.RND.between(0, this.physics.world.bounds.height));
            }
            this.wave++;
            this.waveText.setText(`Wave: ${this.wave} / ${this.maxWave}`);
            this.resizeWaveText();
        };
        this.enemyWaves = this.time.addEvent({
            loop: true,
            delay: 10000,
            callback: createEnemies
        });
        this.waveText = this.add.text(0, 16, `Wave: ${this.wave} / ${this.maxWave}`, { fontSize: '32px', fill: '#FFFFFF' });
        this.resizeWaveText();
        createEnemies();
        //createRoundTrackingEnemy(500, 500);
        //createRoundTrackingEnemy(100, 300);

        const enemyHit = (o1: GameObjects.GameObject,o2: GameObjects.GameObject) => {
            if (this.onEnemyHit(o1, o2))
                this.explosionWithSound('explosion', 'explosion', 0.3, o1, o2);
        };

        this.physics.add.collider(this.enemies.group, this.player.weapon.group, enemyHit);
        this.physics.add.overlap(this.enemies.group, this.player.weapon.group, enemyHit);

        this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, { fontSize: '32px', fill: '#FFFFFF' });
    }

    onPlayerBulletHit(playerObject: GameObjects.GameObject, bulletObject: GameObjects.GameObject) {
        if (!bulletObject.active)
            return false;

        const player = <Player>(playerObject);
        player.hitWithBullet();
        this.playerManager.resize();
        if (player.isFinished())
        {
            this.gameOverSequence();
            this.sound.play('lose', { volume: 0.1 });
        }

        //TODO: remove bullet from the enemy bullets group
        //weapon.group.remove(projectileObject);
        bulletObject.destroy(true);
        return true;
    }

    onBulletBulletHit(playerBullet: GameObjects.GameObject, enemyBullet: GameObjects.GameObject) {
        //The object is already destroyed
        if (!playerBullet.active || !enemyBullet.active)
            return false;

        //TODO: remove bullet from the enemy bullets group
        //weapon.group.remove(projectileObject);
        const b1 = <Phaser.Physics.Arcade.Image>playerBullet;
        const b2 = <Phaser.Physics.Arcade.Image>enemyBullet;

        b1.destroy();
        b2.destroy();
        return true;
    }

    onEnemyHit(enemy: GameObjects.GameObject, playerBullet: GameObjects.GameObject) {
        //The object is already destroyed
        if (!enemy.active || !playerBullet.active)
            return false;

        this.enemies.group.remove(enemy);
        this.player.weapon.group.remove(playerBullet);

        enemy.destroy();
        playerBullet.destroy();
        this.score += (enemy as Enemy).scorePoints;
        return true;
    }

    explosionWithSound(explosionKey: string, soundKey: string, soundVolume: number, o1: GameObjects.GameObject, o2: GameObjects.GameObject) {
        const b1 = <Phaser.Physics.Arcade.Image>o1;
        const b2 = <Phaser.Physics.Arcade.Image>o2;
        const explosion = this.physics.add.sprite((b1.x + b2.x)/2, (b1.y + b1.y)/2, "explosion1");
        explosion.play(explosionKey);
        const timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                timer.destroy();
                explosion.destroy();
            }
        });
        this.sound.play(soundKey, { volume: soundVolume });
    }

    update() {
        this.playerManager.updatePlayerControl(this.isStarted);
        if (!this.isStarted)
            return;

        this.player.weapon.update();
        this.enemies.update();
        this.scoreText.setText(`Score: ${this.score}`);
        if (!this.enemies.isAlive() && this.wave >= this.maxWave) {

            this.sound.play('win', { volume: 0.1 });
            this.gameOverSequence('Victory');
        }
    }

    createAnimations() {
        this.anims.create({
            key: 'explosion',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'explosion1',
            frames: this.anims.generateFrameNumbers('explosion1', { start: 0, end: 14 }),
            frameRate: 24,
            repeat: -1,
        });

    }

    gameOverSequence(text: string = 'GAME OVER') {
        this.gameOver = this.add.text(0, 0, text, { fontSize: '72px', fill: '#FFFFFF' });
        this.continue = this.add.text(0, 0, `Press ENTER to continue!`, { fontSize: '32px', fill: '#FFFFFF' });
        this.resizeGameOverText();
        //TODO: Capture the ENTER event and exit the game
        this.scene.pause();
    }

    resizeGameOverText() {
        if (this.gameOver == null || this.continue == null)
            return;
        const centerX = this.physics.world.bounds.centerX
        const centerY = this.physics.world.bounds.centerY
        this.gameOver.x = centerX - this.gameOver.width/2;
        this.gameOver.y = centerY - this.gameOver.height;
        this.continue.x = centerX - this.continue.width/2;
        this.continue.y = this.gameOver.y + 2*this.gameOver.height;
    }

    resizeWaveText() {
        const x = this.physics.world.bounds.width;
        this.waveText.x = x - this.waveText.width - 16;
    }

    //NOTE: the input logic will be changed in Phaser 3.16.1
    onKeydown(kevt: KeyboardEvent) : any {
        if (kevt.code == 'Escape' || (this.gameOver && kevt.code == 'Enter'))
            this.game.events.emit('game-finished', this.score);
    }
}