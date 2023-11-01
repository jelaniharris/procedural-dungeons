export const getDailyUniqueSeed = () => {
  const dailyUniqueDate = new Date()
    .toISOString() //2023-10-08T20:48:34.378Z
    .substring(0, 10)
    .replaceAll('-', '');
  const seed = parseInt(dailyUniqueDate, 10);
  return seed;
};
