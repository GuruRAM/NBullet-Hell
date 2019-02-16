import React, { Component } from 'react';
import './App.css';
import { ScoreBoard } from './components/ScoreBoard';
import { Register } from './components/Register';
import { Game } from './components/Game';
import { Switch, Route, Redirect } from 'react-router';
import {
    UserLoginAction,
    USER_LOGIN,
    GameFinishedAction,
    GAME_FINISHED,
    GlobalState,
    AppLoadAction,
    APP_LOAD
} from './reducer';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Player, Game as GameModel } from './models/models';
import { history } from './store';
import { apiService } from './services/api-service';

const mapStateToProps = (state: GlobalState) => {
  return {
    player: state.common.player,
    appLoaded: state.common.appLoaded,
  };
};

interface IProps {
  dispatch: Dispatch<UserLoginAction|GameFinishedAction|AppLoadAction>,
  player: Player | null,
  appLoaded: boolean
}

class App extends Component<IProps> {
  componentWillMount() {
    this.onLoad();
  }

  render() {
    if (this.props.appLoaded) {
      return (
        <div className="App full-v">
          <Switch>
            <Route path="/register" render={(props) => <Register onPlayerCreated={(name) => this.onPlayerCreated(name)} {...props} /> } />
            { this.props.player == null && <Redirect to='/register'/> }
            <Route path="/game" render={(props) => <Game onGameFinished={(game) => this.onGameFinished(game)} {...props}/> } />
            <Route strict path="/" render={(props) => <ScoreBoard player={this.props.player!} {...props}/> } />
          </Switch>
        </div>
      );
    }
    return (
      <div>
          <header>Loading...</header>
      </div>
    );
  }

  onLoad() {
    this.props.dispatch({type: APP_LOAD});
  }

  onPlayerCreated(name: string) {
    apiService.getPlayer(name)
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
    apiService.saveGame(this.props.player!.name, game)
    .then(() => {
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