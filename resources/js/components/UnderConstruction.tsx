import React from 'react';

interface UnderConstructionProps {
    title?: string;
    description?: string;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({
    title = 'Halaman dalam Pengembangan',
    description = 'Fitur ini sedang dalam tahap pengembangan dan akan segera hadir.',
}) => {
    return (
        <div className="flex min-h-[600px] items-center justify-center">
            <div className="text-center">
                {/* Construction Icon Animation */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400 opacity-75"></div>
                        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl">
                            <span className="animate-bounce text-6xl">🚧</span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2 className="mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">{title}</h2>

                {/* Description */}
                <p className="mb-8 text-lg text-gray-600">{description}</p>

                {/* Construction Elements */}
                <div className="flex items-center justify-center space-x-4 text-4xl">
                    <span className="animate-pulse">👷</span>
                    <span className="animate-bounce delay-100">⚙️</span>
                    <span className="animate-pulse delay-200">🔧</span>
                    <span className="animate-bounce delay-300">⚡</span>
                </div>

                {/* Progress Bar */}
                <div className="mx-auto mt-8 w-64 overflow-hidden rounded-full bg-gray-200">
                    <div className="animate-progress h-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>
                </div>

                {/* Status Text */}
                <p className="mt-4 text-sm font-semibold text-gray-500">Coming Soon...</p>
            </div>

            {/* Custom Animation Styles */}
            <style>{`
                @keyframes progress {
                    0% {
                        width: 0%;
                    }
                    50% {
                        width: 70%;
                    }
                    100% {
                        width: 100%;
                    }
                }
                .animate-progress {
                    animation: progress 2s ease-in-out infinite;
                }
                .delay-100 {
                    animation-delay: 0.1s;
                }
                .delay-200 {
                    animation-delay: 0.2s;
                }
                .delay-300 {
                    animation-delay: 0.3s;
                }
            `}</style>
        </div>
    );
};

export default UnderConstruction;
