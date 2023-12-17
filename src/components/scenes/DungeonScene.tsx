'use client';

import { ShowDangerIndicators } from '@/app/ShowDangerIndicators';
import { ShowDestructables } from '@/app/ShowDestructables';
import { ShowEnemies } from '@/app/ShowEnemies';
import { ShowEnemyIntention } from '@/app/ShowEnemyIntentions';
import { ShowHazards } from '@/app/ShowHazards';
import { ShowInteractables } from '@/app/ShowInteractables';
import { ShowItems } from '@/app/ShowItems';
import { ShowSummoningIndicators } from '@/app/ShowSummoningIndicators';
import { GameState, useStore } from '@/stores/useStore';
import { Point2D } from '@/utils/Point2D';
import { Environment, Stats } from '@react-three/drei';
import { EffectComposer, Vignette } from '@react-three/postprocessing';
import React, { Suspense, useCallback, useState } from 'react';
import { ShowEnvironment } from '../../app/ShowEnvironment';
import { AmbientSound } from '../AmbientSound';
import { MoveableObjectRef } from '../entities/MoveableObject';
import Player from '../entities/Player';
import {
  DOOR_OPEN,
  ENTITY_ALIVE,
  ENTITY_DIED,
  EVENT_STARTGAME,
  EXIT_GREED,
  EXIT_NEED,
  EntityAliveEvent,
  EntityDiedEvent,
  EventStartGameEvent,
  ON_TICK,
  PLAYER_ATTEMPT_MOVE,
  PLAYER_DAMAGED_TRAP,
  PLAYER_DIED,
  PLAYER_MOVED,
  PLAYER_REACHED_EXIT,
  PLAYER_TOUCHED_ENEMY,
  PlayerAttemptMoveEvent,
  PlayerDamagedTrapEvent,
  TRIGGER_SUMMONING,
  TriggerSummoningEvent,
} from '../types/EventTypes';
import {
  DestructableType,
  Direction,
  Enemy,
  GameStatus,
  ItemType,
  LocationActionType,
  POSITION_OFFSETS,
  SpawnWarningType,
  WalkableType,
} from '../types/GameTypes';
import useGame from '../useGame';

