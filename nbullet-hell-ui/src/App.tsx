import React, { Component } from 'react';
import './App.css';
import { ScoreBoard } from './components/ScoreBoard';
import { Register } from './components/Register';
import { Game } from './components/Game';
import { Switch, Route, Redirect } from 'react-router';
import { UserLoginAction, USER_LOGIN, GameFinishedAction, GAME_FINISHED, GlobalState } from './reducer';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { configService } from './services/config-service';
import { Player, Game as GameModel } from './models/models';
import { history } from './store';

const mapStateToProps = (state: GlobalState) => {
  return { player: state.common.player };
};

/*
const mapDispatchToProps = (dispatch: Dispatch<UserLoginAction>) => {
  onPlayerCreated: ()countersActions.increment,
};
*/
interface IProps {
  dispatch: Dispatch<UserLoginAction|GameFinishedAction>,
  player: Player | null
}

class App extends Component<IProps> {
  render() {
    return (
      <div className="App">
        <Switch>
          <Route path="/register" render={(props) => <Register onPlayerCreated={(name) => this.onPlayerCreated(name)} {...props} /> } />
          { this.props.player == null && <Redirect to='/register'/> }
          <Route path="/game" render={(props) => <Game onGameFinished={(game) => this.onGameFinished(game)} {...props}/> } />
          <Route strict path="/" render={(props) => <ScoreBoard player={this.props.player!} {...props}/> } />
        </Switch>
      </div>
    );
  }

  onPlayerCreated(name: string) {
    fetch(`${configService.getUri()}\\Player\\${name}`,{
      method: "GET",
      mode: "cors", //workaround for the development environment
    })
    .then((response: Response) => response.json())
    .then((player: Player) => { 
      this.props.dispatch({type: USER_LOGIN, player: player});
      history.push('/');
    })
    .catch(error => {
      //couldn't login, redirect to registration
      //redirect to registration again
      console.log(error);
      history.push('/register');
    });
  }

  onGameFinished(game: GameModel) {
    fetch(`${configService.getUri()}\\Game\\${this.props.player!.name}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "PUT",
      mode: "cors", //workaround for the development environment
      body: JSON.stringify(game)
    })
    .then((response: Response) => {
        this.props.dispatch({type: GAME_FINISHED, game: game});
    })
    .catch(error => {
      //couldn't save the game, go to the score board
      console.log(error);
    })
    .then(() => history.push('/'));
  }
}

export default connect(mapStateToProps)(App);
