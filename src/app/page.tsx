'use client';

import React from 'react';
import DungeonScene from '../components/scenes/DungeonScene';
import { FooterHud } from '@/components/hud/FooterHud';

export default function Home() {
  return (
    <>
      <DungeonScene />
      <div className="relative">
        <FooterHud />
      </div>
    </>
  );
}
