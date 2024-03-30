import { cn } from '@/utils/classnames';

export const ContainerHeader = ({
  title,
  className = '',
}: {
  title: string;
  className?: string;
}) => {
  return (
    <h2
      className={cn(
        'text-lg md:text-xl font-bold text-white',
        'bg-slate-800 rounded-md py-2 px-2 my-3',
        className
      )}
    >
      {title}
    </h2>
  );
};
