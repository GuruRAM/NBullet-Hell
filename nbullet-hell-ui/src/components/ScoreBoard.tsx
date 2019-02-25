import { Component } from "react";
import { Player } from "../models/models";
import { Link } from 'react-router-dom';
import { history } from '../store';
import React from 'react'

interface IProps {
  player: Player
}
export class ScoreBoard extends Component<IProps> {
  //TODO: order by score
  max = 10;
  render() {
    return (
      <div>
        <p className="first"><Link className="nes-btn is-primary" to={'/game'}>Start</Link></p>
        <h2 className="title" style={{ paddingTop: "20px" }}>Scoreboard</h2>
        <table className="nes-table is-bordered" style={{ display: "inline-block" }}>
          <tbody>
            {this.props.player.history.map((x, i) =>
              this.props.player.history.length - this.max <= i ?
                <tr key={i}>
                  <td>{i - Math.max((this.props.player.history.length - this.max), 0) + 1}</td>
                  <td>{this.props.player.name}</td>
                  <td>{x.score}</td>
                  <td>{x.endTime.toDateString()}</td>
                </tr> : null)
            }
          </tbody>
        </table>
      </div>
    );
  }

  componentDidMount() {
      document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
      document.removeEventListener("keydown", this.handleKeyDown);
  }

  //NOTE: not binded to the component, this can't be used
  handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Enter' || event.code === 'Space') {
      history.push('/game');
    }
  }
}