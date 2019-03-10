import { Enemies, Enemy, Boss } from '../enemies';
import { EffectsManager } from "./effectsManager";
import { getMiddle } from '../../utils';
import { PlayerManager } from './playerManager';
import { MainScene } from '../main-scene';
import { Weapon } from '../weapons/weapon';
import { GameObjects } from 'phaser';
import { Player } from '../player';

export class InteractionManager {
    constructor(private scene: MainScene, private effectsManager: EffectsManager, private playerManager: PlayerManager, private enemies: Enemies) {
        this.onPlayerHit = this.onPlayerHit.bind(this);
        this.onEnemyHit = this.onEnemyHit.bind(this);
        this.onBulletBulletHit = this.onBulletBulletHit.bind(this);
    }

    //TODO: fix this, not working
    public register() {
        const playerWeaponGroup = this.playerManager.player.weapon.group;
        this.scene.physics.add.collider(this.enemies.group,
            playerWeaponGroup, this.onEnemyHit);
        this.scene.physics.add.overlap(this.enemies.group,
            playerWeaponGroup, this.onEnemyHit);
    }

    registerBoss(boss: Boss) {
        const bossWeapons = boss.getWeapons();
        const interceptableGroups = bossWeapons.filter(i => i.interceptable).map(i => i.group);
        const allGroups = bossWeapons.map(i => i.group);
        this.scene.physics.add.collider(allGroups,
            this.playerManager.player, this.onPlayerHit);
        this.scene.physics.add.overlap(allGroups,
            this.playerManager.player, this.onPlayerHit);

        const playerWeaponGroup = this.playerManager.player.weapon.group;
        this.scene.physics.add.collider(playerWeaponGroup, interceptableGroups, this.onBulletBulletHit);
        this.scene.physics.add.overlap(playerWeaponGroup, interceptableGroups, this.onBulletBulletHit);
        this.scene.physics.add.collider(this.playerManager.player, boss);
        this.scene.physics.add.overlap(this.playerManager.player, boss);

        this.scene.physics.add.collider(boss,
            playerWeaponGroup, this.onEnemyHit);
        this.scene.physics.add.overlap(boss,
            playerWeaponGroup, this.onEnemyHit);
    }

    registerRamCollision(player: Player, boss: Boss, onCollusion: () => void) {
        this.scene.physics.add.collider(player, boss, () => {
            boss.kill();
            player.setVisible(false);
            onCollusion();
        });
    }

    registerEnemy(enemy: Enemy, weapon: Weapon) {
        this.scene.physics.add.collider(weapon.group,
            this.playerManager.player, this.onPlayerHit);
        this.scene.physics.add.overlap(weapon.group,
            this.playerManager.player, this.onPlayerHit);

        const playerWeaponGroup = this.playerManager.player.weapon.group;
        this.scene.physics.add.collider(playerWeaponGroup, weapon.group, this.onBulletBulletHit);
        this.scene.physics.add.overlap(playerWeaponGroup, weapon.group, this.onBulletBulletHit);

        this.scene.physics.add.collider(enemy,
            playerWeaponGroup, this.onEnemyHit);
        this.scene.physics.add.overlap(enemy,
            playerWeaponGroup, this.onEnemyHit);

    }

    onPlayerHit(playerObject: GameObjects.GameObject, bulletObject: GameObjects.GameObject) {
        if (!bulletObject.active)
            return;
        //TODO: move to PlayerManager
        const b1 = <Phaser.Physics.Arcade.Image>playerObject;
        const b2 = <Phaser.Physics.Arcade.Image>bulletObject;

        this.effectsManager.playSoundBulletHit();
        this.effectsManager.playAnimationCraftExplosion(...getMiddle(b1, b2));
        this.playerManager.hitWithBullet(bulletObject);

        //TODO: remove bullet from the enemy bullets group
        //weapon.group.remove(projectileObject);
        bulletObject.destroy(true);
    }

    onBulletBulletHit(playerBullet: GameObjects.GameObject, enemyBullet: GameObjects.GameObject) {
        //The object is already destroyed
        if (!playerBullet.active || !enemyBullet.active)
            return;

        //TODO: remove bullet from the enemy bullets group
        //weapon.group.remove(projectileObject);
        const b1 = <Phaser.Physics.Arcade.Image>playerBullet;
        const b2 = <Phaser.Physics.Arcade.Image>enemyBullet;

        this.effectsManager.playSoundBulletHit();
        this.effectsManager.playAnimationBulletsHit(...getMiddle(playerBullet, enemyBullet));

        b1.destroy();
        b2.destroy();
    }

    onEnemyHit(enemy: GameObjects.GameObject, playerBullet: GameObjects.GameObject) {
        //The object is already destroyed
        if (!enemy.active || !playerBullet.active) {
            if (playerBullet.body)
                playerBullet.destroy();
            return;
        }

        const enemyObject = enemy as Enemy;
        enemyObject.hitByBullet(playerBullet);
        this.playerManager.player.weapon.group.remove(playerBullet);
        playerBullet.destroy();
        /*
        if (enemyObject.isFinished()) {
            this.enemies.group.remove(enemy);
            this.score += (enemy as Enemy).getScore();
        }*/
    }
}