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
  phaserGame: Phaser.Game | null = null;

  componentDidMount() {
    //mounting the phaser canvas
      this.phaserGame = createGame(this.canvasRef.current!);
  }

  componentWillUnmount() {
    this.phaserGame!.destroy(true);
    //disposing the phaser canvas
  }
  render() {
    return (
      <div className="full-v">
        <div className="canvas-container full-v" ref={this.canvasRef}>
        </div>
        <p><input type='button' value='Finish Game' onClick={(e) => { this.props.onGameFinished(this.finishGame()); e.preventDefault(); }}></input></p>
      </div>
    );
  }

  finishGame() {
    const finishDate = new Date();
    return {
      score: finishDate.getSeconds(),
      startTime : this.state.startDate,
      endTime : finishDate
    }
  }
}