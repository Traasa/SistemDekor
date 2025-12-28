import React, { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    href?: string;
    className?: string;
    icon?: ReactNode;
    disabled?: boolean;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    href,
    className = '',
    icon,
    disabled = false,
    fullWidth = false,
}) => {
    const baseClasses =
        'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
        primary:
            'bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] text-white hover:scale-105 hover:shadow-xl hover:shadow-[#D4AF37]/50 focus:ring-[#D4AF37]',
        secondary:
            'bg-gradient-to-r from-[#EC4899] to-[#BE185D] text-white hover:scale-105 hover:shadow-xl hover:shadow-[#EC4899]/50 focus:ring-[#EC4899]',
        outline: 'border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white hover:scale-105 focus:ring-[#D4AF37]',
        ghost: 'text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:scale-105 focus:ring-[#D4AF37]',
    };

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;

    if (href) {
        return (
            <a href={href} className={classes}>
                {icon && <span>{icon}</span>}
                {children}
            </a>
        );
    }

    return (
        <button onClick={onClick} disabled={disabled} className={classes}>
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
};
