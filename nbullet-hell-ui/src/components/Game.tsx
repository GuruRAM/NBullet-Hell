import { Component } from "react";
import { Game as GameModel } from "../models/models";
import Phaser from "phaser"
import React from 'react'
import { createGame } from "../phaser-game/main-game";
import './Game.css';

interface IProps extends React.Props<any> {
  onGameFinished: (game: GameModel) => void;
}

export class Game extends Component<IProps> {
  state =  { startDate: new Date() };
  canvasRef = React.createRef<HTMLDivElement>();
  phaserGame!: Phaser.Game;
  constructor(props: Readonly<IProps>) {
    super(props);
    this.updateGameSize = this.updateGameSize.bind(this);
    this.finishGame = this.finishGame.bind(this);
  }
  componentDidMount() {
      //mounting the phaser canvas
      this.phaserGame = createGame(this.canvasRef.current!);
      window.addEventListener('resize', this.updateGameSize);
      window.addEventListener('orientationchange', this.updateGameSize);
      this.phaserGame.events.addListener('game-finished', this.finishGame);
  }

  componentWillUnmount() {
    this.phaserGame.events.removeAllListeners('game-finished');
    this.phaserGame!.destroy(true);
    window.removeEventListener('resize', this.updateGameSize);
    window.removeEventListener('orientationchange', this.updateGameSize);
  }

  updateGameSize() {
    this.phaserGame.resize(this.canvasRef.current!.clientWidth, this.canvasRef.current!.clientHeight);
  }
  render() {
    return (
      <div className="full-v">
        <div className="canvas-container full-v" ref={this.canvasRef}>
        </div>
      </div>
    );
  }

  finishGame(score: number) {
    const finishDate = new Date();
    const result = {
      score: score,
      startTime : this.state.startDate,
      endTime : finishDate
    }

    this.props.onGameFinished(result);
  }
}