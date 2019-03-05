import { SceneScript, EnemyType } from "./typesScript";

export const gameScript: SceneScript = {
    playerHealth: 10,
    playerPosition: [0.5, 0.5],
    steps: [
        {
            delay: 3000,
            enemies: [{
                type: EnemyType.TackingEnemy,
                health: 2,
                actionDelay: 500,
                quantity: 10
            }],
            stepText: 'Wave: 1 / 3'
        },
        {
            delay: 2000,
            enemies: [{
                type: EnemyType.TackingEnemy,
                health: 2,
                actionDelay: 500,
                quantity: 10
            }],
            stepText: 'Wave: 2 / 3'
        },
        {
            delay: 2000,
            enemies: [{
                type: EnemyType.TackingEnemy,
                health: 2,
                actionDelay: 500,
                quantity: 10
            }],
            stepText: 'Wave: 3 / 3'
        },
        {
            delay: 3000,
            enemies: [{
                type: EnemyType.StationaryBoss,
                health: 100,
                startPosition: [0.5, 0.5],
                actionDelay: 500
            }],
            stepText: 'BOSS WAVE'
        }
    ]
}

export const simpleGameScript: SceneScript = {
    playerHealth: 10,
    playerPosition: [0.5, 0.5],
    steps: [
        ...Array.from(generateSimpleSteps(3)),
        {
            delay: 3000,
            enemies: [{
                type: EnemyType.StationaryBoss,
                health: 100,
                startPosition: [0.5, 0.5],
                actionDelay: 500,
                fireIntervalMidifier: 1.5
            }],
            stepText: 'BOSS WAVE'
        }
    ]
}

function *generateSimpleSteps(n: number) {
    for(let i = 0; i < n; i++) {
        yield {
            delay: 2000,
            enemies: [{
                type: EnemyType.TackingEnemy,
                health: 2,
                actionDelay: 500,
                quantity: 5
            }],
            stepText: `Wave: ${i+1} / ${n}`
        }
    }
}