export const TutorialHeader = ({ title }: { title: string }) => {
  return (
    <h2 className="text-lg md:text-xl font-bold py-2 text-white bg-slate-800 rounded-md px-2 my-3">
      {title}
    </h2>
  );
};
