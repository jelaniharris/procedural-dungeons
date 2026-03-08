import { GameState, useStore } from '@/stores/useStore';
import { cn } from '@/utils/classnames';
import React, { useEffect, useState } from 'react';

export const FloorNotification = () => {
  const currentLevel = useStore((store: GameState) => store.currentLevel);
  const showFloorNotification = useStore(
    (store: GameState) => store.showFloorNotification
  );
  const setShowFloorNotification = useStore(
    (store: GameState) => store.setShowFloorNotification
  );
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (showFloorNotification) {
      // Start rendering and trigger animation
      setShouldRender(true);
      // Small delay to ensure the element is mounted before animation
      setTimeout(() => setIsVisible(true), 50);

      // Hide after 2.5 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        // Remove from DOM after fade out animation completes
        setTimeout(() => {
          setShouldRender(false);
          setShowFloorNotification(false);
        }, 500); // Match transition duration
      }, 2500);

      return () => {
        clearTimeout(hideTimer);
      };
    }
  }, [showFloorNotification, setShowFloorNotification]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center pointer-events-none z-50',
        'transition-all duration-500 ease-out',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      )}
    >
      <div className="bg-slate-800 bg-opacity-90 px-16 py-8 rounded-lg shadow-2xl">
        <div className="text-center">
          <div className="text-white text-6xl md:text-8xl font-bold tracking-wider">
            FLOOR {currentLevel}
          </div>
        </div>
      </div>
    </div>
  );
};
