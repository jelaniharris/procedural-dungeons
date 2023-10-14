'use client';

import Game from '@/components/Game';
import Scene from '@/components/scenes/Scene';
import SceneManager from '@/components/scenes/SceneManager';
import DungeonScene from '../components/scenes/DungeonScene';

export default function Home() {
  return (
    <>
      <Game>
        <SceneManager defaultScene="dungeon">
          <Scene id="dungeon">
            <DungeonScene />
          </Scene>
        </SceneManager>
      </Game>
    </>
  );
}
