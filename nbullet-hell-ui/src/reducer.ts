import { connectRouter } from 'connected-react-router'
import { combineReducers } from 'redux'
import { Player, Game } from './models/models';
import { History } from 'history';

export default (history: History<any>) => {
    return combineReducers({
        router: connectRouter(history),
        common
    });
};

export const APP_LOAD = 'APP_LOAD';
export const USER_LOGIN = "USER_LOGIN";
export const GAME_FINISHED = "GAME_FINISHED";
export type AppLoadAction = {
    type: "APP_LOAD";
}

export type UserLoginAction = {
    type: "USER_LOGIN",
    player: Player,
}

export type GameFinishedAction = {
    type: "GAME_FINISHED",
    game: Game,
}

export type CommonState = {
    appName: string,
    appLoaded: boolean,
    player: Player | null
}

export type GlobalState = {
    common: CommonState,
    router: any
}

export type RootActions = AppLoadAction | UserLoginAction | GameFinishedAction;

const defaultState : CommonState = {
  appName: 'NBullerHell',
  appLoaded: false,
  player: null
};

const common = (state = defaultState, action: RootActions) => {
    switch (action.type) {
        case APP_LOAD:
            return {
                ...state,
                appLoaded: true
            };
        case USER_LOGIN:
            const userLoginAction = action as UserLoginAction;
            return {
                ...state,
                player: userLoginAction.player
            };
        case GAME_FINISHED:
            const gameFinishedAction = action as GameFinishedAction;
            return {
                ...state,
                player: {
                    ...state.player!,
                    history: [...state.player!.history, gameFinishedAction.game]
                }
            };
        default:
            return state;
    }
};