function Effects() {
  const isTired = useStore((state: GameState) => state.isTired);

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
  const addScore = useStore((state: GameState) => state.addScore);
  const setDead = useStore((state: GameState) => state.setDead);
  const setGameStatus = useStore((state: GameState) => state.setGameStatus);
  const setPaused = useStore((state: GameState) => state.setPaused);
  const adjustAttacks = useStore((state: GameState) => state.adjustAttacks);
  const checkIfWalkable = useStore((state: GameState) => state.checkIfWalkable);
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

  const checkPlayerLocation = useStore(
    (state: GameState) => state.checkPlayerLocation
  );
  const clearSpawnWarning = useStore(
    (state: GameState) => state.clearSpawnWarning
  );
  const spawnEnemy = useStore((state: GameState) => state.spawnEnemy);
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
  }, [performTurn, publish]);

  const playerMoved = useCallback(
    (moved: boolean) => {
      // Reduce player enemy on every step or wait action
      modifyEnergy(-1);

      if (moved) {
        const locationAction = checkPlayerLocation();

        // Check if enemies are at the current location
        /*const enemies = getEnemiesAtPlayerLocation();
        enemies.forEach((enemy) => {
          if (canPlayerAttackEnemy(enemy)) {
            playerPerformAttack(enemy);
          }
        });*/

        if (
          (locationAction.result & LocationActionType.COLLECTED_ITEM) ===
          LocationActionType.COLLECTED_ITEM
        ) {
          switch (locationAction.item?.type) {
            case ItemType.ITEM_COIN:
              playAudio('coin.ogg');
              addScore(10);
              break;
            case ItemType.ITEM_CHALICE:
              playAudio('coin.ogg');
              addScore(25);
              break;
            case ItemType.ITEM_CROWN:
              playAudio('coin.ogg');
              addScore(150);
              break;
            case ItemType.ITEM_POTION:
              playAudio('bottle.ogg', 0.5);
              adjustHealth(1);
              break;
            case ItemType.ITEM_WEAPON:
              playAudio('sword-unsheathe.ogg', 0.5);
              adjustAttacks(1);
              break;
            case ItemType.ITEM_CHEST:
              playAudio('coin.ogg');
              addScore(10);
              break;
            case ItemType.ITEM_CHICKEN:
              playAudio('eat_01.ogg');
              modifyEnergy(35);
              break;
            case ItemType.ITEM_APPLE:
              playAudio('eat_01.ogg');
              modifyEnergy(15);
              break;
          }
        }

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

        if (
          (locationAction.result & LocationActionType.AT_EXIT) ===
          LocationActionType.AT_EXIT
        ) {
          console.log('AT EXIT');
          publish(PLAYER_REACHED_EXIT);
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
      console.log(
        'Current Pos:',
        currentPosition,
        ' Desired Direction:',
        desiredDirection
      );

      const playerGO = findGameObjectByName('player');
      if (!playerGO) {
        console.log("Couldn't find player GO");
        return;
      }

      // Find offset
      const desiredOffset = POSITION_OFFSETS.find(
        (offset) => offset.direction == desiredDirection
      );
      if (desiredOffset) {
        console.log(desiredOffset);
        const nextPosition: Point2D = {
          x: currentPosition.x + desiredOffset.position.x,
          y: currentPosition.y + desiredOffset.position.y,
        };

        const checkWalkable = checkIfWalkable(nextPosition);

        if (checkWalkable.result) {
          const movementRef =
            playerGO.getComponent<MoveableObjectRef>('Moveable');

          const moved = await movementRef.move(nextPosition, 'move');
          modifyFloorSteps(-1);

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
                  playerPerformAttack(enemy);
                  publish('player-moved', { moved: false });
                }
              });

              break;
            case WalkableType.BLOCK_WALL:
            case WalkableType.BLOCK_NONE:
            default:
              break;
          }
        }
      } else {
        // Direction is none, stall was pressed?
        publish('player-moved', { moved: false });
        modifyFloorSteps(-1);
      }
    },
    [checkIfWalkable, findGameObjectByName, publish, reduceHealthDestructible]
  );

  React.useEffect(() => {
    const party = async () => {
      const randomTone = Math.floor(Math.random() * 6);

      switch (randomTone) {
        case 1:
          setMapTone('#ff0000');
          break;
        case 2:
          setMapTone('#00ff00');
          break;
        case 3:
          setMapTone('#0000ff');
          break;
        case 4:
          setMapTone('#00FFFF');
          break;
        case 4:
          setMapTone('#FFFF00');
          break;
        default:
          break;
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

      subscribe(EXIT_NEED, () => {
        setShowExitDialog(false);
        setPaused(true);
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
        setGameStatus(GameStatus.GAME_ENDED);
        setPaused(true);
      });

      subscribe(PLAYER_TOUCHED_ENEMY, ({ enemy }) => {
        console.log('Touched by enemy: ', enemy.name);
        playAudio('hurt_04.ogg');
        if (!adjustHealth(-1)) {
          // Then the player died
          publish(PLAYER_DIED, {});
        }
      });

      subscribe<PlayerDamagedTrapEvent>(PLAYER_DAMAGED_TRAP, ({ hazard }) => {
        console.log('Touched by hazard: ', hazard.name);
        playAudio('hurt_04.ogg');
        if (!adjustHealth(-1)) {
          // Then the player died
          publish(PLAYER_DIED, {});
        }
      });

      subscribe<PlayerAttemptMoveEvent>(
        PLAYER_ATTEMPT_MOVE,
        ({ currentPosition, desiredDirection }) => {
          playerAttemptMove(currentPosition, desiredDirection);
        }
      );

      subscribe(PLAYER_MOVED, ({ moved }) => {
        if (moved) {
          playAudio('stepstone_1.wav', 0.2);
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
      unsubscribeAllHandlers(EVENT_STARTGAME);
    };
  }, []);

  return (
    <>
      <directionalLight color={mapTone} />
      <Environment preset="warehouse" />
      <Stats />
      <Suspense fallback={null}>
        <AmbientSound url={'./sounds/dungeon_ambient_1.ogg'} />
        <Effects />
        <ShowEnvironment />
        <Player />
        <ShowItems />
        <ShowEnemies />
        <ShowEnemyIntention />
        <ShowDangerIndicators />
        <ShowHazards />
        <ShowInteractables />
        <ShowDestructables />
        <ShowSummoningIndicators />
      </Suspense>
    </>
  );
};

export default DungeonScene;
