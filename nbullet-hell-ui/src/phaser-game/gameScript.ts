import { SceneScript, EnemyType, EnemyConfig } from "./configs";

export const gameScript: SceneScript = {
    playerHealth: 10,
    playerPosition: [0.5, 0.5],
    steps: [
        {
            delay: 3000,
            enemies: getEnemies(10),
            stepText: 'Wave: 1 / 3'
        },
        {
            delay: 2000,
            enemies: getEnemies(10),
            stepText: 'Wave: 2 / 3'
        },
        {
            delay: 2000,
            enemies: getEnemies(10),
            stepText: 'Wave: 3 / 3'
        },
        {
            delay: 3000,
            enemies: [{
                type: EnemyType.StationaryBoss,
                delay: 0,
                angularVelocity: 0.012,
                health: 100,
                startRotatePosition: 0,
                startPosition: [0.5, 0.5]
            }],
            stepText: 'BOSS WAVE'
        }
    ]
}

function getEnemies(total: number) {
    let enemies: EnemyConfig[] = [];
    for(let i = 0; i < total; i++) {
        enemies.push({
            type: EnemyType.TackingEnemy,
            fireInterval: 1500,
            health: 2,
            velocity: 200,
            angularVelocity: 0.5,
            delay: 0
        });
    }

    return enemies;
}