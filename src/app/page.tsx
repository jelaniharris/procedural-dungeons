'use client';

import React from 'react';
import DungeonScene from '../components/scenes/DungeonScene';
import Game from '@/components/Game';

export default function Home() {
  return (
    <>
      <Game>
        <DungeonScene />
      </Game>
    </>
  );
}
