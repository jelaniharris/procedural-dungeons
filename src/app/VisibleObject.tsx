import { EXPLORED, VISIBLE } from '@/utils/visibilityUtils';
import React from 'react';

interface VisibleObjectProps {
  visibility: number;
  children: React.ReactNode;
  visibleInFog?: boolean;
  visibleExplored?: boolean;
}

/**
 * Thin React.memo wrapper that gates a world object behind the visibility map.
 * Only re-renders when its specific `visibility` number changes, so subscribing
 * components don't cause every object to rebuild on each player step.
 */
export const VisibleObject = React.memo(function VisibleObject({
  visibility,
  visibleInFog = false,
  visibleExplored = false,
  children,
}: VisibleObjectProps) {
  return (
    <group
      visible={
        visibility === VISIBLE ||
        visibleInFog ||
        (visibleExplored && visibility === EXPLORED)
      }
    >
      {children}
    </group>
  );
});
