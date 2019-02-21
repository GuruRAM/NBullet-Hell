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

export enum OnFireEvent {
    OnPlayerFire = 'OnPlayerFire',
    OnEnemyFire = 'OnEnemyFire',
    OnBossFire = 'OnBossFire'
}