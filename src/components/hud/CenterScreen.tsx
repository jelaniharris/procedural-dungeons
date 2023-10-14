const CenterScreenContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <section className="fixed top-0 z-10 w-full h-full items-stretch p-8">
        <section className="flex flex-col items-center justify-center p-5 h-full gap-5 bg-slate-700 bg-opacity-60">
          {children}
        </section>
      </section>
    </>
  );
};

export default CenterScreenContainer;
