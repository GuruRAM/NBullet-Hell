import Phaser from "phaser"
import { Weapon } from "./weapon";
import { Enemies, createRandomBehaviour, createTrackingBehaviour, createEnemyFiringBehaviour, createRoundMovementBehaviour } from "./enemies";
import { Player } from "./player";
import { timer } from "rxjs";


export class MainScene extends Phaser.Scene {
    protected cursor: Phaser.Input.Keyboard.CursorKeys = null!;
    protected player: Player = null!;
    protected lasers: (Phaser.Physics.Arcade.Image | null)[] = [];
    protected weapon!: Weapon;
    protected enemies!: Enemies;
    protected scoreText!: Phaser.GameObjects.Text;
    protected score = 0;
    protected gameOver: Phaser.GameObjects.Text | null = null;
    protected continue: Phaser.GameObjects.Text | null = null;
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
    }
    create() {
        this.onKeydown = this.onKeydown.bind(this);
        this.events.on('resize', () => {
            this.cameras.resize(this.sys.canvas.width, this.sys.canvas.height);
            this.physics.world.setBounds(0, 0, this.sys.canvas.width, this.sys.canvas.height, true, true, true, true);
            // this.cameras.main.setBounds(0, 0, width, height);
            this.resizeGameOverText();
        }, this);

        document.addEventListener("keydown", this.onKeydown);
        this.events.on('destroy', () => {
            document.removeEventListener("keydown", this.onKeydown);
        });

        this.add.image(400, 300, 'background');
        this.player = new Player(this, 256, 256, 'starfighter');
        this.player.setHealth(3);
        this.player.setScale(0.2, 0.2);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setActive(true);
        this.player.setBounce(0.1, 0.1);
        this.player.setCollideWorldBounds(true);

        this.weapon = new Weapon(this.player, 10, 'MegaLaser', this, 0.5, 600);
        this.weapon.create();

        const createTrackingRandomEnemy = (x: number, y: number) => {
            const enemy = this.enemies.addEnemy(x, y, 'enemy1', 0.2)
                .addBehaviour(createRandomBehaviour(0, 0))
                .addBehaviour(createTrackingBehaviour(this.player, 2, 0.05));

            enemy.addBehaviour(createEnemyFiringBehaviour(enemy, 1, 'EnemyProjectile1', this, 2, (weapon) => {
                const onHit: ArcadePhysicsCallback = (projectile, player) => {
                    const playerObject = <Player>(this.player == player ? player : projectile);
                    const projectileObject = playerObject != projectile ? projectile : player;
                    playerObject.hitWithBullet();
                    if (playerObject.isFinished())
                    {
                        this.gameOver = this.add.text(0, 0, `GAME OVER`, { fontSize: '72px', fill: '#FFFFFF' });
                        this.continue = this.add.text(0, 0, `Press ENTER to continue!`, { fontSize: '32px', fill: '#FFFFFF' });
                        this.resizeGameOverText();
                        //TODO: Capture the ENTER event and exit the game
                        this.scene.pause();
                    }
                    weapon.group.remove(projectileObject);
                    projectileObject.destroy();
                }

                this.physics.add.collider(weapon.group, this.player, onHit);
                this.physics.add.overlap(weapon.group, this.player, onHit);

                //projectiles collisions:
                const bulletElimination: ArcadePhysicsCallback = (p1, p2) => {
                    p1.setActive(false);
                    p2.setActive(false);
                    this.weapon.group.remove(p1, true, true);
                    weapon.group.remove(p2, true, true);
                    p1.destroy();
                    p2.destroy();
                };
                this.physics.add.collider(this.weapon.group, weapon.group, bulletElimination);
                this.physics.add.overlap(this.weapon.group, weapon.group, bulletElimination);
            }));
        }

        const createRoundTrackingEnemy = (x: number, y: number) => {
            const enemy = this.enemies.addEnemy(x, y, 'enemy1', 0.2)
                .addBehaviour(createRoundMovementBehaviour(50, 20))
                .addBehaviour(createTrackingBehaviour(this.player, 2, 0.05));

            enemy.addBehaviour(createEnemyFiringBehaviour(enemy, 1, 'EnemyProjectile1', this, 3, (weapon) => {
            }));
        }

        this.enemies = new Enemies(this.player, this);
        this.enemies.create();
        createTrackingRandomEnemy(200, 200);
        createTrackingRandomEnemy(100, 100);
        createTrackingRandomEnemy(300, 100);
        //createRoundTrackingEnemy(500, 500);
        //createRoundTrackingEnemy(100, 300);

        this.enemies.setBulletCollider(this.weapon.group);
        this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, { fontSize: '32px', fill: '#FFFFFF' });
        this.enemies.onEnemyKill.subscribe(score => this.score += score);
    }

    update() {
        this.updatePlayerControl();
        if (!this.isStarted)
            return;
        this.weapon.update();
        this.enemies.update();
        this.scoreText.setText(`Score: ${this.score}`);
    }

    updatePlayerControl() {
        const cursor = this.input.keyboard.createCursorKeys();
        const space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
        if (keyA!.isDown)
        {
            this.player.setVelocityX(-250);
        }
        else if (keyD!.isDown)
        {
            this.player.setVelocityX(250);
        }
        else
        {
            this.player.setVelocityX(0);
        }
    
        if (keyW!.isDown)
        {
            this.player.setVelocityY(-250);
        }
        else if (keyS!.isDown)
        {
            this.player.setVelocityY(250);
        }
        else
        {
            this.player.setVelocityY(0);
        }

        if (cursor.left!.isDown)
        {
            this.player.setAngle(this.player.angle - 3);
        }
        else if (cursor.right!.isDown)
        {
            this.player.setAngle(this.player.angle + 3);
        }

        if (space.isDown) {
            this.weapon.fire();
        }
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

    //NOTE: the input logic will be changed in Phaser 3.16.1
    onKeydown(kevt: KeyboardEvent) : any {
        if (kevt.code == 'Escape' || (this.gameOver && kevt.code == 'Enter'))
            this.game.events.emit('game-finished', this.score);
    }
}