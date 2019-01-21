import Phaser from "phaser"
import { MainScene } from "./main-scene"

export const createGame = (parent: HTMLElement) => new Phaser.Game({
    parent: parent,
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MainScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
});