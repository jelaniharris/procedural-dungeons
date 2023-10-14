import { useProgress } from '@react-three/drei';

export const Loading = () => {
  const { progress } = useProgress();

  if (progress == 100) {
    return <></>;
  }

  return (
    <section className="fixed top-0 z-10 w-full h-full items-stretch">
      <section className="flex flex-col items-center justify-center p-5 h-full gap-5 bg-slate-900">
        <div className="mb-6 h-5 w-full bg-neutral-200 dark:bg-neutral-600">
          <div
            className="h-5 bg-blue-600"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </section>
    </section>
  );
};
