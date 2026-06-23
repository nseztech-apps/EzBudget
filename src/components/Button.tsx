import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 min-h-[44px] min-w-[44px] cursor-pointer';

  const variantClasses = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 shadow-md hover:shadow-lg',
    secondary: 'bg-white text-navy-900 border-2 border-navy-200 hover:border-navy-400 hover:bg-navy-50',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`}
    >
      {children}
    </button>
  );
}
