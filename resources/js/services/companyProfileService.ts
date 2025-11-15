import api from './api';

export interface CompanyProfile {
    id: number;
    company_name: string;
    about: string;
    services: string[];
    gallery?: string[];
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    social_media?: {
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface CompanyProfileFormData {
    company_name: string;
    about: string;
    services: string[];
    gallery?: string[];
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    social_media?: {
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    };
}

export interface CompanyProfileResponse {
    success: boolean;
    data: CompanyProfile;
    message?: string;
}

export const companyProfileService = {
    getProfile: async (): Promise<CompanyProfileResponse> => {
        const response = await api.get('/company-profile');
        return response.data;
    },

    updateProfile: async (id: number, data: CompanyProfileFormData): Promise<CompanyProfileResponse> => {
        const response = await api.put(`/company-profiles/${id}`, data);
        return response.data;
    },

    createProfile: async (data: CompanyProfileFormData): Promise<CompanyProfileResponse> => {
        const response = await api.post('/company-profiles', data);
        return response.data;
    },
};
