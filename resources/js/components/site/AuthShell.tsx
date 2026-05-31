import React from 'react';
import { PublicLayout } from '../../layouts/PublicLayout';

interface AuthShellProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children }) => {
    return (
        <PublicLayout active="home" showFooter={false} wrapperClassName="relative min-h-screen overflow-hidden bg-[#F6F1EA]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 right-10 h-80 w-80 rounded-full bg-[#EAD9C7]/70 blur-3xl" />
                <div className="absolute bottom-[-120px] left-10 h-72 w-72 rounded-full bg-[#B08A56]/20 blur-3xl" />
                <div className="absolute left-1/2 top-20 h-56 w-56 -translate-x-1/2 rounded-full bg-[#1B2430]/10 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] w-full flex-col px-4 py-10 font-sans sm:px-8 2xl:px-16">
                <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="max-w-xl">
                        <p className="inline-block rounded-full border border-[#E7DCCB] bg-[#FFF9F1] px-4 py-2 text-xs font-semibold tracking-[0.28em] text-[#B08A56] uppercase">
                            Welcome Back
                        </p>
                        <h1 className="mt-5 font-serif text-3xl font-bold leading-tight text-[#2A2420] sm:text-4xl">
                            Platform wedding organizer untuk pemesanan, komunikasi, dan tracking order.
                        </h1>
                        <p className="mt-4 text-base text-[#5B4A3C]">Satu tampilan yang konsisten untuk pelanggan dan tim internal.</p>
                    </div>

                    <div className="rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-10 shadow-[0_22px_50px_-34px_rgba(27,36,48,0.65)]">
                        <h2 className="font-serif text-3xl font-bold text-[#2A2420]">{title}</h2>
                        <p className="mt-2 text-sm text-[#5B4A3C]">{subtitle}</p>
                        <div className="mt-6">{children}</div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};
