import axios from 'axios';

export interface ReportFilters {
    start_date?: string;
    end_date?: string;
    status?: string;
    category?: string;
    employee_id?: number;
}

class ReportService {
    private baseUrl = '/api';

    /**
     * Get sales report data
     */
    async getSalesData(filters?: ReportFilters) {
        const response = await axios.get(`${this.baseUrl}/reports-sales-data`, { params: filters });
        return response.data;
    }

    /**
     * Get inventory report data
     */
    async getInventoryData(filters?: ReportFilters) {
        const response = await axios.get(`${this.baseUrl}/reports-inventory-data`, { params: filters });
        return response.data;
    }

    /**
     * Get performance report data
     */
    async getPerformanceData(filters?: ReportFilters) {
        const response = await axios.get(`${this.baseUrl}/reports-performance-data`, { params: filters });
        return response.data;
    }

    /**
     * Get all report statistics
     */
    async getAllStats() {
        const response = await axios.get(`${this.baseUrl}/reports-all-stats`);
        return response.data;
    }

    /**
     * Export report to CSV
     */
    async exportCSV(type: 'sales' | 'inventory' | 'performance', filters?: ReportFilters) {
        const response = await axios.post(`${this.baseUrl}/reports-export-csv`, {
            type,
            ...filters,
        }, {
            responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
}

export const reportService = new ReportService();
export default reportService;
