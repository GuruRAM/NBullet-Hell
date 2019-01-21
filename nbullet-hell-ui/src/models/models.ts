export type Player = {
    name : string;
    history : Game[];
    registrationTime : Date;
}

export type Game = {
    startTime : Date
    endTime : Date
    score : number
}