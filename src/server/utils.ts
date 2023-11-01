export const generateUserHash = (name: string, discriminator: number) => {
  const userHash = `${name}:${discriminator.toString().padStart(4, '0')}`;
  return userHash;
};
export const generateGameHash = (gameType: string, seed?: number) => {
  let gameHash = `${gameType}`;
  if (seed) {
    gameHash = `${gameType}:${seed}`;
  }
  return gameHash;
};
