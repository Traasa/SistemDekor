import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { User, authService } from '../services/authService';

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

type Props = { children: ReactNode };

export function AuthProvider(props: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const res = await authService.getMe();
                    if (res.success) setUser(res.data);
                    else {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user');
                    }
                } catch {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };
        init();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const res = await authService.login({ email, password });
            if (res.success) {
                const { user: u, token } = res.data;
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user', JSON.stringify(u));
                setUser(u);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
        setIsLoading(true);
        try {
            const res = await authService.register({ name, email, password, password_confirmation: passwordConfirmation });
            if (res.success) {
                const { user: u, token } = res.data;
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user', JSON.stringify(u));
                setUser(u);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const val: AuthContextType = { user, isLoading, isAuthenticated: !!user, login, register, logout };

    return <AuthContext.Provider value={val}>{props.children}</AuthContext.Provider>;
}
