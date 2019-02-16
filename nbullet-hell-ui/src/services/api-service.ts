import { configService } from "./config-service";
import { Game, Player } from "../models/models";

export interface IApiService {
    registerPlayer(player: string): Promise<void>;
    saveGame(player: string, game: Game): Promise<void>;
    getPlayer(player: string): Promise<Player>;
}

export class ApiService implements IApiService {
    registerPlayer(player: string): Promise<void> {
        return fetch(`${configService.getUri()}\\Player\\${player}`, {
            method: "PUT",
            mode: "cors", //workaround for the development environment
        }).then(r => {});
    }
    saveGame(player: string, game: Game): Promise<void> {
        return fetch(`${configService.getUri()}\\Game\\${player}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "PUT",
            mode: "cors", //workaround for the development environment
            body: JSON.stringify(game)
        }).then(r => {});
    }
    getPlayer(player: string): Promise<Player> {
        return fetch(`${configService.getUri()}\\Player\\${player}`, {
            method: "GET",
            mode: "cors", //workaround for the development environment
        }).then((response: Response) => response.json());
    }
}

export class LocalApiService implements IApiService {
    prefix = 'bh_user_';
    private getUser(name: string) {
        const player = localStorage.getItem(this.prefix + name);
        if (player) {
            const playerObject = JSON.parse(player) as Player;
            //workaround to work with dates without libraries
            playerObject.registrationTime = new Date(playerObject.registrationTime as any);
            playerObject.history.forEach(item => {
                item.startTime = new Date(item.startTime as any);
                item.endTime = new Date(item.endTime as any);
            });
            return playerObject;
        }
        return null;
    }

    private saveUser(player: Player) {
        localStorage.setItem(this.prefix + player.name, JSON.stringify(player));
    }
    registerPlayer(player: string): Promise<void> {
        let existingPlayer = this.getUser(player);
        if (existingPlayer == null) {
            existingPlayer = {
                name: player,
                history: [],
                registrationTime: new Date()
            }
        }
        this.saveUser(existingPlayer);
        return Promise.resolve<void>(undefined);
    }
    saveGame(player: string, game: Game): Promise<void> {
        const existingUser = this.getUser(player);
        game.endTime = new Date(),
        existingUser!.history.push(game);
        this.saveUser(existingUser!);
        return Promise.resolve<void>(undefined);
    }
    getPlayer(player: string): Promise<Player> {
        const user = this.getUser(player);
        return Promise.resolve(user!);
    }
}

export const apiService: IApiService = new LocalApiService()