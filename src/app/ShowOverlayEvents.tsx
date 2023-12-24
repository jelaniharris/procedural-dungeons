'use client';

import { NoticeOverlay } from '@/components/html/NoticeOverlay';
import { OVERLAY_TEXT, OverlayTextEvent } from '@/components/types/EventTypes';
import { OverLayTextType } from '@/components/types/GameTypes';
import useGame from '@/components/useGame';
import { Point2D } from '@/utils/Point2D';
import { cn } from '@/utils/classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const ShowOverlayEvents = () => {
  const { subscribe, unsubscribeAllHandlers } = useGame();
  const [messages, setMessages] = useState<Map<string, React.ReactNode>>(
    new Map<string, React.ReactNode>()
  );

  const OverlayMessage = ({
    amount,
    position,
    overlayType,
  }: {
    amount: number;
    position: Point2D;
    overlayType: OverLayTextType;
  }) => {
    let contents = {
      text: '',
      className: '',
    };
    switch (overlayType) {
      case OverLayTextType.OVERLAY_SCORE:
        contents = { text: `+${amount}🟡`, className: 'bg-slate-800' };
        break;
      case OverLayTextType.OVERLAY_HEALTH:
        contents = { text: `+${amount}❤️`, className: 'bg-slate-800' };
        break;
      case OverLayTextType.OVERLAY_WEAPON:
        contents = { text: `+${amount}🗡️`, className: 'bg-slate-800' };
        break;
      case OverLayTextType.OVERLAY_ENERGY:
        contents = { text: `+${amount}⚡`, className: 'bg-slate-800' };
        break;
      case OverLayTextType.OVERLAY_NONE:
      default:
        return <></>;
    }
    return (
      <NoticeOverlay position={[position.x, 0, position.y]}>
        <span
          className={cn(
            ' text-xs text-white  p-1 rounded-md',
            contents.className
          )}
        >
          {contents.text}
        </span>
      </NoticeOverlay>
    );
  };

  const deleteFromMessages = useCallback((id: string) => {
    setMessages((prevMessages) => {
      const newMessages = new Map<string, React.ReactNode>(prevMessages);
      const deleted = newMessages.delete(id);
      if (!deleted) {
        console.error('Could not find message id ', id);
      }
      return newMessages;
    });
  }, []);

  const RenderMessages = ({
    messages,
  }: {
    messages: Map<string, React.ReactNode>;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const elements = Array.from(messages).map(([key, message]) => message);
    return <>{elements}</>;
  };

  console.log('[ShowOverlayEvents] Messages ', messages.size);

  useEffect(() => {
    const addToMessages = (id: string, msg: React.ReactNode) => {
      setMessages((prevMessages) => {
        const newMessages = new Map<string, React.ReactNode>(prevMessages);
        console.log('Creating message id: ', id);
        newMessages.set(id, msg);
        console.log(
          '[ShowOverlayEvents] Add Messages length:',
          newMessages.size
        );
        return newMessages;
      });
    };

    subscribe<OverlayTextEvent>(
      OVERLAY_TEXT,
      ({ type, amount, mapPosition }) => {
        const id = uuidv4();
        const removeDelay = 800;

        switch (type) {
          case OverLayTextType.OVERLAY_SCORE:
          case OverLayTextType.OVERLAY_HEALTH:
          case OverLayTextType.OVERLAY_WEAPON:
          case OverLayTextType.OVERLAY_ENERGY:
            if (amount && mapPosition) {
              addToMessages(
                id,
                <OverlayMessage
                  key={`message-${id}`}
                  amount={amount}
                  position={mapPosition}
                  overlayType={type}
                />
              );
              setTimeout(() => deleteFromMessages(id), removeDelay);
            }
            break;
          default:
          case OverLayTextType.OVERLAY_NONE:
            break;
        }
      }
    );
    return () => {
      unsubscribeAllHandlers(OVERLAY_TEXT);
    };
  }, [deleteFromMessages, messages, subscribe, unsubscribeAllHandlers]);

  return <RenderMessages messages={messages} />;
};
