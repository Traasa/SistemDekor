import axios from 'axios';

// Use current domain for API calls (works with both dev and production)
const API_BASE_URL = `${window.location.origin}/api`;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

// User Management API
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'sales' | 'user';
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'sales' | 'user';
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    role?: 'admin' | 'sales' | 'user';
}

export const userService = {
    getAll: async (params?: { search?: string; role?: string; per_page?: number }) => {
        const response = await api.get<{ success: boolean; data: User[] }>('/users', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
        return response.data;
    },

    create: async (data: CreateUserData) => {
        const response = await api.post<{ success: boolean; data: User; message: string }>('/users', data);
        return response.data;
    },

    update: async (id: number, data: UpdateUserData) => {
        const response = await api.put<{ success: boolean; data: User; message: string }>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
        return response.data;
    },
};

// Order Management API
export interface Order {
    id: number;
    client_id: number;
    package_id: number;
    event_date: string;
    event_location: string;
    guest_count: number;
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
    total_price: number;
    notes: string | null;
    verification_token: string;
    created_at: string;
    updated_at: string;
    client?: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    package?: {
        id: number;
        name: string;
        price: number;
    };
    payment_transactions?: PaymentTransaction[];
}

export interface PaymentTransaction {
    id: number;
    order_id: number;
    amount: number;
    payment_type: 'dp' | 'pelunasan';
    payment_method: string;
    payment_date: string;
    status: 'pending' | 'verified' | 'rejected';
    proof_image: string | null;
    notes: string | null;
    verified_by: number | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateOrderData {
    client_id: number;
    package_id: number;
    event_date: string;
    event_location: string;
    guest_count: number;
    notes?: string;
    total_price: number;
}

export interface UpdateOrderData {
    event_date?: string;
    event_location?: string;
    guest_count?: number;
    status?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
    notes?: string;
    total_price?: number;
}

export const orderService = {
    getAll: async (params?: { status?: string; search?: string; date_from?: string; date_to?: string; per_page?: number }) => {
        const response = await api.get<{ success: boolean; data: { data: Order[]; total: number; per_page: number; current_page: number } }>(
            '/orders',
            { params },
        );
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
        return response.data;
    },

    create: async (data: CreateOrderData) => {
        const response = await api.post<{ success: boolean; data: Order; message: string }>('/orders', data);
        return response.data;
    },

    update: async (id: number, data: UpdateOrderData) => {
        const response = await api.put<{ success: boolean; data: Order; message: string }>(`/orders/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/orders/${id}`);
        return response.data;
    },

    updateStatus: async (id: number, status: string) => {
        const response = await api.patch<{ success: boolean; data: Order; message: string }>(`/orders/${id}/status`, { status });
        return response.data;
    },
};

// Payment Transaction API
export const paymentService = {
    getAll: async (params?: { order_id?: number; status?: string; per_page?: number }) => {
        const response = await api.get<{ success: boolean; data: PaymentTransaction[] }>('/payment-transactions', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ success: boolean; data: PaymentTransaction }>(`/payment-transactions/${id}`);
        return response.data;
    },

    verify: async (id: number, status: 'verified' | 'rejected', notes?: string) => {
        const response = await api.post<{ success: boolean; data: PaymentTransaction; message: string }>(`/payment-transactions/${id}/verify`, {
            status,
            notes,
        });
        return response.data;
    },
};

// Client API
export interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateClientData {
    name: string;
    email: string;
    phone: string;
    address?: string;
}

export const clientService = {
    getAll: async (params?: { search?: string; per_page?: number }) => {
        const response = await api.get<{ success: boolean; data: Client[] }>('/clients', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ success: boolean; data: Client }>(`/clients/${id}`);
        return response.data;
    },

    create: async (data: CreateClientData) => {
        const response = await api.post<{ success: boolean; data: Client; message: string }>('/clients', data);
        return response.data;
    },

    update: async (id: number, data: Partial<CreateClientData>) => {
        const response = await api.put<{ success: boolean; data: Client; message: string }>(`/clients/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/clients/${id}`);
        return response.data;
    },
};

// Package API
export interface Package {
    id: number;
    name: string;
    description: string;
    price: number;
    features: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const packageService = {
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: Package[] }>('/packages');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ success: boolean; data: Package }>(`/packages/${id}`);
        return response.data;
    },
};

export default api;
