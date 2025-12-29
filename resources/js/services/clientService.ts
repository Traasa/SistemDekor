import axios from 'axios';

export interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    orders_count: number;
    created_at: string;
    updated_at: string;
}

export interface ClientFormData {
    name: string;
    email: string;
    phone: string;
    address?: string;
}

export interface ClientStats {
    total_clients: number;
    total_orders: number;
    clients_with_orders: number;
    clients_without_orders: number;
}

class ClientService {
    private baseUrl = '/api/admin';

    /**
     * Get all clients with pagination and search
     */
    async getClients(params?: { search?: string; page?: number; per_page?: number }) {
        const response = await axios.get(`${this.baseUrl}/clients-list`, { params });
        return response.data;
    }

    /**
     * Get client statistics
     */
    async getStats(): Promise<ClientStats> {
        const response = await axios.get(`${this.baseUrl}/clients-stats`);
        return response.data;
    }

    /**
     * Get single client by ID
     */
    async getClient(id: number): Promise<Client> {
        const response = await axios.get(`${this.baseUrl}/clients/${id}`);
        return response.data;
    }

    /**
     * Create new client
     */
    async createClient(data: ClientFormData): Promise<Client> {
        const response = await axios.post(`${this.baseUrl}/clients`, data);
        return response.data.client;
    }

    /**
     * Update existing client
     */
    async updateClient(id: number, data: ClientFormData): Promise<Client> {
        const response = await axios.put(`${this.baseUrl}/clients/${id}`, data);
        return response.data.client;
    }

    /**
     * Delete client
     */
    async deleteClient(id: number): Promise<void> {
        await axios.delete(`${this.baseUrl}/clients/${id}`);
    }
}

export const clientService = new ClientService();
export default clientService;
