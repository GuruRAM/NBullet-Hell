export type BulletConfig = {
    key: string,
    velocity: number,
    scale: number,
    fireSound: SoundConfig | undefined,
    bulletType: BulletType
}

export type SoundConfig = {
    key: string,
    volume: number
}

export enum BulletType {
    NormalBullet,
    RoundBullet,
    PlayerBullet,
    BossMainBullet
}