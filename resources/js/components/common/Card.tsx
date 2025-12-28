import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    variant?: 'default' | 'gradient' | 'glass' | 'bordered';
    hover?: boolean;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, variant = 'default', hover = false, className = '', onClick }) => {
    const baseClasses = 'rounded-2xl overflow-hidden transition-all duration-300';

    const variantClasses = {
        default: 'bg-white shadow-lg',
        gradient: 'bg-gradient-to-br from-white via-[#FFF8F0] to-[#FFE4E6] shadow-xl',
        glass: 'bg-white/80 backdrop-blur-md shadow-2xl border border-white/20',
        bordered: 'bg-white border-2 border-[#D4AF37]/20 shadow-md',
    };

    const hoverClass = hover ? 'hover:scale-105 hover:shadow-2xl cursor-pointer' : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClass} ${className}`;

    return (
        <div className={classes} onClick={onClick}>
            {children}
        </div>
    );
};
