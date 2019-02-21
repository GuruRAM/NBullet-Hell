import { PlayerManager } from './managers/playerManager';
import { SceneScriptExecutor } from "./scripts/sceneScript";
import { gameScript } from './scripts/gameScript';
import { EffectsManager } from './managers/effectsManager';

export class MainScene extends Phaser.Scene {
    protected effectsManager = new EffectsManager(this);
    protected playerManager: PlayerManager = new PlayerManager(this);
    protected scriptExecutor!: SceneScriptExecutor;
    public scoreText!: Phaser.GameObjects.Text;
    public waveText!: Phaser.GameObjects.Text;
    protected gameOver: Phaser.GameObjects.Text | null = null;
    protected continue: Phaser.GameObjects.Text | null = null;
    preload() {
        this.effectsManager.loadResources();
        this.load.image('background', process.env.PUBLIC_URL + '/assets/background.png');
        this.load.image('ground', process.env.PUBLIC_URL + '/assets/platform.png');
        this.load.image('enemy1', process.env.PUBLIC_URL + '/assets/enemy1.png');
        this.load.image('starfighter', process.env.PUBLIC_URL + '/assets/starfighter.png');
        this.load.image('MegaLaser', process.env.PUBLIC_URL + '/assets/MegaLaser.png');
        this.load.image('EnemyProjectile1', process.env.PUBLIC_URL + '/assets/EnemyProjectile1.png');
        this.load.image('bossLaser', process.env.PUBLIC_URL + '/assets/EnemyProjectile2.png');
        this.load.image('boss', process.env.PUBLIC_URL + '/assets/boss.png');
    }

    create() {
        this.effectsManager.register();
        this.onKeydown = this.onKeydown.bind(this);
        this.effectsManager.playSoundBackground();
        this.add.image(0, 0, 'background');
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

        this.scriptExecutor = new SceneScriptExecutor(gameScript, this.effectsManager,
            this.playerManager, this);
        
        this.waveText = this.add.text(0, 16, '', { fontSize: '32px', fill: '#FFFFFF' });
        this.scoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#FFFFFF' });

        this.scriptExecutor.startExecution();
    }

    update() {
        this.scriptExecutor.update();
        
        if (this.scriptExecutor.isFinished()) {
            if (this.playerManager.player.isFinished()) {
                this.effectsManager.playSoundLose();
                this.gameOverSequence('GAME OVER');
            } else {
                this.effectsManager.playSoundWin();
                this.gameOverSequence('VICTORY');
            }
        }
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
            this.game.events.emit('game-finished', this.scriptExecutor.score);
    }
}