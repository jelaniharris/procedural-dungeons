import { GameState, useStore } from '@/stores/useStore';

export const EndScreen = () => {
  const score = useStore((store: GameState) => store.score);
  const startGame = useStore((store: GameState) => store.startGame);
  const isDead = useStore((store: GameState) => store.isDead);

  return (
    <section className="fixed top-0 w-full items-stretch min-h-screen">
      <section className="bg-slate-700 bg-opacity-60 m-8 flex flex-col gap-5 justify-center items-center min-h-[100svh]">
        {isDead && <h1 className="text-6xl font-bold text-red-500">DEAD</h1>}
        {!isDead && (
          <h1 className="text-6xl font-bold text-green-500">ESCAPED</h1>
        )}

        <span className="text-4xl font-bold text-white">
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
