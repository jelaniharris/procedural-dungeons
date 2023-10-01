import { GameState, useStore } from '@/stores/useStore';

export const EndScreen = () => {
  const score = useStore((store: GameState) => store.score);
  const startGame = useStore((store: GameState) => store.startGame);

  return (
    <section className="fixed top-0 w-full items-stretch min-h-screen">
      <section className="bg-slate-700 bg-opacity-60 min-h-screen m-8 flex flex-col gap-5 justify-center items-center">
        <span className="text-2xl font-bold text-white">
          Final Score: {score}
        </span>
        <button
          onClick={startGame}
          className="bg-purple-700 text-white font-bold p-4"
        >
          Go Again
        </button>
      </section>
    </section>
  );
};
