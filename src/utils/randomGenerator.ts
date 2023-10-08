// Taken from: https://stackoverflow.com/a/72732727
const psuedoRandom = (seed: number) => {
  const m = 2 ** 35 - 31;
  const a = 185852;
  let s = seed % m;
  return function () {
    return (s = (s * a) % m) / m;
  };
};

export default psuedoRandom;
