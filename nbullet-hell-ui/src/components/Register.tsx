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
        <div className="first">
            <form>
                <div className="nes-field">
                    <label htmlFor="name_field">Please enter your name:</label>
                    <input type="text" id="name_field" className="nes-input" style={{ marginRight: "12px", maxWidth: "400px", display: "inline-block" }} value={this.state.playerName} onChange={(e) => this.updatePlayerNameValue(e)}></input>
                    <button style={{display: "inline-block"}}className="nes-btn" onClick={(e) => { this.register(); e.preventDefault();}}>GO</button>
                    {this.state.validationError && <p>{this.state.validationError}</p>}
                </div>
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