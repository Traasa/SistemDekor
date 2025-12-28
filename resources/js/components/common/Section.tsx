import React, { ReactNode } from 'react';

interface SectionProps {
    children: ReactNode;
    id?: string;
    title?: string;
    subtitle?: string;
    background?: 'light' | 'dark' | 'gradient' | 'transparent';
    className?: string;
}

export const Section: React.FC<SectionProps> = ({ children, id, title, subtitle, background = 'light', className = '' }) => {
    const backgroundClasses = {
        light: 'bg-[#FFF8F0]',
        dark: 'bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] text-white',
        gradient: 'bg-gradient-to-br from-[#FFF8F0] via-[#F5F1E8] to-[#FFE4E6]',
        transparent: 'bg-transparent',
    };

    return (
        <section id={id} className={`py-20 ${backgroundClasses[background]} ${className}`}>
            <div className="container mx-auto max-w-7xl px-4">
                {(title || subtitle) && (
                    <div className="mb-16 text-center">
                        {title && (
                            <h2 className="mb-4 bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text font-serif text-4xl font-bold text-transparent md:text-5xl">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className={`mx-auto max-w-3xl text-lg md:text-xl ${background === 'dark' ? 'text-white/80' : 'text-gray-600'}`}>
                                {subtitle}
                            </p>
                        )}
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
                            <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#EC4899]"></div>
                            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-[#EC4899] to-transparent"></div>
                        </div>
                    </div>
                )}
                {children}
            </div>
        </section>
    );
};
