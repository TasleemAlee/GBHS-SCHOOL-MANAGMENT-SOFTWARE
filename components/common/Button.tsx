
import React from 'react';
import { useApp } from '../../contexts/AppContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  icon?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', icon, ...props }) => {
    const { schoolSettings } = useApp();

    const baseStyles = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
        primary: `text-white`,
        secondary: `bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400`,
        danger: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`,
    };

    const primaryStyle = {
        backgroundColor: schoolSettings.primaryColor,
        borderColor: schoolSettings.primaryColor,
        '--tw-ring-color': schoolSettings.primaryColor,
    } as React.CSSProperties;

    const style = variant === 'primary' ? primaryStyle : {};

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
            {...props}
        >
            {icon && <span className="material-icons-sharp mr-2 -ml-1">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;
