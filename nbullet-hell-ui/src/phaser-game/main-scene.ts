import { PlayerManager } from './managers/playerManager';
import { SceneScriptExecutor } from "./scripts/sceneScriptExecutor";
import { gameScript, simpleGameScript, simpleTextScript } from './scripts/gameScript';
import { EffectsManager } from './managers/effectsManager';

export class MainScene extends Phaser.Scene {
    private textPadding = 16;
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
        this.input.addPointer(3);
        this.effectsManager.register();
        this.onKeydown = this.onKeydown.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.effectsManager.playSoundBackground();
        this.add.image(0, 0, 'background');
        this.events.on('resize', () => {
            this.cameras.resize(this.sys.canvas.width, this.sys.canvas.height);
            this.physics.world.setBounds(0, 0, this.sys.canvas.width, this.sys.canvas.height, true, true, true, true);
            // this.cameras.main.setBounds(0, 0, width, height);
            this.resizeGameOverText();
            this.resizeWaveText();
            this.playerManager.resizePlayer();
            this.playerManager.drawControlElements();
        }, this);

        document.addEventListener("keydown", this.onKeydown);
        document.addEventListener("touchstart", this.onTouchStart);
        document.addEventListener("touchend", this.onTouchEnd);


        this.events.on('destroy', () => {
            document.removeEventListener("keydown", this.onKeydown);
            document.removeEventListener("touchstart", this.onTouchStart);
            document.removeEventListener("touchend", this.onTouchEnd);
        });

        const script = simpleTextScript;
        // this.input.manager.touch ? simpleGameScript : gameScript; 
        this.scriptExecutor = new SceneScriptExecutor(script, this.effectsManager,
            this.playerManager, this);
        
        this.waveText = this.add.text(0, this.textPadding, '', { fontSize: '32px', fill: '#FFFFFF' });
        this.scoreText = this.add.text(this.textPadding, this.textPadding, '', { fontSize: '32px', fill: '#FFFFFF' });

        this.scriptExecutor.startExecution();
    }

    update() {
        this.scriptExecutor.update();
        const scriptStatus = this.scriptExecutor.getScriptStatus();   
        if (scriptStatus.isFinished) {
            if (scriptStatus.isWin) {
                this.effectsManager.playSoundWin();
                this.scriptExecutor.showScore();
                this.gameOverSequence('VICTORY');                
            } else {
                this.effectsManager.playSoundLose();
                this.scriptExecutor.showScore();
                this.gameOverSequence('GAME OVER');
            }
        }
    }

    gameOverSequence(text: string = 'GAME OVER') {
        this.gameOver = this.add.text(0, 0, text, { fontSize: '72px', fill: '#FFFFFF' });
        let instructions = `PRESS ENTER${this.input.manager.touch ? ' / TAP' : ''}`;
        this.continue = this.add.text(0, 0, instructions, { fontSize: '26px', fill: '#FFFFFF' });
        this.resizeGameOverText();
        //TODO: Capture the ENTER event and exit the game
        this.scene.pause();
    }

    resizeGameOverText() {
        if (this.gameOver == null || this.continue == null)
            return;
        
        const width = this.physics.world.bounds.width;
        let desiredWidth = Math.min(this.gameOver.width, 0.95 * width);
        if (this.gameOver.displayWidth != desiredWidth) {
            const scale = desiredWidth / this.gameOver.width;
            this.gameOver.setScale(scale, scale);
        }
        
        desiredWidth = Math.min(this.continue.width, 0.95 * width);
        if (this.continue.displayWidth != desiredWidth) {
            const scale = desiredWidth / this.continue.width;
            this.continue.setScale(scale, scale);
        }

        const centerX = this.physics.world.bounds.centerX
        const centerY = this.physics.world.bounds.centerY
        this.gameOver.x = centerX - this.gameOver.displayWidth/2;
        this.gameOver.y = centerY - this.gameOver.displayHeight;
        this.continue.x = centerX - this.continue.displayWidth/2;
        this.continue.y = this.gameOver.y + 2 * this.gameOver.displayHeight;
    }

    resizeWaveText() {
        const x = this.physics.world.bounds.width;
        if (this.waveText.width + this.scoreText.width > x * 0.8) {
            this.waveText.x = this.textPadding;
            this.waveText.y = 4 * this.textPadding;
        } else {
            this.waveText.y = this.textPadding;
            this.waveText.x = x - this.waveText.width - this.textPadding;
        }
    }

    //NOTE: the input logic will be changed in Phaser 3.16.1
    onKeydown(kevt: KeyboardEvent) : any {
        if (kevt.code == 'Escape' || (this.gameOver && kevt.code == 'Enter'))
            this.game.events.emit('game-finished', this.scriptExecutor.score);
    }

    private finalTouchStarted = false;

    onTouchStart(tevt: TouchEvent) : any {
        if (this.gameOver)
            this.finalTouchStarted = true;
    }

    onTouchEnd(tevt: TouchEvent) : any {
        if (this.gameOver && this.finalTouchStarted)
            this.game.events.emit('game-finished', this.scriptExecutor.score);
    }
}