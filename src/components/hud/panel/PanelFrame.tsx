import { cn } from '@/utils/classnames';

export const PanelFrame = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn('bg-slate-600 shadow-md rounded px-8 py-8 mb-4', className)}
    >
      {children}
    </div>
  );
};
