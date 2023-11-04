export const generateUserHash = (name: string, discriminator: number) => {
  const userHash = `${name}:${discriminator.toString().padStart(4, '0')}`;
  return userHash;
};
export const generateGameHash = (gameType: string, seed?: number) => {
  let gameHash = '';
  if (gameType == 'adventure') {
    gameHash = `${gameType}`;
  } else if (seed && gameType == 'daily') {
    gameHash = `${gameType}:${seed}`;
  }
  return gameHash;
};
