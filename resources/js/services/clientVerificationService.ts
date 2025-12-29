import axios from 'axios';

export interface PaymentTransaction {
    id: number;
    order_id: number;
    payment_type: string;
    amount: number;
    payment_date: string;
    status: string;
    proof_image?: string;
    notes?: string;
    rejection_reason?: string;
    verified_at?: string;
    verified_by?: number;
    rejected_at?: string;
    rejected_by?: number;
}

export interface OrderForVerification {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_price: number;
    final_price: number;
    event_name: string;
    event_date: string;
    created_at: string;
    client: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    package: {
        id: number;
        name: string;
    };
    payment_transactions: PaymentTransaction[];
}

export interface VerificationStats {
    pending_orders: number;
    pending_payments: number;
    awaiting_dp: number;
    today_orders: number;
}

class ClientVerificationService {
    private baseUrl = '/api/admin';

    /**
     * Get orders for verification
     */
    async getOrders(params?: { search?: string; page?: number; per_page?: number }) {
        const response = await axios.get(`${this.baseUrl}/client-verification-list`, { params });
        return response.data;
    }

    /**
     * Get verification statistics
     */
    async getStats(): Promise<VerificationStats> {
        const response = await axios.get(`${this.baseUrl}/verification-stats`);
        return response.data;
    }

    /**
     * Approve an order
     */
    async approveOrder(orderId: number) {
        const response = await axios.post(`${this.baseUrl}/orders/${orderId}/approve`);
        return response.data;
    }

    /**
     * Reject an order
     */
    async rejectOrder(orderId: number, reason: string) {
        const response = await axios.post(`${this.baseUrl}/orders/${orderId}/reject`, {
            rejection_reason: reason,
        });
        return response.data;
    }

    /**
     * Approve a payment
     */
    async approvePayment(orderId: number, paymentId: number) {
        const response = await axios.post(
            `${this.baseUrl}/orders/${orderId}/payments/${paymentId}/approve`
        );
        return response.data;
    }

    /**
     * Reject a payment
     */
    async rejectPayment(orderId: number, paymentId: number, reason: string) {
        const response = await axios.post(
            `${this.baseUrl}/orders/${orderId}/payments/${paymentId}/reject`,
            { rejection_reason: reason }
        );
        return response.data;
    }
}

export const clientVerificationService = new ClientVerificationService();
export default clientVerificationService;
