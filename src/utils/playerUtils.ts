import { PlayerLocalData } from '@/components/types/GameTypes';

export const getPlayerLocalData = () => {
  const data = localStorage.getItem('player');
  if (!data) {
    return null;
  }
  const convertedData = JSON.parse(data) as PlayerLocalData;
  return convertedData;
};

export const savePlayerLocalData = (data: PlayerLocalData) => {
  localStorage.setItem('player', JSON.stringify(data));
};

export const displayPlayerName = (data: PlayerLocalData) => {
  return `${data.name}#${data.discriminator.toString().padStart(3, '0')}`;
};
