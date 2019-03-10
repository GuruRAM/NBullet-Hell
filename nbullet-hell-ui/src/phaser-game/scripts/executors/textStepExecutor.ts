import { IStepExecutor } from '../sceneScriptExecutor';
import { MainScene } from "../../main-scene";
import { getTextWidth } from '../../../utils';

export class TextStepExecutor implements IStepExecutor {
  private finished = false;
  private currentTween!: Phaser.Tweens.Tween;
  constructor(private scene: MainScene, private cancellable: boolean) {
  }

  private startMainText(text: string, lineDuration: number) {
    const worldWidth = this.scene.physics.world.bounds.width;
    const worldHeight = this.scene.physics.world.bounds.height;
    const width = getTextWidth(worldWidth);
    const mainText = this.scene.add.text((worldWidth - width) / 2, worldHeight, text,
    {
      fontSize: '32px', fill: '#FFFFFF', align: 'center',
      wordWrap: { width: width, useAdvancedWrap: false }
    });
    const lineSpacing = 10;
    mainText.setLineSpacing(lineSpacing);
    console.log(mainText.getTextMetrics())
    this.currentTween = this.scene.add.tween({
      targets: [mainText],
      ease: 'Sine.easeInOut',
      duration: lineDuration * mainText.height / (30 + lineSpacing),
      delay: 0,
      y: {
        getEnd: () => -mainText.height
      },
      onComplete: () => {
        //handle completion
        mainText.destroy();
        this.finished = true;
      }
    });
  }

  public runText(preamble: string, preambleDuration: number, text: string, lineDuration: number) {
    const worldWidth = this.scene.physics.world.bounds.width;
    const worldHeight = this.scene.physics.world.bounds.height;
    const width = getTextWidth(worldWidth);
    if (preamble) {
      const preambleText = this.scene.add.text((worldWidth - width) / 2, worldHeight / 4, preamble,
      {
        fontSize: '32px', fill: '#FFFFFF', align: 'center',
        wordWrap: { width: width, useAdvancedWrap: false }
      });
      preambleText.x = (worldWidth - preambleText.displayWidth) / 2;
      this.currentTween = this.scene.add.tween({
        targets: [preambleText],
        ease: 'Sine.easeInOut',
        duration: preambleDuration,
        delay: 0,
        alpha: {
          getStart: () => 1,
          getEnd: () => 0
        },
        onComplete: () => {
          //handle completion
          preambleText.destroy();
          if (!this.finished)
            this.startMainText(text, lineDuration);
        }
      });
    } else {
      this.startMainText(text, lineDuration);
    }
  }
  
  update() {
    if (!this.cancellable)
      return;

    if (this.scene.input.manager.touch)
    {
        const pointers = this.scene.input.manager.pointers.filter(p => p && p.wasTouch && p.isDown);
        if (pointers.length > 0) {
          this.finish();
          return;
        }
    }

    const enter = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const space = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    if (enter.isDown || space.isDown) {
      this.finish();
    }
  }

  finish() {
    if (this.currentTween && !this.finished) {
      this.finished = true;
      this.currentTween.complete();
    }
  }

  finalize() {
  }

  isFinished() {
    return this.finished;
  }
}