import api from './api';

export interface CompanyProfile {
    id: number;
    company_name: string;
    about: string;
    description?: string;
    services: string[];
    gallery?: string[];
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    logo?: string | null;
    favicon?: string | null;
    hero_image?: string | null;
    hero_side_image?: string | null;
    about_gallery_images?: string[];
    portfolio_highlight_images?: string[];
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

const normalizeToStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item)).filter(Boolean);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];

        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item)).filter(Boolean);
            }
        } catch {
            // continue to delimiter fallback
        }

        return trimmed
            .split(/\r?\n|,/) 
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const normalizeCompanyProfile = (raw: any): CompanyProfile => {
    return {
        ...raw,
        about: raw?.about || raw?.description || '',
        services: normalizeToStringArray(raw?.services),
        gallery: normalizeToStringArray(raw?.gallery),
        about_gallery_images: normalizeToStringArray(raw?.about_gallery_images),
        portfolio_highlight_images: normalizeToStringArray(raw?.portfolio_highlight_images),
        social_media: raw?.social_media && typeof raw.social_media === 'object' ? raw.social_media : {},
    };
};

export const companyProfileService = {
    getProfile: async (): Promise<CompanyProfileResponse> => {
        const response = await api.get('/company-profile');
        return {
            ...response.data,
            data: normalizeCompanyProfile(response.data?.data),
        };
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
