import { cn } from '@/utils/classnames';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  classname?: string;
  disabled?: boolean;
  loading?: boolean;
}

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-purple-700 hover:bg-purple-500 text-white',
  secondary: 'bg-green-700 hover:bg-green-500 text-white',
  danger: 'bg-red-700 hover:bg-red-500 text-white',
};

const LoadingSpinner = () => {
  return (
    <div className="absolute inline-flex items-center">
      <div className="w-4 h-4 rounded-full border-2 border-b-transparent animate-spin border-[inherit]" />
    </div>
  );
};

const Button = ({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) => {
  buttonVariantClasses['danger'];
  return (
    <button
      disabled={disabled}
      {...props}
      className={cn(
        'bottom-4 p-4 font-bold rounded-md',
        buttonVariantClasses[variant],
        {
          'bg-slate-400 hover:bg-slate-350': disabled,
        },
        className
      )}
    >
      {loading && <LoadingSpinner />}
      <span
        className={cn('transition', {
          'opacity-0': loading,
          'opacity-100': !loading,
        })}
      >
        {children}
      </span>
    </button>
  );
};

export default Button;
