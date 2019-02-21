import { InteractionManager } from '../managers/interactionManager';
import { MainScene } from '../main-scene';
import { GameObjects } from 'phaser';
import { PlayerManager } from '../managers/playerManager';
import { BulletType, OnFireEvent } from '../configs';
import { Enemies, onEnemyKilled } from '../enemies';
import { Weapon } from '../weapons/weapon';
import { createRandomBehaviour, createTrackingBehaviour, createEnemyFiringBehaviour } from '../managers/enemyBehaviours';
import { EffectsManager } from '../managers/effectsManager';
import { ScriptStep, SceneScript, EnemyConfig, EnemyType } from './typesScript';

const defaultHealth = 10;
const defaultPosition = [0.5, 0.5];
export class SceneScriptExecutor {
    public score: number = 0;
    private enemies: Enemies;
    private currentStep: ScriptStep | undefined;
    private currentStepTimes: Phaser.Time.TimerEvent[] = []
    private currentEnemies: GameObjects.GameObject[] = [];
    private interactionManager: InteractionManager;
    constructor(private script: SceneScript, private effectsManager: EffectsManager, 
        private playerManager: PlayerManager, private scene: MainScene) {
            this.enemies = new Enemies(effectsManager, scene);
            this.interactionManager = new InteractionManager(scene, this.effectsManager,
                this.playerManager, this.enemies);
        }

    public startExecution() {
        if (this.currentStep)
            throw new Error('The execution has been started already!');
        if (this.script.steps.length < 1)
            return;

        this.initialize();
        this.executeStep();
    }

    private initialize() {
        const pp = this.script.playerPosition || defaultPosition;
        const ph = this.script.playerHealth || defaultHealth;
        const bounds = this.scene.physics.world.bounds;
        this.playerManager.createPlayer(pp[0] * bounds.width, pp[1] * bounds.height, ph);
        this.currentStep = this.script.steps[0];
        this.enemies = new Enemies(this.effectsManager, this.scene);
        this.enemies.create();

        this.scene.scoreText.setText(`Score: ${this.score}`);
        this.scene.events.addListener(onEnemyKilled, (score: number) => {
            this.score += score;
            this.scene.scoreText.setText(`Score: ${this.score}`);
        });
    }

    private executeStep() {
        this.currentStepTimes = [
        this.scene.time.addEvent({
            delay: this.currentStep!.delay,
            callback: () => {
                this.currentStepTimes = this.currentStep!.enemies.map(enemy =>
                    this.scene.time.addEvent({
                        delay: enemy.delay,
                        callback: () => this.currentEnemies.push(this.createEnemy(enemy))
                    }));
            }
        })];

        //TODO: move to a separate component
        this.scene.waveText.setText(this.currentStep!.stepText);
        this.scene.resizeWaveText();
    }

    private createEnemy(config: EnemyConfig): Phaser.GameObjects.GameObject {
        const width = this.scene.physics.world.bounds.width;
        const height = this.scene.physics.world.bounds.height
        const startPosition = (config.startPosition && [config.startPosition[0]*width, config.startPosition[1]*height]) ||
            [Phaser.Math.RND.between(0, width), Phaser.Math.RND.between(0, height)];
        if (config.type == EnemyType.TackingEnemy) {
            const enemy = this.enemies.addEnemy(startPosition[0], startPosition[1], config.health || 1, 'enemy1', 0.2)
                .addBehaviour(createRandomBehaviour(config.velocity || 200, config.angularVelocity || 0.5))
                .addBehaviour(createTrackingBehaviour(this.playerManager.player, 2, 0.05));

            enemy.addBehaviour(createEnemyFiringBehaviour(() => {
                const weapon = new Weapon(enemy, config.fireInterval || 1500, this.scene, {
                    scale: 2,
                    velocity: 500,
                    onFireEvent: OnFireEvent.OnEnemyFire,
                    key: 'EnemyProjectile1',
                    bulletType: BulletType.RoundBullet
                });
                weapon.create();
                this.interactionManager.registerEnemy(enemy, weapon);
                return weapon;
            }));
            return enemy;
        } else if (config.type == EnemyType.StationaryBoss) {
            const boss = this.enemies.addBoss(startPosition[0], startPosition[1],
                config.startRotatePosition || 0, config.angularVelocity || 0.012, config.health || 100);
            this.interactionManager.registerBoss(boss);
            return boss;
        }
            throw new Error(`${config.type} is not supported yet`);
    }

    update() {
        this.updateGameObjects();
        this.updateScriptStatus();
    }

    private updateGameObjects() {
        this.currentEnemies.forEach(enemy => {
            enemy.update();
        });
        this.playerManager.updatePlayerControl();
    }

    private updateScriptStatus() {
        if (this.isFinished())
            return;
        if (this.currentStepTimes.length == 0)
            this.nextStep();
        
        const eventsFinished = this.currentStepTimes.reduce((prev, current) =>
            prev && current.hasDispatched, true);
        if (!eventsFinished)
            return;

        const activeEnemies = this.currentEnemies.reduce((prev, cur) => prev || cur.active, false);
        if (activeEnemies)
            return;
        this.nextStep();        
    }

    private nextStep() {
        const nextIndex = this.script.steps.indexOf(this.currentStep!) + 1;
        if (nextIndex >= this.script.steps.length) {
            this.currentStep = undefined;
        } else {
            this.currentStep = this.script.steps[nextIndex];
            this.currentStepTimes = [];
            this.currentEnemies = [];
            this.executeStep();
        }
    }

    public isFinished() {
        return !this.currentStep || this.playerManager.player.isFinished();
    }
}