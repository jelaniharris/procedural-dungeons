export const generateUserHash = (name: string, discriminator: number) => {
  const userHash = `${name}:${discriminator.toString().padStart(4, '0')}`;
  return userHash;
};
export const generateGameHash = (gameType: string, seed: number) => {
  const gameHash = `${gameType}:${seed}`;
  return gameHash;
};
