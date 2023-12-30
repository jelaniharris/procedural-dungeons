'use client';

import Game from '@/components/Game';
import EmbarkScene from '@/components/scenes/EmbarkScene';
import MenuScene from '@/components/scenes/MenuScene';
import Scene from '@/components/scenes/Scene';
import SceneManager from '@/components/scenes/SceneManager';
import DungeonScene from '../components/scenes/DungeonScene';

export default function Home() {
  return (
    <>
      <Game>
        <SceneManager defaultScene="menu">
          <Scene id="menu">
            <MenuScene />
          </Scene>
          <Scene id="embark">
            <EmbarkScene />
          </Scene>
          <Scene id="dungeon">
            <DungeonScene />
          </Scene>
        </SceneManager>
      </Game>
    </>
  );
}
