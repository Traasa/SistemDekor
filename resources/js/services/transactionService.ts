import api from './api';

export interface Transaction {
    id: number;
    transaction_number: string;
    user_id: number;
    client_name: string;
    service_detail: string;
    transaction_date: string;
    status: 'pending' | 'selesai' | 'dibatalkan';
    total_price: number;
    notes?: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

export interface TransactionFormData {
    user_id: number;
    client_name: string;
    service_detail: string;
    transaction_date: string;
    total_price: number;
    notes?: string;
    status?: 'pending' | 'selesai' | 'dibatalkan';
}

export interface TransactionResponse {
    success: boolean;
    data: Transaction | Transaction[];
    message?: string;
}

export interface PaginatedTransactionResponse {
    success: boolean;
    data: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export const transactionService = {
    getTransactions: async (params?: { status?: string; search?: string; page?: number }): Promise<PaginatedTransactionResponse> => {
        const response = await api.get('/transactions', { params });
        return response.data;
    },

    getTransaction: async (id: number): Promise<TransactionResponse> => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    createTransaction: async (data: TransactionFormData): Promise<TransactionResponse> => {
        const response = await api.post('/transactions', data);
        return response.data;
    },

    updateTransaction: async (id: number, data: Partial<TransactionFormData>): Promise<TransactionResponse> => {
        const response = await api.put(`/transactions/${id}`, data);
        return response.data;
    },

    deleteTransaction: async (id: number): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/transactions/${id}`);
        return response.data;
    },

    getUsers: async (): Promise<{ success: boolean; data: Array<{ id: number; name: string; email: string }> }> => {
        const response = await api.get('/users');
        return response.data;
    },

    exportPdf: async (id: number): Promise<Blob> => {
        const response = await api.get(`/transactions/${id}/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
