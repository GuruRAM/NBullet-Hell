import { Component, ChangeEvent } from "react";
import React from 'react'
import { apiService } from "../services/api-service";

interface IProps {
    onPlayerCreated: (name: string) => void;
}

interface IState {
    validationError: string,
    playerName: string
}

export class Register extends Component<IProps, IState> {
    validationRegex = new RegExp('^[a-zA-Z0-9]+$');
    state = {
        validationError: '',
        playerName: ''
    }

    render() {
      return (
        <div>
            <form>
                <p>Please enter your name:</p>
                <input name="player-name" type="text" value={this.state.playerName} onChange={(e) => this.updatePlayerNameValue(e)}></input>
                <input name="register" type="button" value="GO" onClick={(e) => { this.register(); e.preventDefault();}}></input>
                {this.state.validationError && <p>{this.state.validationError}</p>}
            </form>
        </div>
      );
    }

    updatePlayerNameValue(evt: ChangeEvent<HTMLInputElement>) {
        this.setState({
            playerName: evt.target.value
        });
    }

    isValid() : boolean {
         return this.validationRegex.test(this.state.playerName);
    }

    register() {
        if (this.isValid()) {
            this.setState({ validationError: '' });

            apiService.registerPlayer(this.state.playerName)
            .then(response => {
                this.props.onPlayerCreated(this.state.playerName);
            })
            .catch(error => {
                this.setState({ validationError: error.toString() });
            });
        } else this.setState({ validationError: 'The name is not valid only letters and number are allowed!' });
    }
}