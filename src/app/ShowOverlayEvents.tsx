/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { NoticeOverlay } from '@/components/html/NoticeOverlay';
import { OVERLAY_TEXT, OverlayTextEvent } from '@/components/types/EventTypes';
import { OverLayTextType } from '@/components/types/GameTypes';
import useGame from '@/components/useGame';
import { Point2D } from '@/utils/Point2D';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const ShowOverlayEvents = () => {
  const { subscribe, unsubscribeAllHandlers } = useGame();
  const [messages, setMessages] = useState<Map<string, React.ReactNode>>(
    new Map<string, React.ReactNode>()
  );

  const OverlayGoldMessage = ({
    amount,
    position,
  }: {
    amount: number;
    position: Point2D;
  }) => {
    const contents = `+${amount}🟡`;
    return (
      <NoticeOverlay
        key={`overlay-${uuidv4()}`}
        position={[position.x, 0, position.y]}
      >
        <span className=" text-xs text-white bg-slate-800 p-1 rounded-md">
          {contents}
        </span>
      </NoticeOverlay>
    );
  };

  console.log('[ShowOverlayEvents] Messages ', messages.size);

  useEffect(() => {
    const addToMessages = (id: string, msg: React.ReactNode) => {
      const newMessages = new Map<string, React.ReactNode>(messages);
      newMessages.set(id, msg);
      setMessages(newMessages);
      console.log('[ShowOverlayEvents] Add Messages length:', newMessages.size);
    };

    const deleteFromMessages = (id: string) => {
      const newMessages = new Map<string, React.ReactNode>(messages);
      newMessages.delete(id);
      setMessages(newMessages);
      console.log(
        '[ShowOverlayEvents] Delete Messages length:',
        newMessages.size
      );
    };

    subscribe<OverlayTextEvent>(
      OVERLAY_TEXT,
      ({ type, amount, mapPosition }) => {
        switch (type) {
          case OverLayTextType.OVERLAY_SCORE:
            if (amount && mapPosition) {
              const id = uuidv4();
              addToMessages(
                id,
                <OverlayGoldMessage
                  key={`message-${id}`}
                  amount={amount}
                  position={mapPosition}
                />
              );
              setTimeout(() => deleteFromMessages(id), 1000);
            }
            break;
          default:
          case OverLayTextType.OVERLAY_NONE:
            break;
        }

        console.log(type, amount, mapPosition);
      }
    );
    return () => {
      unsubscribeAllHandlers(OVERLAY_TEXT);
    };
  }, [messages, subscribe, unsubscribeAllHandlers]);

  return <>{Array.from(messages).map(([key, message]) => message)}</>;
};
