import React from 'react';
import { Settings, AlertCircle } from 'lucide-react';

interface UnderConstructionProps {
    title: string;
    description?: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({ title, description = 'Halaman ini sedang dalam tahap pengembangan.' }) => {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="relative mb-6">
                <Settings className="h-20 w-20 animate-spin text-gray-300" style={{ animationDuration: '3s' }} />
                <div className="absolute -bottom-2 -right-2 rounded-full bg-white p-1">
                    <AlertCircle className="h-8 w-8 text-pink-500" />
                </div>
            </div>
            
            <h2 className="mb-2 text-2xl font-bold text-gray-800">{title}</h2>
            <p className="max-w-md text-gray-500">{description}</p>
            
            <div className="mt-8 rounded-lg bg-blue-50 px-6 py-4 text-sm text-blue-800">
                Fitur ini akan segera hadir pada update berikutnya.
            </div>
        </div>
    );
};

export default UnderConstruction;
