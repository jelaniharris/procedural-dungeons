import { cn } from '@/utils/classnames';

interface CenterScreenContainerProps extends React.ComponentProps<'section'> {
  children?: React.ReactNode;
  innerClassName?: string;
}

const CenterScreenContainer = ({
  children,
  className,
  innerClassName,
}: CenterScreenContainerProps) => {
  return (
    <>
      <section
        className={cn(
          'fixed top-0 z-10 w-full h-full items-stretch p-2 md:p-4 lg:p-8 sm:p-2',
          className
        )}
      >
        <section
          className={cn(
            'flex flex-col items-center justify-center p-1 md:p-5 h-full gap-5 bg-slate-700 bg-opacity-60',
            innerClassName
          )}
        >
          {children}
        </section>
      </section>
    </>
  );
};

export default CenterScreenContainer;
