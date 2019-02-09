export type BulletConfig = {
    key: string,
    velocity: number,
    scale: number,
    fireSound: SoundConfig | undefined
}

export const defaultBulletConfig: BulletConfig = {
    key: '',
    velocity: 300,
    scale: 1,
    fireSound: undefined
}

export type SoundConfig = {
    key: string,
    volume: number
}