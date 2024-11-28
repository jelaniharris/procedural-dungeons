'use client';

import { ShowContainers } from '@/app/ShowContainers';
import { ShowDangerIndicators } from '@/app/ShowDangerIndicators';
import { ShowDestructables } from '@/app/ShowDestructables';
import { ShowEnemies } from '@/app/ShowEnemies';
import { ShowEnemyIntention } from '@/app/ShowEnemyIntentions';
import { ShowHazards } from '@/app/ShowHazards';
import { ShowInteractables } from '@/app/ShowInteractables';
import { ShowItems } from '@/app/ShowItems';
import { ShowOverlayEvents } from '@/app/ShowOverlayEvents';
import { ShowProjectiles } from '@/app/ShowProjectiles';
import { ShowSummoningIndicators } from '@/app/ShowSummoningIndicators';
import { ShowViewOverlay } from '@/app/ShowViewOverlay';
import { trpc } from '@/app/_trpc/client';
import { GameState, useStore } from '@/stores/useStore';
import { Point2D } from '@/utils/Point2D';
import { getPlayerLocalData } from '@/utils/playerUtils';
import { Environment, Stats } from '@react-three/drei';
import { EffectComposer, Vignette } from '@react-three/postprocessing';
import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { ShowEnvironment } from '../../app/ShowEnvironment';
import { AmbientSound } from '../AmbientSound';
import { FollowCamera } from '../FollowCamera';
import { MoveableObjectRef } from '../entities/MoveableObject';
import Player from '../entities/Player';
import {
  CONTAINER_OPEN,
  DOOR_OPEN,
  ENTITY_ALIVE,
  ENTITY_DIED,
  EVENT_STARTGAME,
  EXIT_EXIT,
  EXIT_GREED,
  EXIT_NEED,
  EntityAliveEvent,
  EntityDiedEvent,
  EventStartGameEvent,
  HIDE_STORE,
  ON_TICK,
  OVERLAY_TEXT,
  OverlayTextEvent,
  PLAYER_ATTEMPT_MOVE,
  PLAYER_DAMAGED_TRAP,
  PLAYER_DIED,
  PLAYER_MOVED,
  PLAYER_REACHED_EXIT,
  PLAYER_TOUCHED_ENEMY,
  PROJECTILE_CREATE,
  PROJECTILE_DESTROY,
  PlayAnimationEvent,
  PlayerAttemptMoveEvent,
  PlayerDamagedTrapEvent,
  ProjectileCreateEvent,
  ProjectileDestroyEvent,
  SHOW_STORE,
  TRIGGER_SUMMONING,
  TriggerSummoningEvent,
} from '../types/EventTypes';
import { ItemData } from '../types/GameData';
import {
  DIRECTIONS,
  DestructableType,
  Direction,
  Enemy,
  EnemyTouchType,
  GameStatus,
  ItemContainerStatus,
  ItemDataInfo,
  ItemType,
  LocationActionType,
  OverLayTextType,
  POSITION_OFFSETS,
  SourceType,
  SpawnWarningType,
  StatusEffectType,
  WalkableType,
} from '../types/GameTypes';
import useGame from '../useGame';

function Effects() {
  const hasStatusEffect = useStore((state: GameState) => state.hasStatusEffect);
  const statusEffects = useStore((state: GameState) => state.statusEffects);
  const isTired = useMemo(() => {
    if (statusEffects.length > 0) {
      return hasStatusEffect(StatusEffectType.STARVING) !== undefined;
    }
    return false;
  }, [hasStatusEffect, statusEffects]);

  return;

  if (!isTired) {
    return;
  }

  return (
    <EffectComposer>
      <Vignette
        offset={1.5}
        darkness={1}
        // Eskil's vignette technique works from the outside inwards rather
        // than the inside outwards, so if this is 'true' set the offset
        // to a value greater than 1.
        // See frag for details - https://github.com/vanruesc/postprocessing/blob/main/src/effects/glsl/vignette/shader.frag
        eskil={true}
      />
    </EffectComposer>
  );
}

