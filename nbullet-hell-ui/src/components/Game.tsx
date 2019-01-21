import { Component } from "react";
import { Game as GameModel } from "../models/models";
import React from 'react'

interface IProps extends React.Props<any> {
  onGameFinished: (game: GameModel) => void;
}

export class Game extends Component<IProps> {
  state =  { startDate: new Date() }

  render() {
    return (
      <div>
        <p>The game is not implemented yet</p>
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