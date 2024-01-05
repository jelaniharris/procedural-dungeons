'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';

export const LoadingBar = () => {
  const { loaded, total, progress } = useProgress();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const text = useMemo(() => {
    return `${loaded}/${total} Items`;
  }, [loaded, total]);

  if (!isLoading) return <></>;

  return (
    <div
      className="h-7 p-1 bg-blue-600 text-white font-bold rounded-sm text-center"
      style={{ width: `${progress}%` }}
    >
      {text}
    </div>
  );
};

export const Loading = () => {
  const { active } = useProgress();

  if (!active) {
    return <></>;
  }

  return (
    <section className="fixed top-0 bg-black w-full h-full items-stretch">
      <section className="flex flex-col justify-between p-5 h-full gap-5 bg-slate-900">
        <div></div>
        <div>
          <h1 className="text-3xl md:text-9xl text-center font-extrabold text-white uppercase">
            Loading
          </h1>
        </div>
        <div className="mb-6 h-7 w-full bg-neutral-200 dark:bg-neutral-600">
          <LoadingBar />
        </div>
      </section>
    </section>
  );
};
