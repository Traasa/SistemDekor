import api from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        token: string;
        token_type: string;
    };
    message: string;
}

export const authService = {
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await api.post('/login', data);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post('/register', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/logout');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },

    getMe: async (): Promise<{ success: boolean; data: User }> => {
        const response = await api.get('/me');
        return response.data;
    },
};
