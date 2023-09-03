import { GameState, useStore } from '@/stores/useStore';

export const FooterHud = () => {
  const currentLevel = useStore((store: GameState) => store.currentLevel);
  const score = useStore((store: GameState) => store.score);

  return (
    <>
      <section className="fixed w-full flex gap-8 justify-center bottom-4">
        <section className=" bg-slate-500 p-4 text-2xl font-bold text-white">
          Score: {score}
        </section>
        <section className=" bg-slate-500 p-4 text-2xl font-bold text-white">
          Level: {currentLevel}
        </section>
      </section>
    </>
  );
};
