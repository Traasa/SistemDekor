import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('auth_token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    const response = await authService.getMe();
                    if (response.success) {
                        setUser(response.data);
                    } else {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user');
                    }
                } catch (error) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            if (response.success) {
                const { user, token } = response.data;
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
        setIsLoading(true);
        try {
            const response = await authService.register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            if (response.success) {
                const { user, token } = response.data;
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};