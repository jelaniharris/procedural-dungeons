import classnames from 'classnames';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  classname?: string;
}

const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={classnames(
        'bottom-4 bg-purple-700 hover:bg-purple-500 p-4 font-bold text-white rounded-md',
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
