import { SceneScript, EnemyType, ScriptStepType } from "./typesScript";

export const gameScript: SceneScript = {
    playerHealth: 10,
    playerPosition: [0.5, 0.5],
    steps: [
        {
            delay: 3000,
            type: ScriptStepType.EliminationStep,
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
            type: ScriptStepType.EliminationStep,
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
            type: ScriptStepType.EliminationStep,
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
            type: ScriptStepType.EliminationStep,
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
            type: ScriptStepType.EliminationStep,
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

export const simpleTextScript: SceneScript = {
    playerHealth: 10,
    playerPosition: [0.5, 0.5],
    steps: [
        {
            delay: 0,
            type: ScriptStepType.TextSceneStep,
            lineDuration: 2500,
            preambleDuration: 5000,
            text: 'COSMOS INVADERS\n\n' +
                'In the year 1337 Cosmic Era ' +
                'the cosmic entity known ' +
                'as Balin invaded The Solar system. ' +
                'Humans finally discovered they are ' +
                'not alone in the Universe. ' +
                'The mighty Solar Fleet has been shattered ' +
                'by the might of alien invaders. ' +
                'Only handful of vessels launch a sneak suicidal ' +
                'attack on the Balin\'s mothership. ' +
                '\n \n \n' +
                'You are one of them...',
            preamble: 'In the far, far future...',
            cancellable: true,
            stepText: ''
        },
        {
            delay: 500,
            type: ScriptStepType.FadeStep,
            show: true,
            duration: 2000,
            stepText: ''
        },
        ...Array.from(generateSimpleSteps(3)),
        {
            delay: 3000,
            type: ScriptStepType.EliminationStep,
            enemies: [{
                type: EnemyType.StationaryBoss,
                health: 50,
                startPosition: [0.5, 0.5],
                actionDelay: 500,
                fireIntervalMidifier: 1.5
            }],
            stepText: 'BOSS WAVE'
        },
        {
            delay: 500,
            type: ScriptStepType.FadeStep,
            show: true,
            duration: 2000,
            stepText: ''
        },
        {
            delay: 500,
            type: ScriptStepType.LastBossStep,
            stepText: '',
        },
        {
            delay: 0,
            type: ScriptStepType.TextSceneStep,
            lineDuration: 2500,
            preambleDuration: 5000,
            text: 'The heroic actions of the human warriors ' +
                'defeated Balin and banished him from the Solar System. ' +
                'The human civilization is living well and prosper. ' +
                'The heroic deeds of the chosen few will be never forgotten. ' +
                '\n' +
                'Balin has never been seen ever after.' +
                '\n\n' +
                'Or did he?' +
                '\n\n' +
                'THE END',
            preamble: '',
            cancellable: false,
            stepText: '',
        }
    ],
    gameOverStep: {
        delay: 1000,
        type: ScriptStepType.TextSceneStep,
        lineDuration: 2500,
        preambleDuration: 4000,
        text: 'The heroic attack of brave warriors was in vain. ' +
            'Vessels have been defeated. Balin has prevailed. ' +
            'The human civilization has been wiped out from the face ' +
            'of the Universe and has never been seen after...' +
            '\n\n' +
            'THE END',
        preamble: 'You are defeated!',
        cancellable: true,
        stepText: ''
    }
}

function *generateSimpleSteps(n: number, enemyQuantity: number = 5) {
    for(let i = 0; i < n; i++) {
        yield {
            delay: 2000,
            type: ScriptStepType.EliminationStep,
            enemies: [{
                type: EnemyType.TackingEnemy,
                health: 2,
                actionDelay: 500,
                quantity: enemyQuantity
            }],
            stepText: `Wave: ${i+1} / ${n}`,
            interactive: true,
        }
    }
}