import { Component } from "react";
import { Player } from "../models/models";
import { Link } from 'react-router-dom';
import React from 'react'

interface IProps {
  player: Player
}
export class ScoreBoard extends Component<IProps> {
    render() {
      return (
        <div>
          <p><Link className="btn btn-lg btn-success" to={'/game'}>Start</Link></p>
          <p>The score board for {this.props.player.name}</p>
          <div>
            {this.props.player.history.map((x, i) =>
            <p key={i}>{i+1} {this.props.player.name} --- {x.score} --- {x.endTime.toString()}</p>
            )}
          </div>
        </div>
      );
    }
}