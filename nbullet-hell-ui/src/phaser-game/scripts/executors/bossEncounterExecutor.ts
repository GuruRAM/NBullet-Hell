import { PlayerManager } from '../../managers/playerManager';
import { InteractionManager } from '../../managers/interactionManager';
import { MainScene } from '../../main-scene';
import { Enemies, Boss } from '../../enemies';
import { IStepExecutor } from '../sceneScriptExecutor';
import { getTextWidth } from '../../../utils';
export class BossEncounterExecutor implements IStepExecutor {
    private finished = false;
    private boss!: Boss;
    constructor(private scene: MainScene, private enemies: Enemies, private interactionManager: InteractionManager, private playerManager: PlayerManager) {
    }
    update() {
        this.boss.update();
        this.playerManager.updatePlayerControl(false);
    }
    isFinished() {
        return this.finished;
    }
    finalize() {
    }
    finish() {
        throw new Error('Finish is not implemented on EliminateAllEnemiesStopExecutor');
    }
    runStage() {
        this.playerManager.setInvicibility();
        this.playerManager.resizePlayer();
        const bounds = this.scene.physics.world.bounds;
        this.boss = this.enemies.addBoss(bounds.centerX, bounds.centerY, 0, 0.012, 100, 1, false);
        this.interactionManager.registerBoss(this.boss);
        const { width: worldWidth } = bounds;
        const width = getTextWidth(worldWidth);
        const instructionsText = this.scene.add.text(0, 0, 'The mothership\'s shields are down! Your weapon system is down. Ram the ship, save The Human Race!', {
            fontSize: '24px', fill: '#FFFFFF', align: 'center',
            wordWrap: { width: width, useAdvancedWrap: false }
        });
        instructionsText.setPosition((worldWidth - instructionsText.width) / 2, 1.5 * this.scene.scoreText.height);
        this.interactionManager.registerRamCollision(this.playerManager.player, this.boss, () => {
            instructionsText.destroy();
            const { width: worldWidth } = this.scene.physics.world.bounds;
            const bossDieText = this.scene.add.text(0, 0, 'Nooooooooooo! (×_×)', {
                fontSize: '24px', fill: '#FFFFFF'
            });
            const textWidth = bossDieText.width;
            bossDieText.setPosition((worldWidth - textWidth) / 2, this.boss.y - this.boss.displayHeight / 2 - 2 * bossDieText.height);
            this.scene.time.addEvent({
                delay: 5000,
                callback: () => {
                    bossDieText.destroy();
                    this.finished = true;
                    this.boss.destroy();
                }
            });
        });
        this.boss.setImmovable(true);
        this.boss.setEnemyActive(0);
    }
}