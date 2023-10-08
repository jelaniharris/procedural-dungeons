'use client';

import { Suspense, useCallback, useState } from 'react';
import { Stats, Environment } from '@react-three/drei';
import React from 'react';
import { ShowEnvironment } from '../../app/ShowEnvironment';
import { GameState, playAudio, useStore } from '@/stores/useStore';
import { ShowItems } from '@/app/ShowItems';
import { AmbientSound } from '../AmbientSound';
import {
  Enemy,
  GameStatus,
  ItemType,
  LocationActionType,
} from '../types/GameTypes';
import { ShowEnemies } from '@/app/ShowEnemies';
import { ShowEnemyIntention } from '@/app/ShowEnemyIntentions';
import useGame from '../useGame';
import Player from '../entities/Player';
import {
  EXIT_GREED,
  EXIT_NEED,
  ON_TICK,
  PLAYER_DAMAGED_TRAP,
  PLAYER_DIED,
  PLAYER_MOVED,
  PLAYER_REACHED_EXIT,
  PLAYER_TOUCHED_ENEMY,
  PlayerDamagedTrapEvent,
} from '../types/EventTypes';
import { ShowDangerIndicators } from '@/app/ShowDangerIndicators';
import { ShowHazards } from '@/app/ShowHazards';
import { EffectComposer, Vignette } from '@react-three/postprocessing';

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
  const setShowExitDialog = useStore(
    (state: GameState) => state.setShowExitDialog
  );

  const resetDangerZones = useStore(
    (state: GameState) => state.resetDangerZones
  );

  const checkPlayerLocation = useStore(
    (state: GameState) => state.checkPlayerLocation
  );
  const { subscribe, publish, unsubscribeAllHandlers, getAllRegistryById } =
    useGame();
  const [mapTone, setMapTone] = useState<string>('#FFFFFF');

  console.log('Rendering Scene');

  const aiTurn = useCallback(() => {
    const enemyLocationResult = (
      locationResult: LocationActionType,
      enemy: Enemy
    ) => {
      switch (locationResult) {
        case LocationActionType.TOUCHED_PLAYER: {
          publish(PLAYER_TOUCHED_ENEMY, { enemy: enemy });
        }
      }
    };
    resetDangerZones();

    performTurn({ enemyLocationResultCallback: enemyLocationResult });

    const gameObjectRegistry = getAllRegistryById();
    gameObjectRegistry.forEach((reg) => {
      reg.publish(ON_TICK);
    });
  }, [performTurn, publish]);

  const playerMoved = useCallback(
    (moved: boolean) => {
      // Reduce player enemy on every step or wait action
      modifyEnergy(-1);

      if (moved) {
        const locationAction = checkPlayerLocation();
        switch (locationAction.result) {
          case LocationActionType.COLLECTED_ITEM:
            switch (locationAction.item?.type) {
              case ItemType.ITEM_COIN:
                playAudio('coin.wav');
                addScore(10);
                break;
              case ItemType.ITEM_CHEST:
                playAudio('coin.wav');
                addScore(10);
                break;
              case ItemType.ITEM_CHICKEN:
                playAudio('eat_01.ogg');
                modifyEnergy(30);
                addScore(5);
                break;
            }
            break;
          case LocationActionType.AT_EXIT:
            console.log('AT EXIT');
            publish(PLAYER_REACHED_EXIT);
            break;
          case LocationActionType.NOTHING:
          default:
            break;
        }
      }

      aiTurn();
    },
    [advanceStage, aiTurn, checkPlayerLocation]
  );

  React.useEffect(() => {
    const party = async () => {
      startGame('daily');

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

      subscribe(EXIT_GREED, () => {
        setShowExitDialog(false);
        advanceStage();
      });

      subscribe(EXIT_NEED, () => {
        setShowExitDialog(false);
        setGameStatus(GameStatus.GAME_ENDED);
      });

      subscribe(PLAYER_REACHED_EXIT, () => {
        console.log('Exit reached');
        setGameStatus(GameStatus.GAME_EXITDECISION);
        setShowExitDialog(true);
      });

      subscribe(PLAYER_DIED, ({}) => {
        console.log('Player has died');
        setDead();
        setGameStatus(GameStatus.GAME_ENDED);
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

      subscribe(PLAYER_MOVED, ({ moved }) => {
        if (moved) {
          playAudio('stepstone_1.wav', 0.2);
        }
        playerMoved(moved);
      });
    };
    party();
    return () => {
      unsubscribeAllHandlers(PLAYER_TOUCHED_ENEMY);
      unsubscribeAllHandlers(PLAYER_MOVED);
      unsubscribeAllHandlers(PLAYER_DIED);
      unsubscribeAllHandlers(PLAYER_DAMAGED_TRAP);
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
      </Suspense>
    </>
  );
};

export default DungeonScene;
