import React from 'react';

interface UserFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    filterRole: string;
    setFilterRole: (value: string) => void;
    onSearch: () => void;
    onAddNew: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({ searchTerm, setSearchTerm, filterRole, setFilterRole, onSearch, onAddNew }) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <svg className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <select
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="all">Semua Role</option>
                    <option value="admin">Admin</option>
                    <option value="sales">Sales</option>
                    <option value="user">User</option>
                </select>
                <button onClick={onSearch} className="bg-gold-500 hover:bg-gold-600 rounded-lg px-6 py-2 font-semibold text-white transition-colors">
                    Cari
                </button>
            </div>
            <button
                onClick={onAddNew}
                className="flex items-center gap-2 rounded-lg bg-pink-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-pink-600"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah User
            </button>
        </div>
    );
};
