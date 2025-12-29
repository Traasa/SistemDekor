import axios from 'axios';

class SettingsService {
    private baseUrl = '/api';

    /**
     * GENERAL SETTINGS
     */
    async getGeneralSettings() {
        const response = await axios.get(`${this.baseUrl}/settings-general`);
        return response.data;
    }

    async updateGeneralSettings(formData: FormData) {
        const response = await axios.post(`${this.baseUrl}/settings-general`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    /**
     * NOTIFICATION SETTINGS
     */
    async getNotificationSettings() {
        const response = await axios.get(`${this.baseUrl}/settings-notifications`);
        return response.data;
    }

    async updateNotificationSettings(settings: any) {
        const response = await axios.post(`${this.baseUrl}/settings-notifications`, settings);
        return response.data;
    }

    /**
     * EMAIL TEMPLATES
     */
    async getEmailTemplates() {
        const response = await axios.get(`${this.baseUrl}/settings-email-templates`);
        return response.data;
    }

    async updateEmailTemplate(type: string, template: any) {
        const response = await axios.post(`${this.baseUrl}/settings-email-templates`, {
            type,
            ...template,
        });
        return response.data;
    }

    /**
     * BACKUP & RESTORE
     */
    async getBackupList() {
        const response = await axios.get(`${this.baseUrl}/settings-backups`);
        return response.data;
    }

    async createBackup() {
        const response = await axios.post(`${this.baseUrl}/settings-backup-create`);
        return response.data;
    }

    async downloadBackup(filename: string) {
        const response = await axios.get(`${this.baseUrl}/settings-backup-download/${filename}`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    async deleteBackup(filename: string) {
        const response = await axios.delete(`${this.baseUrl}/settings-backup-delete/${filename}`);
        return response.data;
    }

    async restoreBackup(filename: string) {
        const response = await axios.post(`${this.baseUrl}/settings-backup-restore/${filename}`);
        return response.data;
    }

    /**
     * SYSTEM
     */
    async getSystemInfo() {
        const response = await axios.get(`${this.baseUrl}/settings-system-info`);
        return response.data;
    }

    async clearCache() {
        const response = await axios.post(`${this.baseUrl}/settings-clear-cache`);
        return response.data;
    }
}

export const settingsService = new SettingsService();
export default settingsService;
