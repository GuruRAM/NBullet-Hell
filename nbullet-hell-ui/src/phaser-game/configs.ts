export type BulletConfig = {
    key: string,
    velocity: number,
    scale: number,
    fireSound: SoundConfig | undefined,
    displayBodyRatio: number
}

export type SoundConfig = {
    key: string,
    volume: number
}