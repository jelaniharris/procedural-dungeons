const randomIntFromInterval = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const clamp = (numb: number, min: number, max: number) => {
  return Math.min(Math.max(numb, min), max);
};

export default randomIntFromInterval;
