import { PlayerManager } from './../managers/playerManager';
import { InteractionManager } from '../managers/interactionManager';
import { MainScene } from '../main-scene';
import { Enemies, onEnemyKilled, Enemy } from '../enemies';
import { EffectsManager } from '../managers/effectsManager';
import { ScriptStep, SceneScript, ScriptStepType, TextSceneStep, EliminationStep, FadeStep } from './typesScript';
import { sceneChangeEffect } from '../../utils';
import { TextStepExecutor } from './executors/textStepExecutor';
import { EliminateStepExecutor } from './executors/eliminateStepExecutor';
import { BossEncounterExecutor } from './executors/bossEncounterExecutor';

const defaultHealth = 10;
const defaultPosition = [0.5, 0.5];
export class SceneScriptExecutor {
    public score: number = 0;
    private gameOverTriggered = false;
    private currentStep: ScriptStep | undefined;
    private currentStepTimes: Phaser.Time.TimerEvent[] = []
    private interactionManager: InteractionManager;
    private enemies: Enemies;

    private currentStepExecutor?: IStepExecutor;
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
        this.playerManager.drawControlElements();
        this.playerManager.createPlayer(pp[0] * bounds.width, pp[1] * bounds.height, ph);
        this.currentStep = this.script.steps[0];
        this.enemies = new Enemies(this.effectsManager, this.scene);
        this.enemies.create();
        this.playerManager.disablePlayer();
        this.scene.events.addListener(onEnemyKilled, (score: number) => {
            this.score += score;
            this.showScore();
        });
    }

    public showScore() {
        this.scene.scoreText.setText(`Score: ${this.score}`);
    }

    private executeStep() {
        if (this.gameOverTriggered) {
            this.playerManager.disablePlayer();
            this.enemies.group.getChildren().forEach(e => {
                const enemy = e as Enemy;
                if (enemy.body && enemy.active) {
                    enemy.setVelocity(0);
                    enemy.setAngularVelocity(0);
                }
            });
        }
        this.playerManager.stopPlayer();
        const currentStep = this.currentStep!;
        this.currentStepTimes = [
            this.scene.time.addEvent({
                delay: currentStep.delay,
                callback: () => {
                    if (currentStep.type == ScriptStepType.TextSceneStep) {
                        const step = <TextSceneStep>currentStep;
                        const executor = new TextStepExecutor(this.scene, step.cancellable);
                        executor.runText(step.preamble, step.preambleDuration, step.text, step.lineDuration);
                        this.currentStepExecutor = executor;
                    } else if (currentStep.type == ScriptStepType.EliminationStep) {
                        const step = <EliminationStep>currentStep;
                        const executor = new EliminateStepExecutor(this.scene, this.enemies,
                            this.interactionManager, this.playerManager);
                        this.currentStepTimes.push(...executor.addEnemies(step.enemies));
                        this.currentStepExecutor = executor;
                    } else if (currentStep.type == ScriptStepType.FadeStep) {
                        const step = <FadeStep>currentStep;
                        this.scene.waveText.setText(currentStep.stepText);
                        this.currentStepExecutor = undefined;
                        if (step.show) {
                            sceneChangeEffect(this.scene, step.duration / 2, () => {
                                this.playerManager.enablePlayer();
                            });
                        } else {
                            sceneChangeEffect(this.scene, step.duration / 2, () => {
                                this.scene.scoreText.setText('');
                                this.playerManager.disablePlayer();
                            });
                        }
                        this.currentStepTimes.push(this.scene.time.addEvent({
                            delay: step.duration,
                            //The stage will be finished automatically when the timer elapses
                            callback: () => {}
                        }));
                    } else if (currentStep.type == ScriptStepType.LastBossStep) {
                        const executor = new BossEncounterExecutor(this.scene, this.enemies,
                            this.interactionManager, this.playerManager);
                        executor.runStage();
                        this.currentStepExecutor = executor;
                    }
                }
            })];

        //TODO: move to a separate component
        this.scene.waveText.setText(currentStep.stepText);
        this.scene.resizeWaveText();
    }

    update() {
        if (this.currentStepExecutor) 
            this.currentStepExecutor.update();
        else this.playerManager.updatePlayerControl(true);
        //this.playerManager.updatePlayerControl();
        this.updateScriptStatus();
    }

    private updateScriptStatus() {
        const status = this.getScriptStatus();
        if (status.isFinished)
            return;

        if (!status.isWin && this.script.gameOverStep && !this.gameOverTriggered) {
            this.gameOverTriggered = true;
            this.nextStep();
            return
        }
        if (this.currentStepTimes.length == 0)
            this.nextStep();
        
        const eventsFinished = this.currentStepTimes.reduce((prev, current) =>
            prev && current.hasDispatched, true);
        if (!eventsFinished)
            return;

        if (!this.currentStepExecutor) {
            this.nextStep();
            return;
        }

        if (this.currentStepExecutor!.isFinished()) {
            if (this.gameOverTriggered)
                this.currentStep = undefined;
            else
                this.nextStep();
        }
    }

    private nextStep() {
        if (this.gameOverTriggered) {
            this.currentStepTimes.forEach(t => t.destroy());
            this.currentStepTimes = [];
            this.currentStepExecutor = undefined;
            this.currentStep = this.script.gameOverStep;
            this.executeStep();
            return;
        }

        const nextIndex = this.script.steps.indexOf(this.currentStep!) + 1;
        if (nextIndex >= this.script.steps.length) {
            this.currentStep = undefined;
        } else {
            this.currentStep = this.script.steps[nextIndex];
            this.currentStepTimes = [];
            this.currentStepExecutor && this.currentStepExecutor.finalize();
            this.currentStepExecutor = undefined;
            this.executeStep();
        }
    }

    public getScriptStatus() {
        return {
            isFinished: !this.currentStep,
            isWin: !this.playerManager.player.isFinished()
        }
    }
}

export interface IStepExecutor {
    update(): void;
    isFinished(): boolean;
    finish(): void;
    finalize(): void;
}