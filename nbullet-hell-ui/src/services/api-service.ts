import { configService } from "./config-service";
import { Game, Player } from "../models/models";

export interface IApiService {
    registerPlayer(player: string): Promise<Response>;
    saveGame(player: string, game: Game): Promise<Response>;
    getPlayer(player: string): Promise<Player>;
}

export class ApiService implements IApiService {
    registerPlayer(player: string): Promise<Response> {
        return fetch(`${configService.getUri()}\\Player\\${player}`, {
            method: "PUT",
            mode: "cors", //workaround for the development environment
        });
    }
    saveGame(player: string, game: Game): Promise<Response> {
        return fetch(`${configService.getUri()}\\Game\\${player}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "PUT",
            mode: "cors", //workaround for the development environment
            body: JSON.stringify(game)
        });
    }
    getPlayer(player: string): Promise<Player> {
        return fetch(`${configService.getUri()}\\Player\\${name}`, {
            method: "GET",
            mode: "cors", //workaround for the development environment
        }).then((response: Response) => response.json());
    }
}

export class FakeApiService implements IApiService {
    registerPlayer(player: string): Promise<Response> {
        return Promise.resolve<Response>(null!);
    }
    saveGame(player: string, game: Game): Promise<Response> {
        return Promise.resolve<Response>(null!);
    }
    getPlayer(player: string): Promise<Player> {
        const now = new Date(Date.now());
        return Promise.resolve({
            name: 'Player1',
            registrationTime: now,
            history: [
                {
                    startTime: now,
                    endTime: now,
                    score: 999
                },
                {
                    startTime: now,
                    endTime: now,
                    score: 989
                }
            ]
        });
    }
}

export const apiService: IApiService = new FakeApiService()