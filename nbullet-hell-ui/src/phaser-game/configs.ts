export type BulletConfig = {
    key: string,
    velocity: number,
    scale: number,
    bulletType: BulletType,
    onFireEvent: OnFireEvent
}

export type SoundConfig = {
    key: string,
    volume: number
}

export enum BulletType {
    NormalBullet,
    RoundBullet,
    TrailBullet,
    RectangleBullet
}

export type SceneScript = {
    playerPosition: [number, number];
    playerHealth: number;
    steps: ScriptStep[];
}

export type ScriptStep = {
    delay: number | undefined;
    stepText: string;
    enemies: EnemyConfig[]
}

export type EnemyConfig = {
    type: EnemyType,
    delay: number;
    fireInterval?: number | undefined,
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
}

export enum EnemyType {
    TackingEnemy,
    StationaryEnemy,
    RotationBoss,
    StationaryBoss
}

export enum OnFireEvent {
    OnPlayerFire = 'OnPlayerFire',
    OnEnemyFire = 'OnEnemyFire',
    OnBossFire = 'OnBossFire'
}