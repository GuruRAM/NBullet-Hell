import { PlayerManager } from '../../managers/playerManager';
import { InteractionManager } from '../../managers/interactionManager';
import { MainScene } from '../../main-scene';
import { GameObjects } from 'phaser';
import { BulletType, OnFireEvent } from '../../configs';
import { Enemies, Enemy } from '../../enemies';
import { Weapon } from '../../weapons/weapon';
import { createRandomBehaviour, createTrackingBehaviour, createEnemyFiringBehaviour } from '../../managers/enemyBehaviours';
import { EnemyConfig, EnemyType } from '../typesScript';
import { IStepExecutor } from '../sceneScriptExecutor';
export class EliminateStepExecutor implements IStepExecutor {
    private currentEnemies: GameObjects.GameObject[] = [];
    constructor(private scene: MainScene, private enemies: Enemies, private interactionManager: InteractionManager, private playerManager: PlayerManager) {
    }
    addEnemies(enemies: EnemyConfig[]) {
        return enemies.map(enemy => this.scene.time.addEvent({
            delay: enemy.delay,
            callback: () => this.currentEnemies.push(...this.createEnemies(enemy))
        }));
    }
    update() {
        this.currentEnemies.forEach(enemy => {
            enemy.update();
        });
        this.playerManager.updatePlayerControl();
    }
    isFinished() {
        const activeEnemies = this.currentEnemies.reduce((prev, cur) => prev || cur.active, false);
        return !activeEnemies;
    }
    finish() {
        throw new Error('Finish is not implemented on EliminateAllEnemiesStopExecutor');
    }
    finalize() {
        this.currentEnemies.forEach(e => {
            e.destroy(true);
        });
    }
    private getPosition(startPosition: [number, number] | undefined) {
        const width = this.scene.physics.world.bounds.width;
        const height = this.scene.physics.world.bounds.height;
        return (startPosition && [startPosition[0] * width, startPosition[1] * height]) ||
            [Phaser.Math.RND.between(0, width), Phaser.Math.RND.between(0, height)];
    }
    private createEnemies(config: EnemyConfig): Phaser.GameObjects.GameObject[] {
        let result: Phaser.GameObjects.GameObject[] = [];
        if (config.type == EnemyType.TackingEnemy) {
            for (let i = 0; i < (config.quantity || 1); i++) {
                const startPosition = this.getPosition(config.startPosition);
                const enemy = this.enemies.addEnemy(startPosition[0], startPosition[1], config.health || 1, 'enemy1', 0.2)
                    .addBehaviour(createRandomBehaviour(config.velocity || 200, config.angularVelocity || 0.5))
                    .addBehaviour(createTrackingBehaviour(this.playerManager.player, 2, 0.05));
                enemy.setImmovable(true);
                enemy.addBehaviour(createEnemyFiringBehaviour(() => {
                    const weapon = new Weapon(enemy, 1500 * (config.fireIntervalMidifier || 1), this.scene, {
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
                enemy.setEnemyActive(config.actionDelay, () => enemy.body && enemy.setImmovable(false));
                result.push(enemy);
            }
            return result;
        }
        else if (config.type == EnemyType.StationaryBoss) {
            for (let i = 0; i < (config.quantity || 1); i++) {
                const startPosition = this.getPosition(config.startPosition);
                const boss = this.enemies.addBoss(startPosition[0], startPosition[1], config.startRotatePosition || 0, config.angularVelocity || 0.012, config.health || 100, config.fireIntervalMidifier || 1);
                this.interactionManager.registerBoss(boss);
                boss.setImmovable(true);
                boss.setEnemyActive(config.actionDelay);
                result.push(boss);
            }
            return result;
        }
        throw new Error(`${config.type} is not supported yet`);
    }
}