const DungeonScene = () => {
  const startGame = useStore((state: GameState) => state.startGame);
  const advanceStage = useStore((state: GameState) => state.advanceStage);
  const performTurn = useStore((state: GameState) => state.performTurn);
  const modifyEnergy = useStore((state: GameState) => state.modifyEnergy);
  const adjustHealth = useStore((state: GameState) => state.adjustHealth);
  const adjustCurrency = useStore((state: GameState) => state.adjustCurrency);
  const adjustKeys = useStore((state: GameState) => state.adjustKeys);
  const addScore = useStore((state: GameState) => state.addScore);
  const hasKeys = useStore((state: GameState) => state.hasKeys);
  const setDead = useStore((state: GameState) => state.setDead);
  const setGameStatus = useStore((state: GameState) => state.setGameStatus);
  const setPaused = useStore((state: GameState) => state.setPaused);
  const adjustAttacks = useStore((state: GameState) => state.adjustAttacks);
  const checkIfWalkable = useStore((state: GameState) => state.checkIfWalkable);
  const determineEnergyBonus = useStore(
    (state: GameState) => state.determineEnergyBonus
  );
  const checkPlayerStandingLocation = useStore(
    (state: GameState) => state.checkPlayerStandingLocation
  );
  const hasStatusEffect = useStore((state: GameState) => state.hasStatusEffect);
  const psuedoShuffle = useStore((state: GameState) => state.shuffleArray);
  const tickPlayer = useStore((state: GameState) => state.tickPlayer);
  const modifyFloorSteps = useStore(
    (state: GameState) => state.modifyFloorSteps
  );
  const reduceHealthDestructible = useStore(
    (state: GameState) => state.reduceHealthDestructible
  );
  const getEnemiesAtPlayerLocation = useStore(
    (state: GameState) => state.getEnemiesAtPlayerLocation
  );
  const getEnemiesAtLocation = useStore(
    (state: GameState) => state.getEnemiesAtLocation
  );
  const canPlayerAttackEnemy = useStore(
    (state: GameState) => state.canPlayerAttackEnemy
  );
  const playerPerformAttack = useStore(
    (state: GameState) => state.playerPerformAttack
  );
  const recordLocalAttempt = useStore(
    (state: GameState) => state.recordLocalAttempt
  );
  const setShowExitDialog = useStore(
    (state: GameState) => state.setShowExitDialog
  );

  const resetDangerZones = useStore(
    (state: GameState) => state.resetDangerZones
  );

  const playAudio = useStore((state: GameState) => state.playAudio);
  const checkDangerState = useStore(
    (state: GameState) => state.checkDangerState
  );

  const isPlayerOnLiquid = useStore(
    (state: GameState) => state.isPlayerOnLiquid
  );

  const checkPlayerLocation = useStore(
    (state: GameState) => state.checkPlayerLocation
  );
  const clearSpawnWarning = useStore(
    (state: GameState) => state.clearSpawnWarning
  );
  const spawnEnemy = useStore((state: GameState) => state.spawnEnemy);
  const spawnProjectile = useStore((state: GameState) => state.spawnProjectile);
  const deleteProjectile = useStore(
    (state: GameState) => state.deleteProjectile
  );
  const getFloorZOffset = useStore((state: GameState) => state.getFloorZOffset);
  const setShowStoreDialog = useStore(
    (state: GameState) => state.setShowStoreDialog
  );
  const getClosestContainerAtLocation = useStore(
    (state: GameState) => state.getClosestContainerAtLocation
  );
  const openContainer = useStore((state: GameState) => state.openContainer);
  const addStatusEffect = useStore((state: GameState) => state.addStatusEffect);
  const getAttemptData = useStore((stage: GameState) => stage.getAttemptData);
  const getProvisions = useStore((stage: GameState) => stage.getProvisions);

  // Api calls
  const saveScore = trpc.saveScore.useMutation();

  const {
    subscribe,
    publish,
    unsubscribeAllHandlers,
    getAllRegistryById,
    gameMode,
    findGameObjectsByXY,
    findGameObjectByName,
  } = useGame();
  const [mapTone, setMapTone] = useState<string>('#FFFFFF');

  console.log('Rendering Scene');

  const saveAttempt = useCallback(() => {
    console.log('Saving game');
    const player = getPlayerLocalData();

    if (player) {
      const attemptInfo = getAttemptData();
      const provisions = getProvisions();
      console.log('Got player, saving score');
      saveScore.mutate({
        score: attemptInfo.score,
        gameType: attemptInfo.type,
        seed: attemptInfo.seed,
        level: attemptInfo.level,
        provisions: provisions.map((p) => p.provisionType),
        name: player.name,
        discriminator: player.discriminator,
        country:
          player.country && player.country.length > 0
            ? player.country
            : undefined,
      });
    }
  }, [getAttemptData, getProvisions, saveScore]);

  const aiTurn = useCallback(() => {
    const enemyLocationResult = (
      locationResult: LocationActionType,
      position?: Point2D,
      enemy?: Enemy
    ) => {
      if (!enemy) {
        return;
      }

      if (
        (locationResult & LocationActionType.TOUCHED_PLAYER) ===
        LocationActionType.TOUCHED_PLAYER
      ) {
        publish(PLAYER_TOUCHED_ENEMY, { enemy: enemy });
      }

      if (
        position &&
        (locationResult & LocationActionType.AT_DOOR) ===
          LocationActionType.AT_DOOR
      ) {
        const gameObjects = findGameObjectsByXY(position.x, position.y);
        for (const gObj of gameObjects) {
          gObj.publish(DOOR_OPEN);
        }
      }
    };
    resetDangerZones();

    performTurn({ enemyLocationResultCallback: enemyLocationResult });

    const gameObjectRegistry = getAllRegistryById();
    gameObjectRegistry.forEach((reg) => {
      reg.publish(ON_TICK);
    });

    // If in danger mode, spawn a new enemy every 9 steps
    checkDangerState();
  }, [
    checkDangerState,
    findGameObjectsByXY,
    getAllRegistryById,
    performTurn,
    publish,
    resetDangerZones,
    tickPlayer,
  ]);

  const playerMoved = useCallback(
    (moved: boolean) => {
      // Reduce player enemy on every step or wait action
      //TODO This should depend on the current floor type the player is on
      modifyEnergy(-1);

      tickPlayer();

      if (moved) {
        const locationAction = checkPlayerLocation();

        // Check if enemies are at the current location
        /*const enemies = getEnemiesAtPlayerLocation();
        enemies.forEach((enemy) => {
          if (canPlayerAttackEnemy(enemy)) {
            playerPerformAttack(enemy);
          }
        });*/
        let itemData: ItemDataInfo | undefined;

        if (
          (locationAction.result & LocationActionType.COLLECTED_ITEM) ===
          LocationActionType.COLLECTED_ITEM
        ) {
          itemData = ItemData.find(
            (data) => data.itemType === locationAction.item?.type
          );
          if (!itemData) {
            console.error(`Unknown data type: ${locationAction.item?.type}`);
          }

          switch (locationAction.item?.type) {
            case ItemType.ITEM_COIN:
              playAudio('coin.ogg');
              const coinScore = addScore(
                itemData?.scoreValue ?? 0,
                SourceType.TREASURE
              );
              publish<OverlayTextEvent>(OVERLAY_TEXT, {
                type: OverLayTextType.OVERLAY_SCORE,
                amount: coinScore,
                mapPosition: locationAction.position,
              });
              break;
            case ItemType.ITEM_CHALICE:
              playAudio('coin.ogg');
              const chaliceScore = addScore(
                itemData?.scoreValue ?? 0,
                SourceType.TREASURE
              );
              publish<OverlayTextEvent>(OVERLAY_TEXT, {
                type: OverLayTextType.OVERLAY_SCORE,
                amount: chaliceScore,
                mapPosition: locationAction.position,
              });
              break;
            case ItemType.ITEM_DIAMOND:
              playAudio('gem.ogg');
              addScore(itemData?.scoreValue ?? 0, SourceType.TREASURE);
              adjustCurrency(itemData?.numberValue ?? 1);
              publish<OverlayTextEvent>(OVERLAY_TEXT, {
                type: OverLayTextType.OVERLAY_CURRENCY,
                amount: 1,
                mapPosition: locationAction.position,
              });
              break;
            case ItemType.ITEM_KEY:
              playAudio('key.ogg');
              addScore(itemData?.scoreValue ?? 0, SourceType.TREASURE);
              adjustKeys(itemData?.numberValue ?? 1);
              publish<OverlayTextEvent>(OVERLAY_TEXT, {
                type: OverLayTextType.OVERLAY_KEY,
                amount: 1,
                mapPosition: locationAction.position,
              });
              break;
            case ItemType.ITEM_CROWN:
              playAudio('coin.ogg');
              const crownscore = addScore(
                itemData?.scoreValue ?? 0,
                SourceType.TREASURE
              );
              publish<OverlayTextEvent>(OVERLAY_TEXT, {
                type: OverLayTextType.OVERLAY_SCORE,
                amount: crownscore,
                mapPosition: locationAction.position,
              });
              break;
            case ItemType.ITEM_INGOT_STACK:
              playAudio('coin.ogg');
              const ingotscore = addScore(
                itemData?.scoreValue ?? 0,
                SourceType.TREASURE
              );
              publish<OverlayTextEvent>(OVERLAY_TEXT, {
                type: OverLayTextType.OVERLAY_SCORE,
                amount: ingotscore,
                mapPosition: locationAction.position,
              });
              break;
            case ItemType.ITEM_FLY_POTION:
              playAudio('bottle.ogg', 0.5);
              addStatusEffect({
                statusEffectType: StatusEffectType.FLYING,
                duration: itemData?.statusTurnsValue ?? 10,
                canExpire: true,
                canStack: true,
              });
              break;
            case ItemType.ITEM_HEALTH_POTION:
              playAudio('bottle.ogg', 0.5);
              const healthResults = adjustHealth(
                itemData?.numberValue ?? 0,
                SourceType.POTION
              );
              publish<OverlayTextEvent>(OVERLAY_TEXT, {
                type: OverLayTextType.OVERLAY_HEALTH,
                amount: healthResults.amountAdjusted,
                mapPosition: locationAction.position,
              });
              break;
            case ItemType.ITEM_WEAPON:
              playAudio('sword-unsheathe.ogg', 0.5);
              adjustAttacks(itemData?.numberValue ?? 0);
              publish<OverlayTextEvent>(OVERLAY_TEXT, {
                type: OverLayTextType.OVERLAY_WEAPON,
                amount: 1,
                mapPosition: locationAction.position,
              });
              break;
            case ItemType.ITEM_CHICKEN:
              playAudio('eat_01.ogg');
              const chickenAmount = determineEnergyBonus(
                itemData?.numberValue ?? 0
              );
              modifyEnergy(chickenAmount);
              publish<OverlayTextEvent>(OVERLAY_TEXT, {
                type: OverLayTextType.OVERLAY_ENERGY,
                amount: chickenAmount,
                mapPosition: locationAction.position,
              });
              break;
            case ItemType.ITEM_APPLE:
              playAudio('eat_01.ogg');
              const appleAmount = determineEnergyBonus(
                itemData?.numberValue ?? 0
              );
              modifyEnergy(appleAmount);
              publish<OverlayTextEvent>(OVERLAY_TEXT, {
                type: OverLayTextType.OVERLAY_ENERGY,
                amount: appleAmount,
                mapPosition: locationAction.position,
              });
              addStatusEffect({
                statusEffectType: StatusEffectType.HASTE,
                duration: itemData?.statusTurnsValue ?? 0,
                canExpire: true,
                canStack: true,
              });
              break;
          }
        }

        // If at a door then we open it
        if (
          (locationAction.result & LocationActionType.AT_DOOR) ===
          LocationActionType.AT_DOOR
        ) {
          const gameObjects = findGameObjectsByXY(
            locationAction.position.x,
            locationAction.position.y
          );
          for (const gObj of gameObjects) {
            gObj.publish(DOOR_OPEN);
          }
        }

        // If at an exit then we exit
        if (
          (locationAction.result & LocationActionType.AT_EXIT) ===
          LocationActionType.AT_EXIT
        ) {
          console.log('AT EXIT');
          publish(PLAYER_REACHED_EXIT);
        }
      }

      const standingEvent = checkPlayerStandingLocation();
      if (standingEvent.sourceType === SourceType.LAVA) {
        console.log('Burnt by lava.');
        playAudio('hurt_04.ogg');
        if (adjustHealth(-1).isDead) {
          // Then the player died
          publish(PLAYER_DIED, {});
        }
      }

      aiTurn();
    },
    [
      addScore,
      adjustAttacks,
      adjustHealth,
      aiTurn,
      canPlayerAttackEnemy,
      checkPlayerLocation,
      findGameObjectsByXY,
      getEnemiesAtPlayerLocation,
      modifyEnergy,
      playerPerformAttack,
      publish,
    ]
  );

  const playerAttemptMove = useCallback(
    async (currentPosition: Point2D, desiredDirection: Direction) => {
      let actualDirection = desiredDirection;
      let isConfused = false;
      if (hasStatusEffect(StatusEffectType.CONFUSION)) {
        if (Math.random() < 0.75) {
          isConfused = true;
          const randomDirection = psuedoShuffle(DIRECTIONS, Math.random)[0];
          actualDirection = randomDirection;
        }
      }

      console.log(
        'Current Pos:',
        currentPosition,
        ' Desired Direction:',
        actualDirection,
        ' Confused: ',
        isConfused
      );

      const playerGO = findGameObjectByName('player');
      if (!playerGO) {
        console.log("Couldn't find player GO");
        return;
      }

      // Find offset
      const desiredOffset = POSITION_OFFSETS.find(
        (offset) => offset.direction == actualDirection
      );
      if (desiredOffset) {
        const nextPosition: Point2D = {
          x: currentPosition.x + desiredOffset.position.x,
          y: currentPosition.y + desiredOffset.position.y,
        };

        const checkWalkable = checkIfWalkable(nextPosition);

        if (checkWalkable.result) {
          const movementRef =
            playerGO.getComponent<MoveableObjectRef>('Moveable');

          const zOffset = getFloorZOffset(nextPosition);

          const moved = await movementRef.move(
            nextPosition,
            'move',
            zOffset ?? 0
          );
          modifyFloorSteps(-1);

          switch (checkWalkable.type) {
            case WalkableType.THROUGH_ENEMY:
              // Get all enemies in the next location
              const throughEnemies = getEnemiesAtLocation(nextPosition);
              throughEnemies.forEach((enemy) => {
                publish(PLAYER_TOUCHED_ENEMY, { enemy: enemy });
              });
              break;
          }

          if (moved) {
            publish('player-moved', { moved: true });
          }

          /*const movementValid = adjustPlayer(
            desiredOffset.position.x,
            desiredOffset.position.y
          );

          if (movementValid) {
            publish('player-moved', { moved: true });
          }*/
        } else {
          switch (checkWalkable.type) {
            case WalkableType.BLOCK_DESTRUCTIBLE:
              const result = reduceHealthDestructible(nextPosition);
              if (playerGO) {
                console.log('Publish event for player?');
                playerGO.publish<PlayAnimationEvent>('play-animation', {
                  animName:
                    Math.random() > 0.5
                      ? 'attack-melee-left'
                      : 'attack-melee-right',
                });
              }
              if (result != DestructableType.NONE) {
                console.log('Destroyed');
                publish('player-moved', { moved: false });
                modifyFloorSteps(-1);
              }
              break;
            case WalkableType.BLOCK_ENEMY:
              // Check if enemies are at the next location
              const enemies = getEnemiesAtLocation(nextPosition);
              enemies.forEach((enemy) => {
                if (canPlayerAttackEnemy(enemy)) {
                  playerGO.publish<PlayAnimationEvent>('play-animation', {
                    animName:
                      Math.random() > 0.5
                        ? 'attack-melee-left'
                        : 'attack-melee-right',
                  });
                  playerPerformAttack(enemy);
                  publish('player-moved', { moved: false });
                }
              });
              break;
            case WalkableType.BLOCK_WALL:
            case WalkableType.BLOCK_NONE:
            default:
              if (isConfused) {
                publish('player-moved', { moved: false });
              }
              break;
          }
        }
      } else {
        // Direction is none, stall was pressed?

        // Check if a chest is close by
        const foundChest = getClosestContainerAtLocation(currentPosition);
        console.log('FOUNDCHEST:', foundChest);
        if (
          foundChest &&
          foundChest.status === ItemContainerStatus.CLOSED &&
          hasKeys()
        ) {
          const gameObjects = findGameObjectsByXY(
            foundChest.position.x,
            foundChest.position.y
          );
          for (const gObj of gameObjects) {
            gObj.publish(CONTAINER_OPEN);
          }
          openContainer(foundChest.id);
          playAudio('chestopen.ogg');
          adjustKeys(-1);
        }

        publish('player-moved', { moved: false });
        modifyFloorSteps(-1);
      }
    },
    [
      adjustKeys,
      canPlayerAttackEnemy,
      checkIfWalkable,
      findGameObjectByName,
      findGameObjectsByXY,
      getClosestContainerAtLocation,
      getEnemiesAtLocation,
      getFloorZOffset,
      hasKeys,
      hasStatusEffect,
      modifyFloorSteps,
      openContainer,
      playAudio,
      playerPerformAttack,
      psuedoShuffle,
      publish,
      reduceHealthDestructible,
    ]
  );
  console.log('[DungeonScene] RENDERING GAME SCENE');

  React.useEffect(() => {
    const party = async () => {
      const randomTone = Math.floor(Math.random() * 6);
      const mapTones: Record<number, string> = {
        '1': '#ff0000',
        '2': '#00ff00',
        '3': '#0000ff',
        '4': '#00FFFF',
        '5': '#FFFF00',
      };
      if (mapTones[randomTone]) {
        setMapTone(mapTones[randomTone]);
      }

      subscribe<EventStartGameEvent>(EVENT_STARTGAME, ({ gameType }) => {
        startGame(gameType);
        const playerGO = findGameObjectByName('player');
        if (playerGO) {
          playerGO.publish<EntityAliveEvent>(ENTITY_ALIVE);
        }
      });

      subscribe(EXIT_GREED, () => {
        setShowExitDialog(false);
        advanceStage();
      });

      subscribe(EXIT_EXIT, () => {
        setShowExitDialog(false);
        setGameStatus(GameStatus.GAME_STARTED);
        setPaused(false);
      });

      subscribe(SHOW_STORE, () => {
        console.log('Showing store');
        setShowStoreDialog(true);
        setShowExitDialog(false);
        setPaused(true);
      });

      subscribe(HIDE_STORE, () => {
        console.log('Hiding Store');
        setShowStoreDialog(false);
        setShowExitDialog(true);
        setPaused(true);
      });

      subscribe(EXIT_NEED, () => {
        setShowExitDialog(false);
        setPaused(true);
        saveAttempt();
        recordLocalAttempt();
        setGameStatus(GameStatus.GAME_ENDED);
      });

      subscribe(PLAYER_REACHED_EXIT, () => {
        console.log('Exit reached');
        setGameStatus(GameStatus.GAME_EXITDECISION);
        setShowExitDialog(true);
        setPaused(true);
      });

      subscribe(PLAYER_DIED, ({}) => {
        const playerGO = findGameObjectByName('player');
        console.log('Player has died');

        if (playerGO) {
          playerGO.publish<EntityDiedEvent>(ENTITY_DIED);
        }

        playAudio('game_over_bad_chest.ogg');
        setDead();
        recordLocalAttempt();
        saveAttempt();
        setGameStatus(GameStatus.GAME_ENDED);
        setPaused(true);
      });

      subscribe(PLAYER_TOUCHED_ENEMY, ({ enemy }) => {
        console.log('Touched by enemy: ', enemy.name);

        if (
          [
            EnemyTouchType.TOUCHTYPE_DAMAGE,
            EnemyTouchType.TOUCHTYPE_BOTH,
          ].includes(enemy.touchType)
        ) {
          playAudio('hurt_04.ogg');
          if (adjustHealth(-1).isDead) {
            // Then the player died
            publish(PLAYER_DIED, {});
          } else {
            /*const playerGO = findGameObjectByName('player');
            if (playerGO) {
              playerGO.publish<PlayAnimationEvent>('play-animation', {
                animName: 'fall',
              });
            }*/
          }
        }
        if (
          [
            EnemyTouchType.TOUCHTYPE_STATUS,
            EnemyTouchType.TOUCHTYPE_BOTH,
          ].includes(enemy.touchType) &&
          enemy.touchStatusEffect != StatusEffectType.NONE
        ) {
          // Touch type is status
          playAudio('cough_03.ogg');
          addStatusEffect({
            statusEffectType: enemy.touchStatusEffect,
            duration: 10,
            canExpire: true,
            canStack: true,
          });
        }
      });

      subscribe<PlayerDamagedTrapEvent>(PLAYER_DAMAGED_TRAP, ({ hazard }) => {
        console.log('Touched by hazard: ', hazard.name);
        playAudio('hurt_04.ogg');
        if (adjustHealth(-1).isDead) {
          // Then the player died
          publish(PLAYER_DIED, {});
        } else {
          /*const playerGO = findGameObjectByName('player');
          if (playerGO) {
            playerGO.publish<PlayAnimationEvent>('play-animation', {
              animName: 'sit',
            });
          }*/
        }
      });

      subscribe<PlayerAttemptMoveEvent>(
        PLAYER_ATTEMPT_MOVE,
        ({ currentPosition, desiredDirection }) => {
          playerAttemptMove(currentPosition, desiredDirection);
        }
      );

      subscribe(PLAYER_MOVED, ({ moved }) => {
        let soundToPlay = 'stepstone_1.ogg';
        if (isPlayerOnLiquid()) {
          soundToPlay = 'sfx100v2_footstep_wet_03.ogg';
        }
        if (moved) {
          playAudio(soundToPlay, 0.4);
        }
        playerMoved(moved);
      });

      subscribe<TriggerSummoningEvent>(
        TRIGGER_SUMMONING,
        ({ spawnWarning, gameObjectRef }) => {
          gameObjectRef.setDisabled(true);
          if (
            spawnWarning.warningType === SpawnWarningType.WARNING_ENEMY &&
            spawnWarning.enemyType
          ) {
            spawnEnemy(spawnWarning.location, spawnWarning.enemyType);
          }
          clearSpawnWarning(spawnWarning);
        }
      );

      subscribe<ProjectileCreateEvent>(PROJECTILE_CREATE, ({ projectile }) => {
        spawnProjectile({
          ...projectile,
          destroy: (id) => {
            publish<ProjectileDestroyEvent>(PROJECTILE_DESTROY, { id });
          },
        });
      });

      subscribe<ProjectileDestroyEvent>(PROJECTILE_DESTROY, ({ id }) => {
        if (id) {
          deleteProjectile(id);
        }
      });

      publish<EventStartGameEvent>(EVENT_STARTGAME, { gameType: gameMode });
    };

    party();

    return () => {
      unsubscribeAllHandlers(PLAYER_TOUCHED_ENEMY);
      unsubscribeAllHandlers(PLAYER_MOVED);
      unsubscribeAllHandlers(PLAYER_DIED);
      unsubscribeAllHandlers(PLAYER_DAMAGED_TRAP);
      unsubscribeAllHandlers(PLAYER_ATTEMPT_MOVE);
      unsubscribeAllHandlers(PLAYER_REACHED_EXIT);
      unsubscribeAllHandlers(EXIT_GREED);
      unsubscribeAllHandlers(EXIT_NEED);
      unsubscribeAllHandlers(SHOW_STORE);
      unsubscribeAllHandlers(HIDE_STORE);
      unsubscribeAllHandlers(EVENT_STARTGAME);
      unsubscribeAllHandlers(TRIGGER_SUMMONING);
      unsubscribeAllHandlers(PROJECTILE_CREATE);
      unsubscribeAllHandlers(PROJECTILE_DESTROY);
    };
  }, []);

  return (
    <>
      <directionalLight color={mapTone} />
      <Environment preset="warehouse" />
      <ShowViewOverlay />
      {process.env.NODE_ENV === 'development' && <Stats />}
      <Suspense fallback={null}>
        <AmbientSound url={'./sounds/dungeon_ambient_1.ogg'} />
        <Effects />
        <ShowEnvironment />
        <Player />
        <FollowCamera />
        <ShowItems />
        <ShowEnemies />
        <ShowEnemyIntention />
        <ShowDangerIndicators />
        <ShowHazards />
        <ShowInteractables />
        <ShowDestructables />
        <ShowSummoningIndicators />
        <ShowOverlayEvents />
        <ShowProjectiles />
        <ShowContainers />
      </Suspense>
    </>
  );
};

export default DungeonScene;
