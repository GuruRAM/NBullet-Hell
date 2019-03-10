export type SceneScript = {
    playerPosition: [number, number];
    playerHealth: number;
    steps: ScriptStep[];
    gameOverStep?: ScriptStep;
}

export type ScriptStep = EliminationStep | TextSceneStep | FadeStep | ScriptStepBase;

export type ScriptStepBase = {
    delay: number | undefined;
    stepText: string;
    type: ScriptStepType;
}

export type EliminationStep = {
    enemies: EnemyConfig[];
} & ScriptStepBase;

export type TextSceneStep = {
    lineDuration: number,
    preambleDuration: number,
    text: string,
    preamble: string,
    cancellable: boolean
} & ScriptStepBase;

export type FadeStep = {
    duration: number,
    show: boolean
} & ScriptStepBase;

export enum ScriptStepType {
    EliminationStep,
    TextSceneStep,
    FadeStep,
    LastBossStep
}

export type EnemyConfig = {
    type: EnemyType,
    delay?: number | undefined;
    fireIntervalMidifier?: number | undefined,
    velocity?: number | undefined,
    angularVelocity?: number | undefined,
    startRotatePosition?: number | undefined,
    health?: number | undefined

    //random if undefined
    //position is percentage based:
    //0.5, 0.5 = center;
    //0, 0 = upper left corner;
    //1, 1 = upper right corner;
    startPosition?: [number, number] | undefined;
    quantity?: number | undefined;
    actionDelay?: number | undefined;
}

export enum EnemyType {
    TackingEnemy,
    StationaryEnemy,
    RotationBoss,
    StationaryBoss
}